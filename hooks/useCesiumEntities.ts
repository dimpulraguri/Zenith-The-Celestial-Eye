"use client";

import { useEffect, useRef } from "react";
import { useISS } from "@/hooks/useISS";
import { useSatellites } from "@/hooks/useSatellites";
import { useSimulationTime } from "@/hooks/useSimulationTime";

// Minimal Cesium entity manager — keeps ISS and a limited set of satellites in sync
export function useCesiumEntities(viewerRef: React.MutableRefObject<any | null>) {
  const { position: issPosition, previousPath: issPrev, futurePath: issFuture } = useISS();
  const { satellites } = useSatellites();
  const { currentSimulationDate } = useSimulationTime();

  const satelliteEntitiesRef = useRef<Record<string, any>>({});

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    // Ensure ISS entity exists
    let issEntity = viewer.entities.getById("iss");
    if (!issEntity) {
      issEntity = viewer.entities.add({ id: "iss", name: "ISS (ZARYA)" });
    }

    // Update ISS stored properties so the rAF updater can pick them up
    if (issPosition && issEntity) {
      issEntity.properties = issEntity.properties || {};
      issEntity.properties.lat = issPosition.lat;
      issEntity.properties.lon = issPosition.lon;
      issEntity.properties.alt = issPosition.altitude * 1000;
    }
  }, [viewerRef, issPosition]);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    // Keep satellite set bounded
    const MAX_VISIBLE = 450;
    const toShow = satellites.slice(0, MAX_VISIBLE);

    // Add/update
    toShow.forEach((sat) => {
      const id = `sat-${sat.noradId}`;
      let ent = viewer.entities.getById(id);
      if (!ent) {
        ent = viewer.entities.add({ id, name: sat.name });
      }
      // store last known position on entity for rendering update step
      ent.properties = ent.properties || {};
      ent.properties.lat = sat.lat;
      ent.properties.lon = sat.lon;
      ent.properties.alt = sat.altitude * 1000;
      satelliteEntitiesRef.current[id] = ent;
    });

    // Remove stale
    Object.keys(satelliteEntitiesRef.current).forEach((id) => {
      if (!toShow.find((s) => `sat-${s.noradId}` === id)) {
        const e = viewer.entities.getById(id);
        if (e) viewer.entities.remove(e);
        delete satelliteEntitiesRef.current[id];
      }
    });
  }, [viewerRef, satellites, currentSimulationDate]);

  // rAF loop for smooth interpolation of entity positions
  useEffect(() => {
    let raf = 0;
    const step = () => {
      const viewer = viewerRef.current;
      if (viewer) {
        // update ISS via ConstantPositionProperty if available
        const iss = viewer.entities.getById("iss");
        if (iss && iss.properties && iss.properties.lat !== undefined) {
          try {
            // try to set position via Cesium API
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const Cesium = (require("cesium") as any).default ?? require("cesium");
            const lat = iss.properties.lat;
            const lon = iss.properties.lon;
            const alt = (iss.properties.alt ?? 408000);
            iss.position = new Cesium.ConstantPositionProperty(
              Cesium.Cartesian3.fromDegrees(lon, lat, alt)
            );
          } catch {
            // ignore if Cesium not globally available
          }
        }

        // update satellites
        Object.values(satelliteEntitiesRef.current).forEach((ent: any) => {
          if (!ent || !ent.properties) return;
          try {
            const Cesium = (require("cesium") as any).default ?? require("cesium");
            ent.position = new Cesium.ConstantPositionProperty(
              Cesium.Cartesian3.fromDegrees(ent.properties.lon, ent.properties.lat, ent.properties.alt)
            );
          } catch {
            // noop
          }
        });
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [viewerRef]);
}
