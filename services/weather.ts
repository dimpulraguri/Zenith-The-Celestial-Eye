import { API_ENDPOINTS } from "@/constants";
import type { ObservabilityScore, WeatherData } from "@/types";
import {
  getMoonPhase,
  estimateLightPollution,
} from "@/utils/astronomy";
import { getObservabilityColor, getObservabilityLabel } from "@/utils/formatting";

// ── Fetch weather from Open-Meteo ─────────────
export async function fetchWeatherData(
  lat: number,
  lon: number
): Promise<WeatherData> {
  const url = new URL(API_ENDPOINTS.OPEN_METEO);
  url.searchParams.set("latitude", lat.toString());
  url.searchParams.set("longitude", lon.toString());
  url.searchParams.set(
    "current",
    [
      "cloud_cover",
      "visibility",
      "wind_speed_10m",
      "relative_humidity_2m",
      "temperature_2m",
      "precipitation",
    ].join(",")
  );
  url.searchParams.set("wind_speed_unit", "kmh");

  try {
    const res = await fetch(url.toString(), {
      next: { revalidate: 300 }, // 5 minutes
    });
    const data = await res.json();
    const current = data.current;

    return {
      cloudCover: current.cloud_cover ?? 50,
      visibility: (current.visibility ?? 10000) / 1000, // m → km
      humidity: current.relative_humidity_2m ?? 50,
      temperature: current.temperature_2m ?? 15,
      windSpeed: current.wind_speed_10m ?? 0,
      precipitation: current.precipitation ?? 0,
    };
  } catch (error) {
    console.warn("Failed to fetch weather data:", error);
    return {
      cloudCover: 40,
      visibility: 15,
      humidity: 55,
      temperature: 18,
      windSpeed: 8,
      precipitation: 0,
    };
  }
}

// ── Compute Observability Score ────────────────
export async function computeObservabilityScore(
  lat: number,
  lon: number
): Promise<ObservabilityScore> {
  const [weather] = await Promise.all([fetchWeatherData(lat, lon)]);

  const moon = getMoonPhase(new Date());
  const lightPollution = estimateLightPollution(lat, lon);

  // Component scores (higher = better for observation)
  const cloudScore = Math.max(0, 100 - weather.cloudCover); // 0 cloud = 100
  const moonScore = Math.max(0, 100 - moon.illumination); // new moon = 100
  const lightScore = Math.max(0, 100 - lightPollution); // no pollution = 100

  // Weighted average
  const score = Math.round(
    cloudScore * 0.4 + moonScore * 0.35 + lightScore * 0.25
  );

  return {
    score,
    label: getObservabilityLabel(score),
    color: getObservabilityColor(score),
    factors: {
      cloudCover: cloudScore,
      moonIllumination: moonScore,
      lightPollution: lightScore,
    },
    weather,
    moon,
  };
}
