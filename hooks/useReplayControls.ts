"use client";

import { useCallback } from "react";
import { useTimeStore } from "@/lib/stores/timeStore";

export function useReplayControls() {
  const {
    play,
    pause,
    rewind,
    fastForward,
    setSpeed,
    resetToNow,
    jumpToEvent,
    setDate,
    setOffset,
  } = useTimeStore();

  return {
    play,
    pause,
    rewind,
    fastForward,
    setSpeed,
    resetToNow,
    jumpToEvent,
    setDate,
    setOffset,
  };
}
