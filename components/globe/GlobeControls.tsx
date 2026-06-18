"use client";

import { motion } from "motion/react";
import {
  Globe2, Layers, GitBranch, Sun, RefreshCw,
  ZoomIn, ZoomOut,
} from "lucide-react";
import { useSettingsStore } from "@/lib/stores/settingsStore";

interface GlobeControlsProps {
  showOrbitPath: boolean;
  showConstellations: boolean;
  showTerminator: boolean;
  onToggleOrbitPath: () => void;
  onToggleConstellations: () => void;
  onToggleTerminator: () => void;
  onRefresh: () => void;
  /** Optional zoom handlers injected by CesiumGlobe for 3D mode */
  onZoomIn?: () => void;
  onZoomOut?: () => void;
}

export function GlobeControls({
  showOrbitPath,
  showConstellations,
  showTerminator,
  onToggleOrbitPath,
  onToggleConstellations,
  onToggleTerminator,
  onRefresh,
  onZoomIn,
  onZoomOut,
}: GlobeControlsProps) {
  const { globeMode, updateSettings } = useSettingsStore();
  const is3D = globeMode === "3d";

  const toggles = [
    {
      label: is3D ? "Switch 2D" : "Switch 3D",
      Icon: Globe2,
      active: is3D,
      onToggle: () => updateSettings({ globeMode: is3D ? "2d" : "3d" }),
    },
    {
      label: "Orbit Path",
      Icon: GitBranch,
      active: showOrbitPath,
      onToggle: onToggleOrbitPath,
    },
    {
      label: "Stars",
      Icon: Layers,
      active: showConstellations,
      onToggle: onToggleConstellations,
    },
    {
      label: "Day/Night",
      Icon: Sun,
      active: showTerminator,
      onToggle: onToggleTerminator,
    },
  ];

  return (
    <div
      className="absolute top-4 right-4 z-[800] flex flex-col gap-1"
      role="toolbar"
      aria-label="Globe controls"
    >
      {/* Toggle controls */}
      {toggles.map(({ label, Icon, active, onToggle }) => (
        <motion.button
          key={label}
          whileHover={{ scale: 1.02, x: -2 }}
          whileTap={{ scale: 0.96 }}
          onClick={onToggle}
          aria-label={label}
          aria-pressed={active}
          className={`flex items-center gap-2 pl-2.5 pr-3 h-8 rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 select-none ${
            active
              ? "text-purple-200 border border-purple-500/40"
              : "text-slate-400 border border-white/10 hover:text-white hover:border-white/20"
          }`}
          style={{
            background: active
              ? "rgba(139,92,246,0.18)"
              : "rgba(8,12,36,0.72)",
            backdropFilter: "blur(12px)",
            boxShadow: active
              ? "0 0 14px rgba(139,92,246,0.25), inset 0 1px 0 rgba(255,255,255,0.06)"
              : "inset 0 1px 0 rgba(255,255,255,0.04)",
          }}
        >
          <Icon className={`w-3.5 h-3.5 shrink-0 ${active ? "text-purple-300" : ""}`} />
          <span className="text-[11px] font-medium whitespace-nowrap leading-none">
            {label}
          </span>
          {/* Active pip */}
          {active && (
            <span className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" />
          )}
        </motion.button>
      ))}

      {/* Divider */}
      <div className="h-px bg-white/8 mx-1 my-0.5" />

      {/* Refresh */}
      <motion.button
        whileHover={{ scale: 1.02, x: -2 }}
        whileTap={{ scale: 0.96 }}
        onClick={onRefresh}
        aria-label="Refresh orbital data"
        className="flex items-center gap-2 pl-2.5 pr-3 h-8 rounded-xl text-slate-400 hover:text-white border border-white/10 hover:border-white/20 transition-all duration-200 focus:outline-none select-none"
        style={{
          background: "rgba(8,12,36,0.72)",
          backdropFilter: "blur(12px)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
        }}
      >
        <RefreshCw className="w-3.5 h-3.5 shrink-0" />
        <span className="text-[11px] font-medium whitespace-nowrap leading-none">
          Refresh
        </span>
      </motion.button>

      {/* 3D-only zoom controls */}
      {is3D && (onZoomIn || onZoomOut) && (
        <>
          <div className="h-px bg-white/8 mx-1 my-0.5" />
          <div className="flex flex-col gap-1">
            <motion.button
              whileHover={{ scale: 1.02, x: -2 }}
              whileTap={{ scale: 0.96 }}
              onClick={onZoomIn}
              aria-label="Zoom in"
              className="flex items-center gap-2 pl-2.5 pr-3 h-8 rounded-xl text-slate-400 hover:text-white border border-white/10 hover:border-white/20 transition-all duration-200 focus:outline-none select-none"
              style={{
                background: "rgba(8,12,36,0.72)",
                backdropFilter: "blur(12px)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
              }}
            >
              <ZoomIn className="w-3.5 h-3.5 shrink-0" />
              <span className="text-[11px] font-medium whitespace-nowrap leading-none">
                Zoom In
              </span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02, x: -2 }}
              whileTap={{ scale: 0.96 }}
              onClick={onZoomOut}
              aria-label="Zoom out"
              className="flex items-center gap-2 pl-2.5 pr-3 h-8 rounded-xl text-slate-400 hover:text-white border border-white/10 hover:border-white/20 transition-all duration-200 focus:outline-none select-none"
              style={{
                background: "rgba(8,12,36,0.72)",
                backdropFilter: "blur(12px)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
              }}
            >
              <ZoomOut className="w-3.5 h-3.5 shrink-0" />
              <span className="text-[11px] font-medium whitespace-nowrap leading-none">
                Zoom Out
              </span>
            </motion.button>
          </div>
        </>
      )}
    </div>
  );
}
