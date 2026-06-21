"use client";

import React, { useState, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import {
  Code2, Play, Sparkles, Upload, FolderOpen, Save,
  Wand2, MessageSquare, Copy, X, ChevronDown,
  FileCode, Plus, Settings2,
} from "lucide-react";
import { PageHeader, GlassCard, Button, Badge, Input, EmptyState } from "@/components/ui";
import { QuantumOrb } from "@/components/ui/QuantumOrb";
import { cn, detectLanguage, copyToClipboard } from "@/lib/utils";
import { useDropzone } from "react-dropzone";
import toast from "react-hot-toast";

// Lazy-load Monaco editor
const MonacoEditor = dynamic(
  () => import("@monaco-editor/react").then((m) => m.default),
  { ssr: false, loading: () => <EditorSkeleton /> }
);

const MONACO_THEME = {
  base: "vs-dark" as const,
  inherit: true,
  rules: [
    { token: "comment",    foreground: "4a4a62", fontStyle: "italic" },
    { token: "keyword",    foreground: "a78bfa", fontStyle: "bold" },
    { token: "string",     foreground: "34d399" },
    { token: "number",     foreground: "fb923c" },
    { token: "type",       foreground: "22d3ee" },
    { token: "function",   foreground: "60a5fa" },
    { token: "variable",   foreground: "f0f0f8" },
    { token: "operator",   foreground: "c4b5fd" },
  ],
  colors: {
    "editor.background":              "#08080c",
    "editor.foreground":              "#f0f0f8",
    "editor.lineHighlightBackground": "#0f0f1a",
    "editorLineNumber.foreground":    "#2a2a40",
    "editorLineNumber.activeForeground": "#7c3aed",
    "editor.selectionBackground":     "#7c3aed40",
    "editor.findMatchBackground":     "#7c3aed60",
    "editorCursor.foreground":        "#a78bfa",
    "editorIndentGuide.background":   "#1a1a28",
    "editorGutter.background":        "#06060a",
    "minimap.background":             "#06060a",
  },
};

interface AIMessage { role: "user" | "assistant"; content: string; }

export default function CodePage() {
  const [code,         setCode]         = useState("// Welcome to AYRA Code Workspace\n// Start coding or ask AI to generate code for you\n\n");
  const [language,     setLanguage]     = useState("typescript");
  const [filename,     setFilename]     = useState("untitled.ts");
  const [aiMessages,   setAiMessages]   = useState<AIMessage[]>([]);
  const [aiInput,      setAiInput]      = useState("");
  const [aiLoading,    setAiLoading]    = useState(false);
  const [showAI,       setShowAI]       = useState(true);
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setCode(e.target?.result as string);
      setFilename(file.name);
      setLanguage(detectLanguage(file.name));
    };
    reader.readAsText(file);
    toast.success(`Loaded ${file.name}`);
  }, []);

  const { getRootProps: getDropProps, getInputProps: getDropInput } = useDropzone({
    onDrop,
    noClick: true,
    noKeyboard: true,
    accept: { "text/*": [] },
  });

  const sendAIMessage = async (input: string, action?: string) => {
    if (!input.trim() && !action) return;

    const userContent = action
      ? `${action}: ${input || "the code above"}\n\n\`\`\`${language}\n${code}\n\`\`\``
      : input;

    const userMsg: AIMessage = { role: "user", content: userContent };
    setAiMessages((prev) => [...prev, userMsg]);
    setAiInput("");
    setAiLoading(true);
    setActiveAction(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...aiMessages, userMsg].map((m) => ({ role: m.role, content: m.content })),
          systemPrompt: `You are an expert ${language} programmer. When providing code, always use proper markdown code blocks with language identifiers. Be concise and practical.`,
        }),
      });

      if (!res.ok || !res.body) throw new Error("Stream failed");

      const reader = res.body.getReader();
      const dec    = new TextDecoder();
      let acc      = "";
      let buf      = "";

      setAiMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const chunk = JSON.parse(line.slice(6));
            if (chunk.type === "text" && chunk.content) {
              acc += chunk.content;
              setAiMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: "assistant", content: acc };
                return updated;
              });
              chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
            }
          } catch { /* skip */ }
        }
      }

      // Auto-extract code block if response contains one
      const codeMatch = acc.match(/```(?:\w+)?\n([\s\S]+?)```/);
      if (codeMatch && action === "Generate") {
        setCode(codeMatch[1]);
        toast.success("Code applied to editor");
      }
    } catch {
      toast.error("AI request failed");
    } finally {
      setAiLoading(false);
    }
  };

  const QUICK_ACTIONS = [
    { label: "Explain",   icon: MessageSquare, action: "Explain this code" },
    { label: "Optimize",  icon: Sparkles,      action: "Optimize this code for performance" },
    { label: "Fix Bugs",  icon: Wand2,         action: "Find and fix bugs in this code" },
    { label: "Add Types", icon: Code2,         action: "Add TypeScript types to this code" },
    { label: "Document",  icon: FileCode,      action: "Add JSDoc comments to this code" },
    { label: "Tests",     icon: Play,          action: "Generate unit tests for this code" },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader
        title="Code Workspace"
        subtitle="AI-powered coding environment"
        icon={<Code2 size={16} />}
        actions={
          <div className="flex items-center gap-2">
            <LanguagePicker value={language} onChange={(l) => { setLanguage(l); setFilename(`untitled.${getExtension(l)}`); }} />
            <label>
              <input type="file" className="hidden" accept=".ts,.tsx,.js,.jsx,.py,.rs,.go,.java,.cpp,.c,.css,.html,.sql,.sh,.md,.json,.yaml" onChange={(e) => { const f = e.target.files?.[0]; if (f) { const r = new FileReader(); r.onload = (ev) => { setCode(ev.target?.result as string); setFilename(f.name); setLanguage(detectLanguage(f.name)); }; r.readAsText(f); } }} />
              <Button variant="secondary" size="sm" leftIcon={<Upload size={13} />} onClick={() => {}}>Upload</Button>
            </label>
            <Button variant="secondary" size="sm" leftIcon={<Save size={13} />} onClick={() => { const blob = new Blob([code], { type: "text/plain" }); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = filename; a.click(); toast.success("File saved"); }}>Save</Button>
            <Button variant="violet" size="sm" leftIcon={showAI ? <X size={13} /> : <Sparkles size={13} />} onClick={() => setShowAI(!showAI)}>{showAI ? "Close AI" : "Open AI"}</Button>
          </div>
        }
      />

      <div className="flex flex-1 overflow-hidden" {...getDropProps()}>
        <input {...getDropInput()} />

        {/* Editor */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* File tab */}
          <div className="flex items-center gap-2 px-4 py-2 border-b border-[rgba(255,255,255,0.06)] bg-[rgba(0,0,0,0.3)]">
            <div className="flex items-center gap-2 px-3 py-1 bg-[rgba(124,58,237,0.1)] border border-[rgba(124,58,237,0.2)] rounded-md">
              <FileCode size={12} className="text-violet-400" />
              <span className="text-[12px] font-mono text-[var(--color-text-secondary)]">{filename}</span>
              <Badge variant="violet" className="text-[9px] py-0">{language}</Badge>
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            <MonacoEditor
              height="100%"
              language={language}
              value={code}
              onChange={(v) => setCode(v ?? "")}
              beforeMount={(monaco) => {
                monaco.editor.defineTheme("ayra", MONACO_THEME);
              }}
              onMount={(editor, monaco) => {
                monaco.editor.setTheme("ayra");
              }}
              options={{
                theme: "ayra",
                fontFamily: "JetBrains Mono, Fira Code, monospace",
                fontSize: 13,
                lineHeight: 22,
                minimap: { enabled: true, scale: 1 },
                scrollBeyondLastLine: false,
                smoothScrolling: true,
                cursorSmoothCaretAnimation: "on",
                cursorBlinking: "smooth",
                padding: { top: 16, bottom: 16 },
                renderLineHighlight: "all",
                lineNumbers: "on",
                roundedSelection: true,
                wordWrap: "off",
                folding: true,
                foldingHighlight: true,
                bracketPairColorization: { enabled: true },
                guides: { bracketPairs: true, indentation: true },
                renderWhitespace: "none",
                tabSize: 2,
                insertSpaces: true,
                autoClosingBrackets: "always",
                autoClosingQuotes: "always",
                formatOnPaste: true,
                suggest: { showKeywords: true },
              }}
            />
          </div>
        </div>

        {/* AI Panel */}
        <AnimatePresence>
          {showAI && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 380, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="flex-shrink-0 border-l border-[rgba(255,255,255,0.06)] flex flex-col overflow-hidden bg-[rgba(5,5,8,0.95)]"
            >
              {/* AI Header */}
              <div className="flex items-center gap-2.5 px-4 py-3 border-b border-[rgba(255,255,255,0.06)]">
                <QuantumOrb size={24} forceState={aiLoading ? "thinking" : "idle"} />
                <div>
                  <p className="text-[12px] font-semibold text-[var(--color-text-primary)]">AI Assistant</p>
                  <p className="text-[10px] text-[var(--color-text-muted)]">{aiLoading ? "Thinking…" : "Ready"}</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="px-3 py-2.5 border-b border-[rgba(255,255,255,0.06)]">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-muted)] mb-2">Quick Actions</p>
                <div className="grid grid-cols-3 gap-1">
                  {QUICK_ACTIONS.map(({ label, icon: Icon, action }) => (
                    <button
                      key={label}
                      onClick={() => sendAIMessage(code, action)}
                      disabled={aiLoading || !code.trim()}
                      className="flex flex-col items-center gap-1 py-2 px-1 rounded-lg hover:bg-[rgba(124,58,237,0.1)] transition-colors disabled:opacity-40 text-[var(--color-text-muted)] hover:text-violet-300"
                    >
                      <Icon size={13} />
                      <span className="text-[9px] font-medium">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {aiMessages.length === 0 ? (
                  <div className="text-center py-8">
                    <Code2 size={24} className="mx-auto text-[var(--color-text-ghost)] mb-2" />
                    <p className="text-[12px] text-[var(--color-text-muted)]">Ask me about your code</p>
                    <p className="text-[11px] text-[var(--color-text-ghost)] mt-1">or use quick actions above</p>
                  </div>
                ) : (
                  aiMessages.map((msg, i) => (
                    <div key={i} className={cn("text-[12px] leading-relaxed", msg.role === "user" ? "text-[var(--color-text-secondary)]" : "text-[var(--color-text-primary)]")}>
                      {msg.role === "user" ? (
                        <div className="bg-[rgba(124,58,237,0.1)] border border-[rgba(124,58,237,0.15)] rounded-lg px-3 py-2">
                          <p className="text-[10px] text-violet-400 mb-1 font-semibold">You</p>
                          <p className="whitespace-pre-wrap">{msg.content.length > 200 ? msg.content.slice(0, 200) + "…" : msg.content}</p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-[10px] text-[var(--color-text-muted)] mb-1 flex items-center gap-1"><QuantumOrb size={12} />AYRA</p>
                          <div className="prose-ayra text-[12px] whitespace-pre-wrap">{msg.content}</div>
                        </div>
                      )}
                    </div>
                  ))
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input */}
              <div className="p-3 border-t border-[rgba(255,255,255,0.06)]">
                <div className="flex gap-2">
                  <input
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendAIMessage(aiInput); } }}
                    placeholder="Ask about code…"
                    disabled={aiLoading}
                    className="flex-1 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-lg text-[12px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] px-3 py-2 outline-none focus:border-[rgba(124,58,237,0.5)] disabled:opacity-40"
                  />
                  <Button variant="violet" size="icon" onClick={() => sendAIMessage(aiInput)} loading={aiLoading}>
                    <Sparkles size={14} />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function EditorSkeleton() {
  return (
    <div className="flex-1 bg-[#08080c] flex items-center justify-center">
      <div className="text-center">
        <Code2 size={28} className="mx-auto text-[var(--color-text-ghost)] mb-2 animate-pulse" />
        <p className="text-[12px] text-[var(--color-text-muted)]">Loading editor…</p>
      </div>
    </div>
  );
}

function LanguagePicker({ value, onChange }: { value: string; onChange: (l: string) => void }) {
  const [open, setOpen] = useState(false);
  const LANGS = ["typescript","javascript","python","rust","go","java","cpp","css","html","sql","shell","markdown","json","yaml"];
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-mono font-medium border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] text-[var(--color-text-secondary)] hover:border-[rgba(255,255,255,0.12)] transition-all">
        {value}<ChevronDown size={11} className={cn("transition-transform", open && "rotate-180")} />
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="absolute right-0 top-full mt-1.5 z-50 w-36 glass-surface rounded-xl border border-[rgba(255,255,255,0.08)] shadow-[var(--shadow-elevated)] py-1 max-h-48 overflow-y-auto">
              {LANGS.map((l) => (
                <button key={l} onClick={() => { onChange(l); setOpen(false); }} className={cn("w-full text-left px-3 py-1.5 text-[11px] font-mono transition-colors", l === value ? "text-violet-300 bg-[rgba(124,58,237,0.1)]" : "text-[var(--color-text-secondary)] hover:bg-[rgba(255,255,255,0.04)]")}>{l}</button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function getExtension(lang: string): string {
  const map: Record<string, string> = { typescript:"ts", javascript:"js", python:"py", rust:"rs", go:"go", java:"java", cpp:"cpp", css:"css", html:"html", sql:"sql", shell:"sh", markdown:"md", json:"json", yaml:"yaml" };
  return map[lang] ?? "txt";
}
