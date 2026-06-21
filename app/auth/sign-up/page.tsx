"use client";

import { useActionState, useRef, useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { signUpWithEmail } from "./actions";
import Link from "next/link";
import { Loader2, ArrowRight, Sparkles, Check } from "lucide-react";

function GlobalStyles() {
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      body { background:#000 !important; margin:0; padding:0; }
      input::placeholder { color:rgba(255,255,255,0.2) !important; }
      input { color-scheme: dark; }
      @keyframes orbFloat1 {
        0%,100% { transform:translate(0,0) scale(1); }
        33%      { transform:translate(-60px,70px) scale(1.12); }
        66%      { transform:translate(80px,-35px) scale(0.9); }
      }
      @keyframes orbFloat2 {
        0%,100% { transform:translate(0,0) scale(1); }
        33%      { transform:translate(50px,-60px) scale(0.88); }
        66%      { transform:translate(-40px,50px) scale(1.1); }
      }
      @keyframes shimmer { from{transform:translateX(-100%)} to{transform:translateX(300%)} }
      @keyframes fadein  { from{opacity:0;transform:translateY(16px);filter:blur(8px)} to{opacity:1;transform:translateY(0);filter:blur(0)} }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);
  return null;
}

function Field({ label, name, type="text", placeholder, autoComplete, hint }: {
  label:string; name:string; type?:string; placeholder:string; autoComplete?:string; hint?:string;
}) {
  return (
    <div>
      <label style={{ display:"block", fontSize:11, fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", color:"rgba(255,255,255,0.32)", marginBottom:8 }}>
        {label}
      </label>
      <input
        name={name} type={type} placeholder={placeholder} autoComplete={autoComplete} required
        style={{
          display:"block", width:"100%", boxSizing:"border-box",
          background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)",
          borderRadius:12, padding:"13px 16px", fontSize:14, color:"#fff",
          outline:"none", transition:"all 0.2s ease",
        }}
        onFocus={e => {
          e.target.style.borderColor = "rgba(124,58,237,0.75)";
          e.target.style.background  = "rgba(124,58,237,0.07)";
          e.target.style.boxShadow   = "0 0 0 3px rgba(124,58,237,0.14)";
        }}
        onBlur={e => {
          e.target.style.borderColor = "rgba(255,255,255,0.1)";
          e.target.style.background  = "rgba(255,255,255,0.05)";
          e.target.style.boxShadow   = "none";
        }}
      />
      {hint && <p style={{ margin:"5px 0 0 2px", fontSize:11, color:"rgba(255,255,255,0.2)" }}>{hint}</p>}
    </div>
  );
}

const PERKS = [
  "100% private — data stays in your own database",
  "Local AI via Ollama or Groq, no tracking",
  "Chat, memory, tasks, vault, code & image studio",
];

export default function SignUpPage() {
  const [state, formAction, isPending] = useActionState(signUpWithEmail, null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const bx = useMotionValue(0);
  const by = useMotionValue(0);
  const sx = useSpring(bx, { stiffness:300, damping:25 });
  const sy = useSpring(by, { stiffness:300, damping:25 });

  const page: React.CSSProperties = {
    position:"fixed", inset:0,
    display:"flex", alignItems:"center", justifyContent:"center",
    fontFamily:"Inter, system-ui, -apple-system, sans-serif",
    background:"#000", overflowY:"auto", padding:"24px 16px",
  };

  return (
    <div style={page}>
      <GlobalStyles />

      {/* Background */}
      <div style={{ position:"fixed", inset:0, pointerEvents:"none", overflow:"hidden" }}>
        <div style={{
          position:"absolute", top:"5%", right:"10%", width:600, height:600, borderRadius:"50%",
          background:"radial-gradient(circle, rgba(124,58,237,0.18) 0%, rgba(124,58,237,0.04) 45%, transparent 70%)",
          filter:"blur(48px)", animation:"orbFloat1 20s ease-in-out infinite",
        }} />
        <div style={{
          position:"absolute", bottom:"8%", left:"5%", width:450, height:450, borderRadius:"50%",
          background:"radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)",
          filter:"blur(48px)", animation:"orbFloat2 26s ease-in-out infinite",
        }} />
        <div style={{
          position:"absolute", inset:0,
          backgroundImage:"radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize:"28px 28px",
        }} />
        <div style={{
          position:"absolute", inset:0,
          background:"radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)",
        }} />
      </div>

      <div style={{ position:"relative", zIndex:10, width:"100%", maxWidth:420 }}>

        {/* Logo */}
        <div style={{
          display:"flex", alignItems:"center", gap:12, justifyContent:"center",
          marginBottom:36, animation:"fadein 0.5s ease both",
        }}>
          <div style={{
            width:46, height:46, borderRadius:14,
            background:"linear-gradient(135deg, rgba(124,58,237,0.35), rgba(124,58,237,0.08))",
            border:"1px solid rgba(124,58,237,0.45)",
            display:"flex", alignItems:"center", justifyContent:"center",
            boxShadow:"0 0 32px rgba(124,58,237,0.28)",
          }}>
            <Sparkles size={20} color="#c4b5fd" />
          </div>
          <span style={{
            fontSize:24, fontWeight:800, letterSpacing:"-0.03em",
            background:"linear-gradient(135deg,#fff 0%,rgba(255,255,255,0.6) 100%)",
            WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
          }}>AYRA</span>
        </div>

        {/* Heading */}
        <div style={{ textAlign:"center", marginBottom:24, animation:"fadein 0.5s 0.06s ease both" }}>
          <h1 style={{
            margin:"0 0 8px", fontSize:30, fontWeight:800, letterSpacing:"-0.03em",
            background:"linear-gradient(160deg,#fff 30%,rgba(255,255,255,0.5) 100%)",
            WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
          }}>Your AI starts here</h1>
          <p style={{ margin:0, fontSize:14, color:"rgba(255,255,255,0.38)" }}>
            Set up your private AI operating system
          </p>
        </div>

        {/* Perks */}
        <div style={{ display:"flex", flexDirection:"column", gap:9, marginBottom:24, animation:"fadein 0.5s 0.1s ease both" }}>
          {PERKS.map(p => (
            <div key={p} style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{
                width:18, height:18, borderRadius:"50%", flexShrink:0,
                background:"rgba(16,185,129,0.12)", border:"1px solid rgba(16,185,129,0.3)",
                display:"flex", alignItems:"center", justifyContent:"center",
              }}>
                <Check size={10} color="#34d399" strokeWidth={3} />
              </div>
              <span style={{ fontSize:13, color:"rgba(255,255,255,0.4)" }}>{p}</span>
            </div>
          ))}
        </div>

        {/* Card */}
        <div style={{
          background:"rgba(255,255,255,0.03)",
          backdropFilter:"blur(32px)", WebkitBackdropFilter:"blur(32px)",
          border:"1px solid rgba(255,255,255,0.08)", borderRadius:24, padding:"28px 26px",
          boxShadow:"0 40px 80px rgba(0,0,0,0.6), 0 1px 0 rgba(255,255,255,0.05) inset",
          animation:"fadein 0.5s 0.14s ease both",
        }}>
          <form action={formAction} style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <Field label="Full name"  name="name"     placeholder="Shariar" autoComplete="name" />
              <Field label="Email"      name="email"    type="email" placeholder="you@example.com" autoComplete="email" />
            </div>
            <Field label="Password"    name="password"  type="password" placeholder="Min. 8 characters" autoComplete="new-password" hint="Letters, numbers and symbols recommended" />
            <Field label="Confirm"     name="confirm"   type="password" placeholder="Repeat password"    autoComplete="new-password" />

            {state?.error && (
              <motion.div
                initial={{ opacity:0, y:-6 }} animate={{ opacity:1, y:0 }}
                style={{
                  display:"flex", alignItems:"center", gap:10,
                  background:"rgba(244,63,94,0.08)", border:"1px solid rgba(244,63,94,0.22)",
                  borderRadius:12, padding:"11px 14px", fontSize:13, color:"#fb7185",
                }}
              >
                <div style={{ width:6, height:6, borderRadius:"50%", background:"#f43f5e", flexShrink:0 }} />
                {state.error}
              </motion.div>
            )}

            {/* Magnetic CTA */}
            <motion.button
              ref={btnRef} type="submit" disabled={isPending}
              onMouseMove={e => {
                if (!btnRef.current) return;
                const r = btnRef.current.getBoundingClientRect();
                bx.set((e.clientX - r.left - r.width / 2) * 0.2);
                by.set((e.clientY - r.top  - r.height / 2) * 0.2);
              }}
              onMouseLeave={() => { bx.set(0); by.set(0); }}
              style={{ x:sx, y:sy, position:"relative", overflow:"hidden", background:"none", border:"none", padding:0, cursor:"pointer", marginTop:4 }}
              whileTap={{ scale:0.97 }}
            >
              <div style={{
                position:"absolute", inset:0, zIndex:1, pointerEvents:"none",
                background:"linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
                animation:"shimmer 2.8s linear infinite",
              }} />
              <div style={{
                position:"relative", zIndex:2,
                display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                background:"linear-gradient(135deg,#6d28d9 0%,#7c3aed 40%,#a855f7 100%)",
                border:"1px solid rgba(168,85,247,0.55)", borderRadius:14,
                padding:"15px 24px", fontSize:14, fontWeight:700, color:"#fff", letterSpacing:"0.015em",
                boxShadow:"0 0 40px rgba(124,58,237,0.4), 0 2px 0 rgba(255,255,255,0.1) inset",
                opacity:isPending ? 0.65 : 1, transition:"opacity 0.2s",
              }}>
                {isPending && <Loader2 size={15} className="animate-spin" />}
                {isPending ? "Creating account…" : "Create account"}
                {!isPending && <ArrowRight size={15} />}
              </div>
            </motion.button>
          </form>
        </div>

        {/* Footer */}
        <div style={{ textAlign:"center", marginTop:22, fontSize:13, color:"rgba(255,255,255,0.25)", animation:"fadein 0.5s 0.22s ease both" }}>
          Already have an account?{" "}
          <Link href="/auth/sign-in" style={{ color:"#a78bfa", textDecoration:"none", fontWeight:600 }}>Sign in →</Link>
        </div>
        <div style={{
          display:"flex", alignItems:"center", justifyContent:"center", gap:7, marginTop:16,
          animation:"fadein 0.5s 0.28s ease both",
        }}>
          <div style={{ width:6, height:6, borderRadius:"50%", background:"#10b981" }} />
          <span style={{ fontSize:11, color:"rgba(255,255,255,0.18)", letterSpacing:"0.06em" }}>
            Zero telemetry · Open source · Self-hosted
          </span>
        </div>
      </div>
    </div>
  );
}