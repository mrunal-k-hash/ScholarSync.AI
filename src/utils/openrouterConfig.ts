/**
 * OpenRouter Free Model Configuration
 * ====================================
 * Centralized configuration for all AI requests.
 * Enforces ONLY free OpenRouter models — paid models are never used.
 */

// ---------------------------------------------------------------------------
// Free model fallback chain (order matters: primary → fallback → last resort)
// ---------------------------------------------------------------------------
export const FREE_MODEL_CHAIN = [
  "openrouter/auto",            // OpenRouter's free auto-router
  "deepseek/deepseek-r1:free",  // DeepSeek R1 free tier
  "google/gemma-3-27b-it:free", // Gemma 3 27B free tier
] as const;

export const DEFAULT_MODEL = FREE_MODEL_CHAIN[0];

// Maximum tokens to keep costs at zero and responses concise
export const MAX_TOKENS = 2048;

// Maximum number of chat history messages sent to the model (token optimization)
export const MAX_HISTORY_MESSAGES = 10;

// Maximum characters per message in history (truncation for token savings)
export const MAX_MESSAGE_CHARS = 1500;

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

/**
 * Returns true if a model identifier is a known free model.
 * Free models must either be in our chain OR contain ':free' suffix.
 */
export function isFreeModel(model: string): boolean {
  if (FREE_MODEL_CHAIN.includes(model as any)) return true;
  if (model === "openrouter/auto") return true;
  if (model.endsWith(":free")) return true;
  return false;
}

/**
 * Validates that the OPENROUTER_API_KEY environment variable exists.
 * Returns the key or throws a descriptive error.
 */
export function getApiKey(): string {
  const key =
    (import.meta as any).env?.OPENROUTER_API_KEY ??
    (globalThis as any).process?.env?.OPENROUTER_API_KEY;

  if (!key || typeof key !== "string" || key.trim() === "") {
    const msg =
      "[OpenRouter] FATAL: OPENROUTER_API_KEY is missing or empty. " +
      "Set it in your .env file (server-side only). AI features are disabled.";
    console.error(msg);
    throw new Error(msg);
  }
  return key;
}

// ---------------------------------------------------------------------------
// Token-optimized history truncation
// ---------------------------------------------------------------------------

interface ChatMessage {
  role: string;
  content: string;
}

/**
 * Truncates chat history to stay within token budget:
 *  1. Keeps only the last `MAX_HISTORY_MESSAGES` messages
 *  2. Trims each message content to `MAX_MESSAGE_CHARS`
 */
export function truncateHistory(messages: ChatMessage[]): ChatMessage[] {
  const recent = messages.slice(-MAX_HISTORY_MESSAGES);
  return recent.map((m) => ({
    role: m.role,
    content:
      m.content.length > MAX_MESSAGE_CHARS
        ? m.content.slice(0, MAX_MESSAGE_CHARS) + "…[truncated]"
        : m.content,
  }));
}

// ---------------------------------------------------------------------------
// Fetch with automatic free-model fallback
// ---------------------------------------------------------------------------

interface OpenRouterRequestBody {
  model: string;
  messages: ChatMessage[];
  max_tokens?: number;
  response_format?: { type: string };
  [key: string]: unknown;
}

interface OpenRouterResponse {
  ok: boolean;
  status: number;
  data: any;
  model: string;
}

/**
 * Makes an OpenRouter chat completion request with automatic fallback
 * through the free model chain. Never routes to a paid model.
 *
 * @param requestOrigin  The origin URL for the HTTP-Referer header
 * @param body           The request body (model field will be overridden)
 * @returns              The parsed response from the first successful model
 * @throws               If all free models fail
 */
export async function fetchWithFallback(
  requestOrigin: string,
  body: Omit<OpenRouterRequestBody, "model"> & { model?: string }
): Promise<OpenRouterResponse> {
  const apiKey = getApiKey();

  for (const model of FREE_MODEL_CHAIN) {
    console.log(`[OpenRouter] Trying model: ${model}`);

    const requestBody: OpenRouterRequestBody = {
      ...body,
      model,
      max_tokens: body.max_tokens ?? MAX_TOKENS,
    };

    // Safety: reject if somehow a non-free model sneaks in
    if (!isFreeModel(requestBody.model)) {
      console.error(
        `[OpenRouter] BLOCKED paid model "${requestBody.model}". Skipping.`
      );
      continue;
    }

    try {
      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
            "HTTP-Referer": requestOrigin,
            "X-Title": "ScholarSync AI",
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const usedModel = data.model || model;
        const tokensUsed = data.usage;

        console.log(`[OpenRouter] ✅ Success with model: ${usedModel}`);
        if (tokensUsed) {
          console.log(
            `[OpenRouter] Token usage — prompt: ${tokensUsed.prompt_tokens ?? "?"}, ` +
            `completion: ${tokensUsed.completion_tokens ?? "?"}, ` +
            `total: ${tokensUsed.total_tokens ?? "?"}`
          );
        }

        return { ok: true, status: 200, data, model: usedModel };
      }

      // Non-OK response — log and try the next model
      const errText = await response.text();
      console.warn(
        `[OpenRouter] ⚠ Model "${model}" returned ${response.status}: ${errText.slice(0, 300)}`
      );
    } catch (networkErr: any) {
      console.error(
        `[OpenRouter] ❌ Network error for model "${model}": ${networkErr.message}`
      );
    }
  }

  // All models exhausted
  const msg =
    "[OpenRouter] All free models in the fallback chain failed. " +
    "No paid models will be used.";
  console.error(msg);
  throw new Error(msg);
}
