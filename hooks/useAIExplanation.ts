// hooks/useAIExplanation.ts
// React hook for fetching AI explanations with caching, loading, and error states

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { CelestialObject, ExplanationLevel } from "@/types";
import { getStaticExplanation, getStaticFacts, getStaticTeacherNotes } from "@/services/ai/provider";

// ── Client-side in-memory cache ───────────────
const clientCache = new Map<
  string,
  { explanation: string; teacherNote: string | null; facts: string[]; fromAI: boolean; ts: number }
>();
const CACHE_TTL = 10 * 60 * 1000;

function getClientCacheKey(objectId: string, level: ExplanationLevel): string {
  return `${objectId}::${level}`;
}

// ── Types ──────────────────────────────────────
export interface AIExplanationResult {
  explanation: string;
  teacherNote: string | null;
  facts: string[];
  fromAI: boolean;
  isLoading: boolean;
  isError: boolean;
  retry: () => void;
}

// ── Hook ───────────────────────────────────────
export function useAIExplanation(
  object: CelestialObject,
  level: ExplanationLevel,
  teacherMode: boolean
): AIExplanationResult {
  const [explanation, setExplanation] = useState<string>(() =>
    getStaticExplanation(object.type, level)
  );
  const [teacherNote, setTeacherNote] = useState<string | null>(() =>
    teacherMode ? getStaticTeacherNotes(object.type) : null
  );
  const [facts, setFacts] = useState<string[]>(() => getStaticFacts(object.type));
  const [fromAI, setFromAI] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const abortRef = useRef<AbortController | null>(null);

  const fetchExplanation = useCallback(async () => {
    // Cancel any in-flight request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);
    setIsError(false);

    // Seed with static immediately for instant feedback
    setExplanation(getStaticExplanation(object.type, level));
    setFacts(getStaticFacts(object.type));
    if (teacherMode) setTeacherNote(getStaticTeacherNotes(object.type));

    // Check client cache first
    const cacheKey = getClientCacheKey(object.id, level);
    const cached = clientCache.get(cacheKey);
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
      setExplanation(cached.explanation);
      setTeacherNote(cached.teacherNote);
      setFacts(cached.facts);
      setFromAI(cached.fromAI);
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/ai/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          objectId: object.id,
          name: object.name,
          type: object.type,
          category: object.category,
          altitude: object.altitude,
          speed: object.speed,
          inclination: object.inclination,
          facts: getStaticFacts(object.type),
          level,
          includeTeacherNote: teacherMode,
        }),
      });

      if (!res.ok) throw new Error(`API ${res.status}`);

      const data = await res.json();

      if (!controller.signal.aborted) {
        setExplanation(data.explanation);
        setTeacherNote(data.teacherNote ?? null);
        setFacts(data.facts ?? getStaticFacts(object.type));
        setFromAI(data.fromAI ?? false);
        setIsLoading(false);

        // Update client cache
        clientCache.set(cacheKey, {
          explanation: data.explanation,
          teacherNote: data.teacherNote ?? null,
          facts: data.facts ?? getStaticFacts(object.type),
          fromAI: data.fromAI ?? false,
          ts: Date.now(),
        });
      }
    } catch (err: unknown) {
      if ((err as { name?: string }).name === "AbortError") return;
      console.error("[useAIExplanation] fetch failed:", err);
      if (!controller.signal.aborted) {
        setIsError(true);
        setFromAI(false);
        setIsLoading(false);
        // Keep static fallback already set above
      }
    }
  }, [object.id, object.name, object.type, object.category, object.altitude, object.speed, object.inclination, level, teacherMode]); // eslint-disable-line

  useEffect(() => {
    fetchExplanation();
    return () => abortRef.current?.abort();
  }, [fetchExplanation, retryCount]);

  const retry = useCallback(() => {
    clientCache.delete(getClientCacheKey(object.id, level));
    setRetryCount(c => c + 1);
  }, [object.id, level]);

  return { explanation, teacherNote, facts, fromAI, isLoading, isError, retry };
}

// ── Ask Anything streaming hook ────────────────
export interface AskAnythingResult {
  answer: string;
  isStreaming: boolean;
  isError: boolean;
  ask: (question: string) => void;
  reset: () => void;
}

export function useAskAnything(object: CelestialObject): AskAnythingResult {
  const [answer, setAnswer] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isError, setIsError] = useState(false);
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);

  const reset = useCallback(() => {
    readerRef.current?.cancel();
    setAnswer("");
    setIsStreaming(false);
    setIsError(false);
  }, []);

  const ask = useCallback(
    async (question: string) => {
      if (!question.trim() || isStreaming) return;

      // Cancel any in-progress stream
      readerRef.current?.cancel();
      setAnswer("");
      setIsStreaming(true);
      setIsError(false);

      try {
        const res = await fetch("/api/ai/ask", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            objectId: object.id,
            name: object.name,
            type: object.type,
            category: object.category,
            altitude: object.altitude,
            speed: object.speed,
            inclination: object.inclination,
            question,
          }),
        });

        if (!res.ok || !res.body) throw new Error(`API ${res.status}`);

        const reader = res.body.getReader();
        readerRef.current = reader;
        const decoder = new TextDecoder();
        let fullText = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const payload = line.slice(6).trim();
              if (payload === "[DONE]") {
                setIsStreaming(false);
                return;
              }
              try {
                const { text } = JSON.parse(payload) as { text: string };
                if (text) {
                  fullText += text;
                  setAnswer(fullText);
                }
              } catch {
                // Ignore malformed chunks
              }
            }
          }
        }
        setIsStreaming(false);
      } catch (err) {
        console.error("[useAskAnything] stream failed:", err);
        setIsError(true);
        setIsStreaming(false);
        setAnswer("I couldn't fetch a live answer right now. Please try again in a moment.");
      }
    },
    [object, isStreaming]
  );

  return { answer, isStreaming, isError, ask, reset };
}
