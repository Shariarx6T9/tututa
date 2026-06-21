"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone } from "react-dropzone";
import {
  BookOpen, Plus, Search, Upload, FileText, File,
  Image, Heart, DollarSign, X, Edit3, Trash2,
  Pin, Download, ExternalLink, Folder, Tag,
  StickyNote, Sparkles,
} from "lucide-react";
import {
  PageHeader, GlassCard, Button, Badge, Input,
  Textarea, EmptyState, Skeleton,
} from "@/components/ui";
import { cn, formatBytes, formatRelativeDate, getMimeIcon } from "@/lib/utils";
import type { VaultItem, VaultItemType } from "@/types";
import toast from "react-hot-toast";

const TYPE_CONFIG: Record<VaultItemType, { label: string; icon: React.ElementType; color: string; badge: string }> = {
  PDF:           { label: "PDF",         icon: FileText, color: "text-rose-400",    badge: "rose" },
  DOCUMENT:      { label: "Document",    icon: File,     color: "text-cyan-400",    badge: "cyan" },
  NOTE:          { label: "Note",        icon: StickyNote, color: "text-amber-400", badge: "amber" },
  IMAGE:         { label: "Image",       icon: Image,    color: "text-violet-400",  badge: "violet" },
  PRESCRIPTION:  { label: "Prescription",icon: Heart,    color: "text-rose-400",    badge: "rose" },
  MEDICAL_REPORT:{ label: "Medical",     icon: Heart,    color: "text-rose-400",    badge: "rose" },
  FINANCIAL:     { label: "Financial",   icon: DollarSign,color:"text-emerald-400", badge: "emerald" },
  CODE:          { label: "Code",        icon: FileText, color: "text-violet-400",  badge: "violet" },
  LINK:          { label: "Link",        icon: ExternalLink, color: "text-cyan-400",badge: "cyan" },
  OTHER:         { label: "Other",       icon: File,     color: "text-[var(--color-text-muted)]", badge: "ghost" },
};

const TYPE_FILTERS: (VaultItemType | "ALL" | "NOTE")[] = [
  "ALL", "NOTE", "PDF", "DOCUMENT", "MEDICAL_REPORT", "PRESCRIPTION", "FINANCIAL", "CODE",
];

export default function VaultPage() {
  const [items,      setItems]      = useState<VaultItem[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState("");
  const [typeFilter, setTypeFilter] = useState<VaultItemType | "ALL">("ALL");
  const [showNote,   setShowNote]   = useState(false);
  const [editItem,   setEditItem]   = useState<VaultItem | null>(null);
  const [uploading,  setUploading]  = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    fetch("/api/vault")
      .then((r) => r.json())
      .then((data) => { setItems(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = items.filter((item) => {
    const matchType   = typeFilter === "ALL" || item.type === typeFilter;
    const matchSearch = !search || item.title.toLowerCase().includes(search.toLowerCase())
      || item.description?.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  const pinned  = filtered.filter((i) => i.isPinned);
  const regular = filtered.filter((i) => !i.isPinned);

  // Dropzone
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!acceptedFiles.length) return;
    setUploading(true);
    try {
      for (const file of acceptedFiles) {
        const fd = new FormData();
        fd.append("file", file);
        
        const res  = await fetch("/api/vault/upload", { method: "POST", body: fd });
        const data = await res.json();
        setItems((prev) => [data, ...prev]);
      }
      toast.success(`Uploaded ${acceptedFiles.length} file(s)`);
      setShowUpload(false);
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "text/*": [".txt", ".md", ".csv"],
      "image/*": [".png", ".jpg", ".jpeg", ".webp"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
  });

  const handleDelete = async (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    await fetch(`/api/vault/${id}`, { method: "DELETE" });
    toast.success("Item deleted");
  };

  const handlePin = async (item: VaultItem) => {
    const updated = { ...item, isPinned: !item.isPinned };
    setItems((prev) => prev.map((i) => i.id === item.id ? updated : i));
    await fetch(`/api/vault/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPinned: !item.isPinned }),
    });
  };

  const stats = {
    total:   items.length,
    pdfs:    items.filter((i) => i.type === "PDF").length,
    notes:   items.filter((i) => i.type === "NOTE").length,
    medical: items.filter((i) => ["PRESCRIPTION","MEDICAL_REPORT"].includes(i.type)).length,
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader
        title="Knowledge Vault"
        subtitle="Your private document repository"
        icon={<BookOpen size={16} />}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" leftIcon={<Upload size={13} />} onClick={() => setShowUpload(!showUpload)}>Upload</Button>
            <Button variant="violet" size="sm" leftIcon={<StickyNote size={13} />} onClick={() => { setEditItem(null); setShowNote(true); }}>New Note</Button>
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-6 py-5 space-y-5">

          {/* Stats */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "Total Items",    value: stats.total,   color: "text-violet-400" },
              { label: "PDFs",           value: stats.pdfs,    color: "text-rose-400" },
              { label: "Notes",          value: stats.notes,   color: "text-amber-400" },
              { label: "Medical Docs",   value: stats.medical, color: "text-cyan-400" },
            ].map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <GlassCard className="p-4 text-center">
                  <p className={cn("text-2xl font-bold", s.color)}>{s.value}</p>
                  <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">{s.label}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>

          {/* Upload drop zone */}
          <AnimatePresence>
            {showUpload && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                <div
                  {...getRootProps()}
                  className={cn(
                    "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all",
                    isDragActive
                      ? "border-violet-500 bg-[rgba(124,58,237,0.1)]"
                      : "border-[rgba(255,255,255,0.1)] hover:border-[rgba(124,58,237,0.3)] hover:bg-[rgba(255,255,255,0.02)]"
                  )}
                >
                  <input {...getInputProps()} />
                  <Upload size={28} className={cn("mx-auto mb-3", isDragActive ? "text-violet-400" : "text-[var(--color-text-muted)]")} />
                  <p className="text-[13px] font-medium text-[var(--color-text-secondary)] mb-1">
                    {isDragActive ? "Drop files here…" : "Drag & drop files or click to browse"}
                  </p>
                  <p className="text-[11px] text-[var(--color-text-muted)]">
                    PDF, DOCX, TXT, MD, Images supported
                  </p>
                  {uploading && <p className="text-[12px] text-violet-400 mt-2 animate-pulse">Uploading…</p>}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Filters + Search */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="flex-1 max-w-sm">
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search vault…" leftIcon={<Search size={13} />} />
              </div>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {(["ALL","NOTE","PDF","DOCUMENT","MEDICAL_REPORT","PRESCRIPTION","FINANCIAL","CODE"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type as VaultItemType | "ALL")}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all whitespace-nowrap",
                    typeFilter === type
                      ? "bg-[rgba(124,58,237,0.2)] text-violet-300 border border-[rgba(124,58,237,0.3)]"
                      : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] border border-transparent hover:border-[rgba(255,255,255,0.06)]"
                  )}
                >
                  {type === "ALL" ? "All" : type === "NOTE" ? "Notes" : TYPE_CONFIG[type as VaultItemType]?.label ?? type}
                </button>
              ))}
            </div>
          </div>

          {/* Items grid */}
          {loading ? (
            <div className="grid grid-cols-3 gap-3">
              {[...Array(6)].map((_, i) => (
                <GlassCard key={i} className="p-4 space-y-2">
                  <div className="flex gap-2 items-center"><div className="skeleton w-8 h-8 rounded-lg" /><div className="skeleton h-3.5 flex-1 rounded" /></div>
                  <div className="skeleton h-2.5 w-full rounded" />
                  <div className="skeleton h-2.5 w-2/3 rounded" />
                </GlassCard>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState icon={<BookOpen size={24} />} title="Vault is empty" description="Upload documents, PDFs, or create notes to build your knowledge base." action={<Button variant="violet" size="sm" leftIcon={<Plus size={13} />} onClick={() => setShowNote(true)}>New Note</Button>} />
          ) : (
            <div className="space-y-5">
              {pinned.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-muted)] mb-2">Pinned</p>
                  <div className="grid grid-cols-3 gap-3">
                    {pinned.map((item, i) => <VaultItemCard key={item.id} item={item} index={i} onEdit={() => { setEditItem(item); setShowNote(true); }} onDelete={() => handleDelete(item.id)} onPin={() => handlePin(item)} />)}
                  </div>
                </div>
              )}
              {regular.length > 0 && (
                <div>
                  {pinned.length > 0 && <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-muted)] mb-2">All Items</p>}
                  <div className="grid grid-cols-3 gap-3">
                    {regular.map((item, i) => <VaultItemCard key={item.id} item={item} index={i} onEdit={() => { setEditItem(item); setShowNote(true); }} onDelete={() => handleDelete(item.id)} onPin={() => handlePin(item)} />)}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Note Editor Modal */}
      <AnimatePresence>
        {showNote && (
          <NoteEditorModal
            initial={editItem?.isNote ? editItem : null}
            onClose={() => { setShowNote(false); setEditItem(null); }}
            onSave={async (data) => {
              const url    = editItem ? `/api/vault/${editItem.id}` : "/api/vault";
              const method = editItem ? "PATCH" : "POST";
              const res    = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...data, isNote: true, type: "NOTE" }) });
              const saved  = await res.json();
              if (editItem) setItems((prev) => prev.map((i) => i.id === editItem.id ? saved : i));
              else setItems((prev) => [saved, ...prev]);
              setShowNote(false); setEditItem(null);
              toast.success(editItem ? "Note updated" : "Note saved");
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Vault Item Card ───────────────────────────────────────────

function VaultItemCard({ item, index, onEdit, onDelete, onPin }: { item: VaultItem; index: number; onEdit: () => void; onDelete: () => void; onPin: () => void; }) {
  const [hovered, setHovered] = useState(false);
  const conf   = TYPE_CONFIG[item.type];
  const TypeIcon = conf.icon;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <GlassCard className={cn("p-4 h-full flex flex-col gap-3 transition-all duration-200 cursor-pointer", hovered && "border-[rgba(124,58,237,0.2)] bg-[var(--color-surface-2)]")} onClick={item.isNote ? onEdit : undefined}>
        <div className="flex items-start justify-between gap-2">
          <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0", "bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.06)]")}>
            <TypeIcon size={16} className={conf.color} />
          </div>
          <AnimatePresence>
            {hovered && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1">
                <button onClick={(e) => { e.stopPropagation(); onPin(); }} className="p-1 rounded-md hover:bg-[rgba(255,255,255,0.08)] text-[var(--color-text-muted)]"><Pin size={11} /></button>
                {item.isNote && <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="p-1 rounded-md hover:bg-[rgba(255,255,255,0.08)] text-[var(--color-text-muted)]"><Edit3 size={11} /></button>}
                {item.url && <a href={item.url} download onClick={(e) => e.stopPropagation()} className="p-1 rounded-md hover:bg-[rgba(255,255,255,0.08)] text-[var(--color-text-muted)]"><Download size={11} /></a>}
                <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1 rounded-md hover:bg-[rgba(244,63,94,0.1)] text-[var(--color-text-muted)] hover:text-rose-400"><Trash2 size={11} /></button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex-1">
          <p className="text-[12.5px] font-semibold text-[var(--color-text-primary)] leading-tight mb-1 line-clamp-2">{item.title}</p>
          {item.description && <p className="text-[11px] text-[var(--color-text-muted)] line-clamp-2 leading-relaxed">{item.description}</p>}
          {item.isNote && item.rawContent && <p className="text-[11px] text-[var(--color-text-muted)] line-clamp-3 leading-relaxed mt-1 font-mono">{item.rawContent.slice(0, 120)}…</p>}
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <Badge variant={conf.badge as "ghost"} className="text-[9px]">{conf.label}</Badge>
            {item.size && <span className="text-[10px] text-[var(--color-text-ghost)]">{formatBytes(item.size)}</span>}
            {item.pageCount && <span className="text-[10px] text-[var(--color-text-ghost)]">{item.pageCount}p</span>}
          </div>
          <span className="text-[10px] text-[var(--color-text-ghost)]">{formatRelativeDate(item.updatedAt)}</span>
        </div>
      </GlassCard>
    </motion.div>
  );
}

// ── Note Editor Modal ─────────────────────────────────────────

function NoteEditorModal({ initial, onClose, onSave }: { initial: VaultItem | null; onClose: () => void; onSave: (data: Partial<VaultItem>) => void; }) {
  const [title,   setTitle]   = useState(initial?.title ?? "");
  const [content, setContent] = useState(initial?.rawContent ?? "");
  const [tags,    setTags]    = useState<string[]>(initial?.tags ?? []);
  const [tagIn,   setTagIn]   = useState("");
  const [saving,  setSaving]  = useState(false);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 16 }} className="relative z-10 w-full max-w-2xl glass-surface rounded-2xl border border-[rgba(255,255,255,0.1)] shadow-[var(--shadow-elevated)] flex flex-col" style={{ maxHeight: "85vh" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[rgba(255,255,255,0.06)]">
          <h3 className="text-[15px] font-semibold text-[var(--color-text-primary)]">{initial ? "Edit Note" : "New Note"}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[rgba(255,255,255,0.06)] text-[var(--color-text-muted)]"><X size={15} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Note title…" />
          <div>
            <label className="block text-[12px] font-medium text-[var(--color-text-secondary)] mb-1.5">Content <span className="text-[var(--color-text-muted)] font-normal">(Markdown supported)</span></label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your note here… Markdown is supported."
              rows={12}
              className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-lg text-[13px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] px-3 py-2.5 outline-none resize-none focus:border-[rgba(124,58,237,0.5)] font-mono"
            />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-[var(--color-text-secondary)] mb-1.5">Tags</label>
            <div className="flex gap-2">
              <Input value={tagIn} onChange={(e) => setTagIn(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { const t = tagIn.trim(); if (t && !tags.includes(t)) setTags([...tags, t]); setTagIn(""); }}} placeholder="Add tag…" leftIcon={<Tag size={12} />} />
            </div>
            {tags.length > 0 && <div className="flex flex-wrap gap-1.5 mt-2">{tags.map((tag) => (<Badge key={tag} variant="violet" className="gap-1">#{tag}<button onClick={() => setTags(tags.filter((t) => t !== tag))}><X size={9} /></button></Badge>))}</div>}
          </div>
        </div>

        <div className="flex justify-end gap-2 px-5 py-4 border-t border-[rgba(255,255,255,0.06)]">
          <Button variant="ghost" size="md" onClick={onClose}>Cancel</Button>
          <Button variant="primary" size="md" loading={saving} onClick={() => { setSaving(true); onSave({ title, rawContent: content, tags }); }}>{initial ? "Update" : "Save Note"}</Button>
        </div>
      </motion.div>
    </div>
  );
}
