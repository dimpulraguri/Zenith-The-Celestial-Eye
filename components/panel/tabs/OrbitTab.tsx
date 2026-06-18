"use client";

import { useMemo } from "react";
import { motion } from "motion/react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getOrbitalElements } from "@/utils/orbital";
import { formatAltitude } from "@/utils/formatting";
import type { CelestialObject } from "@/types";

interface OrbitTabProps {
  object: CelestialObject;
}

// Stat row component
function OrbitalStat({
  label,
  value,
  unit,
}: {
  label: string;
  value: string | number;
  unit?: string;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
      <span className="text-xs text-slate-500">{label}</span>
      <span className="text-xs font-semibold text-white">
        {value}
        {unit && <span className="text-slate-500 ml-1">{unit}</span>}
      </span>
    </div>
  );
}

export function OrbitTab({ object }: OrbitTabProps) {
  // Generate simulated altitude profile over one orbit period
  const altitudeData = useMemo(() => {
    const baseAlt = object.altitude ?? 408;
    const points = [];
    for (let i = 0; i <= 20; i++) {
      const t = i / 20;
      // Slight eccentricity variation
      const alt = baseAlt + Math.sin(t * Math.PI * 2) * (baseAlt * 0.005);
      points.push({
        time: Math.round(t * 92),
        altitude: parseFloat(alt.toFixed(1)),
      });
    }
    return points;
  }, [object.altitude]);

  const orbitalPeriod = 92.68; // minutes for ISS approx

  return (
    <div className="p-4 space-y-4">
      {/* Altitude chart */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-subtle rounded-xl p-3"
      >
        <div className="text-xs text-slate-500 uppercase tracking-wide mb-3">
          Altitude Profile (one orbit)
        </div>
        <ResponsiveContainer width="100%" height={100}>
          <LineChart data={altitudeData}>
            <defs>
              <linearGradient id="altGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(99,102,241,0.1)"
            />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 9, fill: "#64748b" }}
              tickLine={false}
              axisLine={false}
              label={{
                value: "min",
                position: "insideRight",
                offset: 0,
                style: { fontSize: 9, fill: "#64748b" },
              }}
            />
            <YAxis
              tick={{ fontSize: 9, fill: "#64748b" }}
              tickLine={false}
              axisLine={false}
              width={36}
              domain={["auto", "auto"]}
            />
            <Tooltip
              contentStyle={{
                background: "rgba(10,22,40,0.95)",
                border: "1px solid rgba(99,102,241,0.2)",
                borderRadius: "8px",
                fontSize: "11px",
                color: "#e2e8f0",
              }}
              formatter={(value: unknown) => [`${value} km`, "Altitude"]}
              labelFormatter={(label: unknown) => `${label} min`}
            />
            <Line
              type="monotone"
              dataKey="altitude"
              stroke="url(#altGradient)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: "#8b5cf6" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Orbital elements */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-subtle rounded-xl p-3"
      >
        <div className="text-xs text-slate-500 uppercase tracking-wide mb-2">
          Orbital Elements
        </div>
        <OrbitalStat
          label="Orbital Period"
          value={orbitalPeriod.toFixed(2)}
          unit="min"
        />
        <OrbitalStat
          label="Inclination"
          value={(object.inclination ?? 51.6).toFixed(2)}
          unit="°"
        />
        <OrbitalStat
          label="Apogee"
          value={formatAltitude((object.altitude ?? 408) + 10)}
        />
        <OrbitalStat
          label="Perigee"
          value={formatAltitude((object.altitude ?? 408) - 10)}
        />
        <OrbitalStat
          label="Eccentricity"
          value="~0.0004"
        />
        <OrbitalStat
          label="Orbits/Day"
          value={(1440 / orbitalPeriod).toFixed(2)}
        />
      </motion.div>
    </div>
  );
}
