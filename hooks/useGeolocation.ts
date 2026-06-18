"use client";

import { useCallback } from "react";
import { useLocationStore } from "@/lib/stores/locationStore";
import { API_ENDPOINTS } from "@/constants";

export function useGeolocation() {
  const { setLocation } = useLocationStore();

  const detectLocation = useCallback(async () => {
    // Try browser geolocation first
    if ("geolocation" in navigator) {
      return new Promise<void>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const { latitude: lat, longitude: lon } = pos.coords;
            // Reverse geocode
            const name = await reverseGeocode(lat, lon);
            setLocation({ lat, lon, name });
            resolve();
          },
          async () => {
            // Fallback to IP-based location
            await detectByIP(setLocation);
            resolve();
          },
          { timeout: 5000, maximumAge: 60000 }
        );
      });
    } else {
      await detectByIP(setLocation);
    }
  }, [setLocation]);

  const searchLocation = useCallback(
    async (query: string) => {
      if (!query.trim()) return [];

      try {
        const url = new URL(API_ENDPOINTS.NOMINATIM_SEARCH);
        url.searchParams.set("q", query);
        url.searchParams.set("format", "json");
        url.searchParams.set("limit", "5");
        url.searchParams.set("addressdetails", "1");

        const res = await fetch(url.toString(), {
          headers: { "Accept-Language": "en" },
        });
        const data = await res.json();

        return data.map((item: NominatimResult) => ({
          lat: parseFloat(item.lat),
          lon: parseFloat(item.lon),
          name: item.display_name.split(",")[0].trim(),
          country: item.address?.country,
        }));
      } catch {
        return [];
      }
    },
    []
  );

  return { detectLocation, searchLocation };
}

// ── Reverse geocoding ─────────────────────────
async function reverseGeocode(lat: number, lon: number): Promise<string> {
  try {
    const url = new URL(API_ENDPOINTS.NOMINATIM_REVERSE);
    url.searchParams.set("lat", lat.toString());
    url.searchParams.set("lon", lon.toString());
    url.searchParams.set("format", "json");

    const res = await fetch(url.toString(), {
      headers: { "Accept-Language": "en" },
    });
    const data = await res.json();
    const addr = data.address;
    return (
      addr?.city ||
      addr?.town ||
      addr?.village ||
      addr?.county ||
      addr?.state ||
      "Unknown Location"
    );
  } catch {
    return `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`;
  }
}

// ── IP-based location fallback ─────────────────
async function detectByIP(
  setLocation: (l: { lat: number; lon: number; name: string }) => void
): Promise<void> {
  try {
    const res = await fetch("https://ipapi.co/json/");
    const data = await res.json();
    setLocation({
      lat: data.latitude,
      lon: data.longitude,
      name: data.city || "Unknown",
    });
  } catch {
    // Default location (New Delhi) already set in store
  }
}

// ── Nominatim types ───────────────────────────
interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
  address: {
    country?: string;
    city?: string;
    town?: string;
    village?: string;
  };
}
