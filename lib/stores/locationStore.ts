import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { LocationData } from "@/types";

interface LocationStore {
  location: LocationData;
  recentLocations: LocationData[];
  setLocation: (location: LocationData) => void;
  addRecentLocation: (location: LocationData) => void;
  clearRecentLocations: () => void;
}

const DEFAULT_LOCATION: LocationData = {
  lat: 28.6139,
  lon: 77.209,
  name: "New Delhi",
  country: "India",
  timezone: "Asia/Kolkata",
};

export const useLocationStore = create<LocationStore>()(
  persist(
    (set, get) => ({
      location: DEFAULT_LOCATION,
      recentLocations: [],

      setLocation: (location) => {
        set({ location });
        get().addRecentLocation(location);
      },

      addRecentLocation: (location) => {
        const current = get().recentLocations;
        const filtered = current.filter(
          (l) => l.lat !== location.lat || l.lon !== location.lon
        );
        set({ recentLocations: [location, ...filtered].slice(0, 5) });
      },

      clearRecentLocations: () => set({ recentLocations: [] }),
    }),
    {
      name: "zenith-location",
      partialize: (state) => ({
        location: state.location,
        recentLocations: state.recentLocations,
      }),
    }
  )
);
