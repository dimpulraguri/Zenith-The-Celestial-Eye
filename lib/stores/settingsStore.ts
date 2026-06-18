import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserSettings, ExplanationLevel } from "@/types";

interface SettingsStore extends UserSettings {
  updateSettings: (settings: Partial<UserSettings>) => void;
  setExplanationLevel: (level: ExplanationLevel) => void;
  toggleTeacherMode: () => void;
  toggleReducedMotion: () => void;
  toggleHighContrast: () => void;
}

const DEFAULT_SETTINGS: UserSettings = {
  theme: "dark",
  reducedMotion: false,
  highContrast: false,
  explanationLevel: "beginner",
  teacherMode: false,
  units: "metric",
  globeMode: "2d",
  autoLocate: true,
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      ...DEFAULT_SETTINGS,

      updateSettings: (settings) => set((state) => ({ ...state, ...settings })),

      setExplanationLevel: (level) => set({ explanationLevel: level }),

      toggleTeacherMode: () =>
        set((state) => ({ teacherMode: !state.teacherMode })),

      toggleReducedMotion: () =>
        set((state) => ({ reducedMotion: !state.reducedMotion })),

      toggleHighContrast: () =>
        set((state) => ({ highContrast: !state.highContrast })),
    }),
    {
      name: "zenith-settings",
    }
  )
);
