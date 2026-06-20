"use client";

import { useCallback } from "react";
import { useLocationSelection } from "@/hooks/useLocationSelection";

export function useObjectSelection(viewerRef: React.MutableRefObject<any | null>) {
  const { selectLocation } = useLocationSelection();

  const handleClick = useCallback((cartographic: { lat: number; lon: number }) => {
    selectLocation({
      lat: cartographic.lat,
      lon: cartographic.lon,
      name: `Selected ${cartographic.lat.toFixed(3)}, ${cartographic.lon.toFixed(3)}`,
    });
  }, [selectLocation]);

  return { handleClick };
}
