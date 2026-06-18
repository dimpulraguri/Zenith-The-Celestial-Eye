// app/api/ai/explain/route.ts
// POST /api/ai/explain
// Returns a Gemini-generated explanation with static fallback

import { NextRequest, NextResponse } from "next/server";
import { callGemini } from "@/services/ai/gemini";
import {
  buildExplanationPrompt,
  buildTeacherNotePrompt,
} from "@/services/ai/prompts";
import {
  getCachedExplanation,
  setCachedExplanation,
  getCachedTeacherNote,
  setCachedTeacherNote,
  getStaticExplanation,
  getStaticTeacherNotes,
  getStaticFacts,
} from "@/services/ai/provider";
import type { ExplanationLevel } from "@/types";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      objectId,
      name,
      type,
      category,
      altitude,
      speed,
      inclination,
      isVisible,
      facts,
      level,
      includeTeacherNote = false,
    } = body as {
      objectId: string;
      name: string;
      type: string;
      category?: string;
      altitude?: number;
      speed?: number;
      inclination?: number;
      isVisible?: boolean;
      facts?: string[];
      level: ExplanationLevel;
      includeTeacherNote?: boolean;
    };

    if (!objectId || !name || !level) {
      return NextResponse.json(
        { error: "Missing required fields: objectId, name, level" },
        { status: 400 }
      );
    }

    const ctx = { name, type, category, altitude, speed, inclination, isVisible, facts };
    const aiEnabled = !!process.env.GEMINI_API_KEY;

    // ── Main explanation ──────────────────────
    let explanation: string;
    let explanationFromAI = false;

    const cached = getCachedExplanation(objectId, level);
    if (cached) {
      explanation = cached;
      explanationFromAI = true;
    } else if (aiEnabled) {
      try {
        const prompt = buildExplanationPrompt(ctx, level);
        explanation = await callGemini({ prompt, temperature: 0.75, maxOutputTokens: 400 });
        setCachedExplanation(objectId, level, explanation);
        explanationFromAI = true;
      } catch (e: unknown) {
        const isRateLimit = (e as Error)?.message?.includes("RATE_LIMITED");
        console.warn(`[AI] Gemini explanation ${isRateLimit ? "rate limited" : "failed"}, using static fallback:`, (e as Error)?.message);
        explanation = getStaticExplanation(type, level);
      }
    } else {
      explanation = getStaticExplanation(type, level);
    }

    // ── Teacher notes ─────────────────────────
    let teacherNote: string | null = null;
    if (includeTeacherNote) {
      const cachedNote = getCachedTeacherNote(objectId);
      if (cachedNote) {
        teacherNote = cachedNote;
      } else if (aiEnabled) {
        try {
          const prompt = buildTeacherNotePrompt(ctx);
          teacherNote = await callGemini({ prompt, temperature: 0.65, maxOutputTokens: 200 });
          setCachedTeacherNote(objectId, teacherNote);
        } catch (e: unknown) {
          console.warn("[AI] Teacher note failed, using static:", (e as Error)?.message);
          teacherNote = getStaticTeacherNotes(type);
        }
      } else {
        teacherNote = getStaticTeacherNotes(type);
      }
    }

    return NextResponse.json({
      explanation,
      teacherNote,
      facts: getStaticFacts(type),
      fromAI: explanationFromAI,
      level,
    });
  } catch (err) {
    console.error("[AI Explain] Unhandled error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
