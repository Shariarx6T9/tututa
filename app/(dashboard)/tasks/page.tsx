"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckSquare, Plus, Search, Flag, Clock, Calendar,
  Check, Trash2, Edit3, Circle, AlertCircle, Sparkles,
  X, ChevronDown, Repeat,
} from "lucide-react";
import { useTaskStore } from "@/lib/store";
import { PageHeader, GlassCard, Button, Badge, Input, Textarea, EmptyState, Skeleton } from "@/components/ui";
import { cn, formatDate, isTaskOverdue, isDueToday } from "@/lib/utils";
import type { Task, TaskStatus, TaskPriority } from "@/types";
import toast from "react-hot-toast";

const PRIORITY_ICONS: Record<TaskPriority, { icon: React.ElementType; color: string }> = {
  NONE:   { icon: Circle,      color: "text-[var(--color-text-ghost)]" },
  LOW:    { icon: Flag,        color: "text-emerald-400" },
  MEDIUM: { icon: Flag,        color: "text-cyan-400" },
  HIGH:   { icon: Flag,        color: "text-amber-400" },
  URGENT: { icon: AlertCircle, color: "text-rose-400" },
};

const STATUS_TABS: { status: TaskStatus | "ALL"; label: string }[] = [
  { status: "ALL",         label: "All" },
  { status: "TODO",        label: "To Do" },
  { status: "IN_PROGRESS", label: "In Progress" },
  { status: "DONE",        label: "Done" },
];

export default function TasksPage() {
  const { tasks, setTasks, addTask, updateTask, deleteTask } = useTaskStore();
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState("");
  const [showForm, setShowForm]         = useState(false);
  const [editTask, setEditTask]         = useState<Task | null>(null);
  const [aiPrompt, setAiPrompt]         = useState("");
  const [aiLoading, setAiLoading]       = useState(false);
  const [showAI, setShowAI]             = useState(false);
  const [activeStatus, setActiveStatus] = useState<TaskStatus | "ALL">("ALL");

  useEffect(() => {
    fetch("/api/tasks")
      .then((r) => r.json())
      .then((data) => { setTasks(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [setTasks]);

  const filtered = tasks.filter((t) => {
    const matchStatus = activeStatus === "ALL" || t.status === activeStatus;
    const matchSearch = !search || t.title.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const urgent  = filtered.filter((t) => t.priority === "URGENT" && t.status !== "DONE");
  const high    = filtered.filter((t) => t.priority === "HIGH"   && t.status !== "DONE");
  const normal  = filtered.filter((t) => !["URGENT","HIGH"].includes(t.priority) && t.status !== "DONE");
  const done    = filtered.filter((t) => t.status === "DONE");

  const todayCount   = tasks.filter((t) => isDueToday(t.dueDate as Date | undefined) && t.status !== "DONE").length;
  const overdueCount = tasks.filter((t) => isTaskOverdue(t.dueDate as Date | undefined) && t.status !== "DONE").length;
  const completedPct = tasks.length > 0
    ? Math.round((tasks.filter((t) => t.status === "DONE").length / tasks.length) * 100)
    : 0;

  const toggleStatus = async (task: Task) => {
    const newStatus: TaskStatus = task.status === "DONE" ? "TODO" : "DONE";
    updateTask(task.id, { status: newStatus, completedAt: newStatus === "DONE" ? new Date() : undefined });
    await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
  };

  const handleDelete = async (id: string) => {
    deleteTask(id);
    await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    toast.success("Task deleted");
  };

  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    try {
      const res  = await fetch("/api/tasks", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt: aiPrompt }) });
      const data = await res.json();
      data.tasks?.forEach((t: Task) => addTask(t));
      toast.success(`Generated ${data.tasks?.length ?? 0} tasks`);
      setAiPrompt(""); setShowAI(false);
    } catch { toast.error("AI generation failed"); }
    finally { setAiLoading(false); }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader
        title="Tasks"
        subtitle="Your personal task manager"
        icon={<CheckSquare size={16} />}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" leftIcon={<Sparkles size={13} />} onClick={() => setShowAI(!showAI)}>AI Generate</Button>
            <Button variant="violet" size="sm" leftIcon={<Plus size={13} />} onClick={() => { setEditTask(null); setShowForm(true); }}>New Task</Button>
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-5 space-y-4">

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <GlassCard className="p-3 text-center"><p className="text-xl font-bold text-cyan-400">{todayCount}</p><p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">Due Today</p></GlassCard>
            <GlassCard className="p-3 text-center"><p className="text-xl font-bold text-rose-400">{overdueCount}</p><p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">Overdue</p></GlassCard>
            <GlassCard className="p-3 relative overflow-hidden">
              <div className="text-center"><p className="text-xl font-bold text-emerald-400">{completedPct}%</p><p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">Completed</p></div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-[rgba(255,255,255,0.04)]"><motion.div initial={{ width: 0 }} animate={{ width: `${completedPct}%` }} transition={{ duration: 1, ease: "easeOut" }} className="h-full bg-emerald-500 rounded-full" /></div>
            </GlassCard>
          </div>

          {/* AI Panel */}
          <AnimatePresence>
            {showAI && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                <GlassCard className="p-4 border-[rgba(124,58,237,0.2)]">
                  <div className="flex items-center gap-2 mb-3"><Sparkles size={14} className="text-violet-400" /><span className="text-[13px] font-medium text-[var(--color-text-primary)]">Generate tasks with AI</span></div>
                  <div className="flex gap-2">
                    <Input value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAIGenerate()} placeholder="e.g. 'Plan a product launch'" className="flex-1" />
                    <Button variant="violet" size="md" loading={aiLoading} onClick={handleAIGenerate}>Generate</Button>
                  </div>
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Filters */}
          <div className="flex items-center gap-3">
            <div className="flex gap-1 border border-[rgba(255,255,255,0.06)] rounded-lg p-0.5 bg-[rgba(255,255,255,0.02)]">
              {STATUS_TABS.map(({ status, label }) => (
                <button key={status} onClick={() => setActiveStatus(status)} className={cn("px-3 py-1.5 rounded-md text-[12px] font-medium transition-all", activeStatus === status ? "bg-[rgba(124,58,237,0.2)] text-violet-300" : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]")}>
                  {label}
                </button>
              ))}
            </div>
            <div className="flex-1"><Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tasks…" leftIcon={<Search size={13} />} /></div>
          </div>

          {/* Task Lists */}
          {loading ? (
            <div className="space-y-2">{[...Array(5)].map((_, i) => (<GlassCard key={i} className="flex items-center gap-3 px-4 py-3"><div className="skeleton w-5 h-5 rounded-full" /><div className="flex-1 space-y-1.5"><div className="skeleton h-3.5 w-3/4 rounded" /><div className="skeleton h-2.5 w-1/2 rounded" /></div></GlassCard>))}</div>
          ) : filtered.length === 0 ? (
            <EmptyState icon={<CheckSquare size={24} />} title="No tasks found" description="Create tasks manually or generate them with AI." action={<Button variant="violet" size="sm" leftIcon={<Plus size={13} />} onClick={() => setShowForm(true)}>New Task</Button>} />
          ) : (
            <div className="space-y-5">
              {urgent.length > 0 && <TaskGroup label="Urgent" labelColor="text-rose-400" tasks={urgent} onToggle={toggleStatus} onEdit={(t) => { setEditTask(t); setShowForm(true); }} onDelete={handleDelete} />}
              {high.length   > 0 && <TaskGroup label="High Priority" labelColor="text-amber-400" tasks={high} onToggle={toggleStatus} onEdit={(t) => { setEditTask(t); setShowForm(true); }} onDelete={handleDelete} />}
              {normal.length > 0 && <TaskGroup label="Tasks" tasks={normal} onToggle={toggleStatus} onEdit={(t) => { setEditTask(t); setShowForm(true); }} onDelete={handleDelete} />}
              {done.length   > 0 && activeStatus !== "TODO" && <TaskGroup label="Completed" labelColor="text-emerald-400" tasks={done} collapsed onToggle={toggleStatus} onEdit={(t) => { setEditTask(t); setShowForm(true); }} onDelete={handleDelete} />}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showForm && (
          <TaskFormModal
            initial={editTask}
            onClose={() => { setShowForm(false); setEditTask(null); }}
            onSave={async (data) => {
              if (editTask) {
                updateTask(editTask.id, data as Partial<Task>);
                await fetch(`/api/tasks/${editTask.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
              } else {
                const res = await fetch("/api/tasks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...data }) });
                addTask(await res.json());
              }
              setShowForm(false); setEditTask(null);
              toast.success(editTask ? "Task updated" : "Task created");
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function TaskGroup({ label, labelColor, tasks, collapsed: defaultCollapsed = false, onToggle, onEdit, onDelete }: { label: string; labelColor?: string; tasks: Task[]; collapsed?: boolean; onToggle: (t: Task) => void; onEdit: (t: Task) => void; onDelete: (id: string) => void; }) {
  const [open, setOpen] = useState(!defaultCollapsed);
  return (
    <div>
      <button onClick={() => setOpen(!open)} className="flex items-center gap-2 mb-2 w-full text-left">
        <ChevronDown size={13} className={cn("text-[var(--color-text-muted)] transition-transform", !open && "-rotate-90")} />
        <span className={cn("text-[11px] font-semibold uppercase tracking-widest", labelColor ?? "text-[var(--color-text-muted)]")}>{label}</span>
        <Badge variant="ghost" className="text-[9px]">{tasks.length}</Badge>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-1.5">
            {tasks.map((task, i) => <TaskRow key={task.id} task={task} index={i} onToggle={() => onToggle(task)} onEdit={() => onEdit(task)} onDelete={() => onDelete(task.id)} />)}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TaskRow({ task, index, onToggle, onEdit, onDelete }: { task: Task; index: number; onToggle: () => void; onEdit: () => void; onDelete: () => void; }) {
  const [hovered, setHovered] = useState(false);
  const isDone  = task.status === "DONE";
  const overdue = isTaskOverdue(task.dueDate as Date | undefined);
  const today   = isDueToday(task.dueDate as Date | undefined);
  const PriorityIcon = PRIORITY_ICONS[task.priority].icon;

  return (
    <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.03 }} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <GlassCard className={cn("flex items-center gap-3 px-4 py-3 transition-all duration-150", hovered && "border-[rgba(255,255,255,0.1)]", isDone && "opacity-50")}>
        <button onClick={onToggle} className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all", isDone ? "bg-emerald-500 border-emerald-500" : "border-[rgba(255,255,255,0.2)] hover:border-violet-400")}>
          {isDone && <Check size={11} className="text-white" strokeWidth={3} />}
        </button>
        <div className="flex-1 min-w-0">
          <p className={cn("text-[13px] font-medium leading-tight", isDone ? "line-through text-[var(--color-text-muted)]" : "text-[var(--color-text-primary)]")}>{task.title}</p>
          {task.description && <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5 truncate">{task.description}</p>}
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {task.dueDate && <span className={cn("flex items-center gap-1 text-[10px] font-medium", overdue && !isDone ? "text-rose-400" : today ? "text-amber-400" : "text-[var(--color-text-muted)]")}><Calendar size={10} />{formatDate(task.dueDate as Date)}</span>}
            {task.estimatedMin && <span className="flex items-center gap-1 text-[10px] text-[var(--color-text-muted)]"><Clock size={10} />{task.estimatedMin}m</span>}
            {task.isRecurring && <span className="flex items-center gap-1 text-[10px] text-cyan-400"><Repeat size={10} />Recurring</span>}
          </div>
        </div>
        <PriorityIcon size={14} className={cn("flex-shrink-0", PRIORITY_ICONS[task.priority].color)} />
        <AnimatePresence>
          {hovered && (
            <motion.div initial={{ opacity: 0, x: 6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 6 }} className="flex items-center gap-1">
              <button onClick={onEdit} className="p-1.5 rounded-md hover:bg-[rgba(255,255,255,0.06)] text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors"><Edit3 size={12} /></button>
              <button onClick={onDelete} className="p-1.5 rounded-md hover:bg-[rgba(244,63,94,0.1)] text-[var(--color-text-muted)] hover:text-rose-400 transition-colors"><Trash2 size={12} /></button>
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>
    </motion.div>
  );
}

function TaskFormModal({ initial, onClose, onSave }: { initial: Task | null; onClose: () => void; onSave: (data: Partial<Task>) => void; }) {
  const [title, setTitle]             = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [priority, setPriority]       = useState<TaskPriority>(initial?.priority ?? "NONE");
  const [dueDate, setDueDate]         = useState(initial?.dueDate ? new Date(initial.dueDate).toISOString().slice(0, 16) : "");
  const [saving, setSaving]           = useState(false);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 16 }} transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }} className="relative z-10 w-full max-w-md glass-surface rounded-2xl border border-[rgba(255,255,255,0.1)] shadow-[var(--shadow-elevated)] p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-[15px] font-semibold text-[var(--color-text-primary)]">{initial ? "Edit Task" : "New Task"}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[rgba(255,255,255,0.06)] text-[var(--color-text-muted)]"><X size={15} /></button>
        </div>
        <Input label="Task title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What needs to be done?" />
        <Textarea label="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Additional details…" rows={3} />
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[12px] font-medium text-[var(--color-text-secondary)] mb-1.5">Priority</label>
            <select value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)} className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-lg text-[12px] text-[var(--color-text-primary)] px-3 py-2 outline-none focus:border-[rgba(124,58,237,0.5)]">
              {(["NONE","LOW","MEDIUM","HIGH","URGENT"] as TaskPriority[]).map((p) => (<option key={p} value={p}>{p.charAt(0) + p.slice(1).toLowerCase()}</option>))}
            </select>
          </div>
          <Input label="Due Date" type="datetime-local" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" size="md" onClick={onClose}>Cancel</Button>
          <Button variant="primary" size="md" loading={saving} onClick={() => { setSaving(true); onSave({ title, description, priority, dueDate: dueDate ? new Date(dueDate) : undefined }); }}>
            {initial ? "Update" : "Create Task"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
