"use client";

import { motion, AnimatePresence } from "motion/react";
import { X, ExternalLink, Maximize2 } from "lucide-react";
import { useCelestialStore } from "@/lib/stores/celestialStore";
import { ObjectPanel } from "@/components/panel/ObjectPanel";
import { Button } from "@/components/ui/button";

export function InfoPanel() {
  const { selectedObject, isPanelOpen, setIsPanelOpen, openZenithLens } =
    useCelestialStore();

  return (
    <AnimatePresence mode="wait">
      {isPanelOpen && selectedObject && (
        <motion.aside
          key="info-panel"
          initial={{ x: 380, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 380, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 35 }}
          className="relative h-full glass-strong border-l border-white/5 overflow-hidden flex flex-col"
          style={{ width: 380, minWidth: 380 }}
          aria-label="Object information panel"
          role="complementary"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-slate-400 uppercase tracking-widest font-medium truncate">
                Object Details
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                size="icon"
                variant="ghost"
                className="w-7 h-7 hover:bg-white/10"
                onClick={openZenithLens}
                title="Open Zenith Lens"
                aria-label="Open cinematic overlay"
              >
                <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="w-7 h-7 hover:bg-white/10"
                onClick={() => setIsPanelOpen(false)}
                aria-label="Close panel"
              >
                <X className="w-3.5 h-3.5 text-slate-400" />
              </Button>
            </div>
          </div>

          {/* Panel content */}
          <div className="flex-1 overflow-y-auto no-scrollbar">
            <ObjectPanel />
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
