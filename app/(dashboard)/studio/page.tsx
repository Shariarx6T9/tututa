"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Image as ImageIcon, Sparkles, Download, Heart, Trash2,
  Plus, Search, Grid3X3, LayoutGrid, Settings2, X,
  Copy, RefreshCw, Wand2, Sliders, ChevronDown,
} from "lucide-react";
import { PageHeader, GlassCard, Button, Badge, Input, Textarea, EmptyState, Skeleton } from "@/components/ui";
import { QuantumOrb } from "@/components/ui/QuantumOrb";
import { cn, formatRelativeDate } from "@/lib/utils";
import type { StudioImage, ImageEngine } from "@/types";
import toast from "react-hot-toast";

interface GenerateParams {
  prompt: string;
  negativePrompt: string;
  steps: number;
  cfgScale: number;
  width: number;
  height: number;
  seed: number;
  sampler: string;
  model: string;
}

const DEFAULT_PARAMS: GenerateParams = {
  prompt: "",
  negativePrompt: "ugly, blurry, low quality, watermark, signature, text",
  steps: 20,
  cfgScale: 7,
  width: 512,
  height: 512,
  seed: -1,
  sampler: "DPM++ 2M Karras",
  model: "v1-5-pruned-emaonly",
};

const SAMPLERS = ["Euler a","Euler","DPM++ 2M Karras","DPM++ SDE Karras","DPM++ 2S a Karras","DDIM","PLMS"];
const SIZES = [
  { label: "512×512",  w: 512,  h: 512 },
  { label: "768×512",  w: 768,  h: 512 },
  { label: "512×768",  w: 512,  h: 768 },
  { label: "1024×1024",w: 1024, h: 1024 },
  { label: "1024×768", w: 1024, h: 768 },
  { label: "768×1024", w: 768,  h: 1024 },
];

export default function StudioPage() {
  const [images,      setImages]      = useState<StudioImage[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [generating,  setGenerating]  = useState(false);
  const [progress,    setProgress]    = useState(0);
  const [params,      setParams]      = useState<GenerateParams>(DEFAULT_PARAMS);
  const [showParams,  setShowParams]  = useState(true);
  const [gridSize,    setGridSize]    = useState<2 | 3 | 4>(3);
  const [search,      setSearch]      = useState("");
  const [selected,    setSelected]    = useState<StudioImage | null>(null);
  const [showAdvanced,setShowAdvanced]= useState(false);
  const [engine,      setEngine]      = useState<ImageEngine>("STABLE_DIFFUSION");

  useEffect(() => {
    fetch("/api/studio")
      .then((r) => r.json())
      .then((data) => { setImages(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = images.filter((img) =>
    !search || img.prompt.toLowerCase().includes(search.toLowerCase()) || img.tags.some((t) => t.includes(search.toLowerCase()))
  );

  const handleGenerate = async () => {
    if (!params.prompt.trim()) { toast.error("Enter a prompt first"); return; }
    setGenerating(true);
    setProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setProgress((p) => Math.min(p + Math.random() * 8, 90));
      }, 600);

      const res = await fetch("/api/studio/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...params, engine }),
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!res.ok) throw new Error("Generation failed");
      const data = await res.json();
      setImages((prev) => [data, ...prev]);
      toast.success("Image generated!");
    } catch {
      toast.error("Generation failed. Check SD/ComfyUI connection.");
    } finally {
      setGenerating(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const handleFavorite = async (img: StudioImage) => {
    setImages((prev) => prev.map((i) => i.id === img.id ? { ...i, isFavorite: !i.isFavorite } : i));
    await fetch(`/api/studio/${img.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isFavorite: !img.isFavorite }),
    });
  };

  const handleDelete = async (id: string) => {
    setImages((prev) => prev.filter((i) => i.id !== id));
    if (selected?.id === id) setSelected(null);
    await fetch(`/api/studio/${id}`, { method: "DELETE" });
    toast.success("Image deleted");
  };

  const updateParam = <K extends keyof GenerateParams>(key: K, val: GenerateParams[K]) =>
    setParams((p) => ({ ...p, [key]: val }));

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader
        title="Image Studio"
        subtitle="AI image generation workspace"
        icon={<ImageIcon size={16} />}
        actions={
          <div className="flex items-center gap-2">
            <button onClick={() => setGridSize(g => g === 2 ? 3 : g === 3 ? 4 : 2)} className="p-2 rounded-lg border border-[rgba(255,255,255,0.08)] text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors">
              <Grid3X3 size={14} />
            </button>
            <Button variant="secondary" size="sm" leftIcon={<Settings2 size={13} />} onClick={() => setShowParams(!showParams)}>
              {showParams ? "Hide" : "Show"} Controls
            </Button>
          </div>
        }
      />

      <div className="flex flex-1 overflow-hidden">

        {/* Controls Panel */}
        <AnimatePresence>
          {showParams && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="flex-shrink-0 border-r border-[rgba(255,255,255,0.06)] flex flex-col overflow-hidden"
            >
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Engine selector */}
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-widest text-[var(--color-text-muted)] mb-2">Engine</label>
                  <div className="flex gap-1">
                    {(["STABLE_DIFFUSION","COMFYUI"] as ImageEngine[]).map((e) => (
                      <button key={e} onClick={() => setEngine(e)} className={cn("flex-1 py-2 rounded-lg text-[11px] font-medium transition-all border", engine === e ? "bg-[rgba(124,58,237,0.2)] text-violet-300 border-[rgba(124,58,237,0.3)]" : "text-[var(--color-text-muted)] border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.1)]")}>
                        {e === "STABLE_DIFFUSION" ? "Stable Diffusion" : "ComfyUI"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Prompt */}
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-widest text-[var(--color-text-muted)] mb-2">Prompt</label>
                  <textarea
                    value={params.prompt}
                    onChange={(e) => updateParam("prompt", e.target.value)}
                    placeholder="A cinematic portrait of a futuristic city at night, neon lights, volumetric fog, 8k, photorealistic…"
                    rows={4}
                    className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-lg text-[12px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] px-3 py-2.5 outline-none resize-none focus:border-[rgba(124,58,237,0.5)] leading-relaxed"
                  />
                </div>

                {/* Negative prompt */}
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-widest text-[var(--color-text-muted)] mb-2">Negative Prompt</label>
                  <textarea
                    value={params.negativePrompt}
                    onChange={(e) => updateParam("negativePrompt", e.target.value)}
                    rows={2}
                    className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-lg text-[12px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] px-3 py-2.5 outline-none resize-none focus:border-[rgba(124,58,237,0.5)]"
                  />
                </div>

                {/* Size */}
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-widest text-[var(--color-text-muted)] mb-2">Size</label>
                  <div className="grid grid-cols-3 gap-1">
                    {SIZES.map(({ label, w, h }) => (
                      <button key={label} onClick={() => { updateParam("width", w); updateParam("height", h); }} className={cn("py-1.5 rounded-lg text-[10px] font-mono transition-all border", params.width === w && params.height === h ? "bg-[rgba(124,58,237,0.15)] text-violet-300 border-[rgba(124,58,237,0.3)]" : "text-[var(--color-text-muted)] border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.1)]")}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Advanced toggle */}
                <button onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors w-full">
                  <ChevronDown size={12} className={cn("transition-transform", showAdvanced && "rotate-180")} />
                  Advanced Settings
                </button>

                <AnimatePresence>
                  {showAdvanced && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="space-y-3 overflow-hidden">
                      {/* Steps */}
                      <SliderParam label="Steps" value={params.steps} min={10} max={50} step={1} onChange={(v) => updateParam("steps", v)} />
                      {/* CFG Scale */}
                      <SliderParam label="CFG Scale" value={params.cfgScale} min={1} max={20} step={0.5} onChange={(v) => updateParam("cfgScale", v)} />
                      {/* Sampler */}
                      <div>
                        <label className="block text-[11px] font-medium text-[var(--color-text-muted)] mb-1.5">Sampler</label>
                        <select value={params.sampler} onChange={(e) => updateParam("sampler", e.target.value)} className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-lg text-[12px] text-[var(--color-text-primary)] px-2.5 py-1.5 outline-none focus:border-[rgba(124,58,237,0.5)]">
                          {SAMPLERS.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      {/* Seed */}
                      <Input label="Seed (-1 = random)" type="number" value={params.seed} onChange={(e) => updateParam("seed", parseInt(e.target.value))} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Generate button */}
              <div className="p-4 border-t border-[rgba(255,255,255,0.06)]">
                {progress > 0 && (
                  <div className="mb-3">
                    <div className="flex justify-between text-[10px] text-[var(--color-text-muted)] mb-1">
                      <span>Generating…</span><span>{Math.round(progress)}%</span>
                    </div>
                    <div className="h-1 bg-[rgba(255,255,255,0.06)] rounded-full overflow-hidden">
                      <motion.div className="h-full bg-gradient-to-r from-violet-600 to-cyan-500 rounded-full" animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
                    </div>
                  </div>
                )}
                <Button variant="primary" size="lg" className="w-full justify-center" loading={generating} leftIcon={<Sparkles size={15} />} onClick={handleGenerate}>
                  {generating ? "Generating…" : "Generate Image"}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Gallery */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-[rgba(255,255,255,0.06)]">
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search images…" leftIcon={<Search size={13} />} className="max-w-xs" />
            <Badge variant="ghost">{filtered.length} images</Badge>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className={cn("grid gap-3", { "grid-cols-2": gridSize === 2, "grid-cols-3": gridSize === 3, "grid-cols-4": gridSize === 4 })}>
                {[...Array(6)].map((_, i) => <div key={i} className="skeleton aspect-square rounded-xl" />)}
              </div>
            ) : filtered.length === 0 ? (
              <EmptyState icon={<ImageIcon size={24} />} title="No images yet" description="Generate your first image using the controls on the left." action={<Button variant="violet" size="sm" leftIcon={<Sparkles size={13} />} onClick={handleGenerate}>Generate</Button>} />
            ) : (
              <div className={cn("grid gap-3", { "grid-cols-2": gridSize === 2, "grid-cols-3": gridSize === 3, "grid-cols-4": gridSize === 4 })}>
                {filtered.map((img, i) => (
                  <StudioImageCard key={img.id} image={img} index={i} onClick={() => setSelected(img)} onFavorite={() => handleFavorite(img)} onDelete={() => handleDelete(img.id)} onReuse={() => updateParam("prompt", img.prompt)} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image Detail Modal */}
      <AnimatePresence>
        {selected && (
          <ImageDetailModal image={selected} onClose={() => setSelected(null)} onFavorite={() => handleFavorite(selected)} onDelete={() => handleDelete(selected.id)} onReuse={() => { updateParam("prompt", selected.prompt); setSelected(null); }} />
        )}
      </AnimatePresence>
    </div>
  );
}

function SliderParam({ label, value, min, max, step, onChange }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; }) {
  return (
    <div>
      <div className="flex justify-between mb-1.5">
        <label className="text-[11px] font-medium text-[var(--color-text-muted)]">{label}</label>
        <span className="text-[11px] font-mono text-violet-400">{value}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} className="w-full h-1 bg-[rgba(255,255,255,0.08)] rounded-full appearance-none cursor-pointer accent-violet-500" />
    </div>
  );
}

function StudioImageCard({ image, index, onClick, onFavorite, onDelete, onReuse }: { image: StudioImage; index: number; onClick: () => void; onFavorite: () => void; onDelete: () => void; onReuse: () => void; }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.03 }} className="relative group rounded-xl overflow-hidden cursor-pointer aspect-square bg-[var(--color-surface-2)]" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onClick={onClick}>
      <img src={image.url} alt={image.prompt} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
      <AnimatePresence>
        {hovered && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-3">
            <p className="text-[10px] text-white/80 line-clamp-2 mb-2 leading-relaxed">{image.prompt}</p>
            <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
              <button onClick={onFavorite} className={cn("p-1.5 rounded-lg backdrop-blur-sm transition-colors", image.isFavorite ? "bg-rose-500/30 text-rose-400" : "bg-black/40 text-white/70 hover:text-rose-400")}><Heart size={12} fill={image.isFavorite ? "currentColor" : "none"} /></button>
              <button onClick={onReuse} className="p-1.5 rounded-lg bg-black/40 text-white/70 hover:text-violet-300 backdrop-blur-sm transition-colors"><RefreshCw size={12} /></button>
              <a href={image.url} download onClick={(e) => e.stopPropagation()} className="p-1.5 rounded-lg bg-black/40 text-white/70 hover:text-emerald-300 backdrop-blur-sm transition-colors"><Download size={12} /></a>
              <button onClick={onDelete} className="p-1.5 rounded-lg bg-black/40 text-white/70 hover:text-rose-400 backdrop-blur-sm transition-colors ml-auto"><Trash2 size={12} /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {image.isFavorite && <div className="absolute top-2 right-2"><Heart size={12} className="text-rose-400 fill-rose-400" /></div>}
    </motion.div>
  );
}

function ImageDetailModal({ image, onClose, onFavorite, onDelete, onReuse }: { image: StudioImage; onClose: () => void; onFavorite: () => void; onDelete: () => void; onReuse: () => void; }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative z-10 flex gap-5 max-w-5xl w-full max-h-[90vh]">
        {/* Image */}
        <div className="flex-1 rounded-2xl overflow-hidden bg-[var(--color-surface-1)]">
          <img src={image.url} alt={image.prompt} className="w-full h-full object-contain" />
        </div>
        {/* Details */}
        <div className="w-72 flex-shrink-0 glass-surface rounded-2xl border border-[rgba(255,255,255,0.1)] p-5 flex flex-col gap-4 overflow-y-auto">
          <div className="flex items-center justify-between">
            <h3 className="text-[14px] font-semibold text-[var(--color-text-primary)]">Image Details</h3>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[rgba(255,255,255,0.06)] text-[var(--color-text-muted)]"><X size={14} /></button>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-muted)] mb-1.5">Prompt</p>
            <p className="text-[12px] text-[var(--color-text-secondary)] leading-relaxed">{image.prompt}</p>
          </div>
          {image.negativePrompt && <div><p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-muted)] mb-1.5">Negative Prompt</p><p className="text-[12px] text-[var(--color-text-muted)] leading-relaxed">{image.negativePrompt}</p></div>}
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            {[["Size", `${image.width}×${image.height}`], ["Steps", image.steps ?? "–"], ["CFG", image.cfgScale ?? "–"], ["Sampler", image.sampler ?? "–"], ["Seed", image.seed?.toString() ?? "–"], ["Engine", image.engine]].map(([l, v]) => (
              <div key={l as string} className="bg-[rgba(255,255,255,0.03)] rounded-lg p-2"><p className="text-[var(--color-text-muted)] text-[9px] uppercase tracking-wide">{l}</p><p className="text-[var(--color-text-primary)] font-mono mt-0.5 truncate">{v}</p></div>
            ))}
          </div>
          <p className="text-[10px] text-[var(--color-text-ghost)]">{formatRelativeDate(image.createdAt)}</p>
          <div className="flex flex-col gap-2 mt-auto">
            <Button variant="violet" size="sm" leftIcon={<RefreshCw size={12} />} className="w-full justify-center" onClick={onReuse}>Reuse Prompt</Button>
            <a href={image.url} download className="w-full"><Button variant="secondary" size="sm" leftIcon={<Download size={12} />} className="w-full justify-center">Download</Button></a>
            <Button variant="danger" size="sm" leftIcon={<Trash2 size={12} />} className="w-full justify-center" onClick={onDelete}>Delete</Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
