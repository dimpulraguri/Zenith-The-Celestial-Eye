"use client";

import { motion } from "motion/react";
import { ExternalLink, Globe, BookOpen, Satellite } from "lucide-react";
import type { CelestialObject } from "@/types";

interface LearnMoreTabProps {
  object: CelestialObject;
}

function LinkCard({
  href,
  icon: Icon,
  title,
  desc,
  delay = 0,
}: {
  href: string;
  icon: React.ElementType;
  title: string;
  desc: string;
  delay?: number;
}) {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="flex items-center gap-3 p-3 glass-subtle rounded-xl hover:border-purple-500/30 transition-all duration-200 group"
    >
      <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0 group-hover:bg-purple-500/20 transition-colors">
        <Icon className="w-4 h-4 text-purple-400" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-white group-hover:text-purple-300 transition-colors truncate">
          {title}
        </div>
        <div className="text-xs text-slate-500 truncate">{desc}</div>
      </div>
      <ExternalLink className="w-3.5 h-3.5 text-slate-600 group-hover:text-purple-400 transition-colors shrink-0" />
    </motion.a>
  );
}

export function LearnMoreTab({ object }: LearnMoreTabProps) {
  const getLinks = (obj: CelestialObject) => {
    const issLinks = [
      {
        href: "https://www.nasa.gov/international-space-station/",
        icon: Globe,
        title: "NASA ISS Official Page",
        desc: "nasa.gov",
      },
      {
        href: "https://spotthestation.nasa.gov/",
        icon: Satellite,
        title: "Spot the Station",
        desc: "NASA pass predictions",
      },
      {
        href: "https://www.heavens-above.com/",
        icon: BookOpen,
        title: "Heavens-Above",
        desc: "Detailed pass predictions",
      },
      {
        href: "https://en.wikipedia.org/wiki/International_Space_Station",
        icon: Globe,
        title: "Wikipedia – ISS",
        desc: "Comprehensive article",
      },
    ];

    const satLinks = [
      {
        href: "https://celestrak.org/",
        icon: Satellite,
        title: "CelesTrak",
        desc: "TLE orbital data source",
      },
      {
        href: "https://en.wikipedia.org/wiki/Satellite",
        icon: Globe,
        title: "Wikipedia – Satellites",
        desc: "Overview article",
      },
      {
        href: "https://heavens-above.com/",
        icon: BookOpen,
        title: "Heavens-Above",
        desc: "Satellite pass times",
      },
    ];

    if (obj.type === "iss") return issLinks;
    return satLinks;
  };

  const links = getLinks(object);

  return (
    <div className="p-4 space-y-3">
      <div className="text-xs text-slate-500 uppercase tracking-wide mb-3">
        External Resources
      </div>

      {links.map((link, i) => (
        <LinkCard key={link.href} {...link} delay={i * 0.08} />
      ))}

      {/* Related objects hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-4 p-3 rounded-xl border border-white/5 text-center"
      >
        <p className="text-xs text-slate-500">
          Click other objects on the globe to explore and compare
        </p>
      </motion.div>
    </div>
  );
}
