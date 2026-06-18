"use client";

import { useEffect, useRef } from "react";
import { useISS } from "@/hooks/useISS";
import { generateOrbitPath } from "@/utils/orbital";
import { fetchISSTLE } from "@/services/iss";

// Drawn as a Leaflet polyline overlay on the map
// This component must be mounted INSIDE the LeafletGlobe (after map init)

interface OrbitPathProps {
  map: import("leaflet").Map;
  leaflet: typeof import("leaflet");
}

export function OrbitPath({ map, leaflet: L }: OrbitPathProps) {
  const pathRef = useRef<import("leaflet").Polyline | null>(null);
  const { position: issPos } = useISS();

  useEffect(() => {
    let cancelled = false;

    const drawPath = async () => {
      try {
        const tle = await fetchISSTLE();
        const points = await generateOrbitPath(tle, 120);
        if (cancelled || points.length < 2) return;

        // Convert to LatLng pairs, handling anti-meridian
        const segments: [number, number][][] = [];
        let current: [number, number][] = [];
        for (let i = 0; i < points.length; i++) {
          const pt = points[i];
          if (i > 0) {
            const prev = points[i - 1];
            if (Math.abs(pt.lon - prev.lon) > 180) {
              // Anti-meridian crossing — start new segment
              segments.push(current);
              current = [];
            }
          }
          current.push([pt.lat, pt.lon]);
        }
        if (current.length > 0) segments.push(current);

        // Remove old path
        if (pathRef.current) pathRef.current.remove();

        // Draw each segment
        segments.forEach(seg => {
          const line = L.polyline(seg, {
            color: "rgba(245,158,11,0.45)",
            weight: 1.5,
            dashArray: "4 6",
            lineCap: "round",
          }).addTo(map);

          // Only keep the first as ref for cleanup
          if (!pathRef.current) pathRef.current = line;
        });
      } catch (e) {
        console.warn("OrbitPath draw failed:", e);
      }
    };

    drawPath();

    return () => {
      cancelled = true;
      if (pathRef.current) {
        pathRef.current.remove();
        pathRef.current = null;
      }
    };
  }, [map, L]);

  return null;
}

// ── Day/Night terminator ───────────────────────
// Simple CSS gradient overlay approximating terminator line
export function DayNightOverlay() {
  const now = new Date();
  const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000);
  const declination = -23.45 * Math.cos((360 / 365) * (dayOfYear + 10) * (Math.PI / 180));

  // The terminator shift in longitude based on current UTC time
  const utcHours = now.getUTCHours() + now.getUTCMinutes() / 60;
  const sunLon = -(utcHours - 12) * 15; // degrees

  // Convert to percentage position on Mercator map (very approximate)
  const xPercent = ((sunLon + 180) / 360) * 100;

  return (
    <div
      className="absolute inset-0 pointer-events-none z-[400]"
      style={{
        background: `linear-gradient(to right, 
          rgba(0,0,0,0.35) 0%, 
          rgba(0,0,0,0.35) ${Math.max(0, xPercent - 10)}%, 
          rgba(0,0,0,0) ${xPercent}%, 
          rgba(0,0,0,0) ${Math.min(100, xPercent + 10)}%,
          rgba(0,0,0,0.35) 100%
        )`,
        mixBlendMode: "multiply",
      }}
      aria-hidden="true"
    />
  );
}
