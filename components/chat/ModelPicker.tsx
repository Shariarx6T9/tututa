"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Cpu, Loader2, Wifi, WifiOff } from "lucide-react";
import { useChatStore, useModelStore } from "@/lib/store";
import { cn, formatBytes } from "@/lib/utils";

export function ModelPicker() {
  const { selectedModel, setSelectedModel } = useChatStore();
  const { models, isLoading, ollamaAvailable, setModels, setLoading, setOllamaAvailable } = useModelStore();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/models");
        const data = await res.json();
        setModels(data.models ?? []);
        setOllamaAvailable(data.available);
      } catch {
        setOllamaAvailable(false);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [setLoading, setModels, setOllamaAvailable]);

  const currentModel = models.find((m) => m.name === selectedModel);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all",
          "border bg-[rgba(255,255,255,0.04)]",
          open
            ? "border-[rgba(124,58,237,0.4)] text-[var(--color-text-primary)]"
            : "border-[rgba(255,255,255,0.08)] text-[var(--color-text-secondary)] hover:border-[rgba(255,255,255,0.12)]"
        )}
      >
        {isLoading ? (
          <Loader2 size={12} className="animate-spin text-[var(--color-text-muted)]" />
        ) : ollamaAvailable ? (
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        ) : (
          <WifiOff size={12} className="text-rose-400" />
        )}
        <span className="font-mono max-w-[120px] truncate">
          {selectedModel || "Select model"}
        </span>
        <ChevronDown
          size={12}
          className={cn("transition-transform", open && "rotate-180")}
        />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.97 }}
              transition={{ duration: 0.12 }}
              className="absolute right-0 top-full mt-2 z-50 w-[280px] glass-surface rounded-xl border border-[rgba(255,255,255,0.08)] shadow-[var(--shadow-elevated)] overflow-hidden"
            >
              {/* Status bar */}
              <div className="px-3 py-2 border-b border-[rgba(255,255,255,0.05)] flex items-center justify-between">
                <span className="text-[11px] text-[var(--color-text-muted)]">Ollama Models</span>
                <div className="flex items-center gap-1.5">
                  {ollamaAvailable ? (
                    <>
                      <Wifi size={11} className="text-emerald-400" />
                      <span className="text-[10px] text-emerald-400">Connected</span>
                    </>
                  ) : (
                    <>
                      <WifiOff size={11} className="text-rose-400" />
                      <span className="text-[10px] text-rose-400">Offline</span>
                    </>
                  )}
                </div>
              </div>

              {/* Model list */}
              <div className="max-h-[280px] overflow-y-auto py-1">
                {isLoading ? (
                  <div className="flex items-center justify-center py-6 gap-2">
                    <Loader2 size={14} className="animate-spin text-[var(--color-text-muted)]" />
                    <span className="text-[12px] text-[var(--color-text-muted)]">Loading…</span>
                  </div>
                ) : models.length === 0 ? (
                  <div className="text-center py-6">
                    <Cpu size={20} className="mx-auto text-[var(--color-text-ghost)] mb-2" />
                    <p className="text-[12px] text-[var(--color-text-muted)]">No models found</p>
                    <p className="text-[11px] text-[var(--color-text-ghost)] mt-1">
                      Run `ollama pull llama3.2`
                    </p>
                  </div>
                ) : (
                  models.map((model) => (
                    <button
                      key={model.name}
                      onClick={() => { setSelectedModel(model.name); setOpen(false); }}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2.5 text-left transition-colors",
                        selectedModel === model.name
                          ? "bg-[rgba(124,58,237,0.15)] text-[var(--color-text-primary)]"
                          : "text-[var(--color-text-secondary)] hover:bg-[rgba(255,255,255,0.04)] hover:text-[var(--color-text-primary)]"
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        {selectedModel === model.name && (
                          <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                        )}
                        <div className={selectedModel !== model.name ? "ml-3.5" : ""}>
                          <p className="text-[12px] font-mono font-medium">{model.name}</p>
                          {model.details && (
                            <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">
                              {model.details.parameter_size} · {model.details.quantization_level}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className="text-[10px] text-[var(--color-text-ghost)] font-mono">
                        {formatBytes(model.size)}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
