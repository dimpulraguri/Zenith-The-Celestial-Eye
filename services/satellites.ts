import { API_ENDPOINTS } from "@/constants";
import { parseTLEText, propagateSatellite, classifySatellite } from "@/utils/orbital";
import type { SatelliteData, TLEData } from "@/types";

// ── Fetch TLE catalog ─────────────────────────
export async function fetchSatelliteCatalog(
  group: "stations" | "visual" | "weather" = "visual"
): Promise<TLEData[]> {
  const url =
    group === "stations"
      ? API_ENDPOINTS.SATELLITES_STATIONS
      : group === "weather"
      ? API_ENDPOINTS.SATELLITES_WEATHER
      : API_ENDPOINTS.SATELLITES_VISUAL;

  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    const text = await res.text();
    return parseTLEText(text);
  } catch (error) {
    console.warn(`Failed to fetch ${group} TLE catalog:`, error);
    return [];
  }
}

// ── Propagate multiple satellites ─────────────
export async function propagateSatellites(
  tles: TLEData[],
  date: Date = new Date(),
  limit: number = 100
): Promise<SatelliteData[]> {
  const subset = tles.slice(0, limit);
  const results: SatelliteData[] = [];

  for (const tle of subset) {
    const pos = await propagateSatellite(tle, date);
    if (!pos) continue;

    const noradMatch = tle.line1.match(/^1 (\d+)/);
    const noradId = noradMatch ? parseInt(noradMatch[1]) : 0;

    results.push({
      id: `sat-${noradId}`,
      name: tle.name,
      noradId,
      tle,
      lat: pos.lat,
      lon: pos.lon,
      altitude: pos.altitude,
      speed: pos.speed,
      inclination: parseFloat(tle.line2.substring(8, 16).trim()),
      category: classifySatellite(tle.name),
    });
  }

  return results;
}

// ── Get visible satellites from location ──────
export async function getVisibleSatellites(
  observerLat: number,
  observerLon: number,
  maxDistance: number = 3000 // km
): Promise<SatelliteData[]> {
  const [visualTLEs] = await Promise.all([
    fetchSatelliteCatalog("visual"),
  ]);

  const allTLEs = [...visualTLEs];
  const satellites = await propagateSatellites(allTLEs, new Date(), 150);

  // Filter to visible (roughly) from observer location
  return satellites
    .filter((sat) => {
      const dist = Math.sqrt(
        (sat.lat - observerLat) ** 2 + (sat.lon - observerLon) ** 2
      );
      return dist < maxDistance / 111; // rough degree conversion
    })
    .slice(0, 50);
}
