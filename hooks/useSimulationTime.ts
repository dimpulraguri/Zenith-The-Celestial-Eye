"use client";

import { useEffect, useMemo, useState } from "react";
import { useTimeStore } from "@/lib/stores/timeStore";

export function useSimulationTime() {
  const {
    timeOffset,
    isPlaying,
    playbackSpeed,
    direction,
    selectedEvent,
    isRealtimeMode,
  } = useTimeStore();

  const [tick, setTick] = useState(Date.now());

  useEffect(() => {
    if (!isRealtimeMode) return;

    const interval = window.setInterval(() => {
      setTick(Date.now());
    }, 1000);

    return () => window.clearInterval(interval);
  }, [isRealtimeMode]);

  const currentSimulationDate = useMemo(
    () => new Date(tick + timeOffset),
    [timeOffset, tick]
  );

  const relativeOffsetHours = useMemo(() => timeOffset / 3_600_000, [timeOffset]);

  return {
    currentSimulationDate,
    timeOffset,
    relativeOffsetHours,
    isPlaying,
    playbackSpeed,
    direction,
    selectedEvent,
    isRealtimeMode,
  };
}
