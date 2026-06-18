import { create } from "zustand";
import type { ReplayState, ReplaySpeed } from "@/types";

interface TimeStore {
  timeOffset: number;
  replayState: ReplayState;
  replaySpeed: ReplaySpeed;
  isTimeTravelMode: boolean;

  setTimeOffset: (offset: number | ((prev: number) => number)) => void;
  setReplayState: (state: ReplayState) => void;
  setReplaySpeed: (speed: ReplaySpeed) => void;
  toggleTimeTravelMode: () => void;
  jumpToDate: (date: Date) => void;
  resetToNow: () => void;
}

export const useTimeStore = create<TimeStore>((set) => ({
  timeOffset: 0,
  replayState: "idle",
  replaySpeed: 1,
  isTimeTravelMode: false,

  setTimeOffset: (offset) =>
    set((state) => ({
      timeOffset: typeof offset === "function" ? offset(state.timeOffset) : offset,
    })),

  setReplayState: (state) => set({ replayState: state }),
  setReplaySpeed: (speed) => set({ replaySpeed: speed }),

  toggleTimeTravelMode: () =>
    set((state) => ({
      isTimeTravelMode: !state.isTimeTravelMode,
      timeOffset: state.isTimeTravelMode ? 0 : state.timeOffset,
      replayState: state.isTimeTravelMode ? "idle" : state.replayState,
    })),

  jumpToDate: (date) =>
    set({ timeOffset: date.getTime() - Date.now(), isTimeTravelMode: true, replayState: "paused" }),

  resetToNow: () =>
    set({ timeOffset: 0, replayState: "idle", isTimeTravelMode: false }),
}));

// ── Computed helper ───────────────────────────
export function getSimulatedDate(timeOffset: number): Date {
  return new Date(Date.now() + timeOffset);
}
