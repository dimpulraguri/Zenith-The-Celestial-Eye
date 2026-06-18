import { API_ENDPOINTS, ISS_CONFIG } from "@/constants";
import { parseTLEText, propagateSatellite } from "@/utils/orbital";
import type { ISSPosition, TLEData } from "@/types";

// ── TLE Cache ─────────────────────────────────
let cachedTLE: TLEData | null = null;
let tleCacheTime = 0;
const TLE_TTL = 2 * 60 * 60 * 1000; // 2 hours

// ── Fetch ISS TLE ─────────────────────────────
export async function fetchISSTLE(): Promise<TLEData> {
  const now = Date.now();

  if (cachedTLE && now - tleCacheTime < TLE_TTL) {
    return cachedTLE;
  }

  try {
    const res = await fetch(API_ENDPOINTS.ISS_TLE, {
      next: { revalidate: 7200 }, // 2 hours
    });
    const text = await res.text();
    const tles = parseTLEText(text);

    if (tles.length > 0) {
      cachedTLE = tles[0];
      tleCacheTime = now;
      return tles[0];
    }
  } catch (error) {
    console.warn("Failed to fetch ISS TLE from CelesTrak:", error);
  }

  // Fallback TLE (recent-ish, will be slightly inaccurate)
  return getFallbackISSTLE();
}

// ── Compute ISS Position ──────────────────────
export async function computeISSPosition(
  date: Date = new Date()
): Promise<ISSPosition> {
  try {
    const tle = await fetchISSTLE();
    const pos = await propagateSatellite(tle, date);

    if (pos) {
      return {
        lat: pos.lat,
        lon: pos.lon,
        altitude: pos.altitude,
        speed: pos.speed,
        inclination: ISS_CONFIG.inclination,
        timestamp: date.getTime(),
        visibility: determineVisibility(pos.lat, pos.lon),
      };
    }
  } catch (error) {
    console.warn("TLE propagation failed, using OpenNotify fallback:", error);
  }

  // Fallback to OpenNotify
  return fetchOpenNotifyPosition();
}

// ── OpenNotify Fallback ───────────────────────
async function fetchOpenNotifyPosition(): Promise<ISSPosition> {
  try {
    const res = await fetch(API_ENDPOINTS.ISS_POSITION, {
      cache: "no-store",
    });
    const data = await res.json();

    return {
      lat: parseFloat(data.iss_position.latitude),
      lon: parseFloat(data.iss_position.longitude),
      altitude: ISS_CONFIG.altitude,
      speed: ISS_CONFIG.speed,
      inclination: ISS_CONFIG.inclination,
      timestamp: data.timestamp * 1000,
      visibility: "daylight",
    };
  } catch {
    // Last resort fallback
    return {
      lat: 0,
      lon: 0,
      altitude: ISS_CONFIG.altitude,
      speed: ISS_CONFIG.speed,
      inclination: ISS_CONFIG.inclination,
      timestamp: Date.now(),
      visibility: "daylight",
    };
  }
}

// ── Determine ISS Visibility ───────────────────
function determineVisibility(
  lat: number,
  lon: number
): "daylight" | "eclipsed" | "visible" {
  // Simplified: day/night based on subsolar point
  const now = new Date();
  const dayOfYear = Math.floor(
    (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000
  );
  const declination = -23.45 * Math.cos((360 / 365) * (dayOfYear + 10) * (Math.PI / 180));
  const hourAngle = ((lon + 180) % 360) - 180;
  const solarAlt =
    Math.asin(
      Math.sin((lat * Math.PI) / 180) * Math.sin((declination * Math.PI) / 180) +
        Math.cos((lat * Math.PI) / 180) *
          Math.cos((declination * Math.PI) / 180) *
          Math.cos((hourAngle * Math.PI) / 180)
    ) *
    (180 / Math.PI);

  if (solarAlt > -12) return "daylight";
  return "visible";
}

// ── Fallback TLE ──────────────────────────────
function getFallbackISSTLE(): TLEData {
  return {
    name: "ISS (ZARYA)",
    line1:
      "1 25544U 98067A   24001.50000000  .00016717  00000-0  10270-3 0  9994",
    line2:
      "2 25544  51.6400 337.6640 0007776  35.4801 324.6680 15.50809148339470",
  };
}

// ── Fetch astronauts on ISS ───────────────────
export async function fetchAstronauts(): Promise<string[]> {
  try {
    const res = await fetch(API_ENDPOINTS.ISS_PEOPLE, {
      next: { revalidate: 3600 },
    });
    const data = await res.json();
    return (data.people || [])
      .filter((p: { craft: string }) => p.craft === "ISS")
      .map((p: { name: string }) => p.name);
  } catch {
    return ["Oleg Kononenko", "Tracy Caldwell Dyson", "Matthew Dominick"];
  }
}
