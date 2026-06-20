"use client";

import { useCallback } from "react";

export function useCameraController(viewerRef: React.MutableRefObject<any | null>) {
  const flyTo = useCallback((options: { lon: number; lat: number; height?: number; durationMs?: number }) => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    try {
      const Cesium = (require("cesium") as any).default ?? require("cesium");
      viewer.camera.flyTo({ destination: Cesium.Cartesian3.fromDegrees(options.lon, options.lat, options.height ?? 2e6), duration: (options.durationMs ?? 1200) / 1000 });
    } catch (e) {
      // ignore
    }
  }, [viewerRef]);

  const focusOnEntity = useCallback((entityId: string) => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    const ent = viewer.entities.getById(entityId);
    if (!ent || !ent.position) return;
    try {
      const Cesium = (require("cesium") as any).default ?? require("cesium");
      const pos = ent.position.getValue(viewer.clock.currentTime);
      viewer.camera.flyTo({ destination: pos, duration: 1.2 });
    } catch {}
  }, [viewerRef]);

  return { flyTo, focusOnEntity };
}
