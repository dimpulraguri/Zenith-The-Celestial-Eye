"use client";

import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import { Cloud, Eye } from "lucide-react";
import { useObservability } from "@/hooks/useObservability";

// ── Lucide-based factor icons (no emojis) ──────
function MoonIcon({ phase }: { phase: number }) {
  // Pure SVG moon that morphs based on phase
  const fill = phase < 0.1 || phase > 0.9 ? 0 : phase < 0.5 ? phase * 2 : (1 - phase) * 2;
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
      <circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" strokeWidth="1.2" fill="none" opacity="0.4" />
      <ellipse cx={6.5 - 5.5 * (1 - fill)} cy="6.5" rx={5.5 * fill} ry="5.5" fill="currentColor" />
    </svg>
  );
}

function CityIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true">
      <rect x="1" y="6" width="3" height="6" rx="0.5" />
      <rect x="5" y="3" width="3" height="9" rx="0.5" />
      <rect x="9" y="5" width="3" height="7" rx="0.5" />
      <line x1="0" y1="12.5" x2="13" y2="12.5" strokeWidth="0.8" />
    </svg>
  );
}

function RadialGauge({ score, color }: { score: number; color: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const size = 96;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;
    const radius = 36;
    const startAngle = Math.PI * 0.75;
    const endAngle = Math.PI * 2.25;
    const scoreAngle = startAngle + ((endAngle - startAngle) * score) / 100;

    ctx.clearRect(0, 0, size, size);

    // Track
    ctx.beginPath();
    ctx.arc(cx, cy, radius, startAngle, endAngle);
    ctx.strokeStyle = "rgba(99, 102, 241, 0.12)";
    ctx.lineWidth = 8;
    ctx.lineCap = "round";
    ctx.stroke();

    // Progress
    if (score > 0) {
      const gradient = ctx.createLinearGradient(0, 0, size, 0);
      if (score >= 70) {
        gradient.addColorStop(0, "#10b981");
        gradient.addColorStop(1, "#34d399");
      } else if (score >= 40) {
        gradient.addColorStop(0, "#f59e0b");
        gradient.addColorStop(1, "#fbbf24");
      } else {
        gradient.addColorStop(0, "#ef4444");
        gradient.addColorStop(1, "#f87171");
      }
      ctx.beginPath();
      ctx.arc(cx, cy, radius, startAngle, scoreAngle);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 8;
      ctx.lineCap = "round";
      ctx.stroke();
    }

    // Score
    ctx.fillStyle = "#f1f5f9";
    ctx.font = `bold 18px 'Space Grotesk', Inter, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(score.toString(), cx, cy - 3);

    ctx.font = `9px Inter, sans-serif`;
    ctx.fillStyle = "#475569";
    ctx.fillText("/100", cx, cy + 11);
  }, [score, color]);

  return <canvas ref={canvasRef} aria-hidden="true" />;
}

export function ObservabilityGauge() {
  const { observability, isLoading } = useObservability();

  if (isLoading || !observability) {
    return (
      <div className="glass rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-3 w-24 shimmer rounded" />
          <div className="h-5 w-20 shimmer rounded-full" />
        </div>
        <div className="flex items-center gap-3">
          <div className="w-24 h-24 shimmer rounded-full" />
          <div className="flex-1 space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="space-y-1">
                <div className="h-2.5 w-3/4 shimmer rounded" />
                <div className="h-1.5 w-full shimmer rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const { score, label, color, factors, weather, moon } = observability;

  const FACTORS = [
    { label: "Sky", value: factors.cloudCover, Icon: Cloud },
    { label: "Moon", value: factors.moonIllumination, Icon: () => <MoonIcon phase={moon.phase} /> },
    { label: "Dark", value: factors.lightPollution, Icon: CityIcon },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass rounded-2xl p-4 space-y-3"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Sky Quality</span>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: `${color}18`, color }}>
          {label}
        </span>
      </div>

      {/* Gauge + factors */}
      <div className="flex items-center gap-3">
        <div className="shrink-0">
          <RadialGauge score={score} color={color} />
        </div>

        <div className="flex-1 min-w-0 space-y-2.5">
          {FACTORS.map(({ label, value, Icon }) => (
            <div key={label}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <span className="text-slate-500 shrink-0"><Icon /></span>
                  <span className="text-slate-400 font-medium">{label}</span>
                </span>
                <span className="text-white font-semibold tabular-nums text-xs">{value}%</span>
              </div>
              <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${value}%` }}
                  transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full rounded-full"
                  style={{
                    background: value >= 70 ? "#10b981" : value >= 40 ? "#f59e0b" : "#ef4444",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weather row */}
      <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-white/5">
        {[
          { label: "Cloud", value: `${weather.cloudCover}%` },
          { label: "Humidity", value: `${weather.humidity}%` },
          { label: "Visibility", value: weather.visibility >= 10 ? `${Math.round(weather.visibility)}km` : `${weather.visibility.toFixed(1)}km` },
        ].map(({ label, value }) => (
          <div key={label} className="text-center">
            <div className="text-xs font-semibold text-white tabular-nums">{value}</div>
            <div className="text-[10px] text-slate-600 mt-0.5">{label}</div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
