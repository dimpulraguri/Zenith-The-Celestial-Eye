import { create } from "zustand";
import type { PlaybackSpeed, ReplayEvent, ReplayState } from "@/types";

interface TimeStore {
  timeOffset: number;
  replayState: ReplayState;
  replaySpeed: PlaybackSpeed;
  direction: 1 | -1;
  selectedEvent: ReplayEvent | null;
  isRealtimeMode: boolean;
  isPlaying: boolean;
  isTimeTravelMode: boolean;
  setTimeOffset: (offset: number) => void;
  setReplayState: (state: ReplayState) => void;
  setReplaySpeed: (speed: PlaybackSpeed) => void;
  toggleTimeTravelMode: () => void;
  play: () => void;
  pause: () => void;
  rewind: () => void;
  fastForward: () => void;
  resetToNow: () => void;
  jumpToDate: (event: ReplayEvent) => void;
}

const DEFAULT_SPEED = 1;
const MAX_OFFSET_MS = 365 * 24 * 60 * 60 * 1000;

export const useTimeStore = create<TimeStore>((set) => ({
  timeOffset: 0,
  replayState: "idle",
  replaySpeed: DEFAULT_SPEED,
  direction: 1,
  selectedEvent: null,
  isRealtimeMode: true,
  isPlaying: false,
  isTimeTravelMode: false,

  setTimeOffset: (offset) => {
    const clamped = Math.max(-MAX_OFFSET_MS, Math.min(MAX_OFFSET_MS, offset));
    set({
      timeOffset: clamped,
      isRealtimeMode: clamped === 0,
    });
  },

  setReplayState: (state) => {
    set({
      replayState: state,
      isPlaying: state === "playing",
    });
  },

  setReplaySpeed: (speed) => set({ replaySpeed: speed }),

  toggleTimeTravelMode: () =>
    set((state) => ({ isTimeTravelMode: !state.isTimeTravelMode })),

  play: () =>
    set({
      replayState: "playing",
      isPlaying: true,
      direction: 1,
      isRealtimeMode: false,
    }),

  pause: () => set({ replayState: "paused", isPlaying: false }),

  rewind: () =>
    set({
      replayState: "playing",
      isPlaying: true,
      direction: -1,
      isRealtimeMode: false,
    }),

  fastForward: () =>
    set({
      replayState: "playing",
      isPlaying: true,
      direction: 1,
      isRealtimeMode: false,
    }),

  resetToNow: () =>
    set({
      timeOffset: 0,
      replayState: "idle",
      replaySpeed: DEFAULT_SPEED,
      direction: 1,
      selectedEvent: null,
      isRealtimeMode: true,
      isPlaying: false,
    }),

  jumpToDate: (event) => {
    const offset = event.date.getTime() - Date.now();
    set({
      selectedEvent: event,
      timeOffset: Math.max(-MAX_OFFSET_MS, Math.min(MAX_OFFSET_MS, offset)),
      replayState: "playing",
      replaySpeed: DEFAULT_SPEED,
      direction: 1,
      isRealtimeMode: false,
      isPlaying: true,
      isTimeTravelMode: true,
    });
  },
}));

export function getSimulatedDate(timeOffset: number): Date {
  return new Date(Date.now() + timeOffset);
}
