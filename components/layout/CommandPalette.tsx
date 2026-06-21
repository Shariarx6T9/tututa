"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import {
  Search, MessageSquare, Brain, CheckSquare, BookOpen,
  Code2, Image, LayoutDashboard, Settings, Plus,
  ArrowRight, Clock, Hash, Sparkles, Command,
} from "lucide-react";
import { useChatStore, useTaskStore, useMemoryStore } from "@/lib/store";
import { cn, truncate } from "@/lib/utils";

interface CommandItem {
  id: string;
  type: "nav" | "action" | "chat" | "task" | "memory" | "ai";
  label: string;
  description?: string;
  icon: React.ElementType;
  color?: string;
  action: () => void;
  keywords?: string[];
}

interface CommandPaletteProps {
  onClose: () => void;
}

export function CommandPalette({ onClose }: CommandPaletteProps) {
  const router = useRouter();
  const { chats } = useChatStore();
  const { tasks }  = useTaskStore();
  const { memories } = useMemoryStore();
  const [query,    setQuery]    = useState("");
  const [selected, setSelected] = useState(0);
  const [aiMode,   setAiMode]   = useState(false);
  const inputRef   = useRef<HTMLInputElement>(null);
  const listRef    = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const navigate = (href: Route) => {
    router.push(href as never);
    onClose();
  };

  // ── Static commands ───────────────────────────────────────

  const NAV_COMMANDS: CommandItem[] = [
    { id: "dashboard", type: "nav", label: "Dashboard",        icon: LayoutDashboard, action: () => navigate("/"),        keywords: ["home","overview"] },
    { id: "chat",      type: "nav", label: "Chat",             icon: MessageSquare,   action: () => navigate("/chat"),    keywords: ["conversation","talk"] },
    { id: "memory",    type: "nav", label: "Memory",           icon: Brain,           action: () => navigate("/memory"),  keywords: ["remember","knowledge"] },
    { id: "tasks",     type: "nav", label: "Tasks",            icon: CheckSquare,     action: () => navigate("/tasks"),   keywords: ["todo","task"] },
    { id: "vault",     type: "nav", label: "Knowledge Vault",  icon: BookOpen,        action: () => navigate("/vault"),   keywords: ["document","file","pdf","note"] },
    { id: "code",      type: "nav", label: "Code",             icon: Code2,           action: () => navigate("/code"),    keywords: ["editor","coding"] },
    { id: "studio",    type: "nav", label: "Image Studio",     icon: Image,           action: () => navigate("/studio"),  keywords: ["image","generate","art"] },
    { id: "settings",  type: "nav", label: "Settings",         icon: Settings,        action: () => navigate("/settings"),keywords: ["config","preferences"] },
  ];

  const ACTION_COMMANDS: CommandItem[] = [
    { id: "new-chat",   type: "action", label: "New Chat",    description: "Start a new conversation",     icon: Plus,         color: "text-violet-400", action: () => navigate("/chat/new") },
    { id: "new-task",   type: "action", label: "New Task",    description: "Add a new task",               icon: Plus,         color: "text-cyan-400",   action: () => navigate("/tasks") },
    { id: "new-note",   type: "action", label: "New Note",    description: "Create a note in vault",       icon: Plus,         color: "text-amber-400",  action: () => navigate("/vault") },
    { id: "generate",   type: "action", label: "Generate Image","description": "Open image studio",         icon: Sparkles,     color: "text-emerald-400",action: () => navigate("/studio") },
  ];

  // ── Dynamic commands (from user data) ────────────────────

  const chatCommands: CommandItem[] = chats.slice(0, 5).map((chat) => ({
    id: `chat-${chat.id}`,
    type: "chat",
    label: truncate(chat.title, 50),
    description: `Chat · ${chat.model}`,
    icon: MessageSquare,
    action: () => navigate(`/chat/${chat.id}`),
  }));

  const taskCommands: CommandItem[] = tasks
    .filter((t) => t.status !== "DONE")
    .slice(0, 5)
    .map((task) => ({
      id: `task-${task.id}`,
      type: "task",
      label: truncate(task.title, 50),
      description: `Task · ${task.priority}`,
      icon: CheckSquare,
      action: () => navigate("/tasks"),
    }));

  const memoryCommands: CommandItem[] = memories.slice(0, 3).map((mem) => ({
    id: `mem-${mem.id}`,
    type: "memory",
    label: truncate(mem.title, 50),
    description: `Memory · ${mem.type}`,
    icon: Brain,
    action: () => navigate("/memory"),
  }));

  // ── Filter ────────────────────────────────────────────────

  const allCommands = [
    ...ACTION_COMMANDS,
    ...NAV_COMMANDS,
    ...chatCommands,
    ...taskCommands,
    ...memoryCommands,
  ];

  const filtered = query.trim()
    ? allCommands.filter((cmd) => {
        const q = query.toLowerCase();
        return (
          cmd.label.toLowerCase().includes(q) ||
          cmd.description?.toLowerCase().includes(q) ||
          cmd.keywords?.some((k) => k.includes(q))
        );
      })
    : allCommands.slice(0, 12);

  // Group by type
  const grouped = {
    action:  filtered.filter((c) => c.type === "action"),
    nav:     filtered.filter((c) => c.type === "nav"),
    chat:    filtered.filter((c) => c.type === "chat"),
    task:    filtered.filter((c) => c.type === "task"),
    memory:  filtered.filter((c) => c.type === "memory"),
  };

  const flatFiltered = [
    ...grouped.action,
    ...grouped.nav,
    ...grouped.chat,
    ...grouped.task,
    ...grouped.memory,
  ];

  // ── Keyboard nav ──────────────────────────────────────────

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelected((s) => Math.min(s + 1, flatFiltered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelected((s) => Math.max(s - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      flatFiltered[selected]?.action();
    } else if (e.key === "Escape") {
      onClose();
    }
  }, [flatFiltered, selected, onClose]);

  useEffect(() => {
    setSelected(0);
  }, [query]);

  // Scroll selected into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-index="${selected}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [selected]);

  return (
    <div className="fixed inset-0 z-[300] flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Palette */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: -16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: -16 }}
        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-[580px] glass-surface rounded-2xl border border-[rgba(255,255,255,0.1)] shadow-[var(--shadow-elevated)] overflow-hidden"
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[rgba(255,255,255,0.06)]">
          <Search size={16} className="text-[var(--color-text-muted)] flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search commands, chats, tasks, memories…"
            className="flex-1 bg-transparent text-[14px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="text-[var(--color-text-ghost)] hover:text-[var(--color-text-muted)] transition-colors text-[11px]"
            >
              Clear
            </button>
          )}
          <div className="flex items-center gap-1 text-[10px] text-[var(--color-text-ghost)] border border-[rgba(255,255,255,0.06)] rounded-md px-1.5 py-0.5 font-mono">
            ESC
          </div>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[420px] overflow-y-auto py-1.5">
          {flatFiltered.length === 0 ? (
            <div className="text-center py-10">
              <Search size={20} className="mx-auto text-[var(--color-text-ghost)] mb-2" />
              <p className="text-[12px] text-[var(--color-text-muted)]">No results for "{query}"</p>
              <p className="text-[11px] text-[var(--color-text-ghost)] mt-1">Try a different search term</p>
            </div>
          ) : (
            <>
              <CommandGroup label="Actions" items={grouped.action} flatItems={flatFiltered} selected={selected} onSelect={(item) => { item.action(); }} />
              <CommandGroup label="Navigation" items={grouped.nav} flatItems={flatFiltered} selected={selected} onSelect={(item) => { item.action(); }} />
              <CommandGroup label="Recent Chats" items={grouped.chat} flatItems={flatFiltered} selected={selected} onSelect={(item) => { item.action(); }} />
              <CommandGroup label="Tasks" items={grouped.task} flatItems={flatFiltered} selected={selected} onSelect={(item) => { item.action(); }} />
              <CommandGroup label="Memories" items={grouped.memory} flatItems={flatFiltered} selected={selected} onSelect={(item) => { item.action(); }} />
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-[rgba(255,255,255,0.06)] bg-[rgba(0,0,0,0.2)]">
          <div className="flex items-center gap-3 text-[10px] text-[var(--color-text-ghost)]">
            <span className="flex items-center gap-1"><kbd className="font-mono border border-[rgba(255,255,255,0.08)] rounded px-1 py-0.5">↑↓</kbd> navigate</span>
            <span className="flex items-center gap-1"><kbd className="font-mono border border-[rgba(255,255,255,0.08)] rounded px-1 py-0.5">↵</kbd> select</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-[var(--color-text-ghost)]">
            <Command size={10} />
            <span>K to open</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ── Command Group ─────────────────────────────────────────────

function CommandGroup({
  label, items, flatItems, selected, onSelect,
}: {
  label: string;
  items: CommandItem[];
  flatItems: CommandItem[];
  selected: number;
  onSelect: (item: CommandItem) => void;
}) {
  if (items.length === 0) return null;
  return (
    <div className="mb-1">
      <p className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">
        {label}
      </p>
      {items.map((item) => {
        const globalIndex = flatItems.indexOf(item);
        const isSelected  = globalIndex === selected;
        const Icon = item.icon;
        return (
          <div
            key={item.id}
            data-index={globalIndex}
            onClick={() => onSelect(item)}
            className={cn(
              "flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors",
              isSelected
                ? "bg-[rgba(124,58,237,0.15)]"
                : "hover:bg-[rgba(255,255,255,0.04)]"
            )}
          >
            <div className={cn(
              "w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0",
              isSelected
                ? "bg-[rgba(124,58,237,0.2)] border border-[rgba(124,58,237,0.3)]"
                : "bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)]"
            )}>
              <Icon size={13} className={item.color ?? (isSelected ? "text-violet-400" : "text-[var(--color-text-muted)]")} />
            </div>
            <div className="flex-1 min-w-0">
              <p className={cn(
                "text-[13px] font-medium truncate",
                isSelected ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-secondary)]"
              )}>
                {item.label}
              </p>
              {item.description && (
                <p className="text-[11px] text-[var(--color-text-muted)] truncate">{item.description}</p>
              )}
            </div>
            {isSelected && (
              <ArrowRight size={13} className="text-violet-400 flex-shrink-0" />
            )}
          </div>
        );
      })}
    </div>
  );
}
