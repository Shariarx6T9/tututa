// ============================================================
// AYRA — Ollama Client
// Full streaming + OpenAI-compatible API wrapper
// ============================================================

import { OllamaModel, StreamChunk } from "@/types";

export interface OllamaConfig {
  host: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

export interface OllamaChatMessage {
  role: "user" | "assistant" | "system";
  content: string | ContentPart[];
  images?: string[]; // base64 encoded
}

type ContentPart =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } };

export interface OllamaGenerateRequest {
  model: string;
  prompt?: string;
  messages?: OllamaChatMessage[];
  system?: string;
  stream?: boolean;
  options?: {
    temperature?: number;
    num_predict?: number;
    top_p?: number;
    top_k?: number;
    repeat_penalty?: number;
    seed?: number;
  };
  format?: "json";
  keep_alive?: string;
}

export interface OllamaStreamResponse {
  model: string;
  created_at: string;
  message?: { role: string; content: string };
  response?: string;
  done: boolean;
  eval_count?: number;
  eval_duration?: number;
  prompt_eval_count?: number;
  total_duration?: number;
}

export class OllamaClient {
  private host: string;

  constructor(host = "http://localhost:11434") {
    this.host = host.replace(/\/$/, "");
  }

  // ── Models ──────────────────────────────────────────────────

  async listModels(): Promise<OllamaModel[]> {
    try {
      const res = await fetch(`${this.host}/api/tags`, {
        cache: "no-store",
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.models ?? [];
    } catch {
      return [];
    }
  }

  async pullModel(name: string, onProgress?: (status: string) => void): Promise<void> {
    const res = await fetch(`${this.host}/api/pull`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, stream: true }),
    });
    if (!res.ok) throw new Error(`Failed to pull model: ${res.statusText}`);
    const reader = res.body?.getReader();
    if (!reader) return;
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const text = decoder.decode(value);
      const lines = text.split("\n").filter(Boolean);
      for (const line of lines) {
        try {
          const data = JSON.parse(line);
          onProgress?.(data.status ?? "");
        } catch { /* skip */ }
      }
    }
  }

  async deleteModel(name: string): Promise<void> {
    await fetch(`${this.host}/api/delete`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
  }

  async isAvailable(): Promise<boolean> {
    try {
      const res = await fetch(`${this.host}/api/tags`, {
        signal: AbortSignal.timeout(3000),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  // ── Chat Streaming ──────────────────────────────────────────

  async *chatStream(
    messages: OllamaChatMessage[],
    config: OllamaConfig,
    signal?: AbortSignal
  ): AsyncGenerator<StreamChunk> {
    const body: OllamaGenerateRequest = {
      model: config.model,
      messages: config.systemPrompt
        ? [{ role: "system", content: config.systemPrompt }, ...messages]
        : messages,
      stream: true,
      options: {
        temperature: config.temperature ?? 0.7,
        num_predict: config.maxTokens ?? 4096,
      },
    };

    let res: Response;
    try {
      res = await fetch(`${this.host}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal,
      });
    } catch (err) {
      yield { type: "error", error: `Connection failed: ${err}` };
      return;
    }

    if (!res.ok) {
      yield { type: "error", error: `HTTP ${res.status}: ${res.statusText}` };
      return;
    }

    const reader = res.body?.getReader();
    if (!reader) {
      yield { type: "error", error: "No response body" };
      return;
    }

    const decoder = new TextDecoder();
    let buffer = "";

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
            const data: OllamaStreamResponse = JSON.parse(line);
            const content = data.message?.content ?? data.response ?? "";
            if (content) {
              yield { type: "text", content };
            }
            if (data.done) {
              yield {
                type: "done",
                metadata: {
                  evalCount: data.eval_count,
                  evalDuration: data.eval_duration,
                  totalDuration: data.total_duration,
                },
              };
            }
          } catch { /* skip malformed JSON */ }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  // ── OpenAI-Compatible API ───────────────────────────────────

  async *openAIChatStream(
    messages: { role: string; content: string }[],
    config: OllamaConfig,
    signal?: AbortSignal
  ): AsyncGenerator<StreamChunk> {
    const body = {
      model: config.model,
      messages: config.systemPrompt
        ? [{ role: "system", content: config.systemPrompt }, ...messages]
        : messages,
      stream: true,
      temperature: config.temperature ?? 0.7,
      max_tokens: config.maxTokens ?? 4096,
    };

    let res: Response;
    try {
      res = await fetch(`${this.host}/v1/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal,
      });
    } catch (err) {
      yield { type: "error", error: `Connection failed: ${err}` };
      return;
    }

    if (!res.ok) {
      yield { type: "error", error: `HTTP ${res.status}` };
      return;
    }

    const reader = res.body?.getReader();
    if (!reader) return;

    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") {
            yield { type: "done" };
            continue;
          }
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content ?? "";
            if (content) yield { type: "text", content };
          } catch { /* skip */ }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  // ── Embeddings ──────────────────────────────────────────────

  async embed(text: string, model = "nomic-embed-text"): Promise<number[]> {
    const res = await fetch(`${this.host}/api/embed`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model, input: text }),
    });
    if (!res.ok) throw new Error(`Embed failed: ${res.status}`);
    const data = await res.json();
    return data.embeddings?.[0] ?? [];
  }

  // ── Generate (non-chat) ─────────────────────────────────────

  async generate(prompt: string, model: string, options?: Record<string, unknown>): Promise<string> {
    const res = await fetch(`${this.host}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model, prompt, stream: false, ...options }),
    });
    if (!res.ok) throw new Error(`Generate failed: ${res.status}`);
    const data = await res.json();
    return data.response ?? "";
  }
}

// Singleton factory
let _client: OllamaClient | null = null;

export function getOllamaClient(host?: string): OllamaClient {
  if (!_client || host) {
    _client = new OllamaClient(
      host ?? process.env.OLLAMA_HOST ?? "http://localhost:11434"
    );
  }
  return _client;
}
