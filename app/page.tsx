"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useInView, AnimatePresence } from "motion/react";
import {
  Telescope, Satellite, Globe2, Rocket, Eye, Zap, Clock,
  Star, Radio, Navigation, ChevronRight, ArrowRight, Play,
  Moon, Sun, MapPin, Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StarField } from "@/components/landing/StarField";
import { COSMIC_FACTS } from "@/constants";

// ── Animated word-by-word headline ──────────────
function AnimatedHeadline() {
  const words1 = ["What's", "Above", "You,"];
  const words2 = ["Right", "Now?"];
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true });

  return (
    <div ref={containerRef} className="text-center">
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
        {words1.map((word, i) => (
          <motion.span
            key={word}
            initial={{ opacity: 0, y: 40, filter: "blur(12px)" }}
            animate={isInView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
            transition={{ delay: 0.6 + i * 0.12, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold font-space-grotesk text-white tracking-tight leading-none"
          >
            {word}
          </motion.span>
        ))}
      </div>
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-2">
        {words2.map((word, i) => (
          <motion.span
            key={word}
            initial={{ opacity: 0, y: 40, filter: "blur(12px)" }}
            animate={isInView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
            transition={{ delay: 0.96 + i * 0.12, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold font-space-grotesk tracking-tight leading-none text-aurora"
          >
            {word}
          </motion.span>
        ))}
      </div>
    </div>
  );
}

// ── Live ticker ────────────────────────────────
const TICKER_ITEMS = [
  { icon: "🛸", label: "ISS Altitude", value: "408 km" },
  { icon: "⚡", label: "ISS Speed", value: "27,600 km/h" },
  { icon: "🛰️", label: "Active Satellites", value: "8,377+" },
  { icon: "🌙", label: "Moon Phase", value: "Waxing Gibbous" },
  { icon: "🌟", label: "Visible Planets", value: "4 Tonight" },
  { icon: "🔭", label: "Orbital Period", value: "92.7 min" },
  { icon: "📡", label: "Data Source", value: "CelesTrak Live" },
  { icon: "🌍", label: "Orbits Today", value: "15.5×" },
];

function LiveTicker() {
  return (
    <div className="relative overflow-hidden border-y border-white/5 py-3">
      <div className="flex animate-marquee gap-12 whitespace-nowrap">
        {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
          <div key={i} className="flex items-center gap-2 shrink-0">
            <span>{item.icon}</span>
            <span className="text-xs text-slate-500 uppercase tracking-widest">{item.label}</span>
            <span className="text-xs font-semibold text-white">{item.value}</span>
            <span className="text-slate-700 ml-4">·</span>
          </div>
        ))}
      </div>
      {/* Fade edges */}
      <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#050816] to-transparent pointer-events-none z-10" />
      <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#050816] to-transparent pointer-events-none z-10" />
    </div>
  );
}

// ── Earth visualization ────────────────────────
function EarthHero() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.3, duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
      className="relative mx-auto"
      style={{ width: 280, height: 280 }}
    >
      {/* Outer nebula glow */}
      <div className="absolute inset-[-60px] rounded-full opacity-25 blur-3xl"
        style={{ background: "radial-gradient(circle, #8b5cf6 0%, #06b6d4 40%, transparent 70%)" }} />

      {/* Orbit rings */}
      {[1.45, 1.7, 1.95].map((scale, i) => (
        <motion.div
          key={i}
          className="absolute inset-0 rounded-full border border-purple-500/10"
          style={{ transform: `scale(${scale}) rotateX(${68}deg) rotateZ(${i * 15}deg)`, transformStyle: "preserve-3d" }}
          animate={{ rotateZ: [i * 15, i * 15 + 360] }}
          transition={{ duration: 20 + i * 8, repeat: Infinity, ease: "linear" }}
        />
      ))}

      {/* Earth */}
      <div className="w-full h-full rounded-full overflow-hidden relative animate-float"
        style={{
          background: "radial-gradient(circle at 32% 28%, #1d6b45 0%, #0e5a8a 35%, #073460 65%, #020a18 100%)",
          boxShadow: "inset -24px -24px 50px rgba(0,0,0,0.9), inset 12px 12px 30px rgba(6,182,212,0.08), 0 0 60px rgba(139,92,246,0.25), 0 0 120px rgba(6,182,212,0.1)",
        }}>
        {/* Grid lines */}
        <svg className="absolute inset-0 w-full h-full opacity-15" viewBox="0 0 100 100">
          {[20, 35, 50, 65, 80].map(y => (
            <ellipse key={y} cx="50" cy={y} rx="48" ry="7" fill="none" stroke="#06b6d4" strokeWidth="0.3" />
          ))}
          {[0, 30, 60, 90, 120, 150].map(angle => (
            <ellipse key={angle} cx="50" cy="50" rx="7" ry="48" fill="none" stroke="#06b6d4" strokeWidth="0.3" transform={`rotate(${angle} 50 50)`} />
          ))}
        </svg>
        {/* Light shimmer */}
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 28% 22%, rgba(255,255,255,0.07) 0%, transparent 55%)" }} />
      </div>

      {/* ISS dot orbiting */}
      <motion.div
        className="absolute w-2.5 h-2.5 rounded-full bg-amber-400"
        style={{ boxShadow: "0 0 10px rgba(245,158,11,0.9)", top: "50%", left: "50%" }}
        animate={{
          x: [0, 120, 0, -120, 0],
          y: [-90, -30, 90, -30, -90],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      />
    </motion.div>
  );
}

// ── Bento grid features ────────────────────────
const BENTO_ITEMS = [
  {
    title: "ISS Real-Time",
    desc: "Live TLE-propagated position via SGP4 orbital mechanics. Updates every 5 seconds.",
    icon: Rocket,
    color: "#f59e0b",
    size: "col-span-2 row-span-2",
    badge: "LIVE",
  },
  {
    title: "500+ Satellites",
    desc: "Track active payloads from communication to scientific missions.",
    icon: Satellite,
    color: "#60a5fa",
    size: "col-span-1 row-span-1",
  },
  {
    title: "Sky Quality Score",
    desc: "Real cloud cover + moon phase + light pollution index.",
    icon: Eye,
    color: "#10b981",
    size: "col-span-1 row-span-1",
  },
  {
    title: "Zenith Lens",
    desc: "VisionOS-inspired cinematic object inspection with orbital data.",
    icon: Telescope,
    color: "#a78bfa",
    size: "col-span-1 row-span-1",
  },
  {
    title: "Sky Replay",
    desc: 'Time-travel to historic events — eclipses, conjunctions, meteor showers.',
    icon: Clock,
    color: "#f472b6",
    size: "col-span-1 row-span-1",
  },
  {
    title: "3D Globe",
    desc: "Cesium-powered globe with NASA imagery and atmosphere.",
    icon: Globe2,
    color: "#06b6d4",
    size: "col-span-2 row-span-1",
  },
];

function BentoFeatures() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <div ref={ref} className="grid grid-cols-4 gap-3 max-w-5xl mx-auto">
      {BENTO_ITEMS.map((item, i) => {
        const Icon = item.icon;
        return (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
            transition={{ delay: i * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className={`${item.size} glass rounded-2xl p-5 flex flex-col justify-between group hover:border-purple-500/30 transition-all duration-500 cursor-default min-h-[120px]`}
          >
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${item.color}18`, border: `1px solid ${item.color}30` }}>
                <Icon className="w-5 h-5" style={{ color: item.color }} />
              </div>
              {item.badge && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-red-400 animate-pulse" />
                  {item.badge}
                </span>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-white font-space-grotesk text-sm mb-1 group-hover:text-purple-200 transition-colors">{item.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// ── Rotating cosmic fact ───────────────────────
function CosmicFactRotator() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const iv = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex(i => (i + 1) % COSMIC_FACTS.length);
        setVisible(true);
      }, 400);
    }, 5000);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="glass rounded-2xl px-6 py-4 max-w-2xl mx-auto text-center">
      <div className="text-xs text-purple-400 uppercase tracking-widest mb-2 font-medium">Cosmic Fact</div>
      <AnimatePresence mode="wait">
        {visible && (
          <motion.p
            key={index}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.35 }}
            className="text-sm text-slate-300 leading-relaxed"
          >
            {COSMIC_FACTS[index]}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Nav ────────────────────────────────────────
function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "glass border-b border-white/5" : ""}`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
            <Telescope className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-base font-space-grotesk text-white tracking-tight">ZENITH</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-slate-500">
          {[["#features", "Features"], ["#replay", "Sky Replay"], ["#apis", "Data Sources"]].map(([href, label]) => (
            <a key={href} href={href} className="hover:text-white transition-colors duration-200">{label}</a>
          ))}
        </div>
        <Link href="/app">
          <Button size="sm" className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white border-0 font-semibold rounded-xl px-5">
            Launch App <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </div>
    </motion.nav>
  );
}

// ── Main page ──────────────────────────────────
export default function LandingPage() {
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 500], [1, 0]);
  const heroY = useTransform(scrollY, [0, 500], [0, -60]);

  return (
    <div className="relative min-h-screen bg-[#050816] overflow-x-hidden">
      <StarField />

      {/* Aurora blobs */}
      <div className="fixed inset-0 pointer-events-none z-[1]" aria-hidden="true">
        <div className="absolute top-[-10%] left-[15%] w-[500px] h-[500px] rounded-full opacity-15 blur-[120px]"
          style={{ background: "radial-gradient(circle, #7c3aed, transparent)" }} />
        <div className="absolute top-[30%] right-[10%] w-[400px] h-[400px] rounded-full opacity-10 blur-[100px]"
          style={{ background: "radial-gradient(circle, #06b6d4, transparent)" }} />
        <div className="absolute bottom-[20%] left-[5%] w-[300px] h-[300px] rounded-full opacity-10 blur-[80px]"
          style={{ background: "radial-gradient(circle, #6366f1, transparent)" }} />
      </div>

      <LandingNav />

      {/* ── Hero ── */}
      <motion.section
        style={{ opacity: heroOpacity, y: heroY, zIndex: 2 }}
        className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-20 pb-10"
      >
        <div className="relative z-10 flex flex-col items-center gap-8 max-w-5xl mx-auto w-full">
          {/* Live badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-2.5 px-4 py-2 rounded-full glass border border-red-500/20"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 live-dot" />
            <span className="text-xs font-semibold tracking-widest text-red-400 uppercase">ISS Tracking Live</span>
            <span className="text-slate-600 text-xs">· Open Source · No Signup</span>
          </motion.div>

          {/* Headline */}
          <AnimatedHeadline />

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.7 }}
            className="text-lg text-slate-400 max-w-xl text-center leading-relaxed"
          >
            The ISS, 8,000+ satellites, planets, and constellations — 
            tracked in real time from wherever you are.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <Link href="/app">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white border-0 font-semibold px-8 py-6 text-base rounded-2xl glow-purple transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                <Globe2 className="w-5 h-5 mr-2" />
                Open Sky View
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/app">
              <Button size="lg" variant="outline" className="border-white/10 bg-white/5 text-white hover:bg-white/10 hover:border-white/20 font-semibold px-8 py-6 text-base rounded-2xl backdrop-blur-sm transition-all duration-300">
                <Play className="w-4 h-4 mr-2" />
                Watch Demo
              </Button>
            </Link>
          </motion.div>

          {/* Earth */}
          <EarthHero />

          {/* Scroll cue */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 1 }}
            className="flex flex-col items-center gap-2 text-slate-600"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.8, repeat: Infinity }}
              className="w-px h-10 bg-gradient-to-b from-transparent via-purple-500/50 to-transparent"
            />
          </motion.div>
        </div>
      </motion.section>

      {/* ── Live Ticker ── */}
      <div className="relative z-[2]">
        <LiveTicker />
      </div>

      {/* ── Features Bento Grid ── */}
      <section id="features" className="relative py-28 px-6 z-[2]">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-purple-500/20 text-xs text-purple-400 uppercase tracking-widest font-semibold mb-6">
              <Activity className="w-3.5 h-3.5" />
              Everything in One View
            </div>
            <h2 className="text-4xl md:text-5xl font-bold font-space-grotesk text-white leading-tight">
              Astronomy-grade tools,<br />
              <span className="text-aurora">zero complexity</span>
            </h2>
            <p className="mt-4 text-slate-500 max-w-lg mx-auto">
              Built for stargazers, educators, and the simply curious. From TLE orbital mechanics to beginner-friendly explanations.
            </p>
          </motion.div>
          <BentoFeatures />
        </div>
      </section>

      {/* ── Sky Replay CTA ── */}
      <section id="replay" className="relative py-24 px-6 z-[2]">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl glass border border-purple-500/20 p-10 md:p-16 text-center"
          >
            {/* Background glow */}
            <div className="absolute inset-0 opacity-20 pointer-events-none"
              style={{ background: "radial-gradient(ellipse at 50% 0%, #8b5cf6, transparent 60%)" }} />
            <div className="relative z-10">
              <div className="text-5xl mb-6">⏱️</div>
              <h2 className="text-3xl md:text-4xl font-bold font-space-grotesk text-white mb-4">
                Sky Replay Mode
              </h2>
              <p className="text-slate-400 max-w-xl mx-auto mb-8 text-lg leading-relaxed">
                Time-travel to the 2020 Great Conjunction, Total Solar Eclipse 2024, 
                or the Perseid Meteor Shower peak. Like Google Earth — but for the cosmos.
              </p>
              <div className="flex flex-wrap justify-center gap-2 mb-8">
                {["Great Conjunction 2020", "Solar Eclipse 2024", "Perseid Peak", "Blood Moon 2025"].map(label => (
                  <span key={label} className="text-xs px-3 py-1.5 rounded-full glass border border-purple-500/20 text-purple-300">
                    {label}
                  </span>
                ))}
              </div>
              <Link href="/app">
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 font-semibold px-8 py-5 rounded-2xl hover:scale-105 transition-transform">
                  <Clock className="w-4 h-4 mr-2" />
                  Enter Time Machine
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Cosmic Fact ── */}
      <section className="relative py-16 px-6 z-[2]">
        <CosmicFactRotator />
      </section>

      {/* ── Data Sources ── */}
      <section id="apis" className="relative py-24 px-6 z-[2]">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <h2 className="text-3xl font-bold font-space-grotesk text-white mb-3">Powered by Open Science</h2>
            <p className="text-slate-500">Real data. No paywalls. No signup required.</p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { name: "CelesTrak", desc: "TLE Orbital Data", icon: "📡" },
              { name: "Open-Meteo", desc: "Cloud Cover & Weather", icon: "🌤️" },
              { name: "OpenNotify", desc: "ISS Position API", icon: "🛸" },
              { name: "CesiumJS", desc: "3D Globe Rendering", icon: "🌐" },
              { name: "satellite.js", desc: "SGP4 Propagation", icon: "🔢" },
              { name: "Nominatim", desc: "Location Search", icon: "📍" },
            ].map((api, i) => (
              <motion.div
                key={api.name}
                initial={{ opacity: 0, scale: 0.92 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="glass rounded-2xl p-4 flex flex-col items-center gap-2 hover:border-purple-500/25 transition-all duration-300 group"
              >
                <span className="text-2xl">{api.icon}</span>
                <div className="font-semibold text-white text-sm group-hover:text-purple-300 transition-colors">{api.name}</div>
                <div className="text-xs text-slate-500">{api.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative border-t border-white/5 py-16 px-6 z-[2]">
        {/* Aurora line top */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                <Telescope className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="font-bold text-white font-space-grotesk text-sm">ZENITH</div>
                <div className="text-xs text-slate-600">The Celestial Eye</div>
              </div>
            </div>
            <p className="text-slate-600 text-xs text-center">
              Real-time orbital mechanics · Open data · Educational use
            </p>
            <Link href="/app">
              <Button size="sm" className="bg-gradient-to-r from-purple-600 to-cyan-600 text-white border-0 rounded-xl">
                Launch App →
              </Button>
            </Link>
          </div>
          <div className="mt-8 pt-8 border-t border-white/5 text-center text-xs text-slate-700">
            Data sourced from CelesTrak, OpenNotify, Open-Meteo. For educational and recreational use only.
          </div>
        </div>
      </footer>
    </div>
  );
}
