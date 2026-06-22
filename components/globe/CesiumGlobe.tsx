"use client";

import { useEffect, useRef } from "react";
import type React from "react";
import { useISS } from "@/hooks/useISS";
import { useLocationStore } from "@/lib/stores/locationStore";
import { useCelestialStore } from "@/lib/stores/celestialStore";
import { useLocationSelection } from "@/hooks/useLocationSelection";
import { useCesiumEntities } from "@/hooks/useCesiumEntities";
import { useCameraController } from "@/hooks/useCameraController";
import { useObjectSelection } from "@/hooks/useObjectSelection";
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
  const { selectLocation }        = useLocationSelection();
  const { setSelectedObject }     = useCelestialStore();

  // Hooks to manage Cesium entities, camera, and selection
  // They operate on viewerRef when the viewer is ready
  useCesiumEntities(viewerRef as React.MutableRefObject<any | null>);
  const { flyTo, focusOnEntity } = useCameraController(viewerRef as React.MutableRefObject<any | null>);
  const { handleClick } = useObjectSelection(viewerRef as React.MutableRefObject<any | null>);

  // ── Main initialisation ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || viewerRef.current) return;

    const init = async () => {
      // Set base URL before any Cesium import
      (window as Window & { CESIUM_BASE_URL?: string }).CESIUM_BASE_URL = "/cesium";

      // Load Cesium widgets CSS
      if (!document.querySelector('link[href*="widgets.css"]')) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "/cesium/Widgets/widgets.css";
        document.head.appendChild(link);
      }

      // Dynamically import Cesium (client-only)
      let CesiumModule: any;
      try {
        CesiumModule = await import("cesium");
      } catch (err) {
        devError("Failed to import Cesium module", err);
        return;
      }
      const Cesium = CesiumModule.default ?? CesiumModule;

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

      // ── Selected location marker ──────────────────────────────────────────────
      try {
        viewer.entities.add({
          id      : "selected-location",
          name    : "Selected Location",
          position: Cesium.Cartesian3.fromDegrees(location.lon, location.lat, 0),
          point   : {
            pixelSize: 14,
            color: Cesium.Color.fromCssColorString("#8b5cf6"),
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 2,
            scaleByDistance: new Cesium.NearFarScalar(1e5, 1.3, 5e6, 0.2),
          },
          label: {
            text: location.name,
            font: "14px Inter",
            fillColor: Cesium.Color.fromCssColorString("#e2e8f0"),
            outlineColor: Cesium.Color.fromCssColorString("rgba(17,24,39,0.8)"),
            outlineWidth: 3,
            pixelOffset: new Cesium.Cartesian2(0, -20),
            translucencyByDistance: new Cesium.NearFarScalar(1e5, 1.0, 3e6, 0.0),
          },
          billboard: {
            image: createLocationBillboard(),
            verticalOrigin: Cesium.VerticalOrigin.CENTER,
          },
        });
      } catch (err) {
        devError("Selected location entity failed (non-fatal)", err);
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
          } else {
            // Clicked on globe background — derive lat/lon and update observer
            try {
              const cartesian = viewer.camera.pickEllipsoid(movement.position, viewer.scene.globe.ellipsoid);
              if (cartesian) {
                const carto = Cesium.Cartographic.fromCartesian(cartesian);
                const lon = Cesium.Math.toDegrees(carto.longitude);
                const lat = Cesium.Math.toDegrees(carto.latitude);
                selectLocation({
                  lat,
                  lon,
                  name: `Selected ${lat.toFixed(3)}, ${lon.toFixed(3)}`,
                });
              }
            } catch (e) {
              // ignore
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
  }, [setSelectedObject, selectLocation, flyTo]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── ISS position updates ───────────────────────────────────────────────
  useEffect(() => {
    if (!viewerRef.current || !issPosition) return;

    const updateISS = async () => {
      try {
        const Cesium = await import("cesium");
        const viewer = viewerRef.current as any;
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

    updateISS();
  }, [issPosition]);

  // ── Selected location updates ──────────────────────────────────────────
  useEffect(() => {
    if (!viewerRef.current) return;

    const updateLocation = async () => {
      try {
        const Cesium = await import("cesium");
        const viewer = viewerRef.current as any;

        const locationEntity = viewer.entities.getById("selected-location");
        if (locationEntity) {
          locationEntity.position = new Cesium.ConstantPositionProperty(
            Cesium.Cartesian3.fromDegrees(location.lon, location.lat, 0)
          );
          if (locationEntity.label) {
            locationEntity.label.text = location.name;
          }
        }

        if (location.lat !== undefined && location.lon !== undefined) {
          viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(location.lon, location.lat, 2_000_000),
            duration: 1.3,
          });
        }
      } catch (err) {
        devError("Location update failed", err);
      }
    };

    updateLocation();
  }, [location.lat, location.lon, location.name]);

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

function createLocationBillboard(): string {
  const canvas = document.createElement("canvas");
  canvas.width = 48;
  canvas.height = 48;
  const ctx = canvas.getContext("2d")!;

  const gradient = ctx.createRadialGradient(24, 24, 0, 24, 24, 22);
  gradient.addColorStop(0, "rgba(139,92,246,0.8)");
  gradient.addColorStop(0.6, "rgba(139,92,246,0.28)");
  gradient.addColorStop(1, "rgba(139,92,246,0)");

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(24, 24, 22, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#8b5cf6";
  ctx.beginPath();
  ctx.arc(24, 24, 8, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(255,255,255,0.6)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(24, 24, 11, 0, Math.PI * 2);
  ctx.stroke();

  return canvas.toDataURL();
}
