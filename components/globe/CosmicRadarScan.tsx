"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useCelestialStore } from "@/lib/stores/celestialStore";

export function CosmicRadarScan() {
  const { isRadarActive } = useCelestialStore();

  useEffect(() => {
    if (!isRadarActive) return;
    const root = document.documentElement;
    root.style.setProperty("--cosmic-scan-opacity", "1");
    return () => {
      root.style.setProperty("--cosmic-scan-opacity", "0");
    };
  }, [isRadarActive]);

  return (
    <AnimatePresence>
      {isRadarActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="absolute inset-0 pointer-events-none overflow-hidden"
          aria-hidden="true"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(79,70,229,0.08),_transparent_50%)]" />
          <motion.div
            className="absolute left-1/2 top-1/2 rounded-full border border-cyan-400/30"
            initial={{ width: 0, height: 0, opacity: 0.5, translateX: "-50%", translateY: "-50%" }}
            animate={{ width: [0, 360, 660], height: [0, 360, 660], opacity: [0.8, 0.45, 0], rotate: 15 }}
            transition={{ duration: 2.4, ease: "easeOut" }}
            style={{ boxShadow: "0 0 80px rgba(56,189,248,0.18)" }}
          />
          <motion.div
            className="absolute left-1/2 top-1/2 rounded-full border border-violet-400/40"
            initial={{ width: 0, height: 0, opacity: 0.6, translateX: "-50%", translateY: "-50%" }}
            animate={{ width: [0, 260, 480], height: [0, 260, 480], opacity: [0.7, 0.35, 0], rotate: -12 }}
            transition={{ duration: 2.4, ease: "easeOut" }}
          />
          <motion.div
            className="absolute inset-0"
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 2.8, ease: "linear" }}
            style={{ background: "conic-gradient(from 0deg, rgba(56,189,248,0.14), transparent 30%, rgba(168,85,247,0.08) 45%, transparent 60%)" }}
          />
          <div className="absolute left-1/2 top-1/2 w-4 h-4 -translate-x-2 -translate-y-2 rounded-full bg-cyan-300 shadow-[0_0_16px_rgba(56,189,248,0.9)]" />
          <motion.div
            className="absolute left-1/2 top-16 -translate-x-1/2 text-center text-xs uppercase tracking-[0.25em] text-cyan-300/80 font-semibold"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            Scanning the sky above your location...
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
