"use client";

import { useEffect, useRef } from "react";
import type { TLEData, OrbitPoint } from "@/types";
import { generateOrbitTrack } from "@/utils/orbital";

export function useOrbitPaths(viewerRef: React.MutableRefObject<any | null>, tle: TLEData | null, centerDate: Date | null, minutes = 90, steps = 120) {
  const pathRef = useRef<any | null>(null);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || !tle || !centerDate) return;
    let active = true;

    (async () => {
      const track = await generateOrbitTrack(tle, centerDate, (minutes * 60 * 1000) / 2, steps);
      if (!active || !track || track.length < 2) return;

      try {
        const Cesium = (await import("cesium")).default ?? (await import("cesium"));
        const positions = track.map((p: OrbitPoint) => Cesium.Cartesian3.fromDegrees(p.lon, p.lat, p.altitude * 1000));
        if (pathRef.current) viewer.entities.remove(pathRef.current);
        pathRef.current = viewer.entities.add({
          id: `orbit-${tle.name}`,
          polyline: {
            positions,
            width: 2,
            material: Cesium.Color.fromCssColorString("rgba(245,158,11,0.6)").withAlpha(0.85),
          },
        });
      } catch (e) {
        // noop
      }
    })();

    return () => {
      active = false;
      if (pathRef.current && viewer) {
        try { viewer.entities.remove(pathRef.current); } catch {};
        pathRef.current = null;
      }
    };
  }, [viewerRef, tle?.line1, tle?.line2, centerDate?.getTime(), minutes, steps]);

  return { pathRef };
}
