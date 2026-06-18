"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  BookOpen, Zap, Brain, GraduationCap, Sparkles, Send,
  RefreshCw, AlertTriangle, ChevronRight, Loader2, Bot,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSettingsStore } from "@/lib/stores/settingsStore";
import { useAIExplanation, useAskAnything } from "@/hooks/useAIExplanation";
import type { CelestialObject, ExplanationLevel } from "@/types";

// ── Suggested questions ────────────────────────
const SUGGESTED_QUESTIONS = [
  "Why is this moving so fast?",
  "Can I see this tonight?",
  "Explain like I'm 10 years old",
  "What makes this unique?",
];

// ── Level selector config ───────────────────────
const LEVELS: {
  id: ExplanationLevel;
  label: string;
  Icon: React.ElementType;
  color: string;
}[] = [
  { id: "beginner",     label: "Beginner",  Icon: BookOpen, color: "text-green-400" },
  { id: "intermediate", label: "Inter.",    Icon: Zap,      color: "text-blue-400"  },
  { id: "advanced",     label: "Advanced",  Icon: Brain,    color: "text-purple-400" },
];

// ── AI badge ───────────────────────────────────
function AIBadge({ fromAI }: { fromAI: boolean }) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
        fromAI
          ? "bg-purple-500/15 text-purple-300 border border-purple-500/20"
          : "bg-white/5 text-slate-600 border border-white/8"
      }`}
    >
      <Bot className="w-2.5 h-2.5" />
      {fromAI ? "Gemini" : "Curated"}
    </motion.span>
  );
}

// ── Text skeleton ──────────────────────────────
function TextSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <motion.div
          key={i}
          className="h-3 rounded shimmer"
          style={{ width: i === lines - 1 ? "65%" : "100%" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.08 }}
        />
      ))}
    </div>
  );
}

// ── Streaming text renderer ────────────────────
function StreamingText({ text, isStreaming }: { text: string; isStreaming: boolean }) {
  const cursorVisible = isStreaming;
  return (
    <p className="text-sm text-slate-300 leading-relaxed">
      {text}
      {cursorVisible && (
        <motion.span
          className="inline-block w-0.5 h-4 bg-purple-400 ml-0.5 align-middle"
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 0.8, repeat: Infinity }}
        />
      )}
    </p>
  );
}

// ── Ask Anything panel ─────────────────────────
function AskAnythingPanel({ object }: { object: CelestialObject }) {
  const [input, setInput] = useState("");
  const { answer, isStreaming, isError, ask, reset } = useAskAnything(object);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const answerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to answer
  useEffect(() => {
    if (answer && answerRef.current) {
      answerRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [answer]);

  const handleSubmit = () => {
    const q = input.trim();
    if (!q || isStreaming) return;
    ask(q);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-lg bg-purple-500/15 flex items-center justify-center">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
        </div>
        <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">
          Ask Anything
        </span>
        <span className="text-[10px] text-purple-400 ml-auto">Powered by Gemini</span>
      </div>

      {/* Suggested questions */}
      {!answer && !isStreaming && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-wrap gap-1.5"
        >
          {SUGGESTED_QUESTIONS.map((q) => (
            <button
              key={q}
              onClick={() => { ask(q); }}
              className="flex items-center gap-1 text-[10px] px-2.5 py-1.5 rounded-full glass-subtle text-slate-400 hover:text-purple-300 hover:border-purple-500/25 transition-all duration-200 group"
              disabled={isStreaming}
            >
              <ChevronRight className="w-2.5 h-2.5 text-purple-500 group-hover:translate-x-0.5 transition-transform" />
              {q}
            </button>
          ))}
        </motion.div>
      )}

      {/* Answer area */}
      <AnimatePresence mode="wait">
        {(answer || isStreaming) && (
          <motion.div
            ref={answerRef}
            key="answer"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="glass-subtle rounded-xl p-4 space-y-3"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Bot className="w-3 h-3 text-purple-400" />
              </div>
              <span className="text-[10px] text-purple-400 font-semibold">ZENITH AI</span>
              {isStreaming && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  className="ml-auto"
                >
                  <Loader2 className="w-3 h-3 text-purple-400" />
                </motion.div>
              )}
            </div>

            {isError ? (
              <p className="text-xs text-red-400 leading-relaxed">{answer}</p>
            ) : (
              <StreamingText text={answer} isStreaming={isStreaming} />
            )}

            {!isStreaming && answer && (
              <button
                onClick={reset}
                className="text-[10px] text-slate-600 hover:text-slate-400 transition-colors flex items-center gap-1 mt-1"
              >
                <RefreshCw className="w-2.5 h-2.5" /> Ask another question
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input area */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Ask about ${object.name}…`}
          rows={2}
          disabled={isStreaming}
          className="w-full resize-none glass-subtle rounded-xl px-3 py-2.5 pr-10 text-xs text-slate-300 placeholder:text-slate-600 border border-white/8 focus:outline-none focus:border-purple-500/30 transition-all disabled:opacity-50"
          aria-label="Ask a question about this object"
        />
        <button
          onClick={handleSubmit}
          disabled={!input.trim() || isStreaming}
          className="absolute right-2 bottom-2 w-7 h-7 rounded-lg bg-purple-600/20 border border-purple-500/25 flex items-center justify-center text-purple-400 hover:bg-purple-600/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          aria-label="Send question"
        >
          {isStreaming ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Send className="w-3 h-3" />
          )}
        </button>
      </div>
      <p className="text-[10px] text-slate-700 text-center">
        Press Enter to send · Shift+Enter for new line
      </p>
    </div>
  );
}

// ── Main component ─────────────────────────────
export function AIExplainTab({ object }: { object: CelestialObject }) {
  const { explanationLevel, setExplanationLevel, teacherMode, toggleTeacherMode } =
    useSettingsStore();

  const { explanation, teacherNote, facts, fromAI, isLoading, isError, retry } =
    useAIExplanation(object, explanationLevel, teacherMode);

  return (
    <div className="p-4 space-y-4">
      {/* Level selector */}
      <div className="flex gap-1.5">
        {LEVELS.map(({ id, label, Icon, color }) => (
          <button
            key={id}
            onClick={() => setExplanationLevel(id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
              explanationLevel === id
                ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                : "text-slate-500 hover:text-slate-300 hover:bg-white/5 border border-transparent"
            }`}
            aria-pressed={explanationLevel === id}
          >
            <Icon className={`w-3 h-3 ${explanationLevel === id ? "text-purple-300" : color}`} />
            {label}
          </button>
        ))}
      </div>

      {/* Teacher mode toggle */}
      <button
        onClick={toggleTeacherMode}
        className={`w-full flex items-center gap-2 p-2.5 rounded-xl text-xs font-medium transition-all duration-200 ${
          teacherMode
            ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
            : "glass-subtle text-slate-500 hover:text-slate-300"
        }`}
        aria-pressed={teacherMode}
      >
        <GraduationCap className="w-3.5 h-3.5" />
        Teacher Mode {teacherMode ? "ON" : "OFF"}
        <Badge
          className={`ml-auto text-xs border-0 ${
            teacherMode ? "bg-amber-500/20 text-amber-300" : "bg-white/5 text-slate-500"
          }`}
        >
          {teacherMode ? "Active" : "Tap to enable"}
        </Badge>
      </button>

      {/* Explanation text */}
      <AnimatePresence mode="wait">
        <motion.div
          key={explanationLevel}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="glass-subtle rounded-xl p-4 space-y-3"
        >
          {/* Status bar */}
          <div className="flex items-center justify-between">
            <AIBadge fromAI={fromAI} />
            {isError && (
              <button
                onClick={retry}
                className="flex items-center gap-1 text-[10px] text-red-400 hover:text-red-300 transition-colors"
              >
                <RefreshCw className="w-2.5 h-2.5" /> Retry
              </button>
            )}
          </div>

          {/* Content */}
          {isLoading ? (
            <TextSkeleton lines={3} />
          ) : isError ? (
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-amber-400 font-medium mb-1">
                  Using curated data
                </p>
                <p className="text-sm text-slate-300 leading-relaxed">{explanation}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-300 leading-relaxed">{explanation}</p>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Teacher notes */}
      <AnimatePresence>
        {teacherMode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div
              className="rounded-xl p-3 border border-amber-500/20"
              style={{ background: "rgba(245,158,11,0.05)" }}
            >
              <div className="flex items-center gap-1.5 mb-2">
                <GraduationCap className="w-3 h-3 text-amber-400" />
                <span className="text-xs font-semibold text-amber-400">Teacher Notes</span>
                {isLoading && <Loader2 className="w-2.5 h-2.5 text-amber-400 animate-spin ml-auto" />}
              </div>
              {isLoading ? (
                <TextSkeleton lines={2} />
              ) : (
                <p className="text-xs text-slate-400 leading-relaxed">
                  {teacherNote ?? "Loading teacher notes…"}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Key facts */}
      <div className="space-y-2">
        <div className="text-xs text-slate-500 uppercase tracking-wide">Key Facts</div>
        {facts.map((fact, i) => (
          <motion.div
            key={`${object.id}-${i}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-start gap-2"
          >
            <span className="text-purple-400 text-xs mt-0.5 shrink-0">→</span>
            <span className="text-xs text-slate-400 leading-relaxed">{fact}</span>
          </motion.div>
        ))}
      </div>

      {/* Divider */}
      <div className="border-t border-white/5 pt-4">
        {/* Ask Anything */}
        <AskAnythingPanel object={object} />
      </div>
    </div>
  );
}
