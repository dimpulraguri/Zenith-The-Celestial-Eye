"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useCelestialStore } from "@/lib/stores/celestialStore";

export function CosmicRadar() {
  const { isRadarActive } = useCelestialStore();

  return (
    <AnimatePresence>
      {isRadarActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 pointer-events-none flex items-center justify-center"
          aria-hidden="true"
          style={{ zIndex: 10 }}
        >
          {/* Radar circles */}
          {[0.3, 0.5, 0.7, 0.9].map((scale, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full border border-green-400/20"
              initial={{ scale: 0, opacity: 0.6 }}
              animate={{ scale: scale * 3, opacity: 0 }}
              transition={{
                duration: 2.5,
                delay: i * 0.3,
                ease: "easeOut",
              }}
              style={{
                width: "100px",
                height: "100px",
              }}
            />
          ))}

          {/* Radar sweep line */}
          <motion.div
            className="absolute"
            style={{
              width: "2px",
              height: "180px",
              transformOrigin: "50% 100%",
              background:
                "linear-gradient(to top, rgba(34,197,94,0.8), transparent)",
              borderRadius: "1px",
            }}
            initial={{ rotate: 0, opacity: 0.8 }}
            animate={{ rotate: 720, opacity: 0 }}
            transition={{ duration: 2.5, ease: "linear" }}
          />

          {/* Center dot */}
          <div
            className="absolute w-3 h-3 rounded-full bg-green-400"
            style={{ boxShadow: "0 0 12px rgba(34,197,94,0.8)" }}
          />

          {/* Scanning text */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute top-8 left-8 text-green-400/70 text-xs font-mono tracking-widest uppercase"
          >
            Scanning...
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
