// app/api/ai/ask/route.ts
// POST /api/ai/ask  (streaming)
// Real-time streaming Gemini answers for "Ask Anything" feature

import { NextRequest } from "next/server";
import { streamGemini } from "@/services/ai/gemini";
import { buildAskAnythingPrompt } from "@/services/ai/prompts";
import { getStaticExplanation } from "@/services/ai/provider";
import type { ExplanationLevel } from "@/types";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { objectId, name, type, category, altitude, speed, inclination, question } =
      body as {
        objectId: string;
        name: string;
        type: string;
        category?: string;
        altitude?: number;
        speed?: number;
        inclination?: number;
        question: string;
      };

    if (!question?.trim()) {
      return new Response(
        JSON.stringify({ error: "Question is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const aiEnabled = !!process.env.GEMINI_API_KEY;

    if (!aiEnabled) {
      // Fallback: return static intermediate explanation as stream
      const fallback = getStaticExplanation(type, "intermediate" as ExplanationLevel);
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: fallback })}\n\n`));
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        },
      });
      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    const ctx = { name, type, category, altitude, speed, inclination };
    const prompt = buildAskAnythingPrompt(ctx, question);

    let geminiStream: ReadableStream<string>;
    try {
      geminiStream = await streamGemini({ prompt, temperature: 0.85, maxOutputTokens: 400 });
    } catch (streamErr: unknown) {
      // Rate limited or API error — stream a curated fallback message
      const isRateLimited = (streamErr as Error)?.message?.includes("RATE_LIMITED");
      const fallbackText = isRateLimited
        ? `Gemini is at its rate limit right now. Here's the curated answer instead: ${getStaticExplanation(type, "intermediate" as ExplanationLevel)}`
        : getStaticExplanation(type, "intermediate" as ExplanationLevel);

      const encoder = new TextEncoder();
      const fallbackStream = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: fallbackText, rateLimited: isRateLimited })}

`));
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        },
      });
      return new Response(fallbackStream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }
    const encoder = new TextEncoder();

    const sseStream = new ReadableStream({
      async start(controller) {
        const reader = geminiStream.getReader();
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              controller.enqueue(encoder.encode("data: [DONE]\n\n"));
              controller.close();
              break;
            }
            if (value) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ text: value })}\n\n`)
              );
            }
          }
        } catch (err) {
          // On stream error, send fallback
          const fallback = getStaticExplanation(type, "intermediate" as ExplanationLevel);
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ text: fallback, error: true })}\n\n`)
          );
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } finally {
          reader.releaseLock();
        }
      },
    });

    return new Response(sseStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (err) {
    console.error("[AI Ask] Unhandled error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
