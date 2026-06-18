"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight, Clock, Zap, X } from "lucide-react";
import { useTimeStore, getSimulatedDate } from "@/lib/stores/timeStore";
import { REPLAY_EVENTS } from "@/constants";
import { formatDateTime } from "@/utils/formatting";
import type { ReplaySpeed } from "@/types";

const SPEEDS: ReplaySpeed[] = [1, 5, 10, 50, 100];

export function SkyReplay() {
  const {
    timeOffset, replayState, replaySpeed, isTimeTravelMode,
    setTimeOffset, setReplayState, setReplaySpeed,
    toggleTimeTravelMode, jumpToDate, resetToNow,
  } = useTimeStore();

  const [showPresets, setShowPresets] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Advance simulated time while playing
  useEffect(() => {
    if (replayState === "playing") {
      intervalRef.current = setInterval(() => {
        setTimeOffset(prev => prev + replaySpeed * 5000); // 5s real → speed× simulated
      }, 100);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [replayState, replaySpeed, setTimeOffset]);

  const simulatedDate = getSimulatedDate(timeOffset);
  const offsetHours = Math.round(timeOffset / 3600000);

  const handlePlayPause = useCallback(() => {
    setReplayState(replayState === "playing" ? "paused" : "playing");
  }, [replayState, setReplayState]);

  const handleStep = useCallback((direction: 1 | -1) => {
    setTimeOffset(timeOffset + direction * 3600 * 1000 * replaySpeed);
    if (replayState !== "paused") setReplayState("paused");
  }, [timeOffset, replaySpeed, replayState, setTimeOffset, setReplayState]);

  if (!isTimeTravelMode) {
    return (
      <motion.button
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={toggleTimeTravelMode}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-4 py-2 glass rounded-full border border-purple-500/20 text-xs font-semibold text-purple-300 hover:bg-purple-500/10 hover:border-purple-500/40 transition-all duration-200 group"
        aria-label="Open Sky Replay Mode"
      >
        <Clock className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
        Sky Replay
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="absolute bottom-4 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-[600px] z-30"
      role="region"
      aria-label="Sky Replay controls"
    >
      <div className="glass-strong rounded-2xl p-4 border border-purple-500/25"
        style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(139,92,246,0.1)" }}>

        {/* Header row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-purple-500/20 flex items-center justify-center">
              <Clock className="w-3 h-3 text-purple-400" />
            </div>
            <span className="text-xs font-semibold text-purple-300 uppercase tracking-widest">Sky Replay</span>
            {replayState === "playing" && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/15 text-green-400 border border-green-500/20">
                Playing {replaySpeed}×
              </span>
            )}
          </div>
          <button
            onClick={() => { resetToNow(); toggleTimeTravelMode(); }}
            className="text-slate-500 hover:text-slate-300 transition-colors p-1"
            aria-label="Exit Sky Replay"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current simulated time */}
        <div className="text-center mb-3">
          <div className="text-xl font-bold text-white font-space-grotesk tabular-nums">
            {formatDateTime(simulatedDate)}
          </div>
          <div className="text-xs text-slate-500">
            {offsetHours >= 0 ? `+${offsetHours}h` : `${offsetHours}h`} from now
          </div>
        </div>

        {/* Timeline scrubber */}
        <div className="mb-4 px-1">
          <input
            type="range"
            min={-8760}
            max={8760}
            value={Math.round(timeOffset / 3600000)}
            onChange={e => {
              setTimeOffset(parseInt(e.target.value) * 3600000);
              if (replayState === "playing") setReplayState("paused");
            }}
            className="w-full"
            aria-label="Time scrubber (hours from now)"
          />
          <div className="flex justify-between text-xs text-slate-600 mt-1">
            <span>-1 year</span>
            <span>Now</span>
            <span>+1 year</span>
          </div>
        </div>

        {/* Controls row */}
        <div className="flex items-center justify-between">
          {/* Playback controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleStep(-1)}
              className="w-8 h-8 rounded-lg glass flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all"
              aria-label="Step back"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handlePlayPause}
              className="w-10 h-10 rounded-xl bg-purple-600 hover:bg-purple-500 flex items-center justify-center text-white transition-all hover:scale-105"
              aria-label={replayState === "playing" ? "Pause" : "Play"}
            >
              {replayState === "playing"
                ? <Pause className="w-4 h-4" />
                : <Play className="w-4 h-4 ml-0.5" />}
            </button>
            <button
              onClick={() => handleStep(1)}
              className="w-8 h-8 rounded-lg glass flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all"
              aria-label="Step forward"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={resetToNow}
              className="w-8 h-8 rounded-lg glass flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all ml-1"
              aria-label="Return to now"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Speed selector */}
          <div className="flex items-center gap-1">
            <Zap className="w-3 h-3 text-slate-500" />
            {SPEEDS.map(speed => (
              <button
                key={speed}
                onClick={() => setReplaySpeed(speed)}
                className={`text-xs px-2 py-1 rounded-lg transition-all duration-150 font-mono ${
                  replaySpeed === speed
                    ? "bg-purple-500/25 text-purple-300 border border-purple-500/30"
                    : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
                }`}
              >
                {speed}×
              </button>
            ))}
          </div>
        </div>

        {/* Preset events */}
        <div className="mt-3 pt-3 border-t border-white/5">
          <div className="text-xs text-slate-600 mb-2 uppercase tracking-widest">Historic Events</div>
          <div className="flex flex-wrap gap-1.5">
            {REPLAY_EVENTS.slice(0, 4).map(event => (
              <button
                key={event.id}
                onClick={() => jumpToDate(event.date)}
                className="text-xs px-3 py-1 rounded-full glass-subtle hover:border-purple-500/30 hover:text-purple-300 text-slate-400 transition-all"
              >
                {event.title.split(" ").slice(0, 3).join(" ")}
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
