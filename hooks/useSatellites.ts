"use client";

import { useQuery } from "@tanstack/react-query";
import { getVisibleSatellites } from "@/services/satellites";
import { REFRESH_INTERVALS } from "@/constants";
import { useLocationStore } from "@/lib/stores/locationStore";
import { useSimulationTime } from "@/hooks/useSimulationTime";
import type { SatelliteData } from "@/types";

export function useSatellites() {
  const { location } = useLocationStore();
  const { currentSimulationDate } = useSimulationTime();

  const query = useQuery<SatelliteData[]>({
    queryKey: ["satellites", location.lat, location.lon, currentSimulationDate.getTime()],
    queryFn: () => getVisibleSatellites(location.lat, location.lon, currentSimulationDate),
    refetchInterval: REFRESH_INTERVALS.SATELLITE_POSITIONS,
    staleTime: 25_000,
    retry: 2,
    placeholderData: [],
  });

  return {
    satellites: query.data ?? [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    totalCount: query.data?.length ?? 0,
  };
}
