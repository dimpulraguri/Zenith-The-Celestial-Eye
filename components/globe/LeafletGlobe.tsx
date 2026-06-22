"use client";

import { useEffect, useRef, useCallback } from "react";
import { useISS } from "@/hooks/useISS";
import { useSimulationTime } from "@/hooks/useSimulationTime";
import { useSatellites } from "@/hooks/useSatellites";
import { useLocationSelection } from "@/hooks/useLocationSelection";
import { useLocationStore } from "@/lib/stores/locationStore";
import { useCelestialStore } from "@/lib/stores/celestialStore";
import { MAP_CONFIG, SATELLITE_CATEGORY_CONFIG } from "@/constants";
import { CosmicRadarScan } from "@/components/globe/CosmicRadarScan";
import type { CelestialObject } from "@/types";

// Dynamic leaflet import
let L: typeof import("leaflet") | null = null;

interface LeafletGlobeProps {
  showOrbitPath?: boolean;
  showConstellations?: boolean;
  showTerminator?: boolean;
}

export function LeafletGlobe({
  showOrbitPath = true,
  showConstellations = false,
  showTerminator = true,
}: LeafletGlobeProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<import("leaflet").Map | null>(null);
  const issMarkerRef = useRef<import("leaflet").Marker | null>(null);
  const satelliteMarkersRef = useRef<import("leaflet").LayerGroup | null>(null);
  const locationMarkerRef = useRef<import("leaflet").Marker | null>(null);
  const orbitPathRef = useRef<import("leaflet").Polyline[] | null>(null);
  const constellationLayerRef = useRef<import("leaflet").LayerGroup | null>(null);

  const {
    position: issPosition,
    previousPath: issPreviousPath,
    futurePath: issFuturePath,
  } = useISS();
  const { currentSimulationDate } = useSimulationTime();
  const { satellites } = useSatellites();
  const { location } = useLocationStore();
  const { setSelectedObject, setRadarActive } = useCelestialStore();
  const { selectLocation } = useLocationSelection();

  // ── Initialize map ─────────────────────────────
  useEffect(() => {
    if (!mapRef.current) return;
    if (leafletMapRef.current) {
      leafletMapRef.current.remove();
      leafletMapRef.current = null;
    }

    let isDestroyed = false;

    const init = async () => {
      L = await import("leaflet");
      if (isDestroyed || !mapRef.current) return;

      // Fix default marker icons
      // @ts-ignore
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      if (!document.querySelector('link[href*="leaflet"]')) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      if (isDestroyed || !mapRef.current) return;

      const map = L.map(mapRef.current, {
        center: [MAP_CONFIG.DEFAULT_CENTER.lat, MAP_CONFIG.DEFAULT_CENTER.lon],
        zoom: MAP_CONFIG.DEFAULT_ZOOM,
        zoomControl: false,
        attributionControl: false,
        preferCanvas: true,
      });

      L.tileLayer(MAP_CONFIG.TILE_URL, {
        attribution: MAP_CONFIG.TILE_ATTRIBUTION,
        maxZoom: MAP_CONFIG.MAX_ZOOM,
        subdomains: "abcd",
      }).addTo(map);

      L.control.zoom({ position: "bottomright" }).addTo(map);
      L.control
        .attribution({ position: "bottomleft", prefix: false })
        .addAttribution(MAP_CONFIG.TILE_ATTRIBUTION)
        .addTo(map);

      satelliteMarkersRef.current = L.layerGroup().addTo(map);
      leafletMapRef.current = map;

      map.on("click", (event: import("leaflet").LeafletMouseEvent) => {
        selectLocation({
          lat: event.latlng.lat,
          lon: event.latlng.lng,
          name: `Selected ${event.latlng.lat.toFixed(3)}, ${event.latlng.lng.toFixed(3)}`,
        });
      });
    };

    init();

    return () => {
      isDestroyed = true;
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  // ── ISS icon ────────────────────────────────────
  const createISSIcon = useCallback(() => {
    if (!L) return null;
    return L.divIcon({
      html: `
        <div style="position:relative;width:40px;height:40px;display:flex;align-items:center;justify-content:center">
          <div style="
            position:absolute;inset:0;
            border-radius:50%;
            background:radial-gradient(circle, rgba(245,158,11,0.35) 0%, transparent 70%);
            animation:iss-pulse 2s ease-in-out infinite;
          "></div>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="9" y="11" width="10" height="6" rx="1.5" fill="#64748b"/>
            <rect x="11" y="9" width="6" height="10" rx="1" fill="#475569"/>
            <rect x="1" y="11.5" width="6" height="5" rx="1" fill="#2563eb" opacity="0.95"/>
            <line x1="4" y1="11.5" x2="4" y2="16.5" stroke="#60a5fa" stroke-width="0.5" opacity="0.6"/>
            <rect x="7" y="13" width="2" height="2" rx="0.5" fill="#64748b"/>
            <rect x="21" y="11.5" width="6" height="5" rx="1" fill="#2563eb" opacity="0.95"/>
            <line x1="24" y1="11.5" x2="24" y2="16.5" stroke="#60a5fa" stroke-width="0.5" opacity="0.6"/>
            <rect x="19" y="13" width="2" height="2" rx="0.5" fill="#64748b"/>
            <circle cx="14" cy="14" r="1.8" fill="#0ea5e9" opacity="0.9"/>
            <circle cx="14" cy="14" r="13" fill="url(#g)" opacity="0.4"/>
            <defs>
              <radialGradient id="g" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="#f59e0b"/>
                <stop offset="100%" stop-color="#f59e0b" stop-opacity="0"/>
              </radialGradient>
            </defs>
          </svg>
        </div>
      `,
      className: "",
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });
  }, []);

  // ── Satellite icon ──────────────────────────────
  const createSatIcon = useCallback((category: string) => {
    if (!L) return null;
    const config =
      SATELLITE_CATEGORY_CONFIG[category as keyof typeof SATELLITE_CATEGORY_CONFIG] ||
      SATELLITE_CATEGORY_CONFIG.other;
    return L.divIcon({
      html: `
        <div style="
          width:8px;height:8px;
          background:${config.color};
          border:1px solid ${config.color}88;
          border-radius:50%;
          box-shadow:0 0 6px ${config.color}66;
        "></div>
      `,
      className: "",
      iconSize: [8, 8],
      iconAnchor: [4, 4],
    });
  }, []);

  const createLocationIcon = useCallback(() => {
    if (!L) return null;
    return L.divIcon({
      html: `
        <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; inset: 0; border-radius: 50%; background: radial-gradient(circle, rgba(99,102,241,0.35), transparent 55%); animation: pulse-ring 1.8s ease-out infinite;"></div>
          <div style="width: 14px; height: 14px; border-radius: 50%; background: rgba(99,102,241,1); box-shadow: 0 0 14px rgba(99,102,241,0.75);"></div>
        </div>
      `,
      className: "",
      iconSize: [34, 34],
      iconAnchor: [17, 17],
    });
  }, []);

  // ── Update ISS marker ───────────────────────────
  useEffect(() => {
    if (!leafletMapRef.current || !L || !issPosition) return;
    const map = leafletMapRef.current;

    if (!issMarkerRef.current) {
      const icon = createISSIcon();
      if (!icon) return;
      issMarkerRef.current = L.marker([issPosition.lat, issPosition.lon], {
        icon,
        title: "International Space Station (ISS)",
        alt: "ISS",
        zIndexOffset: 1000,
      }).addTo(map);

      issMarkerRef.current.on("click", () => {
        const obj: CelestialObject = {
          id: "iss",
          name: "ISS (ZARYA)",
          type: "iss",
          lat: issPosition.lat,
          lon: issPosition.lon,
          altitude: issPosition.altitude,
          speed: issPosition.speed,
          inclination: issPosition.inclination,
          category: "space_station",
          description: "The International Space Station is a modular space station in low Earth orbit.",
        };
        setSelectedObject(obj);
      });
    } else {
      issMarkerRef.current.setLatLng([issPosition.lat, issPosition.lon]);
    }
  }, [issPosition, createISSIcon, setSelectedObject]);

  // ── Update satellite markers ────────────────────
  useEffect(() => {
    if (!leafletMapRef.current || !L || !satelliteMarkersRef.current) return;
    satelliteMarkersRef.current.clearLayers();

    for (const sat of satellites.slice(0, 50)) {
      const icon = createSatIcon(sat.category);
      if (!icon) continue;
      const marker = L.marker([sat.lat, sat.lon], { icon, title: sat.name, alt: sat.name });
      marker.on("click", () => {
        const obj: CelestialObject = {
          id: sat.id,
          name: sat.name,
          type: "satellite",
          lat: sat.lat,
          lon: sat.lon,
          altitude: sat.altitude,
          speed: sat.speed,
          inclination: sat.inclination,
          category: sat.category,
          description: `${sat.name} is a ${sat.category} satellite.`,
        };
        setSelectedObject(obj);
      });
      satelliteMarkersRef.current.addLayer(marker);
    }
  }, [satellites, createSatIcon, setSelectedObject]);

  // ── Update observer location marker ────────────
  useEffect(() => {
    if (!leafletMapRef.current || !L) return;
    const map = leafletMapRef.current;

    setRadarActive(true);
    setTimeout(() => setRadarActive(false), 3500);

    if (locationMarkerRef.current) locationMarkerRef.current.remove();
      const icon = createLocationIcon();
      if (!icon) return;
      locationMarkerRef.current = L.marker([location.lat, location.lon], {
        icon,
        title: location.name,
        alt: location.name,
        zIndexOffset: 1200,
      }).addTo(map);

      locationMarkerRef.current.bindPopup(`
        <div style="color:#e2e8f0;font-size:12px;line-height:1.3;">
          <strong>${location.name}</strong><br/>
          ${location.lat.toFixed(4)}, ${location.lon.toFixed(4)}
        </div>
      `, { closeButton: false, offset: [0, -24], className: "leaflet-popup-glow" });

      locationMarkerRef.current.openPopup();
      map.flyTo([location.lat, location.lon], 4, { duration: 1.5 });
    }, [location.lat, location.lon, location.name]);
  // ── ISS Orbit Path ──────────────────────────────
  useEffect(() => {
    if (!leafletMapRef.current || !L) return;
    const map = leafletMapRef.current;

    // Remove existing path
    if (orbitPathRef.current) {
      orbitPathRef.current.forEach(p => p.remove());
      orbitPathRef.current = null;
    }

    if (!showOrbitPath) return;

    if (!issPreviousPath?.length && !issFuturePath?.length) return;

    const track = [...(issPreviousPath ?? []), ...(issFuturePath ?? [])];
    if (track.length < 2) return;

    const segments: [number, number][][] = [];
    let current: [number, number][] = [];
    for (let i = 0; i < track.length; i++) {
      const pt = track[i];
      if (i > 0 && Math.abs(pt.lon - track[i - 1].lon) > 180) {
        segments.push(current);
        current = [];
      }
      current.push([pt.lat, pt.lon]);
    }
    if (current.length > 0) segments.push(current);

    const polylines: import("leaflet").Polyline[] = [];
    segments.forEach((seg) => {
      const line = L!.polyline(seg, {
        color: "rgba(245,158,11,0.55)",
        weight: 1.5,
        dashArray: "4 6",
        lineCap: "round",
      }).addTo(leafletMapRef.current!);
      polylines.push(line);
    });
    orbitPathRef.current = polylines;
    return () => {
      if (orbitPathRef.current) {
        orbitPathRef.current.forEach((p) => p.remove());
        orbitPathRef.current = null;
      }
    };

  }, [showOrbitPath]);

  // ── Constellation overlay ───────────────────────
  useEffect(() => {
    if (!leafletMapRef.current || !L) return;

    // Remove existing
    if (constellationLayerRef.current) {
      constellationLayerRef.current.remove();
      constellationLayerRef.current = null;
    }
    if (!showConstellations) return;

    const map = leafletMapRef.current;
    const group = L.layerGroup().addTo(map);
    constellationLayerRef.current = group;

    // Draw simplified constellation lines via L.SVGOverlay over the world bounds
    // Uses a canvas overlay approach for correct Mercator projection
    const canvas = document.createElement("canvas");
    canvas.width = 1440;
    canvas.height = 720;
    const ctx = canvas.getContext("2d")!;

    // Draw star-like points using known bright star positions (RA/Dec → lon/lat approx)
    const BRIGHT_STARS: [number, number][] = [
      // [lon, lat] ≈ [RA*15 - 180, Dec]
      [-37.5, -8.2],   // Orion Rigel
      [-25.5, 7.4],    // Orion Betelgeuse
      [56.2, -17.0],   // Canis Major Sirius
      [95.7, -52.7],   // Canopus
      [113.6, 31.9],   // Gemini Pollux
      [116.3, 28.0],   // Gemini Castor
      [-179, -60],     // Crux Acrux
      [152.1, 11.9],   // Leo Regulus
      [167.9, 56.4],   // Ursa Major Dubhe
      [191.9, 55.0],   // Ursa Major Alioth
      [206.9, 49.3],   // Ursa Major Mizar
      [213.9, -19.0],  // Virgo Spica
      [239.5, 26.7],   // Corona Borealis Alphecca
      [279.2, 38.8],   // Lyra Vega
      [305.6, 40.3],   // Cygnus Deneb
      [310.4, 45.3],   // Cygnus Sadr
      [297.7, 8.9],    // Aquila Altair
      [344.4, -29.6],  // Piscis Austrinus Fomalhaut
      [10.9, 56.5],    // Perseus Mirfak
      [45.6, 4.1],     // Taurus Aldebaran
    ];

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw stars
    BRIGHT_STARS.forEach(([lon, lat]) => {
      const x = ((lon + 180) / 360) * canvas.width;
      const y = ((90 - lat) / 180) * canvas.height;

      ctx.beginPath();
      const grd = ctx.createRadialGradient(x, y, 0, x, y, 4);
      grd.addColorStop(0, "rgba(180,200,255,0.95)");
      grd.addColorStop(1, "rgba(100,140,255,0)");
      ctx.fillStyle = grd;
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw connection lines between neighbouring stars (simplified Orion, Ursa Major)
    const LINES: Array<[number, number][]> = [
      // Orion belt region
      [[-37.5, -8.2], [-25.5, 7.4]],
      // Ursa Major dipper
      [[167.9, 56.4], [191.9, 55.0]], [[191.9, 55.0], [206.9, 49.3]], [[206.9, 49.3], [213.9, -19.0]],
      // Vega → Deneb → Altair (Summer Triangle)
      [[279.2, 38.8], [305.6, 40.3]], [[305.6, 40.3], [297.7, 8.9]], [[297.7, 8.9], [279.2, 38.8]],
    ];

    ctx.strokeStyle = "rgba(100,140,255,0.25)";
    ctx.lineWidth = 1;
    LINES.forEach(([a, b]) => {
      const x1 = ((a[0] + 180) / 360) * canvas.width;
      const y1 = ((90 - a[1]) / 180) * canvas.height;
      const x2 = ((b[0] + 180) / 360) * canvas.width;
      const y2 = ((90 - b[1]) / 180) * canvas.height;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    });

    // Mount as SVG overlay spanning the world
    const dataUrl = canvas.toDataURL();
    const imgEl = document.createElement("img");
    imgEl.src = dataUrl;
    imgEl.style.cssText = "width:100%;height:100%;opacity:0.7;pointer-events:none;";

    const worldBounds: [[number, number], [number, number]] = [[-90, -180], [90, 180]];
    const overlay = L.imageOverlay(dataUrl, worldBounds, { opacity: 0.65, interactive: false });
    overlay.addTo(group);
  }, [showConstellations]);

  return (
    <div className="relative w-full h-full">
      <div
        ref={mapRef}
        className="w-full h-full"
        id="leaflet-globe"
        aria-label="Interactive sky map"
      />
      {/* Day/Night terminator overlay */}
      {showTerminator && <DayNightLeafletOverlay />}
      <CosmicRadarScan />
    </div>
  );
}

// ── Day/Night overlay for 2D map ────────────────────────────────────────────
// Uses additive blending so it works on dark map tiles
function DayNightLeafletOverlay() {
  const now = new Date();
  const dayOfYear = Math.floor(
    (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000
  );
  const utcHours = now.getUTCHours() + now.getUTCMinutes() / 60;
  const sunLon = -(utcHours - 12) * 15;
  const xPercent = ((sunLon + 180) / 360) * 100;

  return (
    <div
      className="absolute inset-0 pointer-events-none z-[400]"
      style={{
        background: `linear-gradient(to right,
          rgba(0,0,20,0.55) 0%,
          rgba(0,0,20,0.55) ${Math.max(0, xPercent - 8)}%,
          rgba(0,0,0,0) ${xPercent}%,
          rgba(0,0,0,0) ${Math.min(100, xPercent + 8)}%,
          rgba(0,0,20,0.55) 100%
        )`,
      }}
      aria-hidden="true"
    />
  );
}
