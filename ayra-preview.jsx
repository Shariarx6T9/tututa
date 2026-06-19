import { useState, useEffect, useRef } from "react";

// ── Design tokens ─────────────────────────────────────────────
const T = {
  void:    "#050507",
  s0:      "#08080c",
  s1:      "#0f0f14",
  s2:      "#141419",
  s3:      "#1a1a22",
  border:  "rgba(255,255,255,0.06)",
  borderHi:"rgba(255,255,255,0.11)",
  violet:  "#7c3aed",
  violetLt:"#a78bfa",
  cyan:    "#06b6d4",
  emerald: "#10b981",
  rose:    "#f43f5e",
  amber:   "#f59e0b",
  text:    "#f0f0f8",
  textSec: "#9090a8",
  textMut: "#4a4a62",
  textGhost:"#2a2a3a",
};

// ── Quantum Orb ───────────────────────────────────────────────
function QuantumOrb({ size = 36, state = "idle" }) {
  const ref = useRef(null);
  const animRef = useRef(null);
  const t = useRef(0);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width  = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);
    const cx = size / 2, cy = size / 2, r = size * 0.36;

    const draw = (ts) => {
      t.current = ts * 0.001;
      const spd = state === "speaking" ? 3 : state === "thinking" ? 1.5 : 0.5;
      const int = state === "speaking" ? 1 : state === "thinking" ? 0.7 : 0.45;
      ctx.clearRect(0, 0, size, size);

      for (let ring = 0; ring < 2; ring++) {
        const rr = r * (1.4 + ring * 0.5);
        const alpha = (0.05 - ring * 0.015) * int;
        const rip = Math.sin(t.current * spd + ring * 1.2) * 0.5 + 0.5;
        const g = ctx.createRadialGradient(cx, cy, rr * 0.7, cx, cy, rr);
        g.addColorStop(0, `rgba(139,92,246,${alpha * rip})`);
        g.addColorStop(1, "rgba(139,92,246,0)");
        ctx.beginPath(); ctx.arc(cx, cy, rr, 0, Math.PI * 2);
        ctx.fillStyle = g; ctx.fill();
      }

      const pulse = Math.sin(t.current * spd) * 0.08 + 1;
      const cr = r * pulse;
      const core = ctx.createRadialGradient(cx - cr * 0.25, cy - cr * 0.3, 0, cx, cy, cr);
      if (state === "speaking") {
        core.addColorStop(0, "rgba(200,170,255,0.95)");
        core.addColorStop(0.4, "rgba(139,92,246,0.8)");
        core.addColorStop(1, "rgba(30,10,80,0.15)");
      } else if (state === "thinking") {
        core.addColorStop(0, "rgba(150,220,255,0.9)");
        core.addColorStop(0.4, "rgba(6,182,212,0.75)");
        core.addColorStop(1, "rgba(0,20,60,0.15)");
      } else {
        core.addColorStop(0, "rgba(180,150,255,0.8)");
        core.addColorStop(0.45, "rgba(109,40,217,0.6)");
        core.addColorStop(1, "rgba(10,5,30,0.1)");
      }
      ctx.beginPath(); ctx.arc(cx, cy, cr, 0, Math.PI * 2);
      ctx.fillStyle = core; ctx.fill();

      const spec = ctx.createRadialGradient(cx - cr * 0.28, cy - cr * 0.28, 0, cx - cr * 0.28, cy - cr * 0.28, cr * 0.55);
      spec.addColorStop(0, `rgba(255,255,255,${0.18 * int})`);
      spec.addColorStop(1, "rgba(255,255,255,0)");
      ctx.beginPath(); ctx.arc(cx, cy, cr, 0, Math.PI * 2);
      ctx.fillStyle = spec; ctx.fill();

      if (state !== "idle") {
        const pc = state === "speaking" ? 4 : 3;
        for (let i = 0; i < pc; i++) {
          const angle = t.current * spd * 0.8 + i * (Math.PI * 2 / pc);
          const px = cx + Math.cos(angle) * r * 1.35;
          const py = cy + Math.sin(angle) * r * 0.6;
          ctx.beginPath(); ctx.arc(px, py, 1.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(167,139,250,${0.7 + Math.sin(t.current * 3 + i) * 0.3})`;
          ctx.fill();
        }
      }
      animRef.current = requestAnimationFrame(draw);
    };
    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [size, state]);

  return <canvas ref={ref} style={{ width: size, height: size, flexShrink: 0 }} />;
}

// ── Glass Card ────────────────────────────────────────────────
function Glass({ children, style, className, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: T.s1,
        border: `1px solid ${hovered ? T.borderHi : T.border}`,
        borderRadius: 14,
        boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
        transition: "all 0.15s ease",
        cursor: onClick ? "pointer" : "default",
        ...style,
      }}
      className={className}
    >
      {children}
    </div>
  );
}

// ── Badge ─────────────────────────────────────────────────────
function Badge({ children, color = "violet" }) {
  const colors = {
    violet:  { bg: "rgba(124,58,237,0.18)", text: "#a78bfa", border: "rgba(124,58,237,0.3)" },
    cyan:    { bg: "rgba(6,182,212,0.15)",  text: "#22d3ee", border: "rgba(6,182,212,0.25)" },
    emerald: { bg: "rgba(16,185,129,0.15)", text: "#34d399", border: "rgba(16,185,129,0.25)" },
    rose:    { bg: "rgba(244,63,94,0.15)",  text: "#fb7185", border: "rgba(244,63,94,0.25)" },
    amber:   { bg: "rgba(245,158,11,0.15)", text: "#fbbf24", border: "rgba(245,158,11,0.25)" },
    ghost:   { bg: "rgba(255,255,255,0.05)",text: T.textMut, border: T.border },
  };
  const c = colors[color] || colors.violet;
  return (
    <span style={{
      background: c.bg, color: c.text, border: `1px solid ${c.border}`,
      borderRadius: 6, padding: "1px 7px", fontSize: 10, fontWeight: 600,
      letterSpacing: "0.02em", display: "inline-flex", alignItems: "center", gap: 4,
    }}>
      {children}
    </span>
  );
}

// ── Nav icons ─────────────────────────────────────────────────
const icons = {
  Dashboard: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  Chat:     () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
  Memory:   () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>,
  Tasks:    () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>,
  Vault:    () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>,
  Code:     () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>,
  Studio:   () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
  Settings: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>,
};

const NAV = ["Dashboard","Chat","Memory","Tasks","Vault","Code","Studio"];
const NAV_COLORS = { Dashboard:"#7c3aed", Chat:"#7c3aed", Memory:"#06b6d4", Tasks:"#10b981", Vault:"#f59e0b", Code:"#f43f5e", Studio:"#8b5cf6" };

// ── Main App ──────────────────────────────────────────────────
export default function AYRAPreview() {
  const [active, setActive]     = useState("Dashboard");
  const [orbState, setOrbState] = useState("idle");
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages]   = useState([
    { role: "assistant", text: "Good morning! I'm AYRA, your private AI OS. I've noticed you have 3 tasks due today and 2 new memories from yesterday's session. How can I help?" },
    { role: "user",      text: "Can you summarize what we discussed about the RailMate project?" },
    { role: "assistant", text: "From your memory bank: RailMate Bangladesh is a Next.js marketing site for a railway tracking app. Recent work covered Supabase backend with contact forms, newsletter sign-ups, analytics, and auth. You resolved a Vercel Edge Runtime webpack warning and a TypeScript `never[]` error. The env variable was renamed from `SUPABASE_SERVICE_ROLE_KEY` to `SUPABASE_SECRET_KEY`." },
  ]);
  const [streaming, setStreaming] = useState(false);
  const [newTask, setNewTask]     = useState("");
  const [tasks, setTasks]         = useState([
    { id:1, title:"Review RailMate PR", done:false, priority:"HIGH",   due:"Today" },
    { id:2, title:"Update Supabase schema", done:false, priority:"MEDIUM", due:"Today" },
    { id:3, title:"Write API docs",      done:true,  priority:"LOW",    due:"Yesterday" },
    { id:4, title:"Deploy to Vercel",    done:false, priority:"URGENT", due:"Tomorrow" },
  ]);
  const [notes, setNotes] = useState([
    { id:1, title:"RailMate Architecture", type:"NOTE",   tags:["project","next.js"] },
    { id:2, title:"API Integration Guide", type:"PDF",    tags:["docs"] },
    { id:3, title:"Medical Report 2025",   type:"MEDICAL",tags:["health"] },
    { id:4, title:"DB Schema Notes",       type:"CODE",   tags:["supabase"] },
  ]);
  const [memories] = useState([
    { title:"Works on RailMate Bangladesh", type:"PROJECT", imp:"HIGH" },
    { title:"Uses Next.js App Router + TypeScript", type:"SKILL", imp:"MEDIUM" },
    { title:"Prefers dark IDE themes",       type:"PREFERENCE", imp:"LOW" },
    { title:"Expert in Supabase & Vercel",   type:"SKILL", imp:"HIGH" },
  ]);
  const [cmdOpen, setCmdOpen] = useState(false);
  const chatEndRef = useRef(null);

  const sendChat = () => {
    if (!chatInput.trim()) return;
    setMessages(m => [...m, { role:"user", text: chatInput }]);
    setChatInput("");
    setStreaming(true);
    setOrbState("speaking");
    setTimeout(() => {
      setMessages(m => [...m, { role:"assistant", text:"I understand! Based on your memory context and the RailMate project details, I can help you structure the Next.js architecture. Want me to generate a component breakdown or API route plan?" }]);
      setStreaming(false);
      setOrbState("idle");
    }, 2200);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior:"smooth" });
  }, [messages, streaming]);

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setCmdOpen(c => !c); }
      if (e.key === "Escape") setCmdOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const PRIORITY_COLOR = { URGENT:"#f43f5e", HIGH:"#f59e0b", MEDIUM:"#06b6d4", LOW:"#10b981" };
  const TYPE_COLOR = { NOTE:"#f59e0b", PDF:"#f43f5e", MEDICAL:"#fb7185", CODE:"#8b5cf6" };

  const renderContent = () => {
    if (active === "Dashboard") return <DashboardView tasks={tasks} messages={messages} memories={memories} orbState={orbState} setActive={setActive} />;
    if (active === "Chat")      return <ChatView messages={messages} streaming={streaming} chatInput={chatInput} setChatInput={setChatInput} onSend={sendChat} orbState={orbState} chatEndRef={chatEndRef} />;
    if (active === "Memory")    return <MemoryView memories={memories} />;
    if (active === "Tasks")     return <TasksView tasks={tasks} setTasks={setTasks} PRIORITY_COLOR={PRIORITY_COLOR} newTask={newTask} setNewTask={setNewTask} />;
    if (active === "Vault")     return <VaultView notes={notes} TYPE_COLOR={TYPE_COLOR} />;
    if (active === "Code")      return <CodeView />;
    if (active === "Studio")    return <StudioView />;
    return null;
  };

  return (
    <div style={{ display:"flex", height:"100vh", background: T.void, fontFamily:"Inter, system-ui, sans-serif", overflow:"hidden", position:"relative", color: T.text }}>

      {/* Ambient bg */}
      <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0 }}>
        <div style={{ position:"absolute", top:"-20%", left:"-10%", width:600, height:600, borderRadius:"50%", background:"radial-gradient(circle, #7c3aed 0%, transparent 70%)", opacity:0.025 }} />
        <div style={{ position:"absolute", bottom:"-15%", right:"-10%", width:400, height:400, borderRadius:"50%", background:"radial-gradient(circle, #06b6d4 0%, transparent 70%)", opacity:0.018 }} />
      </div>

      {/* Sidebar */}
      <div style={{ width:220, flexShrink:0, background:"rgba(6,6,10,0.96)", borderRight:`1px solid ${T.border}`, display:"flex", flexDirection:"column", zIndex:100, position:"relative" }}>
        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", gap:10, padding:"14px 14px 12px", borderBottom:`1px solid ${T.border}` }}>
          <QuantumOrb size={30} state={orbState} />
          <div>
            <div style={{ fontSize:14, fontWeight:700, background:"linear-gradient(135deg,#a78bfa,#7c3aed)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>AYRA</div>
            <div style={{ fontSize:9, color: T.textMut, fontFamily:"monospace", marginTop:1 }}>v1.0 · Private AI OS</div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ padding:"8px 8px", flex:1 }}>
          {NAV.map(name => {
            const Icon = icons[name];
            const isActive = name === active;
            const color = NAV_COLORS[name];
            return (
              <div key={name} onClick={() => setActive(name)} style={{
                display:"flex", alignItems:"center", gap:9, padding:"8px 10px", borderRadius:10, cursor:"pointer",
                marginBottom:2,
                background: isActive ? `${color}18` : "transparent",
                border: `1px solid ${isActive ? color + "30" : "transparent"}`,
                color: isActive ? color : T.textSec,
                fontSize:12.5, fontWeight:500,
                transition:"all 0.13s ease",
              }}>
                <Icon />
                {name}
                {isActive && <div style={{ marginLeft:"auto", width:3, height:16, borderRadius:3, background: color }} />}
              </div>
            );
          })}
        </nav>

        {/* Settings */}
        <div style={{ padding:"0 8px 12px" }}>
          <div style={{ height:1, background: T.border, margin:"0 4px 8px" }} />
          <div onClick={() => {}} style={{ display:"flex", alignItems:"center", gap:9, padding:"8px 10px", borderRadius:10, cursor:"pointer", color: T.textMut, fontSize:12.5, fontWeight:500 }}>
            <icons.Settings /><span>Settings</span>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", position:"relative", zIndex:1 }}>
        {renderContent()}
      </div>

      {/* Command palette */}
      {cmdOpen && (
        <div style={{ position:"fixed", inset:0, zIndex:400, display:"flex", alignItems:"flex-start", justifyContent:"center", paddingTop:"15vh" }}>
          <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.7)", backdropFilter:"blur(8px)" }} onClick={() => setCmdOpen(false)} />
          <div style={{ position:"relative", zIndex:10, width:520, background:"rgba(12,12,18,0.98)", border:`1px solid ${T.borderHi}`, borderRadius:18, boxShadow:"0 24px 60px rgba(0,0,0,0.7)", overflow:"hidden" }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, padding:"14px 16px", borderBottom:`1px solid ${T.border}` }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.textMut} strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input autoFocus placeholder="Search commands, chats, tasks…" style={{ flex:1, background:"none", border:"none", outline:"none", color: T.text, fontSize:14 }} />
              <span style={{ fontSize:10, color: T.textMut, border:`1px solid ${T.border}`, borderRadius:5, padding:"2px 6px", fontFamily:"monospace" }}>ESC</span>
            </div>
            <div style={{ padding:"6px 0" }}>
              {[["Navigate", [["Dashboard","#7c3aed"],["Chat","#7c3aed"],["Memory","#06b6d4"],["Tasks","#10b981"]]],
                ["Actions", [["New Chat","#a78bfa"],["Add Task","#22d3ee"],["New Note","#fbbf24"]]]].map(([group, items]) => (
                <div key={group}>
                  <div style={{ padding:"8px 16px 4px", fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", color: T.textMut }}>{group}</div>
                  {items.map(([label, color], i) => (
                    <div key={label} onClick={() => { if (NAV.includes(label)) setActive(label); setCmdOpen(false); }} style={{
                      display:"flex", alignItems:"center", gap:10, padding:"9px 16px", cursor:"pointer",
                      background: i === 0 && group === "Navigate" ? "rgba(124,58,237,0.12)" : "transparent",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,0.04)"}
                    onMouseLeave={e => e.currentTarget.style.background= i===0&&group==="Navigate"?"rgba(124,58,237,0.12)":"transparent"}
                    >
                      <div style={{ width:26, height:26, borderRadius:8, background:`${color}18`, border:`1px solid ${color}30`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                      </div>
                      <span style={{ fontSize:13, color: T.textSec }}>{label}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <div style={{ padding:"10px 16px", borderTop:`1px solid ${T.border}`, background:"rgba(0,0,0,0.2)", display:"flex", gap:16 }}>
              {[["↑↓","Navigate"],["↵","Select"],["⌘K","Open"]].map(([key, label]) => (
                <span key={key} style={{ fontSize:10, color: T.textMut, display:"flex", alignItems:"center", gap:4 }}>
                  <kbd style={{ background: T.s2, border:`1px solid ${T.border}`, borderRadius:4, padding:"1px 5px", fontFamily:"monospace" }}>{key}</kbd>
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ⌘K hint */}
      <div onClick={() => setCmdOpen(true)} style={{
        position:"fixed", bottom:20, right:20, zIndex:200,
        background:"rgba(12,12,18,0.9)", border:`1px solid ${T.border}`,
        borderRadius:10, padding:"7px 12px", cursor:"pointer",
        display:"flex", alignItems:"center", gap:6, fontSize:11, color: T.textMut,
        backdropFilter:"blur(12px)", boxShadow:"0 4px 20px rgba(0,0,0,0.4)",
      }}>
        <kbd style={{ fontFamily:"monospace", fontSize:10 }}>⌘K</kbd>
        Command Palette
      </div>
    </div>
  );
}

// ── Dashboard View ────────────────────────────────────────────
function DashboardView({ tasks, messages, memories, orbState, setActive }) {
  const todayTasks = tasks.filter(t => t.due === "Today" && !t.done);
  return (
    <div style={{ flex:1, overflowY:"auto", padding:"24px 28px" }}>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24 }}>
        <div style={{ display:"flex", alignItems:"center", gap:16 }}>
          <QuantumOrb size={52} state={orbState} />
          <div>
            <h1 style={{ fontSize:22, fontWeight:700, margin:0 }}>Good morning ☀️</h1>
            <p style={{ fontSize:12, color: T.textMut, margin:"3px 0 0" }}>
              {new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})} · AYRA is ready
            </p>
          </div>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <Badge color="amber"><span style={{width:5,height:5,borderRadius:"50%",background:"#fbbf24",display:"inline-block"}} />{todayTasks.length} due today</Badge>
          <Badge color="emerald"><span style={{width:5,height:5,borderRadius:"50%",background:"#34d399",display:"inline-block",animation:"pulse 2s infinite"}} />Ollama connected</Badge>
        </div>
      </div>

      {/* Quick actions */}
      <p style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.12em", color: T.textMut, marginBottom:10 }}>Quick Actions</p>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:8, marginBottom:24 }}>
        {[["💬","New Chat","#7c3aed"],["✅","Add Task","#06b6d4"],["📝","New Note","#f59e0b"],["🎨","Generate Art","#10b981"],["</> ","Code","#f43f5e"],["🧠","Memory","#8b5cf6"]].map(([emoji, label, color]) => (
          <Glass key={label} style={{ padding:"14px 8px", textAlign:"center", cursor:"pointer" }} onClick={() => {}}>
            <div style={{ fontSize:20, marginBottom:6 }}>{emoji}</div>
            <div style={{ fontSize:10.5, fontWeight:600, color: T.textSec }}>{label}</div>
          </Glass>
        ))}
      </div>

      {/* 3-col grid */}
      <p style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.12em", color: T.textMut, marginBottom:10 }}>Overview</p>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, marginBottom:24 }}>
        {/* Today's focus */}
        <Glass style={{ padding:16 }}>
          <div style={{ fontSize:11, fontWeight:700, color: T.textSec, marginBottom:10, display:"flex", alignItems:"center", gap:6 }}>
            <span style={{ color:"#22d3ee" }}>🎯</span> Today's Focus
          </div>
          {todayTasks.map(t => (
            <div key={t.id} style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 0", borderBottom:`1px solid ${T.border}` }}>
              <div style={{ width:14, height:14, borderRadius:"50%", border:`2px solid rgba(255,255,255,0.15)`, flexShrink:0 }} />
              <span style={{ fontSize:11.5, color: T.textSec, flex:1 }}>{t.title}</span>
              <span style={{ fontSize:9, fontWeight:600, color: t.priority==="URGENT"?"#f43f5e":t.priority==="HIGH"?"#fbbf24":"#06b6d4" }}>{t.priority}</span>
            </div>
          ))}
        </Glass>

        {/* Recent chat */}
        <Glass style={{ padding:16 }}>
          <div style={{ fontSize:11, fontWeight:700, color: T.textSec, marginBottom:10, display:"flex", alignItems:"center", gap:6 }}>
            <span style={{ color:"#a78bfa" }}>💬</span> Last Chat
          </div>
          <div style={{ fontSize:11.5, color: T.textMut, lineHeight:1.6, marginBottom:8 }}>
            {messages[messages.length-1]?.text.slice(0,120)}…
          </div>
          <Badge color="violet">llama3.2</Badge>
        </Glass>

        {/* Memory stats */}
        <Glass style={{ padding:16 }}>
          <div style={{ fontSize:11, fontWeight:700, color: T.textSec, marginBottom:10, display:"flex", alignItems:"center", gap:6 }}>
            <span style={{ color:"#fb7185" }}>🧠</span> Memory
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:6, marginBottom:8 }}>
            {[["4","Total","#a78bfa"],["1","Critical","#fb7185"],["2","Pinned","#fbbf24"]].map(([v,l,c]) => (
              <div key={l} style={{ background: T.s2, borderRadius:8, padding:"8px 4px", textAlign:"center" }}>
                <div style={{ fontSize:16, fontWeight:700, color:c }}>{v}</div>
                <div style={{ fontSize:9, color: T.textMut, marginTop:2 }}>{l}</div>
              </div>
            ))}
          </div>
          {memories.slice(0,2).map(m => (
            <div key={m.title} style={{ fontSize:11, color: T.textMut, padding:"4px 0", borderTop:`1px solid ${T.border}` }}>
              <span style={{ color: T.textSec, fontWeight:500 }}>{m.title.slice(0,30)}</span>
            </div>
          ))}
        </Glass>
      </div>

      {/* Module grid */}
      <p style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.12em", color: T.textMut, marginBottom:10 }}>All Modules</p>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:8 }}>
        {[["Dashboard","#7c3aed","🏠","Unified overview"],["Chat","#7c3aed","💬","AI conversations"],["Memory","#06b6d4","🧠","Long-term knowledge"],["Tasks","#10b981","✅","Task manager"],["Vault","#f59e0b","📚","Documents"],["Studio","#8b5cf6","🎨","Image generation"]].map(([name, color, emoji, desc]) => (
          <Glass key={name} style={{ padding:14, cursor:"pointer" }} onClick={() => setActive(name)}>
            <div style={{ fontSize:20, marginBottom:6 }}>{emoji}</div>
            <div style={{ fontSize:11.5, fontWeight:600, color: T.text, marginBottom:2 }}>{name}</div>
            <div style={{ fontSize:9.5, color: T.textMut, lineHeight:1.4 }}>{desc}</div>
          </Glass>
        ))}
      </div>
    </div>
  );
}

// ── Chat View ─────────────────────────────────────────────────
function ChatView({ messages, streaming, chatInput, setChatInput, onSend, orbState, chatEndRef }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%" }}>
      <div style={{ display:"flex", alignItems:"center", gap:12, padding:"14px 20px", borderBottom:`1px solid ${T.border}`, flexShrink:0 }}>
        <QuantumOrb size={28} state={orbState} />
        <div>
          <div style={{ fontSize:13, fontWeight:600 }}>AYRA Chat</div>
          <div style={{ fontSize:10.5, color: T.textMut }}>{streaming ? "Generating…" : `${messages.length} messages · llama3.2`}</div>
        </div>
        <div style={{ marginLeft:"auto" }}><Badge color="emerald">llama3.2</Badge></div>
      </div>

      <div style={{ flex:1, overflowY:"auto", padding:"16px 20px", display:"flex", flexDirection:"column", gap:12 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display:"flex", gap:10, flexDirection: m.role==="user"?"row-reverse":"row", alignItems:"flex-start" }}>
            {m.role === "assistant"
              ? <QuantumOrb size={26} state={i===messages.length-1&&streaming?"speaking":"idle"} />
              : <div style={{ width:26, height:26, borderRadius:"50%", background:"linear-gradient(135deg,#7c3aed,#5b21b6)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontSize:11, fontWeight:700 }}>U</div>
            }
            <div style={{
              maxWidth:560, padding:"11px 14px", borderRadius: m.role==="user"?"16px 4px 16px 16px":"4px 16px 16px 16px",
              background: m.role==="user" ? "rgba(124,58,237,0.2)" : T.s2,
              border: `1px solid ${m.role==="user" ? "rgba(124,58,237,0.3)" : T.border}`,
              fontSize:13, lineHeight:1.65, color: T.text,
            }}>
              {m.text}
              {i===messages.length-1 && streaming && m.role==="assistant" && (
                <span style={{ display:"inline-block", width:2, height:14, background:"#a78bfa", marginLeft:3, animation:"pulse 1s infinite" }} />
              )}
            </div>
          </div>
        ))}
        {streaming && (
          <div style={{ display:"flex", alignItems:"center", gap:8, paddingLeft:36 }}>
            {[0,1,2].map(i => (
              <div key={i} style={{ width:6, height:6, borderRadius:"50%", background:"#7c3aed", opacity:0.6, animation:`bounce ${0.8+i*0.15}s ease infinite` }} />
            ))}
            <span style={{ fontSize:11.5, color: T.textMut }}>AYRA is thinking…</span>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div style={{ padding:"12px 20px", flexShrink:0 }}>
        <Glass style={{ padding:"12px 14px" }}>
          <div style={{ display:"flex", alignItems:"flex-end", gap:10 }}>
            <textarea
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => { if (e.key==="Enter"&&!e.shiftKey) { e.preventDefault(); onSend(); } }}
              placeholder="Message AYRA…"
              rows={1}
              style={{ flex:1, background:"none", border:"none", outline:"none", resize:"none", fontSize:13, color: T.text, lineHeight:1.5, minHeight:24, maxHeight:120, overflowY:"auto" }}
            />
            <button onClick={onSend} disabled={!chatInput.trim()} style={{
              width:34, height:34, borderRadius:10, background: chatInput.trim() ? T.violet : T.s3,
              border:`1px solid ${chatInput.trim() ? "rgba(124,58,237,0.6)" : T.border}`,
              display:"flex", alignItems:"center", justifyContent:"center", cursor: chatInput.trim() ? "pointer" : "not-allowed", flexShrink:0,
              boxShadow: chatInput.trim() ? "0 2px 10px rgba(124,58,237,0.4)" : "none",
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </div>
          <div style={{ marginTop:8, paddingTop:8, borderTop:`1px solid rgba(255,255,255,0.04)`, display:"flex", justifyContent:"space-between" }}>
            <span style={{ fontSize:10, color: T.textGhost }}>↵ Send · ⇧↵ New line · ⌘K Commands</span>
            <span style={{ fontSize:10, color: T.textGhost }}>{chatInput.length > 0 ? `${chatInput.length} chars` : ""}</span>
          </div>
        </Glass>
      </div>
    </div>
  );
}

// ── Memory View ───────────────────────────────────────────────
function MemoryView({ memories }) {
  const IMP_COLOR = { HIGH:"#f59e0b", MEDIUM:"#22d3ee", LOW:"#10b981", CRITICAL:"#f43f5e" };
  return (
    <div style={{ flex:1, overflowY:"auto", padding:"20px 24px" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <div><h2 style={{ margin:0, fontSize:16, fontWeight:700 }}>Memory</h2><p style={{ margin:"3px 0 0", fontSize:11, color: T.textMut }}>Your long-term AI knowledge base</p></div>
        <button style={{ background:"rgba(124,58,237,0.15)", border:"1px solid rgba(124,58,237,0.3)", color:"#a78bfa", padding:"7px 14px", borderRadius:9, fontSize:12, cursor:"pointer", fontWeight:500 }}>+ Add Memory</button>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8, marginBottom:20 }}>
        {[["4","Total","#a78bfa"],["1","Critical","#f43f5e"],["0","Pinned","#fbbf24"],["3","This Week","#34d399"]].map(([v,l,c])=>(
          <Glass key={l} style={{ padding:"14px 16px", textAlign:"center" }}>
            <div style={{ fontSize:22, fontWeight:800, color:c }}>{v}</div>
            <div style={{ fontSize:10, color: T.textMut, marginTop:3 }}>{l}</div>
          </Glass>
        ))}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
        {memories.map((m, i) => (
          <Glass key={i} style={{ padding:"14px 16px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
              <div style={{ width:24, height:24, borderRadius:7, background:"rgba(124,58,237,0.15)", border:"1px solid rgba(124,58,237,0.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12 }}>🧠</div>
              <span style={{ fontSize:12.5, fontWeight:600, color: T.text }}>{m.title}</span>
            </div>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
              <Badge color={m.imp==="HIGH"?"amber":m.imp==="MEDIUM"?"cyan":"ghost"}>{m.imp}</Badge>
              <Badge color="ghost">{m.type}</Badge>
            </div>
          </Glass>
        ))}
      </div>
    </div>
  );
}

// ── Tasks View ────────────────────────────────────────────────
function TasksView({ tasks, setTasks, PRIORITY_COLOR, newTask, setNewTask }) {
  return (
    <div style={{ flex:1, overflowY:"auto", padding:"20px 24px" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <div><h2 style={{ margin:0, fontSize:16, fontWeight:700 }}>Tasks</h2><p style={{ margin:"3px 0 0", fontSize:11, color: T.textMut }}>Your personal task manager</p></div>
        <div style={{ display:"flex", gap:8 }}>
          <button style={{ background:"rgba(255,255,255,0.05)", border:`1px solid ${T.border}`, color: T.textSec, padding:"7px 14px", borderRadius:9, fontSize:12, cursor:"pointer" }}>✨ AI Generate</button>
          <button style={{ background:"rgba(124,58,237,0.15)", border:"1px solid rgba(124,58,237,0.3)", color:"#a78bfa", padding:"7px 14px", borderRadius:9, fontSize:12, cursor:"pointer", fontWeight:500 }}>+ New Task</button>
        </div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:20 }}>
        {[["2","Due Today","#22d3ee"],["0","Overdue","#f43f5e"],["75%","Completed","#34d399"]].map(([v,l,c])=>(
          <Glass key={l} style={{ padding:"12px 16px", textAlign:"center" }}>
            <div style={{ fontSize:20, fontWeight:700, color:c }}>{v}</div>
            <div style={{ fontSize:10, color: T.textMut, marginTop:2 }}>{l}</div>
          </Glass>
        ))}
      </div>
      <div style={{ display:"flex", gap:8, marginBottom:14 }}>
        {["All","To Do","In Progress","Done"].map(s => (
          <button key={s} style={{ padding:"6px 14px", borderRadius:8, fontSize:11.5, fontWeight:500, cursor:"pointer", background: s==="All"?"rgba(124,58,237,0.18)":"transparent", color: s==="All"?"#a78bfa": T.textMut, border: `1px solid ${s==="All"?"rgba(124,58,237,0.3)":"transparent"}` }}>{s}</button>
        ))}
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
        {tasks.map(t => (
          <Glass key={t.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 16px" }} onClick={() => setTasks(tasks.map(x => x.id===t.id?{...x,done:!x.done}:x))}>
            <div style={{ width:18, height:18, borderRadius:"50%", border:`2px solid ${t.done?"#10b981":"rgba(255,255,255,0.2)"}`, background: t.done?"#10b981":"transparent", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, cursor:"pointer" }}>
              {t.done && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5"><polyline points="20 6 9 17 4 12"/></svg>}
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13, fontWeight:500, color: t.done ? T.textMut : T.text, textDecoration: t.done?"line-through":"none" }}>{t.title}</div>
              <div style={{ fontSize:10.5, color: T.textMut, marginTop:2, display:"flex", gap:8 }}>
                <span>📅 {t.due}</span>
              </div>
            </div>
            <div style={{ fontSize:10, fontWeight:700, color: PRIORITY_COLOR[t.priority], border:`1px solid ${PRIORITY_COLOR[t.priority]}30`, background:`${PRIORITY_COLOR[t.priority]}12`, padding:"2px 8px", borderRadius:5 }}>{t.priority}</div>
          </Glass>
        ))}
      </div>
    </div>
  );
}

// ── Vault View ────────────────────────────────────────────────
function VaultView({ notes, TYPE_COLOR }) {
  return (
    <div style={{ flex:1, overflowY:"auto", padding:"20px 24px" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <div><h2 style={{ margin:0, fontSize:16, fontWeight:700 }}>Knowledge Vault</h2><p style={{ margin:"3px 0 0", fontSize:11, color: T.textMut }}>Your private document repository</p></div>
        <div style={{ display:"flex", gap:8 }}>
          <button style={{ background:"rgba(255,255,255,0.05)", border:`1px solid ${T.border}`, color: T.textSec, padding:"7px 14px", borderRadius:9, fontSize:12, cursor:"pointer" }}>📁 Upload</button>
          <button style={{ background:"rgba(124,58,237,0.15)", border:"1px solid rgba(124,58,237,0.3)", color:"#a78bfa", padding:"7px 14px", borderRadius:9, fontSize:12, cursor:"pointer" }}>📝 New Note</button>
        </div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8, marginBottom:20 }}>
        {[["4","Total Items","#a78bfa"],["1","PDFs","#f43f5e"],["2","Notes","#fbbf24"],["1","Medical","#22d3ee"]].map(([v,l,c])=>(
          <Glass key={l} style={{ padding:"14px 16px", textAlign:"center" }}>
            <div style={{ fontSize:20, fontWeight:700, color:c }}>{v}</div>
            <div style={{ fontSize:10, color: T.textMut, marginTop:2 }}>{l}</div>
          </Glass>
        ))}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
        {notes.map((n,i) => (
          <Glass key={i} style={{ padding:"16px" }}>
            <div style={{ width:36, height:36, borderRadius:10, background:`${TYPE_COLOR[n.type] || "#7c3aed"}18`, border:`1px solid ${TYPE_COLOR[n.type] || "#7c3aed"}28`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, marginBottom:10 }}>
              {n.type==="PDF"?"📄":n.type==="MEDICAL"?"❤️":n.type==="CODE"?"💻":"📝"}
            </div>
            <div style={{ fontSize:12.5, fontWeight:600, marginBottom:6, color: T.text }}>{n.title}</div>
            <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
              <Badge color={n.type==="PDF"?"rose":n.type==="MEDICAL"?"rose":n.type==="CODE"?"violet":"amber"}>{n.type}</Badge>
            </div>
          </Glass>
        ))}
      </div>
    </div>
  );
}

// ── Code View ─────────────────────────────────────────────────
function CodeView() {
  const code = `// RailMate Bangladesh API Route
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const trains = await prisma.train.findMany({
    where: { isActive: true },
    include: { stations: true },
    orderBy: { departureTime: "asc" },
  });
  return NextResponse.json(trains);
}`;

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 20px", borderBottom:`1px solid ${T.border}`, flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:28, height:28, borderRadius:8, background:"rgba(244,63,94,0.15)", border:"1px solid rgba(244,63,94,0.25)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>{"</>"}</div>
          <div><div style={{ fontSize:13, fontWeight:600 }}>Code Workspace</div><div style={{ fontSize:10.5, color: T.textMut }}>AI-powered coding environment</div></div>
        </div>
        <div style={{ display:"flex", gap:6 }}>
          <button style={{ background:"rgba(255,255,255,0.05)", border:`1px solid ${T.border}`, color: T.textSec, padding:"6px 12px", borderRadius:8, fontSize:11.5, cursor:"pointer" }}>Upload</button>
          <button style={{ background:"rgba(255,255,255,0.05)", border:`1px solid ${T.border}`, color: T.textSec, padding:"6px 12px", borderRadius:8, fontSize:11.5, cursor:"pointer" }}>Save</button>
          <button style={{ background:"rgba(124,58,237,0.15)", border:"1px solid rgba(124,58,237,0.3)", color:"#a78bfa", padding:"6px 12px", borderRadius:8, fontSize:11.5, cursor:"pointer" }}>✨ AI Assistant</button>
        </div>
      </div>

      <div style={{ display:"flex", flex:1, overflow:"hidden" }}>
        {/* Editor */}
        <div style={{ flex:1, background:"#08080c", overflow:"auto", fontFamily:"JetBrains Mono, monospace", fontSize:13, lineHeight:1.7, padding:20, color:"#e2e8f0" }}>
          <pre style={{ margin:0, whiteSpace:"pre-wrap" }}>
            <span style={{ color:"#4a4a62" }}>{"// RailMate Bangladesh API Route\n"}</span>
            <span style={{ color:"#a78bfa", fontWeight:600 }}>import </span>
            <span>{"{ prisma } "}</span>
            <span style={{ color:"#a78bfa", fontWeight:600 }}>from </span>
            <span style={{ color:"#34d399" }}>"@/lib/prisma"</span>
            <span>{";\n"}</span>
            <span style={{ color:"#a78bfa", fontWeight:600 }}>import </span>
            <span>{"{ NextResponse } "}</span>
            <span style={{ color:"#a78bfa", fontWeight:600 }}>from </span>
            <span style={{ color:"#34d399" }}>"next/server"</span>
            <span>{";\n\n"}</span>
            <span style={{ color:"#a78bfa", fontWeight:600 }}>export async function </span>
            <span style={{ color:"#60a5fa" }}>GET</span>
            <span>{"(req: "}</span>
            <span style={{ color:"#22d3ee" }}>Request</span>
            <span>{"): "}</span>
            <span style={{ color:"#a78bfa", fontWeight:600 }}>Promise</span>
            <span>{"<"}</span>
            <span style={{ color:"#22d3ee" }}>Response</span>
            <span>{">"}</span>
            <span>{" {\n  "}</span>
            <span style={{ color:"#a78bfa", fontWeight:600 }}>const </span>
            <span>{"trains = "}</span>
            <span style={{ color:"#a78bfa", fontWeight:600 }}>await </span>
            <span>{"prisma."}</span>
            <span style={{ color:"#60a5fa" }}>train</span>
            <span>{"."}</span>
            <span style={{ color:"#60a5fa" }}>findMany</span>
            <span>{"({\n    "}</span>
            <span>{"where: { isActive: "}</span>
            <span style={{ color:"#f97316" }}>true </span>
            <span>{"},\n    include: { stations: "}</span>
            <span style={{ color:"#f97316" }}>true </span>
            <span>{"}\n  });\n  "}</span>
            <span style={{ color:"#a78bfa", fontWeight:600 }}>return </span>
            <span>{"NextResponse."}</span>
            <span style={{ color:"#60a5fa" }}>json</span>
            <span>{"(trains);\n}"}</span>
          </pre>
        </div>

        {/* AI Panel */}
        <div style={{ width:300, borderLeft:`1px solid ${T.border}`, background:"rgba(5,5,8,0.95)", display:"flex", flexDirection:"column" }}>
          <div style={{ padding:"12px 14px", borderBottom:`1px solid ${T.border}`, display:"flex", alignItems:"center", gap:8 }}>
            <QuantumOrb size={22} state="idle" />
            <div><div style={{ fontSize:11.5, fontWeight:600 }}>AI Assistant</div><div style={{ fontSize:9.5, color: T.textMut }}>Ready</div></div>
          </div>
          <div style={{ padding:10, borderBottom:`1px solid ${T.border}` }}>
            <div style={{ fontSize:9.5, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", color: T.textMut, marginBottom:8 }}>Quick Actions</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:4 }}>
              {["Explain","Optimize","Fix Bugs","Types","Docs","Tests"].map(a => (
                <button key={a} style={{ padding:"8px 4px", borderRadius:8, background:"transparent", border:`1px solid ${T.border}`, color: T.textMut, fontSize:9.5, cursor:"pointer", textAlign:"center" }}>{a}</button>
              ))}
            </div>
          </div>
          <div style={{ flex:1, padding:"12px 14px", fontSize:11.5, color: T.textMut, lineHeight:1.6 }}>
            This is a clean Next.js API route using Prisma. I can help you add error handling, pagination, or TypeScript types. What would you like to improve?
          </div>
          <div style={{ padding:10, borderTop:`1px solid ${T.border}`, display:"flex", gap:6 }}>
            <input placeholder="Ask about code…" style={{ flex:1, background:"rgba(255,255,255,0.04)", border:`1px solid ${T.border}`, borderRadius:8, padding:"7px 10px", fontSize:11.5, color: T.text, outline:"none" }} />
            <button style={{ width:30, height:30, borderRadius:8, background:"rgba(124,58,237,0.2)", border:"1px solid rgba(124,58,237,0.3)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2.5"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Studio View ───────────────────────────────────────────────
function StudioView() {
  const images = [
    { prompt:"Futuristic Bangladesh city at night, neon lights", gradient:"linear-gradient(135deg,#7c3aed,#06b6d4)" },
    { prompt:"Abstract AI neural network visualization", gradient:"linear-gradient(135deg,#f43f5e,#f59e0b)" },
    { prompt:"Minimalist dark workspace with glowing screens", gradient:"linear-gradient(135deg,#10b981,#06b6d4)" },
    { prompt:"Portrait of a digital consciousness", gradient:"linear-gradient(135deg,#8b5cf6,#ec4899)" },
    { prompt:"Quantum computing abstract art", gradient:"linear-gradient(135deg,#06b6d4,#10b981)" },
    { prompt:"Cyberpunk street scene with rain", gradient:"linear-gradient(135deg,#f43f5e,#7c3aed)" },
  ];
  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 20px", borderBottom:`1px solid ${T.border}`, flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:28, height:28, borderRadius:8, background:"rgba(139,92,246,0.15)", border:"1px solid rgba(139,92,246,0.25)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>🎨</div>
          <div><div style={{ fontSize:13, fontWeight:600 }}>Image Studio</div><div style={{ fontSize:10.5, color: T.textMut }}>Stable Diffusion · ComfyUI</div></div>
        </div>
        <Badge color="emerald">SD Connected</Badge>
      </div>

      <div style={{ display:"flex", flex:1, overflow:"hidden" }}>
        {/* Controls */}
        <div style={{ width:280, borderRight:`1px solid ${T.border}`, overflow:"auto", padding:14 }}>
          <div style={{ marginBottom:12 }}>
            <div style={{ fontSize:9.5, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", color: T.textMut, marginBottom:6 }}>Prompt</div>
            <textarea defaultValue="A cinematic portrait of a futuristic Bangladesh cityscape at night, neon lights reflecting in rain puddles, 8k, photorealistic" rows={4} style={{ width:"100%", background:"rgba(255,255,255,0.04)", border:`1px solid ${T.border}`, borderRadius:9, padding:"9px 10px", fontSize:12, color: T.text, outline:"none", resize:"none", boxSizing:"border-box" }} />
          </div>
          {[["Steps","20",10,50],["CFG Scale","7",1,20]].map(([l,v,min,max]) => (
            <div key={l} style={{ marginBottom:10 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                <span style={{ fontSize:10.5, color: T.textMut }}>{l}</span>
                <span style={{ fontSize:10.5, color:"#a78bfa", fontFamily:"monospace" }}>{v}</span>
              </div>
              <input type="range" min={min} max={max} defaultValue={v} style={{ width:"100%", accentColor:"#7c3aed" }} />
            </div>
          ))}
          <button style={{ width:"100%", background:"rgba(124,58,237,0.2)", border:"1px solid rgba(124,58,237,0.4)", color:"#a78bfa", padding:"11px", borderRadius:10, fontSize:13, cursor:"pointer", fontWeight:600, marginTop:6, boxShadow:"0 2px 12px rgba(124,58,237,0.3)" }}>
            ✨ Generate Image
          </button>
        </div>

        {/* Gallery */}
        <div style={{ flex:1, overflow:"auto", padding:14 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
            {images.map((img, i) => (
              <div key={i} style={{ aspectRatio:"1/1", borderRadius:12, overflow:"hidden", background: img.gradient, position:"relative", cursor:"pointer" }}>
                <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.25)", display:"flex", alignItems:"flex-end", padding:8, opacity:0 }}
                  onMouseEnter={e => e.currentTarget.style.opacity="1"}
                  onMouseLeave={e => e.currentTarget.style.opacity="0"}
                >
                  <p style={{ fontSize:9.5, color:"rgba(255,255,255,0.85)", lineHeight:1.4, margin:0 }}>{img.prompt}</p>
                </div>
                <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:32, opacity:0.3 }}>🖼️</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
