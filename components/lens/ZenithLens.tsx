"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X, ExternalLink, Globe2, BookOpen, Zap, Brain,
  TrendingUp, Gauge, RotateCcw, Bot, Sparkles, Send,
  Loader2, RefreshCw, ChevronRight,
} from "lucide-react";
import { useCelestialStore } from "@/lib/stores/celestialStore";
import { useSettingsStore } from "@/lib/stores/settingsStore";
import { useAIExplanation, useAskAnything } from "@/hooks/useAIExplanation";
import { formatAltitude, formatSpeed } from "@/utils/formatting";
import { SATELLITE_CATEGORY_CONFIG } from "@/constants";
import type { CelestialObject, ExplanationLevel } from "@/types";

// ── Custom SVG illustrations (no emojis) ──────

function ISSGraphic() {
  return (
    <div className="relative w-44 h-44 mx-auto select-none">
      {/* Outer pulse rings */}
      {[1, 1.4, 1.8].map((s, i) => (
        <motion.div
          key={i}
          className="absolute inset-0 rounded-full border border-amber-500/10"
          initial={{ scale: s, opacity: 0.6 }}
          animate={{ scale: s + 0.06, opacity: 0 }}
          transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.75, ease: "easeOut" }}
        />
      ))}

      {/* ISS SVG */}
      <motion.div
        animate={{ y: [-3, 3, -3] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <svg width="88" height="88" viewBox="0 0 88 88" fill="none" aria-label="ISS illustration">
          {/* Main body */}
          <rect x="30" y="38" width="28" height="12" rx="3" fill="#64748b" />
          <rect x="37" y="34" width="14" height="20" rx="2" fill="#475569" />

          {/* Solar panels - left */}
          <rect x="2" y="35" width="24" height="18" rx="2" fill="#1d4ed8" opacity="0.9" />
          <line x1="14" y1="35" x2="14" y2="53" stroke="#3b82f6" strokeWidth="0.8" opacity="0.5" />
          <line x1="7"  y1="35" x2="7"  y2="53" stroke="#3b82f6" strokeWidth="0.8" opacity="0.5" />
          <line x1="21" y1="35" x2="21" y2="53" stroke="#3b82f6" strokeWidth="0.8" opacity="0.5" />
          <line x1="2"  y1="40" x2="26" y2="40" stroke="#93c5fd" strokeWidth="0.6" opacity="0.4" />
          <line x1="2"  y1="44" x2="26" y2="44" stroke="#93c5fd" strokeWidth="0.6" opacity="0.4" />
          <line x1="2"  y1="48" x2="26" y2="48" stroke="#93c5fd" strokeWidth="0.6" opacity="0.4" />
          <rect x="2" y="35" width="24" height="18" rx="2" fill="none" stroke="#3b82f6" strokeWidth="0.8" opacity="0.6" />
          <rect x="26" y="42.5" width="4" height="3" rx="0.5" fill="#64748b" />

          {/* Solar panels - right */}
          <rect x="62" y="35" width="24" height="18" rx="2" fill="#1d4ed8" opacity="0.9" />
          <line x1="74" y1="35" x2="74" y2="53" stroke="#3b82f6" strokeWidth="0.8" opacity="0.5" />
          <line x1="69" y1="35" x2="69" y2="53" stroke="#3b82f6" strokeWidth="0.8" opacity="0.5" />
          <line x1="79" y1="35" x2="79" y2="53" stroke="#3b82f6" strokeWidth="0.8" opacity="0.5" />
          <line x1="62" y1="40" x2="86" y2="40" stroke="#93c5fd" strokeWidth="0.6" opacity="0.4" />
          <line x1="62" y1="44" x2="86" y2="44" stroke="#93c5fd" strokeWidth="0.6" opacity="0.4" />
          <line x1="62" y1="48" x2="86" y2="48" stroke="#93c5fd" strokeWidth="0.6" opacity="0.4" />
          <rect x="62" y="35" width="24" height="18" rx="2" fill="none" stroke="#3b82f6" strokeWidth="0.8" opacity="0.6" />
          <rect x="58" y="42.5" width="4" height="3" rx="0.5" fill="#64748b" />

          {/* Radiator panels */}
          <rect x="36" y="20" width="16" height="12" rx="1.5" fill="#374151" />
          <line x1="36" y1="25" x2="52" y2="25" stroke="#6b7280" strokeWidth="0.5" />
          <line x1="36" y1="28" x2="52" y2="28" stroke="#6b7280" strokeWidth="0.5" />
          <rect x="36" y="56" width="16" height="12" rx="1.5" fill="#374151" />
          <line x1="36" y1="61" x2="52" y2="61" stroke="#6b7280" strokeWidth="0.5" />
          <line x1="36" y1="64" x2="52" y2="64" stroke="#6b7280" strokeWidth="0.5" />

          {/* Module windows */}
          <circle cx="44" cy="44" r="2.5" fill="#0ea5e9" opacity="0.9" />
          <circle cx="37" cy="44" r="1.5" fill="#0ea5e9" opacity="0.6" />
          <circle cx="51" cy="44" r="1.5" fill="#0ea5e9" opacity="0.6" />

          {/* Glow */}
          <circle cx="44" cy="44" r="22" fill="url(#issGlow)" opacity="0.15" />
          <defs>
            <radialGradient id="issGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
            </radialGradient>
          </defs>
        </svg>
      </motion.div>

      {/* Orbital path */}
      <motion.svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 176 176"
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <ellipse cx="88" cy="88" rx="76" ry="30" fill="none" stroke="rgba(245,158,11,0.12)" strokeWidth="1" strokeDasharray="4 6" />
        {/* Static dot - use CSS animation via className */}
        <circle r="3" fill="#f59e0b" cx="12" cy="88" filter="url(#orbitGlow)">
          <animateMotion dur="10s" repeatCount="indefinite">
            <mpath href="#orbitEllipse" />
          </animateMotion>
        </circle>
        <ellipse id="orbitEllipse" cx="88" cy="88" rx="76" ry="30" fill="none" />
        <defs>
          <filter id="orbitGlow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
      </motion.svg>
    </div>
  );
}

function SatelliteGraphic({ color = "#60a5fa" }: { color?: string }) {
  return (
    <div className="relative w-40 h-40 mx-auto select-none">
      <div className="absolute inset-0 rounded-full opacity-20 blur-2xl"
        style={{ background: `radial-gradient(circle, ${color}, transparent)` }} />
      <motion.div
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <svg width="72" height="72" viewBox="0 0 72 72" fill="none" aria-label="Satellite">
          {/* Body */}
          <rect x="26" y="26" width="20" height="20" rx="3" fill="#374151" />
          <rect x="30" y="30" width="12" height="12" rx="1.5" fill="#1e3a5f" />
          <circle cx="36" cy="36" r="3" fill={color} opacity="0.8" />
          {/* Panels */}
          <rect x="4"  y="30" width="18" height="12" rx="2" fill="#1d4ed8" opacity="0.85" />
          <rect x="50" y="30" width="18" height="12" rx="2" fill="#1d4ed8" opacity="0.85" />
          <line x1="4"  y1="36" x2="22" y2="36" stroke="#93c5fd" strokeWidth="0.8" opacity="0.5" />
          <line x1="50" y1="36" x2="68" y2="36" stroke="#93c5fd" strokeWidth="0.8" opacity="0.5" />
          {/* Antenna */}
          <line x1="36" y1="26" x2="36" y2="14" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="36" cy="12" r="2.5" fill="#6b7280" />
        </svg>
      </motion.div>
    </div>
  );
}

function PlanetGraphic({ color = "#a78bfa" }: { color?: string }) {
  return (
    <div className="relative w-40 h-40 mx-auto select-none">
      <div className="absolute inset-0 rounded-full opacity-25 blur-3xl"
        style={{ background: `radial-gradient(circle, ${color}, transparent)` }} />
      <motion.div
        animate={{ y: [-4, 4, -4] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none" aria-label="Planet">
          <defs>
            <radialGradient id="planetGrad" cx="35%" cy="30%" r="65%">
              <stop offset="0%" stopColor="white" stopOpacity="0.25" />
              <stop offset="60%" stopColor={color} />
              <stop offset="100%" stopColor={color} stopOpacity="0.4" />
            </radialGradient>
          </defs>
          <circle cx="40" cy="40" r="28" fill="url(#planetGrad)" />
          {/* Ring */}
          <ellipse cx="40" cy="40" rx="40" ry="10" fill="none" stroke={color} strokeWidth="2" opacity="0.35" />
          <ellipse cx="40" cy="40" rx="34" ry="8"  fill="none" stroke={color} strokeWidth="1.2" opacity="0.2" />
          {/* Surface bands */}
          <ellipse cx="40" cy="34" rx="27" ry="4" fill="white" opacity="0.05" />
          <ellipse cx="40" cy="42" rx="27" ry="3" fill="white" opacity="0.04" />
        </svg>
      </motion.div>
    </div>
  );
}

function ObjectGraphic({ object }: { object: CelestialObject }) {
  const catConfig = object.category
    ? SATELLITE_CATEGORY_CONFIG[object.category as keyof typeof SATELLITE_CATEGORY_CONFIG]
    : null;
  const color = catConfig?.color ?? "#60a5fa";

  if (object.type === "iss") return <ISSGraphic />;
  if (object.type === "planet") return <PlanetGraphic color={color} />;
  return <SatelliteGraphic color={color} />;
}

// ── Explanations ──────────────────────────────
// ── Level tabs config ─────────────────────────
const LEVELS: { id: ExplanationLevel; label: string; Icon: React.ElementType }[] = [
  { id: "beginner",     label: "Beginner",     Icon: BookOpen },
  { id: "intermediate", label: "Intermediate", Icon: Zap },
  { id: "advanced",     label: "Advanced",     Icon: Brain },
];

// ── Skeleton ───────────────────────────────────
function TextSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-3 rounded shimmer"
          style={{ width: i === lines - 1 ? "65%" : "100%" }} />
      ))}
    </div>
  );
}

// ── Streaming text ─────────────────────────────
function StreamingText({ text, isStreaming }: { text: string; isStreaming: boolean }) {
  return (
    <p className="text-sm text-slate-300 leading-relaxed">
      {text}
      {isStreaming && (
        <motion.span
          className="inline-block w-0.5 h-4 bg-purple-400 ml-0.5 align-middle"
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 0.8, repeat: Infinity }}
        />
      )}
    </p>
  );
}

// ── Ask Anything (inline, compact) ────────────
const QUICK_QUESTIONS = [
  "Why is this so fast?",
  "Can I see it tonight?",
  "Explain like I\'m 10",
  "What makes it unique?",
];

function LensAskAnything({ object }: { object: CelestialObject }) {
  const [input, setInput] = useState("");
  const { answer, isStreaming, ask, reset } = useAskAnything(object);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-purple-400" />
        <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Ask Anything</span>
        <span className="text-[10px] text-purple-400 ml-auto flex items-center gap-1">
          <Bot className="w-2.5 h-2.5" /> Gemini
        </span>
      </div>

      {!answer && !isStreaming && (
        <div className="flex flex-wrap gap-1.5">
          {QUICK_QUESTIONS.map(q => (
            <button key={q} onClick={() => ask(q)}
              className="text-[10px] px-2.5 py-1.5 rounded-full glass-subtle text-slate-400 hover:text-purple-300 hover:border-purple-500/25 transition-all flex items-center gap-1 group"
            >
              <ChevronRight className="w-2.5 h-2.5 text-purple-500 group-hover:translate-x-0.5 transition-transform" />{q}
            </button>
          ))}
        </div>
      )}

      <AnimatePresence>
        {(answer || isStreaming) && (
          <motion.div
            initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="glass-subtle rounded-2xl p-4 space-y-2"
          >
            <div className="flex items-center gap-2 mb-1">
              <div className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Bot className="w-3 h-3 text-purple-400" />
              </div>
              <span className="text-[10px] text-purple-400 font-bold">ZENITH AI</span>
              {isStreaming && <Loader2 className="w-3 h-3 text-purple-400 animate-spin ml-auto" />}
            </div>
            <StreamingText text={answer} isStreaming={isStreaming} />
            {!isStreaming && answer && (
              <button onClick={reset}
                className="text-[10px] text-slate-600 hover:text-slate-400 transition-colors flex items-center gap-1 mt-1">
                <RefreshCw className="w-2.5 h-2.5" /> Ask another
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") { ask(input.trim()); setInput(""); } }}
          placeholder={`Ask about ${object.name}…`}
          disabled={isStreaming}
          className="w-full glass-subtle rounded-xl px-3 py-2.5 pr-10 text-xs text-slate-300 placeholder:text-slate-600 border border-white/8 focus:outline-none focus:border-purple-500/30 transition-all disabled:opacity-50"
        />
        <button
          onClick={() => { ask(input.trim()); setInput(""); }}
          disabled={!input.trim() || isStreaming}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg bg-purple-600/20 border border-purple-500/25 flex items-center justify-center text-purple-400 hover:bg-purple-600/30 disabled:opacity-40 transition-all"
        >
          {isStreaming ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
        </button>
      </div>
    </div>
  );
}

// ── Main Zenith Lens ───────────────────────────
export function ZenithLens() {
  const { selectedObject, isZenithLensOpen, closeZenithLens } = useCelestialStore();
  const { explanationLevel, setExplanationLevel } = useSettingsStore();

  // Live AI explanation — fetches from Gemini, falls back to static
  const { explanation, fromAI, isLoading: aiLoading, isError: aiError, retry } =
    useAIExplanation(selectedObject ?? { id: "", name: "", type: "iss", lat: 0, lon: 0, altitude: 0 }, explanationLevel, false);

  useEffect(() => {
    if (!isZenithLensOpen) return;
    const handle = (e: KeyboardEvent) => { if (e.key === "Escape") closeZenithLens(); };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [isZenithLensOpen, closeZenithLens]);

  const categoryConfig = selectedObject?.category
    ? SATELLITE_CATEGORY_CONFIG[selectedObject.category as keyof typeof SATELLITE_CATEGORY_CONFIG]
    : null;

  return (
    <AnimatePresence>
      {isZenithLensOpen && selectedObject && (
        <>
          {/* Backdrop */}
          <motion.div
            key="lens-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[90]"
            style={{ background: "rgba(5,8,22,0.8)", backdropFilter: "blur(24px)" }}
            onClick={closeZenithLens}
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.div
            key="lens-panel"
            initial={{ opacity: 0, scale: 0.92, y: 24, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1,    y: 0,  filter: "blur(0px)" }}
            exit={{   opacity: 0, scale: 0.95,  y: 12, filter: "blur(4px)" }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-x-4 bottom-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[640px] z-[91] rounded-3xl overflow-hidden"
            style={{
              background: "rgba(6, 9, 28, 0.94)",
              border: "1px solid rgba(139,92,246,0.22)",
              boxShadow: "0 0 0 1px rgba(139,92,246,0.06), 0 40px 100px rgba(0,0,0,0.85), 0 0 80px rgba(139,92,246,0.12)",
              maxHeight: "92vh",
            }}
            role="dialog"
            aria-modal="true"
            aria-label={`Zenith Lens: ${selectedObject.name}`}
            onClick={e => e.stopPropagation()}
          >
            {/* Scan line */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-10 rounded-3xl">
              <motion.div
                className="absolute left-0 right-0 h-px"
                style={{ background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.5), rgba(6,182,212,0.3), transparent)" }}
                animate={{ top: ["0%", "100%"] }}
                transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
              />
            </div>

            {/* Scrollable content */}
            <div className="relative z-20 overflow-y-auto no-scrollbar" style={{ maxHeight: "92vh" }}>

              {/* Header */}
              <div className="flex items-start justify-between px-6 pt-6 pb-0">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                    <span className="text-[10px] text-purple-400 uppercase tracking-widest font-bold">Zenith Lens</span>
                    {selectedObject.type === "iss" && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/15 text-green-400 border border-green-500/25 font-semibold">● Live</span>
                    )}
                  </div>
                  <h2 className="text-xl font-bold text-white font-space-grotesk leading-snug">{selectedObject.name}</h2>
                  {categoryConfig && (
                    <span
                      className="inline-flex mt-1.5 text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider"
                      style={{ background: categoryConfig.bgColor, color: categoryConfig.color }}
                    >
                      {categoryConfig.label}
                    </span>
                  )}
                </div>
                <button
                  onClick={closeZenithLens}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/8 transition-all ml-4 shrink-0"
                  aria-label="Close Zenith Lens"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Object graphic */}
              <div className="px-6 py-6">
                <ObjectGraphic object={selectedObject} />
              </div>

              {/* Stats */}
              <div className="px-6 grid grid-cols-3 gap-2.5 mb-5">
                {[
                  { label: "Altitude", value: selectedObject.altitude ? formatAltitude(selectedObject.altitude) : "—", Icon: TrendingUp },
                  { label: "Speed",    value: selectedObject.speed    ? formatSpeed(selectedObject.speed)        : "—", Icon: Gauge },
                  { label: "Inclin.",  value: selectedObject.inclination ? `${selectedObject.inclination.toFixed(1)}°` : "—", Icon: RotateCcw },
                ].map(({ label, value, Icon }) => (
                  <div key={label} className="glass-subtle rounded-2xl p-3 text-center">
                    <Icon className="w-3.5 h-3.5 text-purple-400 mx-auto mb-1" />
                    <div className="text-sm font-bold text-white font-space-grotesk tabular-nums leading-tight">{value}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{label}</div>
                  </div>
                ))}
              </div>

              {/* Explanation tabs */}
              <div className="px-6 mb-4">
                <div className="flex gap-1 mb-3 p-1 glass-subtle rounded-xl">
                  {LEVELS.map(({ id, label, Icon }) => (
                    <button
                      key={id}
                      onClick={() => setExplanationLevel(id)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                        explanationLevel === id
                          ? "bg-purple-600/25 text-purple-200 shadow-sm"
                          : "text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      <Icon className="w-3 h-3" />
                      {label}
                    </button>
                  ))}
                </div>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={explanationLevel}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.22 }}
                    className="glass-subtle rounded-2xl p-4"
                  >
                    {/* AI badge */}
                    <div className="flex items-center justify-between mb-3">
                      <span className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                        fromAI ? "bg-purple-500/15 text-purple-300 border border-purple-500/20" : "bg-white/5 text-slate-600"
                      }`}>
                        <Bot className="w-2.5 h-2.5" />{fromAI ? "Gemini" : "Curated"}
                      </span>
                      {aiError && (
                        <button onClick={retry} className="text-[10px] text-red-400 hover:text-red-300 flex items-center gap-1">
                          <RefreshCw className="w-2.5 h-2.5" /> Retry
                        </button>
                      )}
                    </div>
                    {aiLoading ? (
                      <div className="space-y-2">
                        {["100%", "100%", "65%"].map((w, i) => (
                          <div key={i} className="h-3 rounded shimmer" style={{ width: w }} />
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-300 leading-relaxed">{explanation}</p>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Ask Anything */}
              {selectedObject && (
                <div className="px-6 mb-5 pt-4 border-t border-white/5">
                  <LensAskAnything object={selectedObject} />
                </div>
              )}

              {/* Actions */}
              <div className="px-6 pb-6 grid grid-cols-2 gap-2">
                <button
                  onClick={closeZenithLens}
                  className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-purple-600/20 border border-purple-500/25 text-sm font-semibold text-purple-300 hover:bg-purple-600/30 transition-all"
                >
                  <Globe2 className="w-4 h-4" />
                  Track on Globe
                </button>
                <a
                  href="https://www.nasa.gov/international-space-station/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-3 rounded-2xl glass-subtle text-sm font-medium text-slate-400 hover:text-white transition-all"
                >
                  <ExternalLink className="w-4 h-4" />
                  Learn More
                </a>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
