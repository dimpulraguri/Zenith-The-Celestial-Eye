import { create } from "zustand";
import type { CelestialObject, PanelTab, NavigationView } from "@/types";

interface CelestialStore {
  selectedObject: CelestialObject | null;
  activeTab: PanelTab;
  activeView: NavigationView;
  isRadarActive: boolean;
  isPanelOpen: boolean;
  isZenithLensOpen: boolean;

  setSelectedObject: (object: CelestialObject | null) => void;
  setActiveTab: (tab: PanelTab) => void;
  setActiveView: (view: NavigationView) => void;
  setRadarActive: (active: boolean) => void;
  setIsPanelOpen: (open: boolean) => void;
  openZenithLens: () => void;
  closeZenithLens: () => void;
}

export const useCelestialStore = create<CelestialStore>((set) => ({
  selectedObject: null,
  activeTab: "overview",
  activeView: "globe",
  isRadarActive: false,
  isPanelOpen: false,
  isZenithLensOpen: false,

  setSelectedObject: (object) =>
    set({
      selectedObject: object,
      isPanelOpen: object !== null,
      activeTab: "overview",
    }),

  setActiveTab: (tab) => set({ activeTab: tab }),
  setActiveView: (view) => set({ activeView: view }),
  setRadarActive: (active) => set({ isRadarActive: active }),
  setIsPanelOpen: (open) => set({ isPanelOpen: open }),
  openZenithLens: () => set({ isZenithLensOpen: true }),
  closeZenithLens: () => set({ isZenithLensOpen: false }),
}));
