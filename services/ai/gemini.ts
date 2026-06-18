// ═══════════════════════════════════════════════════════
// services/ai/gemini.ts
// Gemini API client with streaming support
// ═══════════════════════════════════════════════════════

export interface GeminiStreamChunk {
  text: string;
  done: boolean;
}

export interface GeminiRequestOptions {
  prompt: string;
  temperature?: number;
  maxOutputTokens?: number;
  stream?: boolean;
}

const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta";
// Ordered by preference — fallback on 429 rate limit
const MODELS = [
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-2.5-flash-lite-preview-06-17",
];

// Helper to try multiple models on rate-limit
async function tryModels(
  path: string,
  body: object,
  apiKey: string
): Promise<Response> {
  for (const model of MODELS) {
    const url = `${GEMINI_API_BASE}/models/${model}${path}?key=${apiKey}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.status === 429) {
      console.warn(`[Gemini] ${model} rate limited, trying next model...`);
      continue;
    }
    return res;
  }
  // All models rate limited — return 429 from last attempt
  const url = `${GEMINI_API_BASE}/models/${MODELS[MODELS.length-1]}${path}?key=${apiKey}`;
  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

/**
 * Non-streaming Gemini request.
 * Called from API routes (server side) to avoid exposing the key client-side.
 */
export async function callGemini(options: GeminiRequestOptions): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not configured");

  const requestBody = {
    contents: [{ parts: [{ text: options.prompt }] }],
    generationConfig: {
      temperature: options.temperature ?? 0.75,
      maxOutputTokens: options.maxOutputTokens ?? 512,
      topK: 40,
      topP: 0.95,
    },
    safetySettings: [
      { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
    ],
  };

  const response = await tryModels(":generateContent", requestBody, apiKey);

  if (!response.ok) {
    const err = await response.text();
    if (response.status === 429) throw new Error("RATE_LIMITED");
    throw new Error(`Gemini API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Empty response from Gemini");
  return text.trim();
}

/**
 * Streaming Gemini request.
 * Returns a ReadableStream of server-sent events for real-time text streaming.
 */
export async function streamGemini(options: GeminiRequestOptions): Promise<ReadableStream<string>> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not configured");

  const requestBody = {
    contents: [{ parts: [{ text: options.prompt }] }],
    generationConfig: {
      temperature: options.temperature ?? 0.8,
      maxOutputTokens: options.maxOutputTokens ?? 512,
      topK: 40,
      topP: 0.95,
    },
    safetySettings: [
      { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
    ],
  };

  const response = await tryModels(":streamGenerateContent", requestBody, apiKey);

  if (!response.ok || !response.body) {
    if (response.status === 429) throw new Error("RATE_LIMITED");
    const err = await response.text().catch(() => "Unknown error");
    throw new Error(`Gemini streaming error ${response.status}: ${err}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  return new ReadableStream<string>({
    async pull(controller) {
      try {
        const { done, value } = await reader.read();
        if (done) {
          controller.close();
          return;
        }

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const jsonStr = line.slice(6).trim();
            if (jsonStr === "[DONE]") {
              controller.close();
              return;
            }
            try {
              const parsed = JSON.parse(jsonStr);
              const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
              if (text) controller.enqueue(text);
            } catch {
              // Skip malformed chunks
            }
          }
        }
      } catch (err) {
        controller.error(err);
      }
    },
    cancel() {
      reader.cancel();
    },
  });
}
