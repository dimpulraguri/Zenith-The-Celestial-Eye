"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Satellite, Rocket, Globe2, RefreshCw, Clock } from "lucide-react";
import { NavigationRail } from "@/components/layout/NavigationRail";
import { InfoPanel } from "@/components/layout/InfoPanel";
import { GlobeWrapper } from "@/components/globe/GlobeWrapper";
import { ObservabilityGauge } from "@/components/widgets/ObservabilityGauge";
import { LocationSearch } from "@/components/widgets/LocationSearch";
import { EventTimeline } from "@/features/event-timeline/EventTimeline";
import { ZenithLens } from "@/components/lens/ZenithLens";
import { SettingsPanel } from "@/components/settings/SettingsPanel";
import { PlanetsPanel } from "@/components/planets/PlanetsPanel";
import { useISS } from "@/hooks/useISS";
import { useSatellites } from "@/hooks/useSatellites";
import { useCelestialStore } from "@/lib/stores/celestialStore";
import { useLocationStore } from "@/lib/stores/locationStore";
import { formatAltitude, formatSpeed, formatTime } from "@/utils/formatting";
import type { NavigationView } from "@/types";

// ── HUD Bar ────────────────────────────────────
function HUDBar() {
  const { position: issPos } = useISS();
  const { totalCount } = useSatellites();
  const { location } = useLocationStore();
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    // Set initial time on client only (prevents hydration mismatch)
    setTime(new Date());
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center justify-between h-full px-4 gap-4">
      {/* Logo */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-purple-600 to-cyan-600 flex items-center justify-center">
            <Globe2 className="w-3 h-3 text-white" />
          </div>
          <span className="font-bold text-sm font-space-grotesk text-white hidden sm:block tracking-tight">
            ZENITH
          </span>
        </div>
        <div className="h-4 w-px bg-white/10 hidden sm:block" />
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" />
          <span className="text-xs text-slate-400 truncate max-w-[130px]">{location.name}</span>
        </div>
      </div>

      {/* Center: ISS live data */}
      <div className="flex items-center gap-3 text-xs">
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-green-400 font-semibold uppercase tracking-widest text-[10px]">ISS Live</span>
        </div>

        {issPos && (
          <>
            <div className="hidden lg:flex items-center gap-1.5 text-slate-400">
              <Rocket className="w-3 h-3 text-amber-400" />
              <span className="tabular-nums">{formatAltitude(issPos.altitude)}</span>
            </div>
            <div className="hidden lg:flex items-center gap-1.5 text-slate-400">
              <RefreshCw className="w-3 h-3 text-blue-400" />
              <span className="tabular-nums">{formatSpeed(issPos.speed)}</span>
            </div>
          </>
        )}

        <div className="hidden md:flex items-center gap-1.5 text-slate-400">
          <Satellite className="w-3 h-3 text-cyan-400" />
          <span>{totalCount} tracked</span>
        </div>
      </div>

      {/* Clock */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500 shrink-0">
        <Clock className="w-3 h-3" />
        <span className="font-mono tabular-nums">{time ? formatTime(time) : "00:00:00"} UTC</span>
      </div>
    </div>
  );
}

// ── Left sidebar content ───────────────────────
function LeftPanelContent({ activeView }: { activeView: NavigationView }) {
  const { position: issPos } = useISS();
  const { satellites } = useSatellites();

  return (
    <div className="h-full overflow-y-auto no-scrollbar p-3 space-y-3">
      {/* Settings panel replaces content */}
      <AnimatePresence mode="wait">
        {activeView === "settings" ? (
          <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <SettingsPanel />
          </motion.div>
        ) : (
          <motion.div key="main" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
            <LocationSearch />

            {activeView === "events" ? (
              <motion.div key="events" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <EventTimeline />
              </motion.div>
            ) : activeView === "planets" ? (
              <motion.div key="planets" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="-mx-3 -mt-3">
                <PlanetsPanel />
              </motion.div>
            ) : activeView === "iss" && issPos ? (
              <motion.div key="iss" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Rocket className="w-3 h-3 text-amber-400" />
                  ISS Live Data
                </div>
                <div className="glass-subtle rounded-xl p-3 space-y-2.5">
                  {[
                    ["Latitude", `${issPos.lat.toFixed(4)}°`],
                    ["Longitude", `${issPos.lon.toFixed(4)}°`],
                    ["Altitude", formatAltitude(issPos.altitude)],
                    ["Velocity", formatSpeed(issPos.speed)],
                    ["Inclination", `${issPos.inclination.toFixed(1)}°`],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between text-xs">
                      <span className="text-slate-500">{k}</span>
                      <span className="text-white font-medium tabular-nums">{v}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : activeView === "satellites" ? (
              <motion.div key="sats" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Satellite className="w-3 h-3 text-blue-400" />
                  Visible Now ({satellites.length})
                </div>
                <div className="space-y-1 max-h-72 overflow-y-auto no-scrollbar">
                  {satellites.slice(0, 25).map((sat) => (
                    <button
                      key={sat.id}
                      className="w-full flex items-center gap-2 p-2 glass-subtle rounded-lg text-left hover:border-blue-500/30 transition-all group"
                      onClick={() => {
                        useCelestialStore.getState().setSelectedObject({
                          id: sat.id, name: sat.name, type: "satellite",
                          lat: sat.lat, lon: sat.lon, altitude: sat.altitude,
                          speed: sat.speed, inclination: sat.inclination, category: sat.category,
                        });
                        useCelestialStore.getState().openZenithLens();
                      }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                      <span className="text-xs text-slate-300 truncate flex-1 group-hover:text-white transition-colors">{sat.name}</span>
                      <span className="text-xs text-slate-600 shrink-0 tabular-nums">{Math.round(sat.altitude)} km</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div key="observability" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <ObservabilityGauge />
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main App Page ─────────────────────────────
export default function AppPage() {
  const { activeView, isPanelOpen } = useCelestialStore();

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-[#050816]">
      {/* HUD bar */}
      <header className="h-11 glass-strong border-b border-white/5 shrink-0 z-40" role="banner">
        <HUDBar />
      </header>

      {/* Main layout */}
      <div className="flex flex-1 min-h-0">
        {/* Nav rail */}
        <div className="w-14 glass-strong border-r border-white/5 shrink-0 z-30">
          <NavigationRail />
        </div>

        {/* Left context panel */}
        <aside className="hidden md:flex w-64 glass border-r border-white/5 flex-col shrink-0 z-20" aria-label="Context panel">
          <LeftPanelContent activeView={activeView} />
        </aside>

        {/* Globe — main canvas */}
        <main className="flex-1 relative min-w-0 overflow-hidden" aria-label="Interactive sky globe">
          <GlobeWrapper />
        </main>

        {/* Right info panel */}
        <InfoPanel />
      </div>

      {/* Zenith Lens overlay (portal-like, fixed position) */}
      <ZenithLens />
    </div>
  );
}
