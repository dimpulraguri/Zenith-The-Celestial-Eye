"use client";

import { useEffect, useRef } from "react";
import type { Map as LeafletMap } from "leaflet";

// ── Major constellations with screen-projected data ──
// Stars: [lon, lat] (celestial longitude ≈ screen X, declination ≈ screen Y)
// We render these as SVG overlay anchored to the Leaflet pane

const CONSTELLATIONS = [
  {
    name: "Orion",
    abbr: "Ori",
    stars: [
      [83.8, 5.9],  // Betelgeuse
      [88.8, 7.4],  // Bellatrix
      [84.1, -1.2], // Mintaka
      [84.5, -1.9], // Alnilam
      [85.2, -1.9], // Alnitak
      [83.0, -9.7], // Saiph
      [78.6, -8.2], // Rigel
    ],
    lines: [[0,1],[1,2],[2,3],[3,4],[4,0],[3,5],[5,6],[6,2]],
    center: [83.8, -1.0],
  },
  {
    name: "Ursa Major",
    abbr: "UMa",
    stars: [
      [165.5, 56.4], // Dubhe
      [165.5, 61.8], // Merak
      [178.5, 53.7], // Phecda
      [183.9, 57.0], // Megrez
      [193.5, 55.9], // Alioth
      [200.9, 54.9], // Mizar
      [206.9, 49.3], // Alkaid
    ],
    lines: [[0,1],[1,2],[2,3],[3,0],[3,4],[4,5],[5,6]],
    center: [185, 55],
  },
  {
    name: "Leo",
    abbr: "Leo",
    stars: [
      [152.1, 11.9], // Regulus
      [154.2, 20.5], // Algieba
      [158.4, 14.6], // Adhafera
      [168.5, 15.4], // Denebola
      [162.0, 23.4], // Zosma
      [166.5, 23.8], // Chertan
    ],
    lines: [[0,1],[1,2],[2,0],[2,3],[3,5],[5,4],[4,1]],
    center: [160, 17],
  },
  {
    name: "Scorpius",
    abbr: "Sco",
    stars: [
      [247.3, -26.4], // Antares
      [240.1, -22.6], // Graffias
      [244.0, -15.7], // Dschubba
      [253.0, -37.1], // Sargas
      [258.0, -43.0], // Shaula
      [259.2, -39.0], // Lesath
      [248.9, -34.2], // Girtab
    ],
    lines: [[1,2],[2,0],[0,3],[3,6],[6,5],[5,4]],
    center: [250, -28],
  },
  {
    name: "Cassiopeia",
    abbr: "Cas",
    stars: [
      [2.3,  56.5], // Schedar
      [10.1, 59.2], // Caph
      [14.2, 60.7], // Gamma Cas
      [21.5, 60.2], // Ruchbah
      [28.6, 63.7], // Segin
    ],
    lines: [[0,1],[1,2],[2,3],[3,4]],
    center: [14, 60],
  },
  {
    name: "Gemini",
    abbr: "Gem",
    stars: [
      [113.6, 31.9], // Castor
      [116.3, 28.0], // Pollux
      [99.4,  22.5], // Alhena
      [95.7,  16.4], // Tejat
      [106.1, 20.6], // Mebsuda
      [100.0, 25.1], // Wasat
    ],
    lines: [[0,1],[0,4],[4,5],[5,3],[3,2],[1,4]],
    center: [108, 25],
  },
  {
    name: "Virgo",
    abbr: "Vir",
    stars: [
      [201.3, -11.2], // Spica
      [190.4, -0.7],  // Porrima
      [187.8, 1.8],   // Auva
      [193.9, 10.9],  // Vindemiatrix
    ],
    lines: [[0,1],[1,2],[1,3]],
    center: [196, 0],
  },
];

// ── Convert celestial (RA degrees, Dec) to Leaflet latlng ──
// RA: 0–360° maps to lon -180 to +180 (inverted, since RA increases eastward)
// Dec: -90 to +90 maps directly to lat
function celestialToLatLng(ra: number, dec: number): [number, number] {
  // Offset by current LST approximation (very rough)
  const now = new Date();
  const utcHours = now.getUTCHours() + now.getUTCMinutes() / 60;
  const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000);
  // Rough Local Sidereal Time in degrees (approximate, valid to ~1°)
  const lst = ((100.46 + 0.985647 * dayOfYear + utcHours * 15)) % 360;
  // HA = LST - RA
  let lon = (lst - ra);
  while (lon < -180) lon += 360;
  while (lon > 180)  lon -= 360;
  return [dec, lon];
}

interface ConstellationLayerProps {
  map: LeafletMap;
  leaflet: typeof import("leaflet");
  visible: boolean;
}

export function ConstellationLayer({ map, leaflet: L, visible }: ConstellationLayerProps) {
  const layerRef = useRef<import("leaflet").LayerGroup | null>(null);

  useEffect(() => {
    // Cleanup old layer
    if (layerRef.current) {
      layerRef.current.remove();
      layerRef.current = null;
    }
    if (!visible) return;

    const group = L.layerGroup().addTo(map);
    layerRef.current = group;

    CONSTELLATIONS.forEach(({ name, stars, lines, center }) => {
      const latlngs = stars.map(([ra, dec]) => celestialToLatLng(ra, dec));

      // Draw lines
      lines.forEach(([from, to]) => {
        L.polyline([latlngs[from], latlngs[to]], {
          color: "rgba(148, 163, 184, 0.25)",
          weight: 0.8,
          dashArray: "3 5",
        }).addTo(group);
      });

      // Draw star dots
      latlngs.forEach(ll => {
        L.circleMarker(ll, {
          radius: 1.5,
          color: "rgba(226, 232, 240, 0.4)",
          fillColor: "rgba(226, 232, 240, 0.4)",
          fillOpacity: 1,
          weight: 0,
        }).addTo(group);
      });

      // Label
      const labelCenter = celestialToLatLng(center[0], center[1]);
      const labelIcon = L.divIcon({
        html: `<span style="color:rgba(148,163,184,0.45);font-size:9px;font-family:'Space Grotesk',sans-serif;font-weight:600;letter-spacing:0.08em;white-space:nowrap;text-shadow:0 0 8px rgba(5,8,22,0.8)">${name.toUpperCase()}</span>`,
        className: "",
        iconAnchor: [30, 6],
      });
      L.marker(labelCenter, { icon: labelIcon, interactive: false }).addTo(group);
    });

    return () => {
      if (layerRef.current) {
        layerRef.current.remove();
        layerRef.current = null;
      }
    };
  }, [map, L, visible]);

  return null;
}
