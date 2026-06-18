// ═══════════════════════════════════════════════
// ZENITH — Core TypeScript Types
// ═══════════════════════════════════════════════

// ── Location ─────────────────────────────────
export interface LocationData {
  lat: number;
  lon: number;
  name: string;
  country?: string;
  timezone?: string;
}

// ── Celestial Objects ─────────────────────────
export type CelestialObjectType =
  | "iss"
  | "satellite"
  | "planet"
  | "constellation"
  | "meteor_shower"
  | "conjunction";

export type SatelliteCategory =
  | "communication"
  | "weather"
  | "navigation"
  | "scientific"
  | "military"
  | "space_station"
  | "debris"
  | "other";

export interface CelestialObject {
  id: string;
  name: string;
  type: CelestialObjectType;
  lat: number;
  lon: number;
  altitude: number; // km
  speed?: number; // km/s
  inclination?: number; // degrees
  description?: string;
  category?: SatelliteCategory;
}

// ── ISS ───────────────────────────────────────
export interface ISSPosition {
  lat: number;
  lon: number;
  altitude: number; // km
  speed: number; // km/s
  inclination: number; // degrees
  timestamp: number;
  visibility?: "daylight" | "eclipsed" | "visible";
}

export interface ISSPassPrediction {
  riseTime: Date;
  setTime: Date;
  maxAltitude: number; // degrees above horizon
  duration: number; // seconds
  azimuth: number; // degrees
}

// ── Satellites ────────────────────────────────
export interface TLEData {
  name: string;
  line1: string;
  line2: string;
}

export interface SatelliteData {
  id: string;
  name: string;
  noradId: number;
  tle: TLEData;
  lat: number;
  lon: number;
  altitude: number; // km
  speed: number; // km/s
  inclination: number; // degrees
  category: SatelliteCategory;
  launchDate?: string;
  country?: string;
  purpose?: string;
}

// ── Planets ───────────────────────────────────
export type PlanetName =
  | "mercury"
  | "venus"
  | "mars"
  | "jupiter"
  | "saturn"
  | "uranus"
  | "neptune";

export interface PlanetData {
  id: PlanetName;
  name: string;
  emoji: string;
  color: string;
  glowColor: string;
  distanceAU: number; // current distance from Earth in AU
  magnitude: number; // apparent visual magnitude
  constellation: string; // current constellation
  riseTime?: string;
  setTime?: string;
  altitude?: number; // degrees above horizon at observer
  azimuth?: number; // compass bearing
  ra?: number; // right ascension (hours)
  dec?: number; // declination (degrees)
  isVisible?: boolean;
}

// ── Constellations ────────────────────────────
export interface StarData {
  ra: number; // right ascension in degrees
  dec: number; // declination in degrees
  mag: number; // visual magnitude
}

export interface ConstellationData {
  id: string;
  name: string;
  abbreviation: string;
  stars: StarData[];
  lines: number[][]; // index pairs connecting stars
  season: "spring" | "summer" | "autumn" | "winter" | "year-round";
  mythology?: string;
}

// ── Weather & Observability ───────────────────
export interface WeatherData {
  cloudCover: number; // 0–100 %
  visibility: number; // km
  humidity: number; // %
  temperature: number; // °C
  windSpeed: number; // km/h
  precipitation?: number; // mm
}

export interface MoonData {
  phase: number; // 0–1 (0=new, 0.5=full)
  phaseName: string;
  illumination: number; // 0–100 %
  riseTime?: string;
  setTime?: string;
  altitude?: number;
}

export interface ObservabilityScore {
  score: number; // 0–100
  label: "Excellent Viewing" | "Good Conditions" | "Poor Visibility";
  color: string;
  factors: {
    cloudCover: number; // component score
    moonIllumination: number;
    lightPollution: number;
  };
  weather: WeatherData;
  moon: MoonData;
}

// ── Events ────────────────────────────────────
export type EventType =
  | "iss_pass"
  | "meteor_shower"
  | "conjunction"
  | "eclipse"
  | "opposition"
  | "occultation";

export interface SkyEvent {
  id: string;
  type: EventType;
  title: string;
  description: string;
  startTime: Date;
  endTime?: Date;
  peakTime?: Date;
  coordinates?: { lat: number; lon: number };
  magnitude?: number;
  rating: "unmissable" | "excellent" | "good" | "moderate";
  tags: string[];
  imageUrl?: string;
}

// ── Sky Replay ────────────────────────────────
export interface ReplayEvent {
  id: string;
  title: string;
  description: string;
  date: Date;
  duration?: number; // seconds to replay
  coordinates?: { lat: number; lon: number };
  zoom?: number;
}

export type ReplayState = "idle" | "playing" | "paused" | "ended";
export type ReplaySpeed = 0.5 | 1 | 5 | 10 | 50 | 100;

// ── AI Explanations ───────────────────────────
export type ExplanationLevel = "beginner" | "intermediate" | "advanced";
export type TeacherMode = boolean;

export interface AIExplanation {
  objectId: string;
  level: ExplanationLevel;
  content: string;
  facts: string[];
  analogies?: string[];
  teacherNotes?: string;
}

// ── User Settings ─────────────────────────────
export interface UserSettings {
  theme: "dark"; // always dark for cosmic app
  reducedMotion: boolean;
  highContrast: boolean;
  explanationLevel: ExplanationLevel;
  teacherMode: boolean;
  units: "metric" | "imperial";
  globeMode: "3d" | "2d";
  autoLocate: boolean;
}

// ── Panel ─────────────────────────────────────
export type PanelTab = "overview" | "orbit" | "ai_explain" | "learn_more";

export type NavigationView =
  | "globe"
  | "satellites"
  | "iss"
  | "planets"
  | "events"
  | "settings";

// ── API Responses ─────────────────────────────
export interface OpenNotifyISSResponse {
  message: string;
  timestamp: number;
  iss_position: {
    latitude: string;
    longitude: string;
  };
}

export interface OpenMeteoResponse {
  latitude: number;
  longitude: number;
  current: {
    cloud_cover: number;
    visibility: number;
    wind_speed_10m: number;
    relative_humidity_2m: number;
    temperature_2m: number;
    precipitation: number;
  };
}

// ── Orbit Data ────────────────────────────────
export interface OrbitPoint {
  time: number; // unix timestamp
  lat: number;
  lon: number;
  altitude: number;
}

export interface OrbitalElements {
  semiMajorAxis: number; // km
  eccentricity: number;
  inclination: number; // degrees
  raan: number; // right ascension of ascending node (degrees)
  argumentOfPerigee: number; // degrees
  meanAnomaly: number; // degrees
  period: number; // minutes
  apogee: number; // km
  perigee: number; // km
}

// ── Map/Globe ─────────────────────────────────
export interface GlobeViewState {
  centerLat: number;
  centerLon: number;
  altitude?: number; // camera altitude in meters (Cesium)
  zoom?: number; // zoom level (Leaflet)
}
