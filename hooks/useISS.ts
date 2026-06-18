"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { computeISSPosition } from "@/services/iss";
import { REFRESH_INTERVALS } from "@/constants";
import type { ISSPosition } from "@/types";

export function useISS() {
  const queryClient = useQueryClient();

  const query = useQuery<ISSPosition>({
    queryKey: ["iss-position"],
    queryFn: () => computeISSPosition(new Date()),
    refetchInterval: REFRESH_INTERVALS.ISS_POSITION,
    staleTime: 4000,
    retry: 3,
  });

  // Additional real-time interpolation between fetches
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Prefetch immediately
    queryClient.prefetchQuery({
      queryKey: ["iss-position"],
      queryFn: () => computeISSPosition(new Date()),
    });

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [queryClient]);

  return {
    position: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    lastUpdated: query.dataUpdatedAt,
  };
}
