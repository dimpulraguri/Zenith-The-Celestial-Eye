"use client";

import { useQuery } from "@tanstack/react-query";
import { computeObservabilityScore } from "@/services/weather";
import { REFRESH_INTERVALS } from "@/constants";
import { useLocationStore } from "@/lib/stores/locationStore";
import type { ObservabilityScore } from "@/types";

export function useObservability() {
  const { location } = useLocationStore();

  const query = useQuery<ObservabilityScore>({
    queryKey: ["observability", location.lat, location.lon],
    queryFn: () => computeObservabilityScore(location.lat, location.lon),
    refetchInterval: REFRESH_INTERVALS.WEATHER,
    staleTime: 4 * 60_000, // 4 minutes
    retry: 2,
  });

  return {
    observability: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
