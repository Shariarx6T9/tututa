"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain, Plus, Search, Filter, Pin, Trash2,
  Edit3, Tag, Star, Clock, ChevronDown, X, Check,
  Sparkles, User, Target, Briefcase, Heart, Code2,
  FileText, DollarSign, Zap,
} from "lucide-react";
import { useMemoryStore } from "@/lib/store";
import {
  PageHeader, GlassCard, MotionCard, Button, Badge,
  Input, Textarea, EmptyState, Skeleton,
} from "@/components/ui";
import { cn, formatRelativeDate } from "@/lib/utils";
import type { Memory, MemoryType, MemoryImportance } from "@/types";
import toast from "react-hot-toast";

// ── Type config ───────────────────────────────────────────────

const MEMORY_TYPES: {
  type: MemoryType;
  label: string;
  icon: React.ElementType;
  color: string;
}[] = [
  { type: "FACT",         label: "Fact",        icon: FileText,    color: "cyan" },
  { type: "PREFERENCE",   label: "Preference",  icon: Heart,       color: "rose" },
  { type: "PROJECT",      label: "Project",     icon: Briefcase,   color: "amber" },
  { type: "GOAL",         label: "Goal",        icon: Target,      color: "emerald" },
  { type: "SKILL",        label: "Skill",       icon: Code2,       color: "violet" },
  { type: "CONTEXT",      label: "Context",     icon: Zap,         color: "violet" },
  { type: "PERSONAL",     label: "Personal",    icon: User,        color: "rose" },
  { type: "MEDICAL",      label: "Medical",     icon: Heart,       color: "rose" },
  { type: "FINANCIAL",    label: "Financial",   icon: DollarSign,  color: "emerald" },
  { type: "RELATIONSHIP", label: "Relationship",icon: User,        color: "cyan" },
];

const IMPORTANCE_CONFIG: Record<MemoryImportance, { label: string; color: string }> = {
  LOW:      { label: "Low",      color: "ghost" },
  MEDIUM:   { label: "Medium",   color: "cyan" },
  HIGH:     { label: "High",     color: "amber" },
  CRITICAL: { label: "Critical", color: "rose" },
};

export default function MemoryPage() {
  const { memories, setMemories, addMemory, updateMemory, deleteMemory } = useMemoryStore();
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [typeFilter, setTypeFilter] = useState<MemoryType | "ALL">("ALL");
  const [showForm, setShowForm]     = useState(false);
  const [editing, setEditing]       = useState<Memory | null>(null);
  const [activeTab, setActiveTab]   = useState<"memories" | "profile">("memories");

  // Fetch memories
  useEffect(() => {
    fetch("/api/memory")
      .then((r) => r.json())
      .then((data) => { setMemories(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [setMemories]);

  const filtered = memories.filter((m) => {
    const matchType   = typeFilter === "ALL" || m.type === typeFilter;
    const matchSearch = !search || m.title.toLowerCase().includes(search.toLowerCase())
      || m.content.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  const pinned  = filtered.filter((m) => m.isPinned);
  const regular = filtered.filter((m) => !m.isPinned);

  const handleDelete = async (id: string) => {
    deleteMemory(id);
    await fetch(`/api/memory/${id}`, { method: "DELETE" });
    toast.success("Memory deleted");
  };

  const handlePin = async (m: Memory) => {
    updateMemory(m.id, { isPinned: !m.isPinned });
    await fetch(`/api/memory/${m.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPinned: !m.isPinned }),
    });
  };

  const stats = {
    total:    memories.length,
    critical: memories.filter((m) => m.importance === "CRITICAL").length,
    pinned:   memories.filter((m) => m.isPinned).length,
    recent:   memories.filter((m) => {
      const d = new Date(m.updatedAt);
      return Date.now() - d.getTime() < 7 * 24 * 60 * 60 * 1000;
    }).length,
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader
        title="Memory"
        subtitle="Your long-term AI knowledge base"
        icon={<Brain size={16} />}
        actions={
          <Button
            variant="violet"
            size="sm"
            leftIcon={<Plus size={13} />}
            onClick={() => { setEditing(null); setShowForm(true); }}
          >
            Add Memory
          </Button>
        }
      />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-6 py-5 space-y-5">

          {/* Stats row */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "Total Memories", value: stats.total,    color: "text-violet-400" },
              { label: "Critical",        value: stats.critical, color: "text-rose-400" },
              { label: "Pinned",          value: stats.pinned,   color: "text-amber-400" },
              { label: "This Week",       value: stats.recent,   color: "text-emerald-400" },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <GlassCard className="p-4 text-center">
                  <p className={cn("text-2xl font-bold tracking-tight", s.color)}>{s.value}</p>
                  <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">{s.label}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 border-b border-[rgba(255,255,255,0.06)] pb-0">
            {(["memories", "profile"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-4 py-2 text-[13px] font-medium capitalize transition-all relative",
                  activeTab === tab
                    ? "text-[var(--color-text-primary)]"
                    : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
                )}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div
                    layoutId="memory-tab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-500 rounded-full"
                  />
                )}
              </button>
            ))}
          </div>

          {activeTab === "memories" && (
            <>
              {/* Filters */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex-1 max-w-xs">
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search memories…"
                    leftIcon={<Search size={13} />}
                  />
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto">
                  <button
                    onClick={() => setTypeFilter("ALL")}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all whitespace-nowrap",
                      typeFilter === "ALL"
                        ? "bg-[rgba(124,58,237,0.2)] text-violet-300 border border-[rgba(124,58,237,0.3)]"
                        : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] border border-transparent hover:border-[rgba(255,255,255,0.06)]"
                    )}
                  >
                    All
                  </button>
                  {MEMORY_TYPES.map(({ type, label }) => (
                    <button
                      key={type}
                      onClick={() => setTypeFilter(type)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all whitespace-nowrap",
                        typeFilter === type
                          ? "bg-[rgba(124,58,237,0.2)] text-violet-300 border border-[rgba(124,58,237,0.3)]"
                          : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] border border-transparent hover:border-[rgba(255,255,255,0.06)]"
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Memory grid */}
              {loading ? (
                <div className="grid grid-cols-2 gap-3">
                  {[...Array(6)].map((_, i) => (
                    <GlassCard key={i} className="p-4 space-y-2">
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-3/4" />
                    </GlassCard>
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <EmptyState
                  icon={<Brain size={24} />}
                  title="No memories found"
                  description="Add memories manually or let AYRA extract them from conversations."
                  action={
                    <Button
                      variant="violet"
                      size="sm"
                      leftIcon={<Plus size={13} />}
                      onClick={() => setShowForm(true)}
                    >
                      Add Memory
                    </Button>
                  }
                />
              ) : (
                <div className="space-y-4">
                  {pinned.length > 0 && (
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--color-text-muted)] mb-2 flex items-center gap-1.5">
                        <Pin size={10} />
                        Pinned
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        {pinned.map((m, i) => (
                          <MemoryCard
                            key={m.id}
                            memory={m}
                            index={i}
                            onEdit={() => { setEditing(m); setShowForm(true); }}
                            onDelete={() => handleDelete(m.id)}
                            onPin={() => handlePin(m)}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  {regular.length > 0 && (
                    <div>
                      {pinned.length > 0 && (
                        <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--color-text-muted)] mb-2">
                          All Memories
                        </p>
                      )}
                      <div className="grid grid-cols-2 gap-3">
                        {regular.map((m, i) => (
                          <MemoryCard
                            key={m.id}
                            memory={m}
                            index={i}
                            onEdit={() => { setEditing(m); setShowForm(true); }}
                            onDelete={() => handleDelete(m.id)}
                            onPin={() => handlePin(m)}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {activeTab === "profile" && <MemoryProfileTab />}
        </div>
      </div>

      {/* Memory Form Modal */}
      <AnimatePresence>
        {showForm && (
          <MemoryFormModal
            initial={editing}
            onClose={() => { setShowForm(false); setEditing(null); }}
            onSave={(mem) => {
              if (editing) updateMemory(editing.id, mem as Partial<Memory>);
              else addMemory(mem as Memory);
              setShowForm(false);
              setEditing(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Memory Card ───────────────────────────────────────────────

function MemoryCard({
  memory, index, onEdit, onDelete, onPin,
}: {
  memory: Memory;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
  onPin: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const typeConf = MEMORY_TYPES.find((t) => t.type === memory.type);
  const impConf  = IMPORTANCE_CONFIG[memory.importance];
  const TypeIcon = typeConf?.icon ?? FileText;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <GlassCard
        className={cn(
          "p-4 transition-all duration-200",
          hovered && "border-[rgba(124,58,237,0.2)] bg-[var(--color-surface-2)]"
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-md bg-[rgba(124,58,237,0.15)] flex items-center justify-center flex-shrink-0">
              <TypeIcon size={12} className="text-violet-400" />
            </div>
            <p className="text-[12.5px] font-semibold text-[var(--color-text-primary)] truncate">
              {memory.title}
            </p>
          </div>
          <AnimatePresence>
            {hovered && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center gap-1 flex-shrink-0"
              >
                <ActionBtn onClick={onPin}   icon={Pin}    />
                <ActionBtn onClick={onEdit}  icon={Edit3}  />
                <ActionBtn onClick={onDelete} icon={Trash2} danger />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Content */}
        <p className="text-[12px] text-[var(--color-text-secondary)] leading-relaxed line-clamp-3 mb-3">
          {memory.content}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Badge variant={impConf.color as "ghost"} dot>
              {impConf.label}
            </Badge>
            <Badge variant="ghost">{typeConf?.label ?? memory.type}</Badge>
            {memory.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="ghost" className="text-[9px]">
                #{tag}
              </Badge>
            ))}
          </div>
          <span className="text-[10px] text-[var(--color-text-ghost)] flex-shrink-0">
            {formatRelativeDate(memory.updatedAt)}
          </span>
        </div>

        {memory.isPinned && (
          <div className="absolute top-3 right-3">
            <Pin size={10} className="text-amber-400" />
          </div>
        )}
      </GlassCard>
    </motion.div>
  );
}

function ActionBtn({
  icon: Icon, onClick, danger,
}: { icon: React.ElementType; onClick: () => void; danger?: boolean }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className={cn(
        "p-1 rounded-md transition-colors",
        danger
          ? "text-rose-400 hover:bg-[rgba(244,63,94,0.1)]"
          : "text-[var(--color-text-muted)] hover:bg-[rgba(255,255,255,0.08)] hover:text-[var(--color-text-secondary)]"
      )}
    >
      <Icon size={12} />
    </button>
  );
}

// ── Memory Form Modal ─────────────────────────────────────────

function MemoryFormModal({
  initial, onClose, onSave,
}: {
  initial: Memory | null;
  onClose: () => void;
  onSave: (m: Partial<Memory>) => void;
}) {
  const [title,      setTitle]      = useState(initial?.title ?? "");
  const [content,    setContent]    = useState(initial?.content ?? "");
  const [type,       setType]       = useState<MemoryType>(initial?.type ?? "FACT");
  const [importance, setImportance] = useState<MemoryImportance>(initial?.importance ?? "MEDIUM");
  const [tagInput,   setTagInput]   = useState("");
  const [tags,       setTags]       = useState<string[]>(initial?.tags ?? []);
  const [saving,     setSaving]     = useState(false);

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput("");
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) return;
    setSaving(true);
    try {
      const method = initial ? "PATCH" : "POST";
      const url    = initial ? `/api/memory/${initial.id}` : "/api/memory";
      const res    = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, type, importance, tags }),
      });
      const data = await res.json();
      onSave(data);
      toast.success(initial ? "Memory updated" : "Memory saved");
    } catch {
      toast.error("Failed to save memory");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md glass-surface rounded-2xl border border-[rgba(255,255,255,0.1)] shadow-[var(--shadow-elevated)] p-6 space-y-4"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-[15px] font-semibold text-[var(--color-text-primary)]">
            {initial ? "Edit Memory" : "New Memory"}
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[rgba(255,255,255,0.06)] text-[var(--color-text-muted)]">
            <X size={15} />
          </button>
        </div>

        <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Short descriptive title…" />

        <Textarea
          label="Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Detailed memory content…"
          rows={4}
        />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[12px] font-medium text-[var(--color-text-secondary)] mb-1.5">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as MemoryType)}
              className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-lg text-[12px] text-[var(--color-text-primary)] px-3 py-2 outline-none focus:border-[rgba(124,58,237,0.5)]"
            >
              {MEMORY_TYPES.map(({ type: t, label }) => (
                <option key={t} value={t}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[12px] font-medium text-[var(--color-text-secondary)] mb-1.5">Importance</label>
            <select
              value={importance}
              onChange={(e) => setImportance(e.target.value as MemoryImportance)}
              className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-lg text-[12px] text-[var(--color-text-primary)] px-3 py-2 outline-none focus:border-[rgba(124,58,237,0.5)]"
            >
              {(["LOW","MEDIUM","HIGH","CRITICAL"] as MemoryImportance[]).map((imp) => (
                <option key={imp} value={imp}>{IMPORTANCE_CONFIG[imp].label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-[12px] font-medium text-[var(--color-text-secondary)] mb-1.5">Tags</label>
          <div className="flex gap-2">
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTag()}
              placeholder="Add tag…"
              leftIcon={<Tag size={12} />}
            />
            <Button variant="secondary" size="md" onClick={addTag}>Add</Button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="violet" className="gap-1">
                  #{tag}
                  <button onClick={() => setTags(tags.filter((t) => t !== tag))}>
                    <X size={9} />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" size="md" onClick={onClose}>Cancel</Button>
          <Button variant="primary" size="md" loading={saving} onClick={handleSave}>
            {initial ? "Update" : "Save Memory"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Profile Tab ───────────────────────────────────────────────

function MemoryProfileTab() {
  return (
    <GlassCard className="p-6">
      <h3 className="text-[14px] font-semibold text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
        <User size={16} className="text-violet-400" />
        Your Profile
      </h3>
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: "Preferred Name", placeholder: "What should AYRA call you?" },
          { label: "Occupation",     placeholder: "What do you do?" },
          { label: "Timezone",       placeholder: "e.g. America/New_York" },
          { label: "Location",       placeholder: "City, Country" },
          { label: "Expertise Level",placeholder: "Beginner / Intermediate / Expert" },
          { label: "Communication Style", placeholder: "Formal / Casual / Technical" },
        ].map((f) => (
          <Input key={f.label} label={f.label} placeholder={f.placeholder} />
        ))}
      </div>
      <div className="mt-4">
        <Textarea label="Short Bio" placeholder="Tell AYRA about yourself…" rows={3} />
      </div>
      <div className="mt-4 flex justify-end">
        <Button variant="primary" size="md" leftIcon={<Check size={13} />}>
          Save Profile
        </Button>
      </div>
    </GlassCard>
  );
}
