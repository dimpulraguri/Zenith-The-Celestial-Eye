"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Calendar, Zap, Star, Globe, Rocket } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SKY_EVENTS } from "@/constants";
import { formatCountdown, formatDate } from "@/utils/formatting";
import type { SkyEvent, EventType } from "@/types";

const EVENT_ICONS: Record<EventType, React.ElementType> = {
  iss_pass: Rocket,
  meteor_shower: Star,
  conjunction: Globe,
  eclipse: Globe,
  opposition: Globe,
  occultation: Globe,
};

const EVENT_COLORS: Record<SkyEvent["rating"], string> = {
  unmissable: "#f59e0b",
  excellent: "#8b5cf6",
  good: "#06b6d4",
  moderate: "#64748b",
};

function EventCard({ event, index }: { event: SkyEvent; index: number }) {
  const [countdown, setCountdown] = useState(formatCountdown(event.startTime));
  const Icon = EVENT_ICONS[event.type] || Calendar;
  const color = EVENT_COLORS[event.rating];

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(formatCountdown(event.startTime));
    }, 1000);
    return () => clearInterval(timer);
  }, [event.startTime]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="glass-subtle rounded-xl p-3 space-y-2"
    >
      <div className="flex items-start gap-2">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: `${color}20` }}
        >
          <Icon className="w-3.5 h-3.5" style={{ color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-sm font-medium text-white leading-tight">
              {event.title}
            </span>
            {event.rating === "unmissable" && (
              <Badge className="text-xs px-1.5 py-0 bg-amber-500/20 text-amber-300 border-0">
                🔥 Must-see
              </Badge>
            )}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">
            {formatDate(event.startTime)}
          </div>
        </div>

        {/* Countdown */}
        <div className="text-right shrink-0">
          <div
            className="text-sm font-bold font-space-grotesk"
            style={{ color }}
          >
            {countdown}
          </div>
          <div className="text-xs text-slate-600">away</div>
        </div>
      </div>

      <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
        {event.description}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1">
        {event.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-slate-500"
          >
            #{tag}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

export function EventTimeline() {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-3">
        <Calendar className="w-3.5 h-3.5 text-purple-400" />
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
          Upcoming Events
        </span>
      </div>

      {SKY_EVENTS.map((event, i) => (
        <EventCard key={event.id} event={event} index={i} />
      ))}
    </div>
  );
}
