"use client";

import { useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Camera, X, Download, Share2, Check, Loader2 } from "lucide-react";
import { useCelestialStore } from "@/lib/stores/celestialStore";
import { useISS } from "@/hooks/useISS";
import { useLocationStore } from "@/lib/stores/locationStore";
import { formatAltitude, formatSpeed } from "@/utils/formatting";

// ── Share card (visual only, rendered as a div) ─
function ShareCard({
  cardRef,
}: {
  cardRef: React.RefObject<HTMLDivElement | null>;
}) {
  const { selectedObject } = useCelestialStore();
  const { position: issPos } = useISS();
  const { location } = useLocationStore();
  const now = new Date();

  const obj = selectedObject;
  const displayName = obj?.name ?? "ISS (ZARYA)";
  const altitude   = obj?.altitude ?? issPos?.altitude ?? 408;
  const speed      = obj?.speed    ?? issPos?.speed    ?? 7.66;

  return (
    <div
      ref={cardRef}
      className="w-[480px] h-[270px] relative overflow-hidden rounded-2xl select-none"
      style={{
        background: "linear-gradient(135deg, #050816 0%, #0a1628 50%, #050816 100%)",
        fontFamily: "'Space Grotesk', Inter, sans-serif",
      }}
    >
      {/* Aurora glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-40%] left-[20%] w-[300px] h-[300px] rounded-full opacity-20 blur-[80px]"
          style={{ background: "radial-gradient(circle, #7c3aed, transparent)" }} />
        <div className="absolute bottom-[-20%] right-[10%] w-[200px] h-[200px] rounded-full opacity-15 blur-[60px]"
          style={{ background: "radial-gradient(circle, #06b6d4, transparent)" }} />
      </div>

      {/* Star dots */}
      {[
        [12,  8, 1.5], [45, 22, 1], [78, 15, 2], [90, 45, 1], [20, 60, 1.5],
        [55, 70, 1], [85, 80, 1.5], [35, 90, 1], [70, 35, 2], [10, 45, 1],
      ].map(([x, y, r], i) => (
        <div key={i} className="absolute rounded-full bg-white"
          style={{ left: `${x}%`, top: `${y}%`, width: r, height: r, opacity: 0.4 }} />
      ))}

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-between p-8">
        {/* Top row */}
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs text-purple-400 uppercase tracking-widest font-bold mb-1">ZENITH · Celestial Eye</div>
            <div className="text-2xl font-bold text-white leading-tight">{displayName}</div>
            <div className="text-xs text-slate-500 mt-0.5">
              Observed from {location.name} · {now.toUTCString().slice(0, 16)}
            </div>
          </div>

          {/* Object type badge */}
          <div className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)" }}>
            <span className="text-2xl">{obj?.type === "satellite" ? "🛰" : "🛸"}</span>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-6">
          {[
            { label: "Altitude", value: formatAltitude(altitude) },
            { label: "Velocity", value: formatSpeed(speed) },
            { label: "Inclination", value: `${obj?.inclination?.toFixed(1) ?? "51.6"}°` },
          ].map(({ label, value }) => (
            <div key={label}>
              <div className="text-lg font-bold text-white tabular-nums">{value}</div>
              <div className="text-xs text-slate-500">{label}</div>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-green-400 font-semibold">LIVE DATA</span>
          </div>
          <div className="text-xs text-slate-600">zenith.app · real-time orbital tracking</div>
        </div>
      </div>

      {/* Border gradient */}
      <div className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{ border: "1px solid rgba(139,92,246,0.2)" }} />
    </div>
  );
}

// ── Screenshot button + modal ──────────────────
export function ScreenshotMode() {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleDownload = useCallback(async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      // Dynamic import html2canvas
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(cardRef.current, {
        scale: 3,
        backgroundColor: null,
        useCORS: true,
        logging: false,
      });
      const link = document.createElement("a");
      link.download = `zenith-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (e) {
      console.warn("Screenshot failed:", e);
    } finally {
      setDownloading(false);
    }
  }, []);

  const handleShare = useCallback(async () => {
    if (!cardRef.current) return;
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(cardRef.current, { scale: 2, backgroundColor: null });
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        if (navigator.share && navigator.canShare({ files: [new File([blob], "zenith.png", { type: "image/png" })] })) {
          await navigator.share({
            title: "ZENITH – What's Above You Right Now",
            files: [new File([blob], "zenith.png", { type: "image/png" })],
          });
        } else {
          // Fallback: copy URL
          await navigator.clipboard.writeText("https://zenith.app – Real-time celestial tracking");
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }
      }, "image/png");
    } catch (e) {
      console.warn("Share failed:", e);
    }
  }, []);

  return (
    <>
      {/* Trigger button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="absolute top-4 left-4 z-20 w-9 h-9 glass rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:border-purple-500/30 transition-all"
        aria-label="Screenshot mode"
      >
        <Camera className="w-4 h-4" />
      </motion.button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[85] bg-[#050816]/80 backdrop-blur-xl"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-x-4 bottom-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-auto z-[86] glass-strong rounded-3xl p-6"
              style={{ boxShadow: "0 40px 100px rgba(0,0,0,0.8)" }}
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-bold text-white font-space-grotesk">Share Card</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Your cosmic snapshot</p>
                </div>
                <button onClick={() => setIsOpen(false)} className="w-8 h-8 rounded-full glass flex items-center justify-center text-slate-500 hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Preview */}
              <div className="mb-5 rounded-2xl overflow-hidden">
                <ShareCard cardRef={cardRef} />
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-purple-600/20 border border-purple-500/30 text-sm font-semibold text-purple-300 hover:bg-purple-600/30 transition-all disabled:opacity-50"
                >
                  {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  Download PNG
                </button>
                <button
                  onClick={handleShare}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl glass-subtle text-sm font-semibold text-slate-300 hover:text-white transition-all"
                >
                  {copied ? <Check className="w-4 h-4 text-green-400" /> : <Share2 className="w-4 h-4" />}
                  {copied ? "Copied!" : "Share"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
