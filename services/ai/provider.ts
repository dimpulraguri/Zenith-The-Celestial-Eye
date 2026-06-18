// ═══════════════════════════════════════════════════════
// services/ai/provider.ts
// AI provider abstraction layer + in-memory cache
// ═══════════════════════════════════════════════════════

import type { ExplanationLevel } from "@/types";
import type { ObjectContext } from "./prompts";

// ── Static fallback data (from original AIExplainTab) ──
const STATIC_EXPLANATIONS: Record<
  string,
  Record<ExplanationLevel, string> & { teacherNotes: string; facts: string[] }
> = {
  iss: {
    beginner:
      "The ISS is a giant space house where astronauts live and work. It's about the size of a football field and floats around Earth so fast that it completes a full orbit in just 92 minutes! You can even spot it in the night sky — it looks like a very bright, fast-moving star.",
    intermediate:
      "The International Space Station (ISS) orbits Earth at approximately 408 km altitude in Low Earth Orbit (LEO), traveling at 7.66 km/s and completing one orbit every 92.68 minutes. It's a collaborative project between NASA, Roscosmos, ESA, JAXA, and CSA, serving as a microgravity research laboratory with continuous human presence since November 2000.",
    advanced:
      "The ISS maintains its 51.6° inclination LEO orbit through periodic reboosts using Progress spacecraft to counteract atmospheric drag (~90 m/day decay). Position is computed via SGP4 propagation from USSPACECOM TLE datasets updated daily. The orbit's inclination was chosen to maximize accessibility from both American (28.5°N) and Russian (51.6°N) launch sites while providing optimal global ground track coverage.",
    teacherNotes:
      "Teaching point: The ISS demonstrates orbital mechanics — ask students why it doesn't fall. (It's constantly falling, but moving forward so fast it misses Earth.) This introduces orbital velocity and Kepler's first law. Connect to centripetal acceleration: a = v²/r.",
    facts: [
      "Continuously inhabited since November 2, 2000 — over 24 years",
      "Orbits Earth ~15.5 times per day at 7.66 km/s",
      "Weighs approximately 420,000 kg with a 109 m × 73 m footprint",
      "Over 270 people from 21 countries have visited the ISS",
      "Its solar arrays generate up to 120 kilowatts of electricity",
    ],
  },
  satellite: {
    beginner:
      "Satellites are machines we've sent into space to help us every day. Some guide us with GPS, some photograph storms for weather forecasts, and others beam TV signals across continents. Think of them as our eyes and ears floating high above Earth!",
    intermediate:
      "Artificial satellites occupy various orbital regimes based on their mission: LEO (160–2,000 km) for Earth observation and communications, MEO (2,000–35,786 km) for navigation constellations like GPS and Galileo, and GEO (35,786 km) where satellites appear stationary, ideal for broadcasting and weather monitoring.",
    advanced:
      "Satellite orbital dynamics are governed by the two-body problem with perturbative forces: J2 oblateness (dominant in LEO), atmospheric drag (significant below 600 km), solar radiation pressure, and lunisolar gravity. TLE sets encode mean Brouwer orbital elements propagated via SGP4 (LEO/MEO) or SDP4 (HEO/GEO), with epoch-referenced osculating elements in the TEME reference frame.",
    teacherNotes:
      "Use Kepler's third law (T² ∝ a³) as a teaching tool: GPS at 20,200 km has a 12-hour period; the ISS at 408 km takes 92 minutes. Have students calculate orbital periods at different altitudes to internalize the altitude-period relationship.",
    facts: [
      "Over 9,000 active satellites currently orbit Earth",
      "Starlink alone has deployed over 6,000 satellites",
      "The first satellite, Sputnik 1, was launched October 4, 1957",
      "GPS satellites maintain accuracy to within 30 cm",
      "A single geostationary satellite covers ~42% of Earth's surface",
    ],
  },
  planet: {
    beginner:
      "Planets are enormous balls of rock or swirling gas orbiting our Sun. Each one is a completely different world — some have rings made of ice and rock, some have storms larger than Earth, and some are so far away that sunlight takes hours to reach them!",
    intermediate:
      "Solar system planets are classified as terrestrial (rocky: Mercury, Venus, Earth, Mars) or Jovian (gas/ice giants: Jupiter, Saturn, Uranus, Neptune). Their positions are computed from VSOP87 or JPL DE440 ephemerides, accounting for mutual gravitational perturbations that create subtle secular variations over millennia.",
    advanced:
      "Precise planetary ephemerides use JPL DE440 — a numerically integrated n-body solution fitting centuries of optical, radar, and spacecraft tracking data with sub-arcsecond accuracy. Planetary positions in ICRF/J2000 are transformed to local horizontal coordinates via GAST sidereal time, precession/nutation matrices, and the observer's geodetic latitude. Apparent positions require correction for light-time, stellar aberration, and atmospheric refraction.",
    teacherNotes:
      "Connect planetary orbital periods to Kepler's third law. Challenge students: if Jupiter is 5.2 AU from the Sun, how long is its year? (Answer: ~11.9 Earth years.) This reinforces the cube-square relationship and builds intuition for scale in the solar system.",
    facts: [
      "Jupiter is 1,300 times the volume of Earth",
      "Venus rotates backwards relative to other planets",
      "Saturn's rings are less than 1 km thick despite being 282,000 km wide",
      "A day on Mercury is longer than a year on Mercury",
      "Neptune's winds reach 2,100 km/h — the fastest in the solar system",
    ],
  },
  default: {
    beginner:
      "This is a fascinating object in our cosmic neighborhood, following the invisible forces of gravity that govern everything in the universe. Scientists have spent centuries uncovering the mathematical rules behind objects like this — and they're surprisingly beautiful and precise.",
    intermediate:
      "Celestial objects follow predictable Keplerian orbital paths modified by perturbative forces including gravitational interactions with other bodies, solar radiation pressure, and atmospheric drag. Modern computational ephemerides allow precise position predictions decades into the future.",
    advanced:
      "High-precision astrometry for solar system objects employs numerical integration of the full n-body problem with post-Newtonian relativistic corrections (PPN formalism). Position solutions are anchored to the ICRF3 inertial reference frame via VLBI astrometry, with Earth-fixed coordinates in ITRF2020 connected through IERS Earth Orientation Parameters updated at weekly cadence.",
    teacherNotes:
      "This object provides an excellent entry point for Newton's Law of Universal Gravitation. Ask: if this object were twice as far away, how would the gravitational force change? (One-quarter as strong.) This builds intuition for inverse-square laws in physics.",
    facts: [
      "Gravity governs all orbital motion in the universe",
      "Orbital mechanics was formalized by Johannes Kepler in 1609",
      "Even GPS satellites require relativistic corrections to stay accurate",
      "Orbital periods can be predicted centuries in advance",
      "Space debris follows the same physical laws as operational satellites",
    ],
  },
};

export function getStaticExplanation(
  objectType: string,
  level: ExplanationLevel
): string {
  const key = objectType in STATIC_EXPLANATIONS ? objectType : "default";
  return STATIC_EXPLANATIONS[key][level];
}

export function getStaticFacts(objectType: string): string[] {
  const key = objectType in STATIC_EXPLANATIONS ? objectType : "default";
  return STATIC_EXPLANATIONS[key].facts;
}

export function getStaticTeacherNotes(objectType: string): string {
  const key = objectType in STATIC_EXPLANATIONS ? objectType : "default";
  return STATIC_EXPLANATIONS[key].teacherNotes;
}

// ── Response cache (in-memory, keyed by objectId+level) ──
interface CacheEntry {
  text: string;
  timestamp: number;
}

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const explanationCache = new Map<string, CacheEntry>();
const teacherNoteCache = new Map<string, CacheEntry>();

function getCacheKey(objectId: string, level: ExplanationLevel): string {
  return `${objectId}::${level}`;
}

export function getCachedExplanation(
  objectId: string,
  level: ExplanationLevel
): string | null {
  const key = getCacheKey(objectId, level);
  const entry = explanationCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    explanationCache.delete(key);
    return null;
  }
  return entry.text;
}

export function setCachedExplanation(
  objectId: string,
  level: ExplanationLevel,
  text: string
): void {
  explanationCache.set(getCacheKey(objectId, level), {
    text,
    timestamp: Date.now(),
  });
}

export function getCachedTeacherNote(objectId: string): string | null {
  const entry = teacherNoteCache.get(objectId);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    teacherNoteCache.delete(objectId);
    return null;
  }
  return entry.text;
}

export function setCachedTeacherNote(objectId: string, text: string): void {
  teacherNoteCache.set(objectId, { text, timestamp: Date.now() });
}

// Re-export ObjectContext for external use
export type { ObjectContext };
