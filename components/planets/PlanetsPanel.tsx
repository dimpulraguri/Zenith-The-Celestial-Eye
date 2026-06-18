"use client";

import { useMemo } from "react";
import { motion } from "motion/react";
import { PLANETS } from "@/constants";
import { useCelestialStore } from "@/lib/stores/celestialStore";
import type { PlanetData } from "@/types";

// ── Planet ring SVG ────────────────────────────
function PlanetVisual({ planet, size = 48 }: { planet: PlanetData; size?: number }) {
  const hasSaturnRings = planet.id === "saturn";
  const hasUranusTilt  = planet.id === "uranus";
  const s = size;

  return (
    <svg width={s * 1.6} height={s} viewBox={`0 0 ${s * 1.6} ${s}`} fill="none" aria-hidden="true">
      <defs>
        <radialGradient id={`grad-${planet.id}`} cx="38%" cy="32%" r="65%">
          <stop offset="0%" stopColor="white" stopOpacity="0.18" />
          <stop offset="45%" stopColor={planet.color} />
          <stop offset="100%" stopColor={planet.color} stopOpacity="0.35" />
        </radialGradient>
        <radialGradient id={`glow-${planet.id}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={planet.color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={planet.color} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Glow halo */}
      <ellipse cx={s * 0.8} cy={s * 0.5} rx={s * 0.65} ry={s * 0.65}
        fill={`url(#glow-${planet.id})`} />

      {/* Saturn / Uranus rings (behind) */}
      {(hasSaturnRings || hasUranusTilt) && (
        <ellipse
          cx={s * 0.8} cy={s * 0.5}
          rx={s * 0.72} ry={hasSaturnRings ? s * 0.18 : s * 0.72}
          fill="none" stroke={planet.color} strokeWidth="2.5" opacity="0.3"
          transform={hasUranusTilt ? `rotate(-90 ${s * 0.8} ${s * 0.5})` : undefined}
        />
      )}

      {/* Planet sphere */}
      <circle cx={s * 0.8} cy={s * 0.5} r={s * 0.38} fill={`url(#grad-${planet.id})`} />

      {/* Surface bands */}
      {(planet.id === "jupiter" || planet.id === "saturn") && (
        <>
          <ellipse cx={s * 0.8} cy={s * 0.4}  rx={s * 0.36} ry={s * 0.07} fill="white" opacity="0.05" />
          <ellipse cx={s * 0.8} cy={s * 0.55} rx={s * 0.36} ry={s * 0.05} fill="white" opacity="0.04" />
        </>
      )}

      {/* Saturn rings (front) */}
      {hasSaturnRings && (
        <ellipse cx={s * 0.8} cy={s * 0.5} rx={s * 0.55} ry={s * 0.14}
          fill="none" stroke={planet.color} strokeWidth="1.5" opacity="0.2" />
      )}

      {/* Shine */}
      <ellipse cx={s * 0.68} cy={s * 0.38} rx={s * 0.12} ry={s * 0.08}
        fill="white" opacity="0.12" transform={`rotate(-20 ${s * 0.68} ${s * 0.38})`} />
    </svg>
  );
}

// ── Planet card ────────────────────────────────
function PlanetCard({ planet, index }: { planet: PlanetData; index: number }) {
  const { setSelectedObject, openZenithLens } = useCelestialStore();

  const handleClick = () => {
    setSelectedObject({
      id: planet.id,
      name: planet.name,
      type: "planet",
      lat: 0,
      lon: 0,
      altitude: planet.distanceAU * 149597870.7, // AU to km
      description: `${planet.name} — magnitude ${planet.magnitude > 0 ? "+" : ""}${planet.magnitude}. Currently in ${planet.constellation}.`,
    });
    openZenithLens();
  };

  return (
    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      onClick={handleClick}
      className="w-full text-left glass-subtle rounded-2xl p-3 flex items-center gap-3 hover:border-purple-500/30 transition-all duration-300 group"
      style={{ borderColor: planet.isVisible ? `${planet.color}20` : undefined }}
    >
      {/* Planet visual */}
      <div className="shrink-0">
        <PlanetVisual planet={planet} size={36} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="text-sm font-semibold text-white group-hover:text-purple-200 transition-colors">
            {planet.name}
          </span>
          {planet.isVisible && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider"
              style={{ background: `${planet.color}18`, color: planet.color }}>
              Visible
            </span>
          )}
        </div>
        <div className="text-[10px] text-slate-500 flex items-center gap-2">
          <span>{planet.constellation}</span>
          <span className="text-slate-700">·</span>
          <span>Mag {planet.magnitude > 0 ? "+" : ""}{planet.magnitude}</span>
          <span className="text-slate-700">·</span>
          <span>{planet.distanceAU} AU</span>
        </div>
      </div>

      {/* Arrow */}
      <div className="shrink-0 text-slate-700 group-hover:text-purple-400 transition-colors text-lg">›</div>
    </motion.button>
  );
}

// ── Planets panel ──────────────────────────────
export function PlanetsPanel() {
  const visible   = PLANETS.filter(p => p.isVisible);
  const invisible = PLANETS.filter(p => !p.isVisible);

  return (
    <div className="h-full overflow-y-auto no-scrollbar p-3 space-y-4">
      {/* Header */}
      <div>
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-yellow-400 opacity-80" />
          Visible Tonight ({visible.length})
        </div>
        <div className="space-y-1.5">
          {visible.map((p, i) => <PlanetCard key={p.id} planet={p} index={i} />)}
        </div>
      </div>

      {invisible.length > 0 && (
        <div>
          <div className="text-xs font-semibold text-slate-600 uppercase tracking-widest mb-1">Not Visible</div>
          <div className="space-y-1.5">
            {invisible.map((p, i) => <PlanetCard key={p.id} planet={p} index={visible.length + i} />)}
          </div>
        </div>
      )}

      <div className="text-[10px] text-slate-700 text-center pb-2">
        Positions approximate · Based on current UTC date
      </div>
    </div>
  );
}
