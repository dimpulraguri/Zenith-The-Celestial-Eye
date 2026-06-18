// ── satellite.js - using require for compatibility
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SatLib = any;

let satLib: SatLib = null;

async function getSatelliteLib(): Promise<SatLib> {
  if (!satLib) {
    satLib = await import("satellite.js");
  }
  return satLib;
}

import type {
  TLEData,
  SatelliteCategory,
  OrbitalElements,
  OrbitPoint,
} from "@/types";

// ── Parse TLE text ────────────────────────────
export function parseTLEText(text: string): TLEData[] {
  const lines = text
    .trim()
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const result: TLEData[] = [];

  for (let i = 0; i < lines.length - 2; i += 3) {
    const name = lines[i];
    const line1 = lines[i + 1];
    const line2 = lines[i + 2];

    if (line1?.startsWith("1 ") && line2?.startsWith("2 ")) {
      result.push({ name: name.trim(), line1, line2 });
    }
  }

  return result;
}

// ── Propagate satellite position from TLE ─────
export async function propagateSatellite(
  tle: TLEData,
  date: Date = new Date()
): Promise<{ lat: number; lon: number; altitude: number; speed: number } | null> {
  try {
    const sat = await getSatelliteLib();
    const satrec = sat.twoline2satrec(tle.line1, tle.line2);
    const posVel = sat.propagate(satrec, date);

    if (!posVel || typeof posVel.position === "boolean" || !posVel.position) {
      return null;
    }

    const gmst = sat.gstime(date);
    const geographic = sat.eciToGeodetic(posVel.position, gmst);

    const lat = sat.degreesLat(geographic.latitude);
    const lon = sat.degreesLong(geographic.longitude);
    const altitude = geographic.height; // km

    // Calculate speed from velocity vector
    let speed = 7.66; // default km/s
    if (
      posVel.velocity &&
      typeof posVel.velocity !== "boolean" &&
      posVel.velocity
    ) {
      const vel = posVel.velocity;
      speed = Math.sqrt(vel.x ** 2 + vel.y ** 2 + vel.z ** 2);
    }

    return { lat, lon, altitude, speed };
  } catch {
    return null;
  }
}

// ── Get orbital elements from TLE ─────────────
export function getOrbitalElements(tle: TLEData): OrbitalElements {
  const line2 = tle.line2;
  const inclination = parseFloat(line2.substring(8, 16).trim());
  const raan = parseFloat(line2.substring(17, 25).trim());
  const eccentricity = parseFloat("0." + line2.substring(26, 33).trim());
  const argumentOfPerigee = parseFloat(line2.substring(34, 42).trim());
  const meanAnomaly = parseFloat(line2.substring(43, 51).trim());
  const meanMotion = parseFloat(line2.substring(52, 63).trim()); // rev/day

  // Derived values
  const period = 1440 / meanMotion; // minutes
  const mu = 398600.4418; // km^3/s^2
  const a = Math.pow(mu / Math.pow((2 * Math.PI) / (period * 60), 2), 1 / 3);

  const perigee = a * (1 - eccentricity) - 6371; // km above surface
  const apogee = a * (1 + eccentricity) - 6371; // km above surface

  return {
    semiMajorAxis: a,
    eccentricity,
    inclination,
    raan,
    argumentOfPerigee,
    meanAnomaly,
    period,
    apogee,
    perigee,
  };
}

// ── Generate orbit path points ─────────────────
export async function generateOrbitPath(
  tle: TLEData,
  steps: number = 100
): Promise<OrbitPoint[]> {
  try {
    const sat = await getSatelliteLib();
    const satrec = sat.twoline2satrec(tle.line1, tle.line2);
    const elements = getOrbitalElements(tle);
    const periodMs = elements.period * 60 * 1000;

    const now = Date.now();
    const points: OrbitPoint[] = [];

    for (let i = 0; i <= steps; i++) {
      const t = now + (i / steps) * periodMs;
      const date = new Date(t);
      const posVel = sat.propagate(satrec, date);

      if (
        !posVel ||
        typeof posVel.position === "boolean" ||
        !posVel.position
      ) {
        continue;
      }

      const gmst = sat.gstime(date);
      const geo = sat.eciToGeodetic(posVel.position, gmst);

      points.push({
        time: t,
        lat: sat.degreesLat(geo.latitude),
        lon: sat.degreesLong(geo.longitude),
        altitude: geo.height,
      });
    }

    return points;
  } catch {
    return [];
  }
}

// ── Classify satellite by name ─────────────────
export function classifySatellite(name: string): SatelliteCategory {
  const n = name.toUpperCase();

  if (
    n.includes("ISS") ||
    n.includes("TIANGONG") ||
    n.includes("CSS") ||
    n.includes("ZARYA")
  ) {
    return "space_station";
  }
  if (
    n.includes("STARLINK") ||
    n.includes("ONEWEB") ||
    n.includes("IRIDIUM") ||
    n.includes("INTELSAT") ||
    n.includes("SES") ||
    n.includes("TELESAT") ||
    n.includes("GLOBALSTAR") ||
    n.includes("ORBCOMM")
  ) {
    return "communication";
  }
  if (
    n.includes("GPS") ||
    n.includes("GLONASS") ||
    n.includes("GALILEO") ||
    n.includes("BEIDOU") ||
    n.includes("NAVSTAR") ||
    n.includes("NAVIC")
  ) {
    return "navigation";
  }
  if (
    n.includes("NOAA") ||
    n.includes("METEOSAT") ||
    n.includes("GOES") ||
    n.includes("METEOR") ||
    n.includes("FENGYUN") ||
    n.includes("DMSP")
  ) {
    return "weather";
  }
  if (
    n.includes("HUBBLE") ||
    n.includes("CHANDRA") ||
    n.includes("FERMI") ||
    n.includes("SWIFT") ||
    n.includes("AQUA") ||
    n.includes("TERRA") ||
    n.includes("LANDSAT") ||
    n.includes("SENTINEL") ||
    n.includes("ICESAT")
  ) {
    return "scientific";
  }
  if (
    n.includes("USA ") ||
    n.includes("NOSS") ||
    n.includes("LACROSSE") ||
    n.includes("KH-")
  ) {
    return "military";
  }
  if (n.includes("DEB") || n.includes("R/B") || n.includes("ROCKET BODY")) {
    return "debris";
  }

  return "other";
}

// ── Degrees/Radians ───────────────────────────
export const toRad = (deg: number) => (deg * Math.PI) / 180;
export const toDeg = (rad: number) => (rad * 180) / Math.PI;

// ── Great circle distance ─────────────────────
export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ── Is satellite visible from location ────────
export function isSatelliteVisible(
  obsLat: number,
  obsLon: number,
  satLat: number,
  satLon: number,
  satAltKm: number
): boolean {
  const dist = haversineDistance(obsLat, obsLon, satLat, satLon);
  // Approximate horizon distance
  const horizonDist = Math.sqrt(2 * 6371 * satAltKm);
  return dist < horizonDist;
}
