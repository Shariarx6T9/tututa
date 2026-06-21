"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { Copy, Check, User, RefreshCw, ThumbsUp, ThumbsDown } from "lucide-react";
import { QuantumOrb } from "@/components/ui/QuantumOrb";
import { cn, copyToClipboard, formatRelativeDate } from "@/lib/utils";
import type { ChatMessage } from "@/types";

interface MessageBubbleProps {
  message: ChatMessage;
  isStreaming?: boolean;
  isLast?: boolean;
}

export function MessageBubble({ message, isStreaming, isLast }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const [hovering, setHovering] = useState(false);
  const isUser = message.role === "user";

  const handleCopy = async () => {
    await copyToClipboard(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "group flex gap-3 px-2 py-1.5 rounded-xl transition-colors",
        hovering && "bg-[rgba(255,255,255,0.02)]",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      {/* Avatar */}
      <div className="flex-shrink-0 mt-0.5">
        {isUser ? (
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center shadow-[0_2px_8px_rgba(124,58,237,0.4)]">
            <User size={13} className="text-white" />
          </div>
        ) : (
          <QuantumOrb size={28} forceState={isStreaming ? "speaking" : "idle"} />
        )}
      </div>

      {/* Content */}
      <div className={cn("flex-1 min-w-0", isUser ? "flex flex-col items-end" : "")}>
        {/* Role label */}
        <div className={cn("flex items-center gap-2 mb-1", isUser ? "flex-row-reverse" : "flex-row")}>
          <span className="text-[11px] font-medium text-[var(--color-text-muted)]">
            {isUser ? "You" : `AYRA${message.model ? ` · ${message.model}` : ""}`}
          </span>
          <span className="text-[10px] text-[var(--color-text-ghost)]">
            {formatRelativeDate(message.createdAt)}
          </span>
          {message.latency && (
            <span className="text-[10px] text-[var(--color-text-ghost)]">
              {(message.latency / 1000).toFixed(1)}s
            </span>
          )}
        </div>

        {/* Bubble */}
        <div
          className={cn(
            "relative rounded-2xl px-4 py-3 max-w-[680px]",
            isUser
              ? "bg-[rgba(124,58,237,0.2)] border border-[rgba(124,58,237,0.25)] text-[var(--color-text-primary)] rounded-tr-sm"
              : "bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] rounded-tl-sm"
          )}
        >
          {isUser ? (
            <p className="text-[13px] leading-relaxed whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="prose-ayra text-[13px]">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ node, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || "");
                    const inline = !match;
                    if (inline) {
                      return (
                        <code className="font-mono text-[12px] bg-[rgba(124,58,237,0.12)] border border-[rgba(124,58,237,0.2)] px-1.5 py-0.5 rounded text-violet-300" {...props}>
                          {children}
                        </code>
                      );
                    }
                    return (
                      <CodeBlock
                        language={match[1]}
                        code={String(children).replace(/\n$/, "")}
                      />
                    );
                  },
                  pre({ children }) { return <>{children}</>; },
                }}
              >
                {message.content}
              </ReactMarkdown>
              {isStreaming && (
                <span className="inline-block w-0.5 h-4 bg-violet-400 ml-0.5 animate-pulse" />
              )}
            </div>
          )}
        </div>

        {/* Action bar */}
        <motion.div
          initial={false}
          animate={{ opacity: hovering && !isStreaming ? 1 : 0 }}
          className={cn(
            "flex items-center gap-1 mt-1.5",
            isUser ? "flex-row-reverse" : "flex-row"
          )}
        >
          <ActionBtn icon={copied ? Check : Copy} onClick={handleCopy} label="Copy" active={copied} />
          {!isUser && (
            <>
              <ActionBtn icon={RefreshCw} onClick={() => {}} label="Regenerate" />
              <ActionBtn icon={ThumbsUp} onClick={() => {}} label="Good" />
              <ActionBtn icon={ThumbsDown} onClick={() => {}} label="Bad" />
            </>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}

// ── Code Block ────────────────────────────────────────────────

function CodeBlock({ language, code }: { language: string; code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await copyToClipboard(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group/code my-3 rounded-xl overflow-hidden border border-[rgba(255,255,255,0.08)]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[rgba(0,0,0,0.4)] border-b border-[rgba(255,255,255,0.06)]">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[rgba(255,255,255,0.12)]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[rgba(255,255,255,0.12)]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[rgba(255,255,255,0.12)]" />
          </div>
          <span className="text-[11px] font-mono text-[var(--color-text-muted)]">{language}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-[11px] text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors opacity-0 group-hover/code:opacity-100"
        >
          {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      {/* Code */}
      <div className="overflow-x-auto">
        <SyntaxHighlighter
          language={language}
          useInlineStyles={false}
          className="!bg-[rgba(0,0,0,0.5)] !text-[12.5px] !p-4 !m-0 font-mono leading-relaxed"
          wrapLongLines={false}
          customStyle={{
            background: "rgba(0, 0, 0, 0.45)",
            fontSize: "12.5px",
            margin: 0,
            padding: "1rem",
            fontFamily: "JetBrains Mono, Fira Code, monospace",
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}

// ── Action Button ─────────────────────────────────────────────

function ActionBtn({
  icon: Icon,
  onClick,
  label,
  active,
}: {
  icon: React.ElementType;
  onClick: () => void;
  label: string;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={cn(
        "p-1.5 rounded-md transition-all duration-150 text-[11px]",
        active
          ? "text-emerald-400 bg-[rgba(16,185,129,0.1)]"
          : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:bg-[rgba(255,255,255,0.06)]"
      )}
    >
      <Icon size={13} />
    </button>
  );
}
