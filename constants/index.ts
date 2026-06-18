import type { PlanetData, ReplayEvent, SkyEvent } from "@/types";

// ── API Endpoints ─────────────────────────────
export const API_ENDPOINTS = {
  ISS_TLE: "https://celestrak.org/NORAD/elements/gp.php?CATNR=25544&FORMAT=TLE",
  ISS_POSITION: "https://api.open-notify.org/iss-now.json",
  ISS_PEOPLE: "https://api.open-notify.org/astros.json",
  SATELLITES_STATIONS:
    "https://celestrak.org/NORAD/elements/gp.php?GROUP=stations&FORMAT=TLE",
  SATELLITES_VISUAL:
    "https://celestrak.org/NORAD/elements/gp.php?GROUP=visual&FORMAT=TLE",
  SATELLITES_WEATHER:
    "https://celestrak.org/NORAD/elements/gp.php?GROUP=weather&FORMAT=TLE",
  OPEN_METEO: "https://api.open-meteo.com/v1/forecast",
  NOMINATIM_SEARCH: "https://nominatim.openstreetmap.org/search",
  NOMINATIM_REVERSE: "https://nominatim.openstreetmap.org/reverse",
} as const;

// ── Timing ────────────────────────────────────
export const REFRESH_INTERVALS = {
  ISS_POSITION: 5000, // 5 seconds
  SATELLITE_POSITIONS: 30000, // 30 seconds
  WEATHER: 300000, // 5 minutes
  TLE_DATA: 3600000 * 2, // 2 hours
  PLANET_POSITIONS: 3600000, // 1 hour
} as const;

// ── Map Config ────────────────────────────────
export const MAP_CONFIG = {
  DEFAULT_CENTER: { lat: 20, lon: 0 },
  DEFAULT_ZOOM: 3,
  MIN_ZOOM: 2,
  MAX_ZOOM: 18,
  TILE_URL: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
  TILE_ATTRIBUTION:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
} as const;

// ── ISS ───────────────────────────────────────
export const ISS_NORAD_ID = 25544;
export const ISS_CONFIG = {
  altitude: 408, // approximate km
  speed: 7.66, // km/s
  orbitalPeriod: 92.68, // minutes
  inclination: 51.6, // degrees
  color: "#F59E0B",
  glowColor: "rgba(245, 158, 11, 0.6)",
};

// ── Planet Definitions ────────────────────────
export const PLANETS: PlanetData[] = [
  {
    id: "mercury",
    name: "Mercury",
    emoji: "☿",
    color: "#9CA3AF",
    glowColor: "rgba(156, 163, 175, 0.6)",
    distanceAU: 0.39,
    magnitude: -1.9,
    constellation: "Gemini",
    isVisible: false,
  },
  {
    id: "venus",
    name: "Venus",
    emoji: "♀",
    color: "#FDE68A",
    glowColor: "rgba(253, 230, 138, 0.6)",
    distanceAU: 0.72,
    magnitude: -4.6,
    constellation: "Taurus",
    isVisible: true,
  },
  {
    id: "mars",
    name: "Mars",
    emoji: "♂",
    color: "#F87171",
    glowColor: "rgba(248, 113, 113, 0.6)",
    distanceAU: 1.52,
    magnitude: -2.9,
    constellation: "Gemini",
    isVisible: true,
  },
  {
    id: "jupiter",
    name: "Jupiter",
    emoji: "♃",
    color: "#FB923C",
    glowColor: "rgba(251, 146, 60, 0.6)",
    distanceAU: 5.2,
    magnitude: -2.9,
    constellation: "Leo",
    isVisible: true,
  },
  {
    id: "saturn",
    name: "Saturn",
    emoji: "♄",
    color: "#FCD34D",
    glowColor: "rgba(252, 211, 77, 0.6)",
    distanceAU: 9.58,
    magnitude: 0.7,
    constellation: "Aquarius",
    isVisible: true,
  },
  {
    id: "uranus",
    name: "Uranus",
    emoji: "⛢",
    color: "#67E8F9",
    glowColor: "rgba(103, 232, 249, 0.6)",
    distanceAU: 19.2,
    magnitude: 5.7,
    constellation: "Taurus",
    isVisible: false,
  },
  {
    id: "neptune",
    name: "Neptune",
    emoji: "♆",
    color: "#818CF8",
    glowColor: "rgba(129, 140, 248, 0.6)",
    distanceAU: 30.05,
    magnitude: 7.8,
    constellation: "Pisces",
    isVisible: false,
  },
];

// ── Satellite Categories ───────────────────────
export const SATELLITE_CATEGORY_CONFIG = {
  communication: {
    label: "Communication",
    color: "#60A5FA",
    bgColor: "rgba(96, 165, 250, 0.15)",
    icon: "Radio",
  },
  weather: {
    label: "Weather",
    color: "#34D399",
    bgColor: "rgba(52, 211, 153, 0.15)",
    icon: "Cloud",
  },
  navigation: {
    label: "Navigation",
    color: "#FBBF24",
    bgColor: "rgba(251, 191, 36, 0.15)",
    icon: "Navigation",
  },
  scientific: {
    label: "Scientific",
    color: "#A78BFA",
    bgColor: "rgba(167, 139, 250, 0.15)",
    icon: "Microscope",
  },
  military: {
    label: "Military",
    color: "#F87171",
    bgColor: "rgba(248, 113, 113, 0.15)",
    icon: "Shield",
  },
  space_station: {
    label: "Space Station",
    color: "#F59E0B",
    bgColor: "rgba(245, 158, 11, 0.15)",
    icon: "Orbit",
  },
  debris: {
    label: "Debris",
    color: "#6B7280",
    bgColor: "rgba(107, 114, 128, 0.15)",
    icon: "Trash2",
  },
  other: {
    label: "Other",
    color: "#94A3B8",
    bgColor: "rgba(148, 163, 184, 0.15)",
    icon: "Star",
  },
} as const;

// ── Sky Replay Prebuilt Events ─────────────────
export const REPLAY_EVENTS: ReplayEvent[] = [
  {
    id: "great-conjunction-2020",
    title: "Great Conjunction 2020",
    description:
      "Jupiter and Saturn appeared closer than they had since 1623, separated by only 0.1°. This rare celestial event was visible worldwide.",
    date: new Date("2020-12-21T18:00:00Z"),
    coordinates: { lat: 30, lon: 0 },
  },
  {
    id: "solar-eclipse-2024",
    title: "Total Solar Eclipse 2024",
    description:
      "A total solar eclipse crossed North America from Mexico through Texas to Maine, with totality lasting up to 4 minutes 28 seconds.",
    date: new Date("2024-04-08T18:17:00Z"),
    coordinates: { lat: 32, lon: -96 },
  },
  {
    id: "perseid-2024",
    title: "Perseid Meteor Shower 2024",
    description:
      "One of the most reliable meteor showers, producing up to 100 meteors per hour at peak. The Perseus constellation was the radiant point.",
    date: new Date("2024-08-12T03:00:00Z"),
    coordinates: { lat: 45, lon: 0 },
  },
  {
    id: "saturn-opposition-2025",
    title: "Saturn at Opposition 2025",
    description:
      "Saturn reached opposition, appearing at its largest and brightest in the sky. The rings were tilted at 26° offering spectacular views.",
    date: new Date("2025-09-21T00:00:00Z"),
    coordinates: { lat: 0, lon: 0 },
  },
  {
    id: "iss-flyover-next",
    title: "Next ISS Flyover",
    description:
      "Witness the International Space Station passing overhead, moving at 7.66 km/s and appearing as a bright star crossing the sky in minutes.",
    date: new Date(Date.now() + 6 * 3600000), // ~6 hours from now
    coordinates: { lat: 28.6, lon: 77.2 },
  },
];

// ── Upcoming Sky Events ────────────────────────
export const SKY_EVENTS: SkyEvent[] = [
  {
    id: "perseids-2025",
    type: "meteor_shower",
    title: "Perseid Meteor Shower Peak",
    description:
      "Up to 100 meteors per hour. Look northeast after midnight. Radiant point in Perseus.",
    startTime: new Date("2025-08-11T21:00:00Z"),
    endTime: new Date("2025-08-13T06:00:00Z"),
    peakTime: new Date("2025-08-12T03:00:00Z"),
    rating: "unmissable",
    tags: ["meteor", "perseus", "summer"],
  },
  {
    id: "jupiter-saturn-conj-2025",
    type: "conjunction",
    title: "Jupiter–Saturn Conjunction",
    description:
      "Jupiter and Saturn appear within 1° of each other in the evening sky.",
    startTime: new Date("2025-12-15T19:00:00Z"),
    rating: "excellent",
    tags: ["planets", "conjunction", "evening"],
  },
  {
    id: "lunar-eclipse-2025",
    type: "eclipse",
    title: "Total Lunar Eclipse",
    description:
      "The Moon enters Earth's shadow completely, turning a deep red (Blood Moon). Visible from Americas, Europe, and Africa.",
    startTime: new Date("2025-09-07T17:30:00Z"),
    endTime: new Date("2025-09-07T21:45:00Z"),
    peakTime: new Date("2025-09-07T19:37:00Z"),
    rating: "unmissable",
    tags: ["eclipse", "lunar", "blood moon"],
  },
  {
    id: "leonids-2025",
    type: "meteor_shower",
    title: "Leonid Meteor Shower",
    description:
      "Known for occasional meteor storms. Radiant point in Leo constellation.",
    startTime: new Date("2025-11-17T02:00:00Z"),
    peakTime: new Date("2025-11-17T04:00:00Z"),
    rating: "good",
    tags: ["meteor", "leo", "november"],
  },
  {
    id: "venus-jupiter-conj",
    type: "conjunction",
    title: "Venus–Jupiter Conjunction",
    description:
      "Venus and Jupiter appear extremely close in the pre-dawn sky, both clearly visible to the naked eye.",
    startTime: new Date("2025-08-23T05:00:00Z"),
    rating: "excellent",
    tags: ["planets", "venus", "jupiter", "dawn"],
  },
];

// ── Cosmic Facts ──────────────────────────────
export const COSMIC_FACTS = [
  "The ISS orbits Earth every 92 minutes, completing 15.5 orbits per day.",
  "Light from the Sun takes about 8 minutes 20 seconds to reach Earth.",
  "Saturn would float in water — it's less dense than water.",
  "One day on Venus is longer than one year on Venus.",
  "The Milky Way galaxy contains an estimated 100–400 billion stars.",
  "Neutron stars can spin at 700 rotations per second.",
  "The observable universe is approximately 93 billion light-years in diameter.",
  "Jupiter's Great Red Spot storm has been raging for over 350 years.",
  "There are more stars in the universe than grains of sand on all Earth's beaches.",
  "The ISS experiences 16 sunrises and 16 sunsets every day.",
  "Mars has the tallest volcano in the solar system: Olympus Mons at 21.9 km high.",
  "A year on Mercury is only 88 Earth days.",
  "The Voyager 1 spacecraft is now over 23 billion km from the Sun.",
  "Pluto's moon Charon is so large that they orbit each other.",
  "The sun accounts for 99.86% of all mass in the solar system.",
  "Light takes over 4 years to travel from the nearest star (Proxima Centauri).",
  "There are at least 200 billion galaxies in the observable universe.",
  "A teaspoon of neutron star material would weigh about 10 million tons.",
  "The rings of Saturn are mostly water ice particles.",
  "Europa, Jupiter's moon, likely has more liquid water than all of Earth's oceans.",
];

// ── Observability Labels ───────────────────────
export const OBSERVABILITY_THRESHOLDS = {
  EXCELLENT: 70,
  GOOD: 40,
} as const;

// ── Navigation Items ──────────────────────────
export const NAV_ITEMS = [
  { id: "globe", label: "Sky Globe", icon: "Globe2" },
  { id: "satellites", label: "Satellites", icon: "Satellite" },
  { id: "iss", label: "ISS Tracker", icon: "Rocket" },
  { id: "planets", label: "Planets", icon: "Circle" },
  { id: "events", label: "Events", icon: "Calendar" },
  { id: "settings", label: "Settings", icon: "Settings" },
] as const;

// ── Bortle Scale (Light Pollution) ────────────
export const BORTLE_SCALE = [
  {
    level: 1,
    name: "Excellent dark-sky site",
    maxLat: 90,
    minScore: 90,
  },
  { level: 4, name: "Rural/suburban transition", minScore: 70 },
  { level: 6, name: "Bright suburban sky", minScore: 50 },
  { level: 8, name: "City sky", minScore: 20 },
  { level: 9, name: "Inner-city sky", minScore: 0 },
] as const;
