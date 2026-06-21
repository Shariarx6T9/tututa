"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Settings, Cpu, Brain, Palette, Shield,
  Database, Wifi, WifiOff, Check, Save, RefreshCw,
  Trash2, Download, Upload, Server, User,
} from "lucide-react";
import { PageHeader, GlassCard, Button, Badge, Input, Skeleton } from "@/components/ui";
import { QuantumOrb } from "@/components/ui/QuantumOrb";
import { cn } from "@/lib/utils";
import { useModelStore } from "@/lib/store";
import { useSession } from "@/lib/auth/use-session";
import Link from "next/link";
import toast from "react-hot-toast";

const SETTINGS_SECTIONS = [
  { id: "ai",      label: "AI Models",    icon: Cpu },
  { id: "memory",  label: "Memory",       icon: Brain },
  { id: "studio",  label: "Image Studio", icon: Palette },
  { id: "system",  label: "System",       icon: Database },
] as const;

type SettingsSection = typeof SETTINGS_SECTIONS[number]["id"];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<SettingsSection>("ai");
  const { models, ollamaAvailable, setModels, setOllamaAvailable, setLoading } = useModelStore();

  // Settings state
  const [ollamaHost,   setOllamaHost]   = useState("http://localhost:11434");
  const [defaultModel, setDefaultModel] = useState("llama3.2");
  const [temperature,  setTemperature]  = useState(0.7);
  const [maxTokens,    setMaxTokens]    = useState(4096);
  const [systemPrompt, setSystemPrompt] = useState("");
  const [sdHost,       setSdHost]       = useState("http://localhost:7860");
  const [comfyHost,    setComfyHost]    = useState("http://localhost:8188");
  const [testingConn,  setTestingConn]  = useState(false);
  const [savedAnim,    setSavedAnim]    = useState(false);

  useEffect(() => {
    // Load settings
    fetch("/api/settings")
      .then((r) => r.json())
      .then((s) => {
        if (s.ollamaHost)   setOllamaHost(s.ollamaHost);
        if (s.defaultModel) setDefaultModel(s.defaultModel);
        if (s.temperature)  setTemperature(s.temperature);
        if (s.maxTokens)    setMaxTokens(s.maxTokens);
        if (s.systemPrompt) setSystemPrompt(s.systemPrompt);
        if (s.sdHost)       setSdHost(s.sdHost);
        if (s.comfyHost)    setComfyHost(s.comfyHost);
      })
      .catch(() => {});
  }, []);

  const testConnection = async () => {
    setTestingConn(true);
    try {
      const res = await fetch("/api/models");
      const data = await res.json();
      setModels(data.models ?? []);
      setOllamaAvailable(data.available);
      if (data.available) toast.success(`Connected! Found ${data.models.length} models.`);
      else toast.error("Ollama not reachable at " + ollamaHost);
    } catch {
      toast.error("Connection failed");
    } finally {
      setTestingConn(false);
    }
  };

  const saveSettings = async () => {
    try {
      await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ollamaHost, defaultModel, temperature, maxTokens, systemPrompt, sdHost, comfyHost,
        }),
      });
      setSavedAnim(true);
      toast.success("Settings saved");
      setTimeout(() => setSavedAnim(false), 2000);
    } catch {
      toast.error("Failed to save settings");
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader
        title="Settings"
        subtitle="Configure AYRA to your preferences"
        icon={<Settings size={16} />}
        actions={
          <Button
            variant="violet"
            size="sm"
            leftIcon={savedAnim ? <Check size={13} /> : <Save size={13} />}
            onClick={saveSettings}
          >
            {savedAnim ? "Saved!" : "Save Settings"}
          </Button>
        }
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar nav */}
        <div className="w-52 flex-shrink-0 border-r border-[rgba(255,255,255,0.06)] p-3 space-y-0.5">
          {/* Account link — routes to /settings/account */}
          <Link
            href="/settings/account"
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] font-medium transition-all text-[var(--color-text-secondary)] hover:bg-[rgba(255,255,255,0.04)] hover:text-[var(--color-text-primary)]"
          >
            <User size={14} className="text-[var(--color-text-muted)]" />
            Account
          </Link>
          <div className="h-px bg-[rgba(255,255,255,0.05)] my-1 mx-1" />
          {SETTINGS_SECTIONS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              className={cn(
                "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] font-medium transition-all text-left",
                activeSection === id
                  ? "bg-[rgba(124,58,237,0.15)] text-violet-300 border border-[rgba(124,58,237,0.2)]"
                  : "text-[var(--color-text-secondary)] hover:bg-[rgba(255,255,255,0.04)] hover:text-[var(--color-text-primary)]"
              )}
            >
              <Icon size={14} className={activeSection === id ? "text-violet-400" : "text-[var(--color-text-muted)]"} />
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl space-y-5">
            {activeSection === "ai" && (
              <AISettings
                ollamaHost={ollamaHost} setOllamaHost={setOllamaHost}
                defaultModel={defaultModel} setDefaultModel={setDefaultModel}
                temperature={temperature} setTemperature={setTemperature}
                maxTokens={maxTokens} setMaxTokens={setMaxTokens}
                systemPrompt={systemPrompt} setSystemPrompt={setSystemPrompt}
                models={models} ollamaAvailable={ollamaAvailable}
                testingConn={testingConn} onTest={testConnection}
              />
            )}
            {activeSection === "memory" && <MemorySettings />}
            {activeSection === "studio" && (
              <StudioSettings sdHost={sdHost} setSdHost={setSdHost} comfyHost={comfyHost} setComfyHost={setComfyHost} />
            )}
            {activeSection === "system" && <SystemSettings />}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── AI Settings ───────────────────────────────────────────────

function AISettings({ ollamaHost, setOllamaHost, defaultModel, setDefaultModel, temperature, setTemperature, maxTokens, setMaxTokens, systemPrompt, setSystemPrompt, models, ollamaAvailable, testingConn, onTest }: {
  ollamaHost: string; setOllamaHost: (v: string) => void;
  defaultModel: string; setDefaultModel: (v: string) => void;
  temperature: number; setTemperature: (v: number) => void;
  maxTokens: number; setMaxTokens: (v: number) => void;
  systemPrompt: string; setSystemPrompt: (v: string) => void;
  models: { name: string }[]; ollamaAvailable: boolean;
  testingConn: boolean; onTest: () => void;
}) {
  return (
    <>
      <SettingsSection title="Ollama Connection" description="Configure your local Ollama instance">
        <div className="space-y-4">
          <div className="flex items-end gap-3">
            <Input
              label="Ollama Host URL"
              value={ollamaHost}
              onChange={(e) => setOllamaHost(e.target.value)}
              placeholder="http://localhost:11434"
              className="flex-1"
              leftIcon={<Server size={13} />}
            />
            <Button
              variant={ollamaAvailable ? "secondary" : "violet"}
              size="md"
              loading={testingConn}
              onClick={onTest}
              leftIcon={ollamaAvailable ? <Wifi size={13} /> : <WifiOff size={13} />}
            >
              {testingConn ? "Testing…" : ollamaAvailable ? "Connected" : "Test"}
            </Button>
          </div>

          {/* Status */}
          <div className={cn(
            "flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border",
            ollamaAvailable
              ? "bg-[rgba(16,185,129,0.08)] border-[rgba(16,185,129,0.2)]"
              : "bg-[rgba(244,63,94,0.06)] border-[rgba(244,63,94,0.15)]"
          )}>
            <div className={cn("w-2 h-2 rounded-full", ollamaAvailable ? "bg-emerald-400 animate-pulse" : "bg-rose-400")} />
            <p className="text-[12px] font-medium">
              {ollamaAvailable
                ? `Ollama connected · ${models.length} model${models.length !== 1 ? "s" : ""} available`
                : "Ollama not connected. Start Ollama and test the connection."}
            </p>
          </div>

          {/* Models list */}
          {models.length > 0 && (
            <div>
              <label className="block text-[12px] font-medium text-[var(--color-text-secondary)] mb-2">Default Model</label>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {models.map((m) => (
                  <div
                    key={m.name}
                    onClick={() => setDefaultModel(m.name)}
                    className={cn(
                      "flex items-center justify-between px-3.5 py-2.5 rounded-xl border cursor-pointer transition-all",
                      defaultModel === m.name
                        ? "bg-[rgba(124,58,237,0.12)] border-[rgba(124,58,237,0.3)]"
                        : "border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.03)]"
                    )}
                  >
                    <span className="text-[12px] font-mono text-[var(--color-text-primary)]">{m.name}</span>
                    {defaultModel === m.name && <Check size={13} className="text-violet-400" />}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </SettingsSection>

      <SettingsSection title="Generation Parameters" description="Default parameters for AI responses">
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1.5">
              <label className="text-[12px] font-medium text-[var(--color-text-secondary)]">Temperature</label>
              <span className="text-[12px] font-mono text-violet-400">{temperature}</span>
            </div>
            <input type="range" min={0} max={2} step={0.05} value={temperature} onChange={(e) => setTemperature(parseFloat(e.target.value))} className="w-full h-1.5 bg-[rgba(255,255,255,0.08)] rounded-full appearance-none cursor-pointer accent-violet-500" />
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-[var(--color-text-ghost)]">Precise (0)</span>
              <span className="text-[10px] text-[var(--color-text-ghost)]">Creative (2)</span>
            </div>
          </div>
          <Input label="Max Tokens" type="number" value={maxTokens} onChange={(e) => setMaxTokens(parseInt(e.target.value))} />
        </div>
      </SettingsSection>

      <SettingsSection title="System Prompt" description="Default system prompt injected into every conversation">
        <textarea
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          placeholder="You are AYRA, a helpful private AI assistant…"
          rows={5}
          className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-lg text-[13px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] px-3 py-2.5 outline-none resize-none focus:border-[rgba(124,58,237,0.5)] font-mono leading-relaxed"
        />
      </SettingsSection>
    </>
  );
}

// ── Memory Settings ───────────────────────────────────────────

function MemorySettings() {
  return (
    <>
      <SettingsSection title="Memory Behaviour" description="Control how AYRA learns and stores memories">
        <div className="space-y-3">
          {[
            { label: "Auto-extract memories from chats",  desc: "Automatically identify and save important information from conversations", default: true },
            { label: "Inject memories into context",       desc: "Include relevant memories when generating responses",                      default: true },
            { label: "Memory confidence threshold",        desc: "Only save memories above a confidence score",                              default: false },
          ].map((opt) => (
            <ToggleOption key={opt.label} label={opt.label} description={opt.desc} defaultValue={opt.default} />
          ))}
        </div>
      </SettingsSection>

      <SettingsSection title="Memory Management" description="Manage your stored memories">
        <div className="space-y-2">
          <Button variant="secondary" size="sm" leftIcon={<Download size={13} />}>Export All Memories</Button>
          <Button variant="secondary" size="sm" leftIcon={<Upload size={13} />}>Import Memories</Button>
          <Button variant="danger" size="sm" leftIcon={<Trash2 size={13} />}>Clear All Memories</Button>
        </div>
      </SettingsSection>
    </>
  );
}

// ── Studio Settings ───────────────────────────────────────────

function StudioSettings({ sdHost, setSdHost, comfyHost, setComfyHost }: {
  sdHost: string; setSdHost: (v: string) => void;
  comfyHost: string; setComfyHost: (v: string) => void;
}) {
  return (
    <SettingsSection title="Image Generation Endpoints" description="Configure Stable Diffusion and ComfyUI connections">
      <div className="space-y-4">
        <Input label="Stable Diffusion WebUI (A1111)" value={sdHost} onChange={(e) => setSdHost(e.target.value)} placeholder="http://localhost:7860" leftIcon={<Server size={13} />} />
        <Input label="ComfyUI" value={comfyHost} onChange={(e) => setComfyHost(e.target.value)} placeholder="http://localhost:8188" leftIcon={<Server size={13} />} />
        <div className="p-3 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)]">
          <p className="text-[11px] text-[var(--color-text-muted)] leading-relaxed">
            Make sure your image generation service is running and accessible. AYRA supports both Stable Diffusion WebUI (A1111) and ComfyUI. Enable <code className="font-mono text-violet-400 text-[10px] bg-[rgba(124,58,237,0.1)] px-1 py-0.5 rounded">--api</code> flag when starting SD WebUI.
          </p>
        </div>
      </div>
    </SettingsSection>
  );
}

// ── System Settings ───────────────────────────────────────────

function SystemSettings() {
  return (
    <>
      <SettingsSection title="Data & Privacy" description="Your data stays on your machine">
        <div className="p-4 rounded-xl border border-[rgba(16,185,129,0.2)] bg-[rgba(16,185,129,0.06)]">
          <div className="flex items-start gap-3">
            <Shield size={16} className="text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[12px] font-semibold text-emerald-300 mb-1">Fully Private</p>
              <p className="text-[11px] text-[var(--color-text-muted)] leading-relaxed">
                AYRA runs entirely locally. All your data — chats, memories, files, tasks — is stored in your local PostgreSQL database. No data is ever sent to external servers. Your Ollama models run locally on your machine.
              </p>
            </div>
          </div>
        </div>
      </SettingsSection>

      <SettingsSection title="Database" description="Manage your local database">
        <div className="space-y-2">
          <Button variant="secondary" size="sm" leftIcon={<Download size={13} />}>Export All Data</Button>
          <Button variant="secondary" size="sm" leftIcon={<RefreshCw size={13} />}>Run Migrations</Button>
          <Button variant="danger" size="sm" leftIcon={<Trash2 size={13} />}>Reset All Data</Button>
        </div>
      </SettingsSection>

      <SettingsSection title="About" description="AYRA system information">
        <div className="flex items-center gap-4">
          <QuantumOrb size={48} />
          <div>
            <p className="text-[15px] font-bold gradient-text-violet">AYRA</p>
            <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">Private AI Operating System</p>
            <p className="text-[10px] text-[var(--color-text-ghost)] mt-0.5 font-mono">Version 1.0.0</p>
          </div>
        </div>
      </SettingsSection>
    </>
  );
}

// ── Reusable sub-components ───────────────────────────────────

function SettingsSection({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <GlassCard className="p-5">
        <div className="mb-4">
          <h3 className="text-[13px] font-semibold text-[var(--color-text-primary)]">{title}</h3>
          <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">{description}</p>
        </div>
        {children}
      </GlassCard>
    </motion.div>
  );
}

function ToggleOption({ label, description, defaultValue }: { label: string; description: string; defaultValue: boolean }) {
  const [enabled, setEnabled] = useState(defaultValue);
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <div className="flex-1">
        <p className="text-[12px] font-medium text-[var(--color-text-primary)]">{label}</p>
        <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5 leading-relaxed">{description}</p>
      </div>
      <button
        onClick={() => setEnabled(!enabled)}
        className={cn(
          "relative w-10 h-5.5 rounded-full transition-all duration-200 flex-shrink-0 mt-0.5",
          enabled ? "bg-violet-600" : "bg-[rgba(255,255,255,0.1)]"
        )}
        style={{ height: "22px" }}
      >
        <motion.div
          className="absolute top-0.5 w-4.5 h-4.5 bg-white rounded-full shadow-sm"
          animate={{ left: enabled ? "calc(100% - 20px)" : "2px" }}
          transition={{ duration: 0.15 }}
          style={{ width: "18px", height: "18px" }}
        />
      </button>
    </div>
  );
}
