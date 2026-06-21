"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  MessageSquare, Brain, CheckSquare, BookOpen,
  Code2, Image, Plus, ArrowRight, Zap, Clock,
  TrendingUp, Calendar, Sparkles, Activity,
  ChevronRight, Target, Star,
} from "lucide-react";
import { GlassCard, MotionCard, Button, Badge, Skeleton } from "@/components/ui";
import { QuantumOrb } from "@/components/ui/QuantumOrb";
import { useChatStore, useTaskStore, useMemoryStore } from "@/lib/store";
import { cn, formatRelativeDate, isDueToday, isTaskOverdue } from "@/lib/utils";
import type { Chat, Task, Memory } from "@/types";

// ── Greeting ──────────────────────────────────────────────────

function getGreeting(): { text: string; emoji: string } {
  const h = new Date().getHours();
  if (h < 5)  return { text: "Good night",    emoji: "🌙" };
  if (h < 12) return { text: "Good morning",  emoji: "☀️" };
  if (h < 17) return { text: "Good afternoon",emoji: "⛅" };
  return             { text: "Good evening",   emoji: "🌆" };
}

// ── Quick action config ───────────────────────────────────────

const QUICK_ACTIONS = [
  { href: "/chat/new", icon: MessageSquare, label: "New Chat",     color: "violet",  desc: "Start a conversation"   },
  { href: "/tasks",    icon: CheckSquare,   label: "Add Task",     color: "cyan",    desc: "Capture what's next"    },
  { href: "/vault",    icon: BookOpen,      label: "Add Note",     color: "amber",   desc: "Save a quick note"      },
  { href: "/studio",   icon: Image,         label: "Generate Art", color: "emerald", desc: "Create with AI"         },
  { href: "/code",     icon: Code2,         label: "Code",         color: "rose",    desc: "Open code workspace"    },
  { href: "/memory",   icon: Brain,         label: "View Memory",  color: "violet",  desc: "Your knowledge base"    },
] as const;

const MODULE_CARDS = [
  { href: "/chat",   icon: MessageSquare, label: "Chat",    desc: "AI conversations",          color: "#7c3aed" },
  { href: "/memory", icon: Brain,         label: "Memory",  desc: "Long-term knowledge",       color: "#06b6d4" },
  { href: "/tasks",  icon: CheckSquare,   label: "Tasks",   desc: "Personal task manager",     color: "#10b981" },
  { href: "/vault",  icon: BookOpen,      label: "Vault",   desc: "Document repository",       color: "#f59e0b" },
  { href: "/code",   icon: Code2,         label: "Code",    desc: "AI coding workspace",       color: "#f43f5e" },
  { href: "/studio", icon: Image,         label: "Studio",  desc: "Image generation",          color: "#8b5cf6" },
] as const;

// ── Dashboard Page ────────────────────────────────────────────

export default function DashboardPage() {
  const { chats, setChats } = useChatStore();
  const { tasks, setTasks } = useTaskStore();
  const { memories, setMemories } = useMemoryStore();
  const [loading, setLoading] = useState(true);
  const { text: greeting, emoji } = getGreeting();

  useEffect(() => {
    const loadAll = async () => {
      try {
        const [chatsRes, tasksRes, memoriesRes] = await Promise.all([
          fetch("/api/chats"),
          fetch("/api/tasks"),
          fetch("/api/memory"),
        ]);
        const [chatsData, tasksData, memoriesData] = await Promise.all([
          chatsRes.json(),
          tasksRes.json(),
          memoriesRes.json(),
        ]);
        setChats(chatsData);
        setTasks(tasksData);
        setMemories(memoriesData);
      } catch { /* fail silently */ }
      finally { setLoading(false); }
    };
    loadAll();
  }, [setChats, setTasks, setMemories]);

  const todayTasks   = tasks.filter((t) => isDueToday(t.dueDate as Date | undefined) && t.status !== "DONE");
  const overdueTasks = tasks.filter((t) => isTaskOverdue(t.dueDate as Date | undefined) && t.status !== "DONE");
  const recentChats  = chats.slice(0, 5);
  const criticalMems = memories.filter((m) => m.importance === "CRITICAL").slice(0, 3);
  const pinnedMems   = memories.filter((m) => m.isPinned).slice(0, 3);
  const completedToday = tasks.filter((t) => {
    if (t.status !== "DONE" || !t.completedAt) return false;
    return isDueToday(t.completedAt as Date);
  }).length;

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  });

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">

        {/* ── Hero Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <QuantumOrb size={52} />
            <div>
              <h1 className="text-[24px] font-bold text-[var(--color-text-primary)] leading-tight">
                {emoji} {greeting}
              </h1>
              <p className="text-[13px] text-[var(--color-text-muted)] mt-0.5">
                {dateStr} · AYRA is ready
              </p>
            </div>
          </div>

          {/* Live status pills */}
          <div className="flex items-center gap-2">
            {todayTasks.length > 0 && (
              <Link href="/tasks">
                <Badge variant="amber" dot className="cursor-pointer hover:opacity-80 transition-opacity">
                  {todayTasks.length} due today
                </Badge>
              </Link>
            )}
            {overdueTasks.length > 0 && (
              <Link href="/tasks">
                <Badge variant="rose" dot className="cursor-pointer hover:opacity-80 transition-opacity">
                  {overdueTasks.length} overdue
                </Badge>
              </Link>
            )}
            <Badge variant="emerald" dot>
              Ollama connected
            </Badge>
          </div>
        </motion.div>

        {/* ── Quick Actions ── */}
        <div>
          <SectionLabel>Quick Actions</SectionLabel>
          <div className="grid grid-cols-6 gap-2">
            {QUICK_ACTIONS.map(({ href, icon: Icon, label, color, desc }, i) => (
              <motion.div
                key={href}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.3 }}
              >
                <Link href={href}>
                  <GlassCard
                    hover
                    className="p-3.5 flex flex-col items-center gap-2 text-center group"
                  >
                    <div className={cn(
                      "w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200",
                      "bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)]",
                      "group-hover:scale-110",
                      {
                        "group-hover:bg-[rgba(124,58,237,0.15)] group-hover:border-[rgba(124,58,237,0.3)]": color === "violet",
                        "group-hover:bg-[rgba(6,182,212,0.15)] group-hover:border-[rgba(6,182,212,0.3)]":   color === "cyan",
                        "group-hover:bg-[rgba(245,158,11,0.15)] group-hover:border-[rgba(245,158,11,0.3)]": color === "amber",
                        "group-hover:bg-[rgba(16,185,129,0.15)] group-hover:border-[rgba(16,185,129,0.3)]": color === "emerald",
                        "group-hover:bg-[rgba(244,63,94,0.15)] group-hover:border-[rgba(244,63,94,0.3)]":   color === "rose",
                      }
                    )}>
                      <Icon size={16} className={cn("transition-colors", {
                        "text-[var(--color-text-muted)] group-hover:text-violet-400":  color === "violet",
                        "text-[var(--color-text-muted)] group-hover:text-cyan-400":    color === "cyan",
                        "text-[var(--color-text-muted)] group-hover:text-amber-400":   color === "amber",
                        "text-[var(--color-text-muted)] group-hover:text-emerald-400": color === "emerald",
                        "text-[var(--color-text-muted)] group-hover:text-rose-400":    color === "rose",
                      })} />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)] transition-colors leading-tight">
                        {label}
                      </p>
                    </div>
                  </GlassCard>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── Main Grid ── */}
        <div className="grid grid-cols-3 gap-4">

          {/* Today's Focus */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="col-span-1"
          >
            <GlassCard className="h-full flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-[rgba(255,255,255,0.06)]">
                <div className="flex items-center gap-2">
                  <Target size={14} className="text-cyan-400" />
                  <span className="text-[12px] font-semibold text-[var(--color-text-primary)]">Today's Focus</span>
                </div>
                <Link href="/tasks" className="text-[10px] text-[var(--color-text-muted)] hover:text-violet-400 transition-colors flex items-center gap-1">
                  View all <ChevronRight size={10} />
                </Link>
              </div>

              <div className="p-3 space-y-1.5 flex-1">
                {loading ? (
                  [...Array(3)].map((_, i) => (
                    <div key={i} className="flex gap-2 items-center p-2">
                      <Skeleton className="w-4 h-4 rounded-full flex-shrink-0" />
                      <Skeleton className="h-3 flex-1 rounded" />
                    </div>
                  ))
                ) : todayTasks.length === 0 ? (
                  <div className="text-center py-6">
                    <CheckSquare size={20} className="mx-auto text-[var(--color-text-ghost)] mb-2" />
                    <p className="text-[11px] text-[var(--color-text-muted)]">Nothing due today</p>
                    <p className="text-[10px] text-[var(--color-text-ghost)] mt-0.5">Great job! 🎉</p>
                  </div>
                ) : (
                  todayTasks.slice(0, 6).map((task) => (
                    <TaskMiniRow key={task.id} task={task} />
                  ))
                )}
              </div>

              {completedToday > 0 && (
                <div className="px-4 py-2.5 border-t border-[rgba(255,255,255,0.06)]">
                  <p className="text-[11px] text-emerald-400 flex items-center gap-1.5">
                    <Zap size={11} />
                    {completedToday} task{completedToday > 1 ? "s" : ""} completed today
                  </p>
                </div>
              )}
            </GlassCard>
          </motion.div>

          {/* Recent Chats */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="col-span-1"
          >
            <GlassCard className="h-full flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-[rgba(255,255,255,0.06)]">
                <div className="flex items-center gap-2">
                  <MessageSquare size={14} className="text-violet-400" />
                  <span className="text-[12px] font-semibold text-[var(--color-text-primary)]">Recent Chats</span>
                </div>
                <Link href="/chat/new" className="flex items-center gap-1 text-[10px] text-[var(--color-text-muted)] hover:text-violet-400 transition-colors">
                  <Plus size={11} /> New
                </Link>
              </div>

              <div className="p-2 space-y-0.5 flex-1 overflow-y-auto">
                {loading ? (
                  [...Array(4)].map((_, i) => (
                    <div key={i} className="p-2.5 space-y-1">
                      <Skeleton className="h-3 w-3/4 rounded" />
                      <Skeleton className="h-2.5 w-1/2 rounded" />
                    </div>
                  ))
                ) : recentChats.length === 0 ? (
                  <div className="text-center py-6">
                    <MessageSquare size={20} className="mx-auto text-[var(--color-text-ghost)] mb-2" />
                    <p className="text-[11px] text-[var(--color-text-muted)]">No chats yet</p>
                  </div>
                ) : (
                  recentChats.map((chat) => (
                    <ChatMiniRow key={chat.id} chat={chat} />
                  ))
                )}
              </div>

              <div className="p-3 border-t border-[rgba(255,255,255,0.06)]">
                <Link href="/chat/new">
                  <Button variant="violet" size="sm" className="w-full justify-center" leftIcon={<Plus size={12} />}>
                    New Chat
                  </Button>
                </Link>
              </div>
            </GlassCard>
          </motion.div>

          {/* Memory Insights */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="col-span-1"
          >
            <GlassCard className="h-full flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-[rgba(255,255,255,0.06)]">
                <div className="flex items-center gap-2">
                  <Brain size={14} className="text-rose-400" />
                  <span className="text-[12px] font-semibold text-[var(--color-text-primary)]">Memory</span>
                </div>
                <Link href="/memory" className="text-[10px] text-[var(--color-text-muted)] hover:text-violet-400 transition-colors flex items-center gap-1">
                  View all <ChevronRight size={10} />
                </Link>
              </div>

              <div className="p-3 space-y-2 flex-1">
                {/* Stats row */}
                <div className="grid grid-cols-3 gap-1.5 mb-3">
                  {[
                    { label: "Total",    value: memories.length,                               color: "text-violet-400" },
                    { label: "Critical", value: memories.filter((m) => m.importance === "CRITICAL").length, color: "text-rose-400" },
                    { label: "Pinned",   value: memories.filter((m) => m.isPinned).length,     color: "text-amber-400" },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="bg-[rgba(255,255,255,0.03)] rounded-lg p-2 text-center">
                      <p className={cn("text-[14px] font-bold", color)}>{value}</p>
                      <p className="text-[9px] text-[var(--color-text-ghost)] mt-0.5">{label}</p>
                    </div>
                  ))}
                </div>

                {loading ? (
                  [...Array(3)].map((_, i) => (
                    <div key={i} className="p-2.5 space-y-1.5 rounded-lg border border-[rgba(255,255,255,0.04)]">
                      <Skeleton className="h-3 w-3/4 rounded" />
                      <Skeleton className="h-2.5 w-full rounded" />
                    </div>
                  ))
                ) : [...criticalMems, ...pinnedMems].slice(0, 3).length === 0 ? (
                  <div className="text-center py-4">
                    <Brain size={18} className="mx-auto text-[var(--color-text-ghost)] mb-2" />
                    <p className="text-[11px] text-[var(--color-text-muted)]">No memories yet</p>
                  </div>
                ) : (
                  [...criticalMems, ...pinnedMems].slice(0, 3).map((mem) => (
                    <MemoryMiniRow key={mem.id} memory={mem} />
                  ))
                )}
              </div>

              <div className="p-3 border-t border-[rgba(255,255,255,0.06)]">
                <Link href="/memory">
                  <Button variant="secondary" size="sm" className="w-full justify-center" leftIcon={<Plus size={12} />}>
                    Add Memory
                  </Button>
                </Link>
              </div>
            </GlassCard>
          </motion.div>
        </div>

        {/* ── Module Cards ── */}
        <div>
          <SectionLabel>All Modules</SectionLabel>
          <div className="grid grid-cols-6 gap-3">
            {MODULE_CARDS.map(({ href, icon: Icon, label, desc, color }, i) => (
              <motion.div
                key={href}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.05 * i + 0.2 }}
              >
                <Link href={href}>
                  <GlassCard hover glow className="p-4 group flex flex-col gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
                      style={{ background: `${color}18`, border: `1px solid ${color}28` }}
                    >
                      <Icon size={18} style={{ color }} />
                    </div>
                    <div>
                      <p className="text-[12px] font-semibold text-[var(--color-text-primary)] group-hover:text-white transition-colors">
                        {label}
                      </p>
                      <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5 leading-snug">
                        {desc}
                      </p>
                    </div>
                    <ArrowRight
                      size={12}
                      className="text-[var(--color-text-ghost)] group-hover:text-[var(--color-text-muted)] group-hover:translate-x-1 transition-all"
                    />
                  </GlassCard>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── AI Insight Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <GlassCard className="p-5 border-[rgba(124,58,237,0.15)] bg-[rgba(124,58,237,0.04)]">
            <div className="flex items-start gap-4">
              <QuantumOrb size={40} />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={13} className="text-violet-400" />
                  <p className="text-[12px] font-semibold text-violet-300">AYRA Insight</p>
                </div>
                <p className="text-[13px] text-[var(--color-text-secondary)] leading-relaxed">
                  {overdueTasks.length > 0
                    ? `You have ${overdueTasks.length} overdue task${overdueTasks.length > 1 ? "s" : ""}. Want me to help reprioritize or reschedule them?`
                    : todayTasks.length > 0
                    ? `You have ${todayTasks.length} task${todayTasks.length > 1 ? "s" : ""} due today. Let's stay focused!`
                    : memories.length > 0
                    ? `Your knowledge base has ${memories.length} memories. I use these to give you personalized responses.`
                    : "Welcome to AYRA! Start by having a conversation, adding tasks, or building your memory bank."}
                </p>
              </div>
              <Link href="/chat/new">
                <Button variant="violet" size="sm" leftIcon={<MessageSquare size={12} />}>
                  Ask AYRA
                </Button>
              </Link>
            </div>
          </GlassCard>
        </motion.div>

      </div>
    </div>
  );
}

// ── Mini Row Components ───────────────────────────────────────

function TaskMiniRow({ task }: { task: Task }) {
  const overdue = isTaskOverdue(task.dueDate as Date | undefined);
  return (
    <Link href="/tasks">
      <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-[rgba(255,255,255,0.04)] transition-colors group">
        <div className={cn(
          "w-4 h-4 rounded-full border-2 flex-shrink-0 transition-colors",
          overdue
            ? "border-rose-500"
            : "border-[rgba(255,255,255,0.2)] group-hover:border-violet-400"
        )} />
        <p className="text-[12px] text-[var(--color-text-secondary)] truncate flex-1 group-hover:text-[var(--color-text-primary)] transition-colors">
          {task.title}
        </p>
        {overdue && (
          <span className="text-[9px] text-rose-400 font-medium flex-shrink-0">overdue</span>
        )}
      </div>
    </Link>
  );
}

function ChatMiniRow({ chat }: { chat: Chat }) {
  return (
    <Link href={`/chat/${chat.id}`}>
      <div className="px-2.5 py-2 rounded-lg hover:bg-[rgba(255,255,255,0.04)] transition-colors group cursor-pointer">
        <p className="text-[12px] font-medium text-[var(--color-text-secondary)] truncate group-hover:text-[var(--color-text-primary)] transition-colors">
          {chat.title}
        </p>
        <div className="flex items-center justify-between mt-0.5">
          <span className="text-[10px] text-[var(--color-text-ghost)] font-mono">{chat.model}</span>
          {chat.lastMessageAt && (
            <span className="text-[10px] text-[var(--color-text-ghost)]">
              {formatRelativeDate(chat.lastMessageAt)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

function MemoryMiniRow({ memory }: { memory: Memory }) {
  const importanceColors: Record<string, string> = {
    CRITICAL: "text-rose-400",
    HIGH:     "text-amber-400",
    MEDIUM:   "text-cyan-400",
    LOW:      "text-[var(--color-text-ghost)]",
  };
  return (
    <Link href="/memory">
      <div className="px-2.5 py-2 rounded-lg hover:bg-[rgba(255,255,255,0.04)] transition-colors group border border-transparent hover:border-[rgba(255,255,255,0.04)]">
        <div className="flex items-center gap-1.5 mb-0.5">
          <div className={cn("w-1 h-1 rounded-full bg-current", importanceColors[memory.importance])} />
          <p className="text-[11px] font-semibold text-[var(--color-text-secondary)] truncate group-hover:text-[var(--color-text-primary)] transition-colors">
            {memory.title}
          </p>
        </div>
        <p className="text-[10px] text-[var(--color-text-ghost)] line-clamp-1 pl-2.5">
          {memory.content}
        </p>
      </div>
    </Link>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-muted)] mb-3">
      {children}
    </p>
  );
}
