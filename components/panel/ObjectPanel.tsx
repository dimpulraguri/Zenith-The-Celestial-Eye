"use client";

import { motion } from "motion/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useCelestialStore } from "@/lib/stores/celestialStore";
import { SATELLITE_CATEGORY_CONFIG } from "@/constants";
import { OverviewTab } from "./tabs/OverviewTab";
import { OrbitTab } from "./tabs/OrbitTab";
import { AIExplainTab } from "./tabs/AIExplainTab";
import { LearnMoreTab } from "./tabs/LearnMoreTab";

export function ObjectPanel() {
  const { selectedObject, activeTab, setActiveTab } = useCelestialStore();

  if (!selectedObject) return null;

  const categoryConfig =
    selectedObject.category &&
    SATELLITE_CATEGORY_CONFIG[
      selectedObject.category as keyof typeof SATELLITE_CATEGORY_CONFIG
    ];

  const typeLabel =
    selectedObject.type === "iss"
      ? "Space Station"
      : selectedObject.type === "satellite"
      ? categoryConfig?.label || "Satellite"
      : selectedObject.type === "planet"
      ? "Planet"
      : selectedObject.type === "constellation"
      ? "Constellation"
      : selectedObject.type === "location"
      ? "Ground Location"
      : "Celestial Object";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col h-full"
    >
      {/* Object header */}
      <div className="px-4 py-4 border-b border-white/5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h2
              className="text-lg font-bold text-white font-space-grotesk truncate"
              title={selectedObject.name}
            >
              {selectedObject.name}
            </h2>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Badge
                className="text-xs px-2 py-0.5 border-0"
                style={{
                  background: categoryConfig?.bgColor || "rgba(99,102,241,0.15)",
                  color: categoryConfig?.color || "#a5b4fc",
                }}
              >
                {typeLabel}
              </Badge>
              {selectedObject.type === "iss" && (
                <span className="flex items-center gap-1 text-xs text-green-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  Live
                </span>
              )}
            </div>
          </div>

          {/* Altitude callout */}
          {selectedObject.altitude && (
            <div className="text-right shrink-0">
              <div className="text-xl font-bold text-aurora font-space-grotesk">
                {Math.round(selectedObject.altitude).toLocaleString()}
              </div>
              <div className="text-xs text-slate-500">km altitude</div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(v) =>
          setActiveTab(v as "overview" | "orbit" | "ai_explain" | "learn_more")
        }
        className="flex-1 flex flex-col min-h-0"
      >
        <TabsList className="mx-4 mt-3 bg-white/5 border border-white/8 grid grid-cols-4 h-9">
          <TabsTrigger
            value="overview"
            className="text-xs data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="orbit"
            className="text-xs data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300"
          >
            Orbit
          </TabsTrigger>
          <TabsTrigger
            value="ai_explain"
            className="text-xs data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300"
          >
            Explain
          </TabsTrigger>
          <TabsTrigger
            value="learn_more"
            className="text-xs data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300"
          >
            Learn
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto no-scrollbar">
          <TabsContent value="overview" className="mt-0 h-full">
            <OverviewTab object={selectedObject} />
          </TabsContent>
          <TabsContent value="orbit" className="mt-0 h-full">
            <OrbitTab object={selectedObject} />
          </TabsContent>
          <TabsContent value="ai_explain" className="mt-0 h-full">
            <AIExplainTab object={selectedObject} />
          </TabsContent>
          <TabsContent value="learn_more" className="mt-0 h-full">
            <LearnMoreTab object={selectedObject} />
          </TabsContent>
        </div>
      </Tabs>
    </motion.div>
  );
}
