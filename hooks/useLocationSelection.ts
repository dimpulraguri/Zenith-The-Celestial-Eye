"use client";

import { useCallback, useRef } from "react";
import { useLocationStore } from "@/lib/stores/locationStore";
import { useCelestialStore } from "@/lib/stores/celestialStore";
import type { LocationData, CelestialObject } from "@/types";

export function useLocationSelection() {
  const { setLocation } = useLocationStore();
  const { setSelectedObject, setRadarActive } = useCelestialStore();
  const radarTimerRef = useRef<number | null>(null);

  const selectLocation = useCallback(
    (location: LocationData) => {
      const normalizedName = location.name ||
        `Selected ${location.lat.toFixed(3)}, ${location.lon.toFixed(3)}`;
      const selectedLocation: CelestialObject = {
        id: `location-${location.lat.toFixed(4)}-${location.lon.toFixed(4)}`,
        name: normalizedName,
        type: "location",
        lat: location.lat,
        lon: location.lon,
        altitude: 0,
        description: "Ground coordinate selected on the globe.",
      };

      setLocation({ ...location, name: normalizedName });
      setSelectedObject(selectedLocation);
      setRadarActive(true);

      if (radarTimerRef.current) {
        window.clearTimeout(radarTimerRef.current);
      }
      radarTimerRef.current = window.setTimeout(() => {
        setRadarActive(false);
        radarTimerRef.current = null;
      }, 2800);
    },
    [setLocation, setSelectedObject, setRadarActive]
  );

  return { selectLocation };
}
