// ============================================================
// AYRA — Unified AI Client
// Works locally with Ollama AND on Vercel with Groq/OpenRouter
// ============================================================

import { StreamChunk } from "@/types";

export type AIProvider = "ollama" | "openai" | "groq" | "openrouter";

export interface AIConfig {
  provider:     AIProvider;
  model:        string;
  apiKey?:      string;
  baseURL?:     string;
  temperature?: number;
  maxTokens?:   number;
  systemPrompt?: string;
}

export interface AIMessage {
  role:    "user" | "assistant" | "system";
  content: string;
}

// ── Provider base URLs ────────────────────────────────────────

const PROVIDER_URLS: Record<AIProvider, string> = {
  ollama:     process.env.OLLAMA_HOST    ?? "http://localhost:11434",
  openai:     "https://api.openai.com/v1",
  groq:       "https://api.groq.com/openai/v1",
  openrouter: "https://openrouter.ai/api/v1",
};

// ── Model maps for common providers ──────────────────────────

export const PROVIDER_MODELS: Record<AIProvider, string[]> = {
  ollama:     ["llama3.2", "llama3.1:8b", "codellama:13b", "mistral", "phi3"],
  openai:     ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo"],
  groq:       ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768", "gemma2-9b-it"],
  openrouter: ["meta-llama/llama-3.3-70b-instruct", "mistralai/mistral-7b-instruct", "google/gemma-2-9b-it"],
};

// ── Detect provider from env ──────────────────────────────────

export function detectProvider(): AIProvider {
  if (process.env.GROQ_API_KEY)       return "groq";
  if (process.env.OPENROUTER_API_KEY) return "openrouter";
  if (process.env.OPENAI_API_KEY)     return "openai";
  return "ollama"; // default: local
}

export function getDefaultModel(provider: AIProvider): string {
  const map: Record<AIProvider, string> = {
    ollama:     process.env.OLLAMA_DEFAULT_MODEL ?? "llama3.2",
    openai:     "gpt-4o-mini",
    groq:       "llama-3.3-70b-versatile",
    openrouter: "meta-llama/llama-3.3-70b-instruct",
  };
  return map[provider];
}

// ── Unified streaming client ──────────────────────────────────

export async function* streamChat(
  messages: AIMessage[],
  config: Partial<AIConfig> & { model?: string },
  signal?: AbortSignal
): AsyncGenerator<StreamChunk> {
  const provider = (config.provider ?? detectProvider()) as AIProvider;
  const model    = config.model ?? getDefaultModel(provider);

  if (provider === "ollama") {
    yield* streamOllama(messages, { ...config, model }, signal);
  } else {
    yield* streamOpenAICompat(messages, { ...config, model, provider }, signal);
  }
}

// ── Ollama native stream ──────────────────────────────────────

async function* streamOllama(
  messages: AIMessage[],
  config: Partial<AIConfig> & { model: string },
  signal?: AbortSignal
): AsyncGenerator<StreamChunk> {
  const host = config.baseURL ?? process.env.OLLAMA_HOST ?? "http://localhost:11434";
  const body  = {
    model: config.model,
    messages: config.systemPrompt
      ? [{ role: "system", content: config.systemPrompt }, ...messages]
      : messages,
    stream: true,
    options: {
      temperature: config.temperature ?? 0.7,
      num_predict: config.maxTokens   ?? 4096,
    },
  };

  let res: Response;
  try {
    res = await fetch(`${host}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal,
    });
  } catch {
    yield { type: "error", error: "Cannot reach Ollama. Is it running at " + host + "?" };
    return;
  }

  if (!res.ok) {
    yield { type: "error", error: `Ollama error: HTTP ${res.status}` };
    return;
  }

  yield* readNDJSONStream(res, (data) => data.message?.content ?? "");
}

// ── OpenAI-compatible stream (Groq, OpenRouter, OpenAI) ──────

async function* streamOpenAICompat(
  messages: AIMessage[],
  config: Partial<AIConfig> & { model: string; provider: AIProvider },
  signal?: AbortSignal
): AsyncGenerator<StreamChunk> {
  const baseURL = config.baseURL ?? PROVIDER_URLS[config.provider];
  const apiKey  = config.apiKey  ?? getAPIKey(config.provider);

  if (!apiKey) {
    yield { type: "error", error: `No API key for provider "${config.provider}". Set ${getEnvKeyName(config.provider)} in environment.` };
    return;
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${apiKey}`,
  };

  // OpenRouter requires these extra headers
  if (config.provider === "openrouter") {
    headers["HTTP-Referer"] = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    headers["X-Title"] = "AYRA";
  }

  const body = {
    model: config.model,
    messages: config.systemPrompt
      ? [{ role: "system", content: config.systemPrompt }, ...messages]
      : messages,
    stream: true,
    temperature: config.temperature ?? 0.7,
    max_tokens:  config.maxTokens   ?? 4096,
  };

  let res: Response;
  try {
    res = await fetch(`${baseURL}/chat/completions`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal,
    });
  } catch (err) {
    yield { type: "error", error: `Connection failed: ${err}` };
    return;
  }

  if (!res.ok) {
    const errText = await res.text().catch(() => res.statusText);
    yield { type: "error", error: `API error ${res.status}: ${errText}` };
    return;
  }

  yield* readSSEStream(res, (data) => {
    if (data === "[DONE]") return null;
    try {
      const parsed = JSON.parse(data);
      return parsed.choices?.[0]?.delta?.content ?? "";
    } catch { return ""; }
  });
}

// ── Stream readers ────────────────────────────────────────────

async function* readNDJSONStream(
  res: Response,
  extract: (data: Record<string, unknown>) => string
): AsyncGenerator<StreamChunk> {
  const reader  = res.body?.getReader();
  if (!reader) return;
  const decoder = new TextDecoder();
  let buffer    = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const data = JSON.parse(line);
          const content = extract(data);
          if (content) yield { type: "text", content };
          if (data.done) yield { type: "done", metadata: { evalCount: data.eval_count } };
        } catch { /* skip */ }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

async function* readSSEStream(
  res: Response,
  extract: (data: string) => string | null
): AsyncGenerator<StreamChunk> {
  const reader  = res.body?.getReader();
  if (!reader) return;
  const decoder = new TextDecoder();
  let buffer    = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const raw = line.slice(6).trim();
        const content = extract(raw);
        if (content === null) { yield { type: "done" }; continue; }
        if (content) yield { type: "text", content };
      }
    }
    yield { type: "done" };
  } finally {
    reader.releaseLock();
  }
}

// ── Helpers ───────────────────────────────────────────────────

function getAPIKey(provider: AIProvider): string {
  const keys: Record<AIProvider, string | undefined> = {
    ollama:     undefined,
    openai:     process.env.OPENAI_API_KEY,
    groq:       process.env.GROQ_API_KEY,
    openrouter: process.env.OPENROUTER_API_KEY,
  };
  return keys[provider] ?? "";
}

function getEnvKeyName(provider: AIProvider): string {
  const map: Record<AIProvider, string> = {
    ollama:     "OLLAMA_HOST",
    openai:     "OPENAI_API_KEY",
    groq:       "GROQ_API_KEY",
    openrouter: "OPENROUTER_API_KEY",
  };
  return map[provider];
}

// ── Model availability check ──────────────────────────────────

export async function listModels(provider: AIProvider): Promise<string[]> {
  if (provider === "ollama") {
    try {
      const host = process.env.OLLAMA_HOST ?? "http://localhost:11434";
      const res  = await fetch(`${host}/api/tags`, { signal: AbortSignal.timeout(3000) });
      const data = await res.json();
      return (data.models ?? []).map((m: { name: string }) => m.name);
    } catch { return []; }
  }
  // For cloud providers, return known models
  return PROVIDER_MODELS[provider] ?? [];
}

export async function isProviderAvailable(provider: AIProvider): Promise<boolean> {
  if (provider === "ollama") {
    try {
      const host = process.env.OLLAMA_HOST ?? "http://localhost:11434";
      const res  = await fetch(`${host}/api/tags`, { signal: AbortSignal.timeout(3000) });
      return res.ok;
    } catch { return false; }
  }
  return !!getAPIKey(provider);
}
