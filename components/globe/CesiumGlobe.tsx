"use client";

import { useEffect, useRef } from "react";
import type React from "react";
import { useISS } from "@/hooks/useISS";
import { useLocationStore } from "@/lib/stores/locationStore";
import { useCelestialStore } from "@/lib/stores/celestialStore";
import type { CelestialObject } from "@/types";

// ─── Dev-only error logger ────────────────────────────────────────────────────
function devError(label: string, error: unknown) {
  if (process.env.NODE_ENV !== "development") return;
  if (error instanceof Error) {
    console.error(`[CesiumGlobe] ${label}: ${error.message}`);
  } else {
    console.error(`[CesiumGlobe] ${label}`, error);
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────
export interface CesiumZoomRef {
  zoomIn: () => void;
  zoomOut: () => void;
}

interface CesiumGlobeProps {
  zoomRef?: React.MutableRefObject<CesiumZoomRef | null>;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function CesiumGlobe({ zoomRef }: CesiumGlobeProps = {}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef    = useRef<unknown>(null);

  const { position: issPosition } = useISS();
  const { location }              = useLocationStore();
  const { setSelectedObject }     = useCelestialStore();

  // ── Main initialisation ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || viewerRef.current) return;

    const init = async () => {
      // Set base URL before any Cesium import
      (window as Window & { CESIUM_BASE_URL?: string }).CESIUM_BASE_URL = "/cesium";

      // Dynamically import Cesium (client-only)
      let Cesium: Awaited<typeof import("cesium")>;
      try {
        Cesium = await import("cesium");
        await import("cesium/Build/Cesium/Widgets/widgets.css");
      } catch (err) {
        devError("Failed to import Cesium module", err);
        return;
      }

      // Apply Ion token (needed for terrain; imagery uses built-in Bing fallback)
      const token = process.env.NEXT_PUBLIC_CESIUM_ION_TOKEN;
      if (token) Cesium.Ion.defaultAccessToken = token;

      // ── Create viewer with defaults — NO custom Ion imagery ─────────────────
      // Using baseLayerPicker: false lets Cesium load its own reliable base layer
      // (Bing Maps Aerial) without requiring account-specific asset IDs.
      let viewer: InstanceType<typeof Cesium.Viewer>;
      try {
        viewer = new Cesium.Viewer(containerRef.current!, {
          animation            : false,
          timeline             : false,
          baseLayerPicker      : false,
          fullscreenButton     : false,
          geocoder             : false,
          homeButton           : false,
          infoBox              : false,
          navigationHelpButton : false,
          sceneModePicker      : false,
          selectionIndicator   : false,
          creditContainer      : document.createElement("div"),
        });
      } catch (err) {
        devError("Viewer constructor failed", err);
        return;
      }

      // ── Scene settings ───────────────────────────────────────────────────────
      try {
        viewer.scene.globe.enableLighting = true;
        if (viewer.scene.skyAtmosphere) viewer.scene.skyAtmosphere.show = true;
        viewer.scene.fog.enabled = true;
      } catch (err) {
        devError("Scene configuration failed (non-fatal)", err);
      }

      // ── Store viewer & expose zoom ───────────────────────────────────────────
      viewerRef.current = viewer;

      if (zoomRef) {
        zoomRef.current = {
          zoomIn:  () => viewer.camera.zoomIn(500_000),
          zoomOut: () => viewer.camera.zoomOut(500_000),
        };
      }

      // ── ISS entity ───────────────────────────────────────────────────────────
      try {
        viewer.entities.add({
          id       : "iss",
          name     : "ISS (ZARYA)",
          position : Cesium.Cartesian3.fromDegrees(0, 0, 408_000),
          billboard: {
            image         : createISSBillboard(),
            scale         : 0.8,
            verticalOrigin: Cesium.VerticalOrigin.CENTER,
          },
          label: {
            text       : "ISS",
            font       : "12px Inter",
            fillColor  : Cesium.Color.fromCssColorString("#F59E0B"),
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 2,
            style      : Cesium.LabelStyle.FILL_AND_OUTLINE,
            pixelOffset: new Cesium.Cartesian2(0, -30),
            translucencyByDistance: new Cesium.NearFarScalar(1e6, 1.0, 5e7, 0.0),
          },
        });
      } catch (err) {
        devError("ISS entity failed (non-fatal)", err);
      }

      // ── Click handler ────────────────────────────────────────────────────────
      try {
        const handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        handler.setInputAction((movement: any) => {
          const picked = viewer.scene.pick(movement.position);
          if (Cesium.defined(picked) && picked.id) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const entity = picked.id as any;
            if (entity.id === "iss" && issPosition) {
              const obj: CelestialObject = {
                id         : "iss",
                name       : "ISS (ZARYA)",
                type       : "iss",
                lat        : issPosition.lat,
                lon        : issPosition.lon,
                altitude   : issPosition.altitude,
                speed      : issPosition.speed,
                inclination: issPosition.inclination,
                category   : "space_station",
              };
              setSelectedObject(obj);
            }
          }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
      } catch (err) {
        devError("Click handler failed (non-fatal)", err);
      }
    };

    init();

    return () => {
      if (viewerRef.current) {
        (viewerRef.current as { destroy: () => void }).destroy();
        viewerRef.current = null;
      }
    };
  }, [setSelectedObject]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── ISS position updates ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!viewerRef.current || !issPosition) return;

    const update = async () => {
      try {
        const Cesium = await import("cesium");
        const viewer = viewerRef.current as {
          entities: { getById: (id: string) => { position?: unknown } | undefined };
        };
        const issEntity = viewer.entities.getById("iss");
        if (issEntity) {
          issEntity.position = new Cesium.ConstantPositionProperty(
            Cesium.Cartesian3.fromDegrees(
              issPosition.lon,
              issPosition.lat,
              issPosition.altitude * 1000
            )
          );
        }
      } catch (err) {
        devError("ISS position update failed", err);
      }
    };

    update();
  }, [issPosition]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      id="cesium-container"
      aria-label="3D Celestial Globe"
    />
  );
}

// ─── ISS billboard (canvas) ───────────────────────────────────────────────────
function createISSBillboard(): string {
  const canvas = document.createElement("canvas");
  canvas.width  = 48;
  canvas.height = 48;
  const ctx = canvas.getContext("2d")!;

  const gradient = ctx.createRadialGradient(24, 24, 0, 24, 24, 18);
  gradient.addColorStop(0, "rgba(245,158,11,0.9)");
  gradient.addColorStop(1, "rgba(245,158,11,0.3)");
  ctx.beginPath();
  ctx.arc(24, 24, 18, 0, Math.PI * 2);
  ctx.fillStyle = gradient;
  ctx.fill();

  ctx.strokeStyle = "rgba(245,158,11,0.8)";
  ctx.lineWidth   = 1.5;
  ctx.beginPath();
  ctx.ellipse(24, 24, 20, 8, Math.PI / 4, 0, Math.PI * 2);
  ctx.stroke();

  return canvas.toDataURL();
}
