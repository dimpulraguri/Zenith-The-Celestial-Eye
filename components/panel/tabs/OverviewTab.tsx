"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  MapPin, Gauge, TrendingUp, RotateCcw, Eye, Clock, Lightbulb,
} from "lucide-react";
import { formatAltitude, formatSpeed, formatCoord } from "@/utils/formatting";
import type { CelestialObject } from "@/types";

// ── Stat card ──────────────────────────────────
function StatCard({
  icon: Icon, label, value, sub, delay = 0, accent = "purple",
}: {
  icon: React.ElementType; label: string; value: string; sub?: string;
  delay?: number; accent?: "purple" | "amber" | "cyan" | "green";
}) {
  const colors: Record<string, { bg: string; text: string }> = {
    purple: { bg: "bg-purple-500/10", text: "text-purple-400" },
    amber:  { bg: "bg-amber-500/10",  text: "text-amber-400" },
    cyan:   { bg: "bg-cyan-500/10",   text: "text-cyan-400" },
    green:  { bg: "bg-green-500/10",  text: "text-green-400" },
  };
  const { bg, text } = colors[accent];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="glass-subtle rounded-xl p-3 flex items-start gap-2.5"
    >
      <div className={`w-7 h-7 rounded-lg ${bg} flex items-center justify-center shrink-0 mt-0.5`}>
        <Icon className={`w-3.5 h-3.5 ${text}`} />
      </div>
      <div className="min-w-0">
        <div className="text-[10px] text-slate-500 uppercase tracking-wide mb-0.5 font-medium">{label}</div>
        <div className="text-sm font-semibold text-white leading-tight">{value}</div>
        {sub && <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">{sub}</div>}
      </div>
    </motion.div>
  );
}

const ISS_FACTS = [
  "The ISS is roughly the size of a US football field — 109m × 73m.",
  "Continuously inhabited since November 2, 2000 — over 24 years.",
  "Travels at 7.66 km/s — completing one orbit every 92.7 minutes.",
  "Crew experience 16 sunrises and 16 sunsets every single day.",
  "Built at a cost of approximately $150 billion across 16 nations.",
  "Its solar arrays span 2,500 m² — generating 120 kilowatts of power.",
  "The ISS is visible to the naked eye as a fast-moving bright star.",
];

export function OverviewTab({ object }: { object: CelestialObject }) {
  const [factIdx, setFactIdx] = useState(0);
  const [factVisible, setFactVisible] = useState(true);

  // Rotate facts every 6 seconds
  useEffect(() => {
    if (object.type !== "iss") return;
    const iv = setInterval(() => {
      setFactVisible(false);
      setTimeout(() => {
        setFactIdx(i => (i + 1) % ISS_FACTS.length);
        setFactVisible(true);
      }, 350);
    }, 6000);
    return () => clearInterval(iv);
  }, [object.type]);

  const isISS = object.type === "iss";

  return (
    <div className="p-4 space-y-3">
      {/* Key stats grid */}
      <div className="grid grid-cols-2 gap-2">
        {object.altitude !== undefined && (
          <StatCard icon={TrendingUp} label="Altitude" value={formatAltitude(object.altitude)} delay={0} accent="purple" />
        )}
        {object.speed !== undefined && (
          <StatCard icon={Gauge} label="Speed" value={formatSpeed(object.speed)} delay={0.04} accent="cyan" />
        )}
        {object.inclination !== undefined && (
          <StatCard icon={RotateCcw} label="Inclination" value={`${object.inclination.toFixed(1)}°`} delay={0.08} accent="purple" />
        )}
        <StatCard icon={MapPin} label="Latitude"  value={formatCoord(object.lat, "lat")}  delay={0.12} accent="green" />
        <StatCard icon={MapPin} label="Longitude" value={formatCoord(object.lon, "lon")}  delay={0.16} accent="green" />
        {isISS && (
          <StatCard icon={Eye} label="Visibility" value="Visible Tonight" sub="Clear sky conditions" delay={0.20} accent="amber" />
        )}
      </div>

      {/* Description */}
      {object.description && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="glass-subtle rounded-xl p-3"
        >
          <p className="text-xs text-slate-400 leading-relaxed">{object.description}</p>
        </motion.div>
      )}

      {/* ISS fun fact — rotating */}
      {isISS && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl p-3.5 border border-amber-500/15"
          style={{ background: "rgba(245,158,11,0.04)" }}
        >
          <div className="flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-amber-500/15 flex items-center justify-center shrink-0 mt-0.5">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-bold text-amber-400 mb-1 uppercase tracking-widest">Did You Know?</div>
              <AnimatePresence mode="wait">
                {factVisible && (
                  <motion.p
                    key={factIdx}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.3 }}
                    className="text-xs text-slate-400 leading-relaxed"
                  >
                    {ISS_FACTS[factIdx]}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      )}

      {/* Real-time indicator */}
      {isISS && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-center gap-2 text-[10px] text-slate-600"
        >
          <Clock className="w-3 h-3" />
          <span>Position propagated via SGP4 · updates every 5 s</span>
        </motion.div>
      )}
    </div>
  );
}
