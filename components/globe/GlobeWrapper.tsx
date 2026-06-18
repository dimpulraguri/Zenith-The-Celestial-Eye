"use client";

import { useState, useCallback, useRef, Suspense, lazy } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "motion/react";
import { GlobeControls } from "@/components/globe/GlobeControls";
import { DayNightOverlay } from "@/components/globe/OrbitPath";
import { SkyReplay } from "@/components/replay/SkyReplay";
import { ScreenshotMode } from "@/components/screenshot/ScreenshotMode";
import { useSettingsStore } from "@/lib/stores/settingsStore";
import { useQueryClient } from "@tanstack/react-query";
import type { CesiumZoomRef } from "@/components/globe/CesiumGlobe";

// Dynamic imports — no SSR for map libs
const LeafletGlobe = dynamic(() => import("./LeafletGlobe").then(m => ({ default: m.LeafletGlobe })), {
  ssr: false,
  loading: () => <GlobeSkeleton label="Loading Sky Map…" />,
});

const CesiumGlobe = dynamic(() => import("./CesiumGlobe").then(m => ({ default: m.CesiumGlobe })), {
  ssr: false,
  loading: () => <GlobeSkeleton label="Loading 3D Globe…" />,
});

// ── Loading skeleton ───────────────────────────
function GlobeSkeleton({ label }: { label: string }) {
  return (
    <div className="w-full h-full bg-[#050816] flex flex-col items-center justify-center gap-4 relative overflow-hidden">
      {/* Animated grid */}
      <svg className="absolute inset-0 w-full h-full opacity-5" aria-hidden="true">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#8b5cf6" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Pulsing earth */}
      <div className="relative">
        <motion.div
          className="w-24 h-24 rounded-full"
          style={{
            background: "radial-gradient(circle at 35% 30%, #1d6b45, #073460 60%, #020a18)",
            boxShadow: "0 0 40px rgba(139,92,246,0.25)",
          }}
          animate={{ scale: [1, 1.03, 1] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        />
        {[1.4, 1.7].map((s, i) => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-full border border-purple-500/20"
            initial={{ scale: s, opacity: 0.5 }}
            animate={{ scale: s + 0.08, opacity: 0 }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.7 }}
          />
        ))}
      </div>

      {/* Loading text */}
      <div className="flex flex-col items-center gap-2">
        <div className="text-sm text-slate-400 font-medium">{label}</div>
        <div className="flex gap-1">
          {[0, 0.2, 0.4].map((delay, i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-purple-500"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 0.9, repeat: Infinity, delay }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Atmosphere glow ────────────────────────────
function AtmosphereGlow() {
  return (
    <div className="absolute inset-0 pointer-events-none z-[1]" aria-hidden="true">
      {/* Edge vignette */}
      <div className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse at center, transparent 60%, rgba(5,8,22,0.7) 100%)" }} />
      {/* Top aurora */}
      <div className="absolute top-0 left-0 right-0 h-24 opacity-20"
        style={{ background: "linear-gradient(180deg, rgba(139,92,246,0.3) 0%, transparent 100%)" }} />
      {/* Bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 opacity-30"
        style={{ background: "linear-gradient(0deg, rgba(5,8,22,0.8) 0%, transparent 100%)" }} />
    </div>
  );
}

// ── Main globe wrapper ─────────────────────────
export function GlobeWrapper() {
  const { globeMode } = useSettingsStore();
  const queryClient = useQueryClient();

  const [showOrbitPath, setShowOrbitPath] = useState(true);
  const [showConstellations, setShowConstellations] = useState(false);
  const [showTerminator, setShowTerminator] = useState(true);

  // Shared ref — CesiumGlobe populates this once the Viewer is ready
  const cesiumZoomRef = useRef<CesiumZoomRef | null>(null);

  const handleZoomIn  = useCallback(() => cesiumZoomRef.current?.zoomIn(),  []);
  const handleZoomOut = useCallback(() => cesiumZoomRef.current?.zoomOut(), []);

  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["iss-position"] });
    queryClient.invalidateQueries({ queryKey: ["satellites"] });
  }, [queryClient]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#050816]">
      {/* Globe */}
      <AnimatePresence mode="wait">
        {globeMode === "2d" ? (
          <motion.div
            key="leaflet"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0"
          >
            <LeafletGlobe
              showOrbitPath={showOrbitPath}
              showConstellations={showConstellations}
              showTerminator={showTerminator}
            />
          </motion.div>
        ) : (
          <motion.div
            key="cesium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0"
          >
            <CesiumGlobe zoomRef={cesiumZoomRef} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Day/Night terminator overlay — 3D (Cesium) mode only */}
      {showTerminator && globeMode === "3d" && <DayNightOverlay />}

      {/* Atmosphere glow */}
      <AtmosphereGlow />

      {/* Globe controls toolbar */}
      <GlobeControls
        showOrbitPath={showOrbitPath}
        showConstellations={showConstellations}
        showTerminator={showTerminator}
        onToggleOrbitPath={() => setShowOrbitPath(v => !v)}
        onToggleConstellations={() => setShowConstellations(v => !v)}
        onToggleTerminator={() => setShowTerminator(v => !v)}
        onRefresh={handleRefresh}
        onZoomIn={globeMode === "3d" ? handleZoomIn : undefined}
        onZoomOut={globeMode === "3d" ? handleZoomOut : undefined}
      />

      {/* Sky Replay controls */}
      <SkyReplay />

      {/* Screenshot / share mode */}
      <ScreenshotMode />
    </div>
  );
}
