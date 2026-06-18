"use client";

import { motion, AnimatePresence } from "motion/react";
import { X, Globe2, Monitor, Moon, Zap, GraduationCap, Ruler, Info, BookOpen, Brain } from "lucide-react";
import { useSettingsStore } from "@/lib/stores/settingsStore";
import { useCelestialStore } from "@/lib/stores/celestialStore";
import type { ExplanationLevel } from "@/types";

// ── Toggle switch ──────────────────────────────
function Toggle({ checked, onChange, id }: { checked: boolean; onChange: () => void; id: string }) {
  return (
    <button
      id={id}
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative w-10 h-5.5 rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 ${
        checked ? "bg-purple-600" : "bg-white/10"
      }`}
      style={{ height: 22, width: 40 }}
    >
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 500, damping: 35 }}
        className="absolute top-[3px] w-4 h-4 rounded-full bg-white"
        style={{ left: checked ? 20 : 3 }}
      />
    </button>
  );
}

// ── Settings row ───────────────────────────────
function SettingRow({ icon: Icon, label, desc, children }: {
  icon: React.ElementType; label: string; desc?: string; children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
      <div className="flex items-start gap-3">
        <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center shrink-0 mt-0.5">
          <Icon className="w-3.5 h-3.5 text-slate-400" />
        </div>
        <div>
          <div className="text-sm font-medium text-white">{label}</div>
          {desc && <div className="text-xs text-slate-500 mt-0.5">{desc}</div>}
        </div>
      </div>
      {children}
    </div>
  );
}

// ── Main Settings Panel ────────────────────────
export function SettingsPanel() {
  const { activeView } = useCelestialStore();
  const {
    reducedMotion, toggleReducedMotion,
    highContrast, toggleHighContrast,
    teacherMode, toggleTeacherMode,
    units, updateSettings,
    globeMode, explanationLevel, setExplanationLevel,
  } = useSettingsStore();

  const isOpen = activeView === "settings";

  const LEVELS: { id: ExplanationLevel; label: string; Icon: React.ElementType }[] = [
    { id: "beginner", label: "Beginner", Icon: BookOpen },
    { id: "intermediate", label: "Intermediate", Icon: Zap },
    { id: "advanced", label: "Advanced", Icon: Brain },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="settings-panel"
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 20, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="h-full w-full overflow-y-auto no-scrollbar"
        >
          {/* Header */}
          <div className="px-4 pt-4 pb-2 border-b border-white/5">
            <h2 className="font-semibold text-white font-space-grotesk text-base">Settings</h2>
            <p className="text-xs text-slate-500 mt-0.5">Customize your ZENITH experience</p>
          </div>

          <div className="p-4 space-y-2">
            {/* Globe section */}
            <div className="text-xs text-slate-600 uppercase tracking-widest font-semibold mb-2 mt-2">Globe</div>
            <div className="glass-subtle rounded-xl px-3 py-1">
              <SettingRow icon={Globe2} label="Globe Mode" desc="2D map or 3D Cesium globe">
                <div className="flex gap-1">
                  {(["2d", "3d"] as const).map(mode => (
                    <button
                      key={mode}
                      onClick={() => updateSettings({ globeMode: mode })}
                      className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${
                        globeMode === mode
                          ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                          : "text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      {mode.toUpperCase()}
                    </button>
                  ))}
                </div>
              </SettingRow>
            </div>

            {/* Units */}
            <div className="text-xs text-slate-600 uppercase tracking-widest font-semibold mb-2 mt-4">Display</div>
            <div className="glass-subtle rounded-xl px-3 py-1">
              <SettingRow icon={Ruler} label="Units" desc="Altitude, speed, distance">
                <div className="flex gap-1">
                  {(["metric", "imperial"] as const).map(u => (
                    <button
                      key={u}
                      onClick={() => updateSettings({ units: u })}
                      className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all capitalize ${
                        units === u
                          ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                          : "text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      {u === "metric" ? "km" : "mi"}
                    </button>
                  ))}
                </div>
              </SettingRow>
              <SettingRow icon={Moon} label="Reduced Motion" desc="Disable animations">
                <Toggle id="reduced-motion" checked={reducedMotion} onChange={toggleReducedMotion} />
              </SettingRow>
              <SettingRow icon={Monitor} label="High Contrast" desc="Increase visibility">
                <Toggle id="high-contrast" checked={highContrast} onChange={toggleHighContrast} />
              </SettingRow>
            </div>

            {/* Explanation */}
            <div className="text-xs text-slate-600 uppercase tracking-widest font-semibold mb-2 mt-4">AI Explanations</div>
            <div className="glass-subtle rounded-xl px-3 pt-2 pb-3">
              <div className="text-xs text-slate-400 mb-2 px-0.5">Knowledge level for object descriptions</div>
              <div className="flex flex-col gap-1.5">
                {LEVELS.map(({ id, label, Icon }) => (
                  <button
                    key={id}
                    onClick={() => setExplanationLevel(id)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                      explanationLevel === id
                        ? "bg-purple-500/15 text-purple-300 border border-purple-500/25"
                        : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {label}
                    {explanationLevel === id && (
                      <span className="ml-auto text-xs text-purple-400">Active</span>
                    )}
                  </button>
                ))}
              </div>
              <div className="mt-3 border-t border-white/5 pt-3">
                <SettingRow icon={GraduationCap} label="Teacher Mode" desc="Show classroom notes">
                  <Toggle id="teacher-mode" checked={teacherMode} onChange={toggleTeacherMode} />
                </SettingRow>
              </div>
            </div>

            {/* About */}
            <div className="text-xs text-slate-600 uppercase tracking-widest font-semibold mb-2 mt-4">About</div>
            <div className="glass-subtle rounded-xl p-3">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-cyan-600 flex items-center justify-center shrink-0">
                  <span className="text-lg">🔭</span>
                </div>
                <div>
                  <div className="font-semibold text-white text-sm font-space-grotesk">ZENITH</div>
                  <div className="text-xs text-slate-500">The Celestial Eye · v1.0</div>
                </div>
              </div>
              <div className="space-y-1.5 text-xs text-slate-500">
                <div className="flex justify-between">
                  <span>Orbital data</span>
                  <span className="text-slate-400">CelesTrak (live)</span>
                </div>
                <div className="flex justify-between">
                  <span>Weather</span>
                  <span className="text-slate-400">Open-Meteo</span>
                </div>
                <div className="flex justify-between">
                  <span>Propagator</span>
                  <span className="text-slate-400">SGP4 (satellite.js)</span>
                </div>
                <div className="flex justify-between">
                  <span>Map</span>
                  <span className="text-slate-400">CartoDB Dark</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
