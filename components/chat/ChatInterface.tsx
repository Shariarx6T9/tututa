"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Send, Paperclip, Mic, Square, RefreshCw,
  Copy, ThumbsUp, ThumbsDown, Sparkles, ChevronDown,
} from "lucide-react";
import { useChatStore, useModelStore } from "@/lib/store";
import { MessageBubble } from "./MessageBubble";
import { ModelPicker } from "./ModelPicker";
import { Button, GlassCard } from "@/components/ui";
import { QuantumOrb } from "@/components/ui/QuantumOrb";
import { cn, copyToClipboard, generateId } from "@/lib/utils";
import type { ChatMessage } from "@/types";
import toast from "react-hot-toast";

interface ChatInterfaceProps {
  chatId?: string;
}

export function ChatInterface({ chatId }: ChatInterfaceProps) {
  const router = useRouter();
  const {
    activeChat, messages, stream,
    addMessage, updateMessage, setStream, clearStream,
    setActiveChat, addChat, setMessages, selectedModel,
  } = useChatStore();

  const [input, setInput] = useState("");
  const [isComposing, setIsComposing] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  const inputRef   = useRef<HTMLTextAreaElement>(null);
  const scrollRef  = useRef<HTMLDivElement>(null);
  const abortRef   = useRef<AbortController | null>(null);

  const currentMessages = chatId ? (messages[chatId] ?? []) : [];

  // Auto-grow textarea
  const adjustHeight = () => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 200) + "px";
  };

  // Scroll to bottom
  const scrollToBottom = useCallback((smooth = true) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: smooth ? "smooth" : "instant" });
  }, []);

  useEffect(() => {
    scrollToBottom(false);
  }, [currentMessages.length, scrollToBottom]);

  useEffect(() => {
    if (stream.isStreaming) scrollToBottom();
  }, [stream.streamingContent, stream.isStreaming, scrollToBottom]);

  // Track scroll position for scroll-to-bottom button
  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
    setShowScrollBtn(!atBottom);
  };

  // Load chat messages
  useEffect(() => {
    if (!chatId) return;
    fetch(`/api/chats/${chatId}`)
      .then((r) => r.json())
      .then((data) => {
        setActiveChat(data);
        setMessages(chatId, data.messages ?? []);
      })
      .catch(() => toast.error("Failed to load chat"));
  }, [chatId, setActiveChat, setMessages]);

  const stopStreaming = () => {
    abortRef.current?.abort();
    clearStream();
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || stream.isStreaming) return;
    const content = text.trim();
    setInput("");
    if (inputRef.current) inputRef.current.style.height = "auto";

    let currentChatId = chatId;

    // Create new chat if none
    if (!currentChatId) {
      const res = await fetch("/api/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: content.slice(0, 60), model: selectedModel, firstMessage: content }),
      });
      const newChat = await res.json();
      currentChatId = newChat.id;
      addChat(newChat);
      router.push(`/chat/${currentChatId}`);
      return; // Router push will reload with chatId
    }

    // Add user message to UI immediately
    const userMsg: ChatMessage = {
      id: generateId(),
      chatId: currentChatId,
      role: "user",
      content,
      createdAt: new Date(),
    };
    addMessage(currentChatId, userMsg);

    // Persist user message
    await fetch(`/api/chats/${currentChatId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: "user", content }),
    }).catch(() => {});

    // Start streaming
    const assistantId = generateId();
    const assistantMsg: ChatMessage = {
      id: assistantId,
      chatId: currentChatId,
      role: "assistant",
      content: "",
      model: selectedModel,
      createdAt: new Date(),
    };
    addMessage(currentChatId, assistantMsg);

    setStream({ isStreaming: true, streamingChatId: currentChatId, streamingContent: "" });

    const controller = new AbortController();
    abortRef.current = controller;

    const allMessages = [...currentMessages, userMsg].map((m) => ({
      role: m.role,
      content: m.content,
    }));

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId: currentChatId,
          messages: allMessages,
          model: selectedModel,
          includeMemory: true,
        }),
        signal: controller.signal,
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      if (!res.body) throw new Error("No stream");

      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let accumulated = "";
      let buf = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buf += dec.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          try {
            const chunk = JSON.parse(data);
            if (chunk.type === "text" && chunk.content) {
              accumulated += chunk.content;
              setStream({ streamingContent: accumulated });
              updateMessage(currentChatId!, assistantId, { content: accumulated });
            }
          } catch { /* skip */ }
        }
      }
    } catch (err) {
      if ((err as { name?: string }).name !== "AbortError") {
        toast.error("Generation failed. Check Ollama connection.");
        updateMessage(currentChatId!, assistantId, {
          content: "⚠️ Failed to generate response. Please check your Ollama connection.",
        });
      }
    } finally {
      clearStream();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !isComposing) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const isEmpty = currentMessages.length === 0;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-[rgba(255,255,255,0.06)] flex-shrink-0">
        <div className="flex items-center gap-3">
          <QuantumOrb size={28} />
          <div>
            <h2 className="text-[13px] font-semibold text-[var(--color-text-primary)]">
              {activeChat?.title ?? "New Chat"}
            </h2>
            <p className="text-[11px] text-[var(--color-text-muted)]">
              {stream.isStreaming ? "Generating…" : `${currentMessages.length} messages`}
            </p>
          </div>
        </div>
        <ModelPicker />
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-1"
      >
        {isEmpty ? (
          <ChatWelcome onSuggestion={sendMessage} />
        ) : (
          <>
            <AnimatePresence initial={false}>
              {currentMessages.map((msg, i) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  isStreaming={stream.isStreaming && msg.id === messages[chatId ?? ""]?.at(-1)?.id}
                  isLast={i === currentMessages.length - 1}
                />
              ))}
            </AnimatePresence>
            {stream.isStreaming && stream.streamingContent === "" && (
              <ThinkingIndicator />
            )}
          </>
        )}
      </div>

      {/* Scroll to bottom btn */}
      <AnimatePresence>
        {showScrollBtn && (
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            onClick={() => scrollToBottom()}
            className="absolute bottom-24 left-1/2 -translate-x-1/2 glass border-[rgba(255,255,255,0.1)] text-[var(--color-text-secondary)] px-3 py-1.5 rounded-full text-[12px] flex items-center gap-1.5 hover:text-[var(--color-text-primary)] transition-colors shadow-lg"
          >
            <ChevronDown size={13} />
            Scroll to bottom
          </motion.button>
        )}
      </AnimatePresence>

      {/* Input area */}
      <div className="px-4 pb-4 flex-shrink-0">
        <GlassCard className="p-3">
          <div className="flex items-end gap-2.5">
            {/* Attach */}
            <button className="mb-0.5 p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:bg-[rgba(255,255,255,0.06)] transition-all flex-shrink-0">
              <Paperclip size={16} />
            </button>

            {/* Textarea */}
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => { setInput(e.target.value); adjustHeight(); }}
              onKeyDown={handleKeyDown}
              onCompositionStart={() => setIsComposing(true)}
              onCompositionEnd={() => setIsComposing(false)}
              placeholder="Message AYRA…"
              rows={1}
              className="flex-1 bg-transparent text-[13px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] outline-none resize-none leading-relaxed py-1.5 min-h-[36px] max-h-[200px]"
            />

            {/* Send / Stop */}
            {stream.isStreaming ? (
              <button
                onClick={stopStreaming}
                className="mb-0.5 p-2 rounded-lg bg-rose-600/20 text-rose-400 border border-rose-500/30 hover:bg-rose-600/30 transition-all flex-shrink-0"
              >
                <Square size={15} />
              </button>
            ) : (
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim()}
                className={cn(
                  "mb-0.5 p-2 rounded-lg transition-all flex-shrink-0",
                  input.trim()
                    ? "bg-violet-600 text-white hover:bg-violet-500 shadow-[0_2px_8px_rgba(124,58,237,0.4)]"
                    : "text-[var(--color-text-ghost)] cursor-not-allowed"
                )}
              >
                <Send size={15} />
              </button>
            )}
          </div>

          {/* Footer hints */}
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-[rgba(255,255,255,0.04)]">
            <span className="text-[10px] text-[var(--color-text-ghost)]">
              ↵ Send · ⇧↵ New line · ⌘K Commands
            </span>
            <span className="text-[10px] text-[var(--color-text-ghost)]">
              {input.length > 0 && `${input.length} chars`}
            </span>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

// ── Welcome Screen ────────────────────────────────────────────

const SUGGESTIONS = [
  { icon: "✨", text: "What can you help me with today?" },
  { icon: "🧠", text: "Summarize my recent memories" },
  { icon: "📝", text: "Help me write a technical document" },
  { icon: "🔧", text: "Review and improve my code" },
  { icon: "📊", text: "Analyze data and create insights" },
  { icon: "🎯", text: "Create a project plan for me" },
];

function ChatWelcome({ onSuggestion }: { onSuggestion: (text: string) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center h-full text-center py-12"
    >
      <QuantumOrb size={64} className="mb-6" />
      <h2 className="text-[22px] font-semibold gradient-text-violet mb-2">
        Good {getGreeting()}, I'm AYRA
      </h2>
      <p className="text-[13px] text-[var(--color-text-muted)] mb-10 max-w-sm">
        Your private AI operating system. Ask me anything, or start with a suggestion below.
      </p>

      <div className="grid grid-cols-2 gap-2 w-full max-w-md">
        {SUGGESTIONS.map((s) => (
          <motion.button
            key={s.text}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSuggestion(s.text)}
            className="text-left p-3 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,255,255,0.05)] hover:border-[rgba(124,58,237,0.3)] transition-all group"
          >
            <span className="text-base">{s.icon}</span>
            <p className="text-[12px] text-[var(--color-text-muted)] group-hover:text-[var(--color-text-secondary)] mt-1 leading-snug">
              {s.text}
            </p>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

function ThinkingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2.5 px-2 py-1"
    >
      <QuantumOrb size={24} forceState="thinking" />
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-violet-500"
            animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>
      <span className="text-[12px] text-[var(--color-text-muted)]">AYRA is thinking…</span>
    </motion.div>
  );
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}
