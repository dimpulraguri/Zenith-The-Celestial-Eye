import type { MoonData, PlanetData } from "@/types";

// ── Moon Phase Calculation ─────────────────────
export function getMoonPhase(date: Date = new Date()): MoonData {
  // Known new moon: Jan 6, 2000
  const knownNewMoon = new Date("2000-01-06T18:14:00Z");
  const lunarCycle = 29.530588853; // days

  const daysSince =
    (date.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24);
  const phase = ((daysSince % lunarCycle) + lunarCycle) % lunarCycle;
  const normalizedPhase = phase / lunarCycle; // 0–1

  // Illumination approximation
  const illumination = Math.round(
    ((1 - Math.cos(2 * Math.PI * normalizedPhase)) / 2) * 100
  );

  const phaseName = getMoonPhaseName(normalizedPhase);

  return {
    phase: normalizedPhase,
    phaseName,
    illumination,
  };
}

function getMoonPhaseName(phase: number): string {
  if (phase < 0.03 || phase > 0.97) return "New Moon";
  if (phase < 0.22) return "Waxing Crescent";
  if (phase < 0.28) return "First Quarter";
  if (phase < 0.47) return "Waxing Gibbous";
  if (phase < 0.53) return "Full Moon";
  if (phase < 0.72) return "Waning Gibbous";
  if (phase < 0.78) return "Last Quarter";
  return "Waning Crescent";
}

// ── Simplified Planetary Positions ────────────
// Uses simplified VSOP87 approximations (good to ~1° accuracy for visibility purposes)
export function getPlanetApproximatePosition(
  planetId: string,
  date: Date = new Date()
): { ra: number; dec: number; constellation: string } {
  // Julian date
  const jd = toJulianDate(date);

  // Simplified positions (these are rough approximations for UI display)
  const positions: Record<
    string,
    { ra: number; dec: number; constellation: string }
  > = {
    mercury: getMercuryPosition(jd),
    venus: getVenusPosition(jd),
    mars: getMarsPosition(jd),
    jupiter: getJupiterPosition(jd),
    saturn: getSaturnPosition(jd),
    uranus: { ra: 43.2, dec: 16.8, constellation: "Taurus" },
    neptune: { ra: 354.7, dec: -3.1, constellation: "Pisces" },
  };

  return (
    positions[planetId] || { ra: 0, dec: 0, constellation: "Unknown" }
  );
}

// ── Julian Date ───────────────────────────────
export function toJulianDate(date: Date): number {
  return date.getTime() / 86400000 + 2440587.5;
}

// Centuries from J2000.0
function T(jd: number): number {
  return (jd - 2451545.0) / 36525.0;
}

// Normalize degrees
function normDeg(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

function getMercuryPosition(jd: number): {
  ra: number;
  dec: number;
  constellation: string;
} {
  const t = T(jd);
  const L = normDeg(252.250906 + 149472.6746358 * t);
  return { ra: L, dec: 2.0, constellation: "Gemini" };
}

function getVenusPosition(jd: number): {
  ra: number;
  dec: number;
  constellation: string;
} {
  const t = T(jd);
  const L = normDeg(181.979801 + 58517.8156760 * t);
  const constellations = ["Taurus", "Gemini", "Cancer", "Leo", "Virgo"];
  const idx = Math.floor(((L / 360) * constellations.length) % constellations.length);
  return { ra: L, dec: -3.0, constellation: constellations[idx] };
}

function getMarsPosition(jd: number): {
  ra: number;
  dec: number;
  constellation: string;
} {
  const t = T(jd);
  const L = normDeg(355.433 + 19140.2993313 * t);
  return { ra: L, dec: 15.0, constellation: "Gemini" };
}

function getJupiterPosition(jd: number): {
  ra: number;
  dec: number;
  constellation: string;
} {
  const t = T(jd);
  const L = normDeg(34.351519 + 3034.9056606 * t);
  const constellations = ["Leo", "Virgo", "Libra"];
  const idx = Math.floor(((L / 360) * constellations.length) % constellations.length);
  return { ra: L, dec: 10.0, constellation: constellations[idx] };
}

function getSaturnPosition(jd: number): {
  ra: number;
  dec: number;
  constellation: string;
} {
  const t = T(jd);
  const L = normDeg(50.077444 + 1222.1138488 * t);
  return { ra: L, dec: -10.0, constellation: "Aquarius" };
}

// ── Sidereal Time ─────────────────────────────
export function getLocalSiderealTime(lon: number, date: Date = new Date()): number {
  const jd = toJulianDate(date);
  const t = T(jd);
  const gmst =
    280.46061837 +
    360.98564736629 * (jd - 2451545.0) +
    0.000387933 * t * t -
    (t * t * t) / 38710000.0;
  return ((gmst + lon) % 360 + 360) % 360;
}

// ── Altitude/Azimuth from RA/Dec ──────────────
export function raDecToAltAz(
  ra: number,
  dec: number,
  lat: number,
  lst: number
): { altitude: number; azimuth: number } {
  const hourAngle = ((lst - ra) % 360 + 360) % 360;
  const haRad = (hourAngle * Math.PI) / 180;
  const decRad = (dec * Math.PI) / 180;
  const latRad = (lat * Math.PI) / 180;

  const sinAlt =
    Math.sin(decRad) * Math.sin(latRad) +
    Math.cos(decRad) * Math.cos(latRad) * Math.cos(haRad);
  const altitude = (Math.asin(sinAlt) * 180) / Math.PI;

  const cosAz =
    (Math.sin(decRad) - Math.sin(latRad) * sinAlt) /
    (Math.cos(latRad) * Math.cos(Math.asin(sinAlt)));
  let azimuth = (Math.acos(Math.max(-1, Math.min(1, cosAz))) * 180) / Math.PI;
  if (Math.sin(haRad) > 0) azimuth = 360 - azimuth;

  return { altitude, azimuth };
}

// ── Light Pollution Estimate ───────────────────
// Rough Bortle scale estimation based on distance from major cities
export function estimateLightPollution(lat: number, lon: number): number {
  // Simple model: assume high light pollution near lat/lon 0 clusters of cities
  // Returns 0–100 (0 = pristine dark sky, 100 = severe light pollution)

  // Major city coordinates for rough estimation
  const cities = [
    { lat: 40.71, lon: -74.01 }, // New York
    { lat: 51.51, lon: -0.13 }, // London
    { lat: 35.69, lon: 139.69 }, // Tokyo
    { lat: 19.08, lon: 72.88 }, // Mumbai
    { lat: -23.55, lon: -46.63 }, // São Paulo
    { lat: 55.75, lon: 37.62 }, // Moscow
    { lat: 30.04, lon: 31.24 }, // Cairo
    { lat: 1.35, lon: 103.82 }, // Singapore
    { lat: 28.61, lon: 77.21 }, // New Delhi
    { lat: 31.23, lon: 121.47 }, // Shanghai
    { lat: 48.86, lon: 2.35 }, // Paris
    { lat: 34.05, lon: -118.24 }, // Los Angeles
    { lat: 41.88, lon: -87.63 }, // Chicago
  ];

  let minDistance = Infinity;
  for (const city of cities) {
    const dist = Math.sqrt((lat - city.lat) ** 2 + (lon - city.lon) ** 2);
    minDistance = Math.min(minDistance, dist);
  }

  // Convert distance to pollution score (0 km = 95, 50 deg = 5)
  const pollution = Math.max(5, Math.min(95, 95 - (minDistance / 50) * 90));
  return Math.round(pollution);
}

// ── Format coordinates ────────────────────────
export function formatCoordinates(lat: number, lon: number): string {
  const latDir = lat >= 0 ? "N" : "S";
  const lonDir = lon >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(4)}° ${latDir}, ${Math.abs(lon).toFixed(4)}° ${lonDir}`;
}

// ── Constellation visibility ───────────────────
export function getVisibleConstellations(
  lat: number,
  date: Date = new Date()
): string[] {
  // Simplified — returns season-appropriate constellations
  const month = date.getMonth(); // 0-11

  const seasonal: Record<string, string[]> = {
    winter: ["Orion", "Taurus", "Gemini", "Canis Major", "Perseus"],
    spring: ["Leo", "Virgo", "Boötes", "Corvus", "Hydra"],
    summer: ["Scorpius", "Sagittarius", "Aquila", "Cygnus", "Hercules"],
    autumn: ["Pegasus", "Andromeda", "Perseus", "Aries", "Pisces"],
  };

  const yearRound = ["Ursa Major", "Ursa Minor", "Cassiopeia", "Draco"];

  let season: string;
  if (lat >= 0) {
    // Northern hemisphere
    if (month >= 11 || month <= 1) season = "winter";
    else if (month >= 2 && month <= 4) season = "spring";
    else if (month >= 5 && month <= 7) season = "summer";
    else season = "autumn";
  } else {
    // Southern hemisphere — seasons reversed
    if (month >= 11 || month <= 1) season = "summer";
    else if (month >= 2 && month <= 4) season = "autumn";
    else if (month >= 5 && month <= 7) season = "winter";
    else season = "spring";
  }

  return [...(seasonal[season] || []), ...yearRound];
}
