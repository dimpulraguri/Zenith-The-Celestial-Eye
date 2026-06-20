"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { fetchISSTLE, propagateISSTLEPosition } from "@/services/iss";
import { useSimulationTime } from "@/hooks/useSimulationTime";
import { useOrbitalPrediction } from "@/hooks/useOrbitalPrediction";
import type { ISSPosition, OrbitalPrediction, TLEData } from "@/types";

function interpolateISSPosition(
  start: ISSPosition,
  end: ISSPosition,
  alpha: number,
  currentTime: number
): ISSPosition {
  const rawDelta = end.lon - start.lon;
  let lonDelta = rawDelta;
  if (rawDelta > 180) lonDelta -= 360;
  if (rawDelta < -180) lonDelta += 360;
  let lon = start.lon + lonDelta * alpha;
  if (lon > 180) lon -= 360;
  if (lon < -180) lon += 360;

  return {
    lat: start.lat + (end.lat - start.lat) * alpha,
    lon,
    altitude: start.altitude + (end.altitude - start.altitude) * alpha,
    speed: start.speed + (end.speed - start.speed) * alpha,
    inclination: start.inclination,
    azimuth:
      start.azimuth !== undefined && end.azimuth !== undefined
        ? start.azimuth + (end.azimuth - start.azimuth) * alpha
        : start.azimuth,
    timestamp: currentTime,
    visibility: start.visibility,
  };
}

export function useISS(simulationDate?: Date) {
  const { currentSimulationDate } = useSimulationTime();
  const simDate = simulationDate ?? currentSimulationDate;
  const [tle, setTle] = useState<TLEData | null>(null);
  const [currentPoint, setCurrentPoint] = useState<ISSPosition | null>(null);
  const [nextPoint, setNextPoint] = useState<ISSPosition | null>(null);
  const [position, setPosition] = useState<ISSPosition | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const prediction = useOrbitalPrediction(tle, simDate, 120, 80);

  const simulationSeconds = Math.floor(simDate.getTime() / 1000);
  const fraction = useMemo(
    () => (simDate.getTime() % 1000) / 1000,
    [simulationSeconds, simDate.getTime()]
  );

  useEffect(() => {
    let active = true;
    fetchISSTLE()
      .then((data) => {
        if (!active) return;
        setTle(data);
      })
      .catch(() => {
        if (active) setTle(null);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!tle) return;
    let active = true;
    setIsLoading(true);
    setIsError(false);

    const currentDate = new Date(simulationSeconds * 1000);
    const nextDate = new Date((simulationSeconds + 1) * 1000);

    Promise.all([
      propagateISSTLEPosition(tle, currentDate),
      propagateISSTLEPosition(tle, nextDate),
    ])
      .then(([current, next]) => {
        if (!active) return;
        if (current) setCurrentPoint(current);
        if (next) setNextPoint(next);
      })
      .catch(() => {
        if (!active) return;
        setIsError(true);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [simulationSeconds, tle]);

  useEffect(() => {
    if (!currentPoint || !nextPoint) return;
    const frame = () => {
      setPosition(interpolateISSPosition(currentPoint, nextPoint, fraction, simDate.getTime()));
      animationRef.current = requestAnimationFrame(frame);
    };

    const animationRef = { current: 0 } as { current: number };
    animationRef.current = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [currentPoint, nextPoint, fraction, simDate]);

  useEffect(() => {
    if (!position && currentPoint) {
      setPosition(currentPoint);
    }
  }, [position, currentPoint]);

  return {
    position: position ?? currentPoint,
    previousPath: prediction.prediction?.previousPath,
    futurePath: prediction.prediction?.futurePath,
    isLoading,
    isError,
    lastUpdated: simDate.getTime(),
  };
}
