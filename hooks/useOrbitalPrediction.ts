"use client";

import { useEffect, useState } from "react";
import { generateOrbitTrack, propagateSatellite } from "@/utils/orbital";
import type { OrbitalPrediction, OrbitPoint, TLEData } from "@/types";

export function useOrbitalPrediction(
  tle: TLEData | null,
  simulationDate: Date,
  windowMinutes = 90,
  steps = 64
) {
  const [prediction, setPrediction] = useState<OrbitalPrediction | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!tle) {
      setPrediction(null);
      return;
    }

    let active = true;
    const run = async () => {
      setIsLoading(true);
      try {
        const halfWindowMs = windowMinutes * 60 * 1000;
        const orbitTrack = await generateOrbitTrack(tle, simulationDate, halfWindowMs, steps);

        if (!active) return;

        const nowMs = simulationDate.getTime();
        const previousPath = orbitTrack.filter((point) => point.time < nowMs);
        const futurePath = orbitTrack.filter((point) => point.time > nowMs);
        const currentPoint = {
          time: nowMs,
          lat: orbitTrack.length
            ? orbitTrack.reduce((prev, candidate) => {
                return Math.abs(candidate.time - nowMs) < Math.abs(prev.time - nowMs) ? candidate : prev;
              }, orbitTrack[0]).lat
            : 0,
          lon: orbitTrack.length
            ? orbitTrack.reduce((prev, candidate) => {
                return Math.abs(candidate.time - nowMs) < Math.abs(prev.time - nowMs) ? candidate : prev;
              }, orbitTrack[0]).lon
            : 0,
          altitude: orbitTrack.length ? orbitTrack.reduce((prev, candidate) => {
                return Math.abs(candidate.time - nowMs) < Math.abs(prev.time - nowMs) ? candidate : prev;
              }, orbitTrack[0]).altitude : 0,
        };

        setPrediction({ currentPoint, previousPath, futurePath });
      } catch {
        if (active) {
          setPrediction(null);
        }
      } finally {
        if (active) setIsLoading(false);
      }
    };

    run();

    return () => {
      active = false;
    };
  }, [tle?.line1, tle?.line2, simulationDate.toISOString(), windowMinutes, steps]);

  return { prediction, isLoading };
}
