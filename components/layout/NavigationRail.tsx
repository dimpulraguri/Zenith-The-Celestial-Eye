"use client";

import Link from "next/link";
import { motion } from "motion/react";
import {
  Globe2,
  Satellite,
  Rocket,
  Circle,
  Calendar,
  Settings,
  Telescope,
  Home,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCelestialStore } from "@/lib/stores/celestialStore";
import { cn } from "@/utils/formatting";
import type { NavigationView } from "@/types";

const NAV_ITEMS: {
  id: NavigationView;
  label: string;
  Icon: React.ElementType;
}[] = [
  { id: "globe", label: "Sky Globe", Icon: Globe2 },
  { id: "satellites", label: "Satellites", Icon: Satellite },
  { id: "iss", label: "ISS Tracker", Icon: Rocket },
  { id: "planets", label: "Planets", Icon: Circle },
  { id: "events", label: "Events", Icon: Calendar },
  { id: "settings", label: "Settings", Icon: Settings },
];

export function NavigationRail() {
  const { activeView, setActiveView } = useCelestialStore();

  return (
    <nav
      className="flex flex-col items-center h-full py-4 gap-2"
      aria-label="Main navigation"
      role="navigation"
    >
      {/* Logo */}
      <Link
        href="/"
        className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-cyan-600 mb-4 hover:scale-105 transition-transform"
        title="ZENITH Home"
      >
        <Telescope className="w-5 h-5 text-white" />
      </Link>

      {/* Nav items */}
      <div className="flex flex-col gap-1 flex-1">
        {NAV_ITEMS.map(({ id, label, Icon }) => (
          <Tooltip key={id}>
            <TooltipTrigger>
              <button
                id={`nav-${id}`}
                onClick={() => setActiveView(id)}
                aria-label={label}
                aria-current={activeView === id ? "page" : undefined}
                className={cn(
                  "relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 group focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500",
                  activeView === id
                    ? "bg-purple-500/20 text-purple-300"
                    : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
                )}
              >
                {activeView === id && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute inset-0 rounded-xl bg-purple-500/15 border border-purple-500/30"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon className="w-[18px] h-[18px] relative z-10" />
                {activeView === id && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-purple-400 rounded-r-full" />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="glass border-white/10">
              <p className="text-xs font-medium">{label}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>

      {/* Back to home */}
      <Tooltip>
        <TooltipTrigger>
          <Link
            href="/"
            className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-600 hover:text-slate-300 hover:bg-white/5 transition-all"
            aria-label="Back to home"
          >
            <Home className="w-4 h-4" />
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right" className="glass border-white/10">
          <p className="text-xs font-medium">Home</p>
        </TooltipContent>
      </Tooltip>
    </nav>
  );
}
