// ═══════════════════════════════════════════════════════
// services/ai/prompts.ts
// Structured prompt engineering for celestial AI explanations
// ═══════════════════════════════════════════════════════

import type { ExplanationLevel } from "@/types";

export interface ObjectContext {
  name: string;
  type: string;
  category?: string;
  altitude?: number;
  speed?: number;
  inclination?: number;
  isVisible?: boolean;
  facts?: string[];
}

const LEVEL_INSTRUCTIONS: Record<ExplanationLevel, string> = {
  beginner: `Write 2-3 simple, engaging sentences for a curious child or non-technical adult. 
Use everyday analogies, avoid jargon, and make it exciting. 
Focus on what makes this object amazing and relatable.
No bullet points. Flowing, conversational prose.`,

  intermediate: `Write one concise, educational paragraph for a science enthusiast or student.
Include key technical facts like orbital altitude, speed, mission purpose, and scientific significance.
Use correct scientific terminology but remain accessible.
Keep it to 4-5 sentences maximum.`,

  advanced: `Write a precise, technical explanation for engineers, astronomers, or aerospace professionals.
Use correct orbital mechanics terminology: TLE, SGP4, J2 perturbations, RAAN, apogee/perigee, ephemerides, etc.
Reference specific numbers (altitudes in km, speeds in km/s, orbital periods).
Include relevant physical forces, reference frames, and computational methods.
Keep it to 5-6 dense technical sentences.`,
};

export function buildExplanationPrompt(
  ctx: ObjectContext,
  level: ExplanationLevel
): string {
  const contextLines = [
    `Object Name: ${ctx.name}`,
    `Object Type: ${ctx.type}${ctx.category ? ` (${ctx.category})` : ""}`,
    ctx.altitude != null ? `Altitude: ${ctx.altitude.toFixed(1)} km` : null,
    ctx.speed != null ? `Orbital Speed: ${ctx.speed.toFixed(2)} km/s` : null,
    ctx.inclination != null ? `Orbital Inclination: ${ctx.inclination.toFixed(1)}°` : null,
    ctx.isVisible != null ? `Currently Visible from Ground: ${ctx.isVisible ? "Yes" : "No"}` : null,
    ctx.facts?.length ? `Key Facts:\n${ctx.facts.map(f => `- ${f}`).join("\n")}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  return `You are ZENITH, an expert astronomy AI assistant for a premium celestial tracking application. 
Explain the following space object to the user at the requested knowledge level.

=== OBJECT DATA ===
${contextLines}

=== LEVEL ===
${level.toUpperCase()}

=== INSTRUCTIONS ===
${LEVEL_INSTRUCTIONS[level]}

=== IMPORTANT ===
- Do NOT use markdown formatting, bullet points, or headers in your response.
- Return ONLY the explanation text, nothing else.
- Be factually accurate and scientifically precise.
- Vary your opening — don't always start with "The".`;
}

export function buildAskAnythingPrompt(
  ctx: ObjectContext,
  userQuestion: string
): string {
  const contextLines = [
    `Object Name: ${ctx.name}`,
    `Object Type: ${ctx.type}${ctx.category ? ` (${ctx.category})` : ""}`,
    ctx.altitude != null ? `Altitude: ${ctx.altitude.toFixed(1)} km` : null,
    ctx.speed != null ? `Speed: ${ctx.speed.toFixed(2)} km/s` : null,
    ctx.inclination != null ? `Inclination: ${ctx.inclination.toFixed(1)}°` : null,
  ]
    .filter(Boolean)
    .join("\n");

  return `You are ZENITH, an expert astronomy AI embedded in a real-time celestial tracking app. 
A user is viewing "${ctx.name}" live on the app and has a question.

=== CURRENT OBJECT ===
${contextLines}

=== USER'S QUESTION ===
${userQuestion}

=== INSTRUCTIONS ===
- Answer the question directly, naturally, and accurately.
- Reference the specific object's real data when relevant.
- Keep your answer to 3-5 sentences maximum.
- Be conversational but scientifically accurate.
- If the question is playful (e.g., "explain like I'm 10"), match that energy.
- Do NOT use bullet points or markdown. Plain conversational prose only.
- Do NOT say "I am an AI" or similar disclaimers.`;
}

export function buildTeacherNotePrompt(ctx: ObjectContext): string {
  return `You are an astronomy educator creating a teaching note for a teacher using ZENITH, a celestial tracking app.

=== OBJECT ===
Name: ${ctx.name}
Type: ${ctx.type}${ctx.category ? ` (${ctx.category})` : ""}
${ctx.altitude != null ? `Altitude: ${ctx.altitude.toFixed(1)} km` : ""}
${ctx.speed != null ? `Speed: ${ctx.speed.toFixed(2)} km/s` : ""}

Create a concise "Teacher Note" (3-4 sentences) that:
1. Identifies the key physics/science concept this object illustrates
2. Suggests one engaging classroom discussion question or thought experiment
3. Mentions a curriculum connection (Kepler's laws, orbital mechanics, etc.)

Return only the teacher note text, no formatting.`;
}
