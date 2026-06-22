"use client";

import { useActionState, useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { signUpWithEmail } from "./actions";
import Link from "next/link";
import { Loader2, ArrowRight, Check } from "lucide-react";
import Image from "next/image";

function GlobalStyles() {
  return (
    <style>{`
      body { background:#000 !important; margin:0; padding:0; }
      input::placeholder { color:rgba(255,255,255,0.2) !important; }
      input { color-scheme:dark; }
      @keyframes orbFloat1 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(-60px,70px) scale(1.12)} 66%{transform:translate(80px,-35px) scale(0.9)} }
      @keyframes orbFloat2 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(50px,-60px) scale(0.88)} 66%{transform:translate(-40px,50px) scale(1.1)} }
      @keyframes logoSpin  { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      @keyframes logoPulse { 0%,100%{box-shadow:0 0 24px rgba(180,140,90,0.3),0 0 60px rgba(180,140,90,0.1)} 50%{box-shadow:0 0 40px rgba(180,140,90,0.5),0 0 80px rgba(180,140,90,0.2)} }
      @keyframes shimmer   { from{transform:translateX(-100%)} to{transform:translateX(300%)} }
      @keyframes fadein    { from{opacity:0;transform:translateY(14px);filter:blur(6px)} to{opacity:1;transform:translateY(0);filter:blur(0)} }
    `}</style>
  );
}

function Field({ label, name, type="text", placeholder, autoComplete, hint }: {
  label:string; name:string; type?:string; placeholder:string; autoComplete?:string; hint?:string;
}) {
  return (
    <div>
      <label style={{ display:"block", fontSize:11, fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase" as const, color:"rgba(255,255,255,0.3)", marginBottom:7 }}>
        {label}
      </label>
      <input
        name={name} type={type} placeholder={placeholder} autoComplete={autoComplete} required
        style={{
          display:"block", width:"100%", boxSizing:"border-box" as const,
          background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.09)",
          borderRadius:11, padding:"13px 15px", fontSize:13, color:"#fff",
          outline:"none", transition:"all 0.2s ease",
        }}
        onFocus={e => {
          e.target.style.borderColor = "rgba(180,140,90,0.7)";
          e.target.style.background  = "rgba(180,140,90,0.06)";
          e.target.style.boxShadow   = "0 0 0 3px rgba(180,140,90,0.12)";
        }}
        onBlur={e => {
          e.target.style.borderColor = "rgba(255,255,255,0.09)";
          e.target.style.background  = "rgba(255,255,255,0.05)";
          e.target.style.boxShadow   = "none";
        }}
      />
      {hint && <p style={{ margin:"4px 0 0 2px", fontSize:11, color:"rgba(255,255,255,0.2)" }}>{hint}</p>}
    </div>
  );
}

const PERKS = [
  "100% private — data stays in your own database",
  "Local AI via Ollama or cloud via Groq",
  "Chat, memory, tasks, vault, code & studio",
];

export default function SignUpPage() {
  const [state, formAction, isPending] = useActionState(signUpWithEmail, null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const bx = useMotionValue(0);
  const by = useMotionValue(0);
  const sx = useSpring(bx, { stiffness:300, damping:25 });
  const sy = useSpring(by, { stiffness:300, damping:25 });

  return (
    <div style={{
      position:"fixed", inset:0,
      display:"flex", alignItems:"center", justifyContent:"center",
      fontFamily:"Inter, system-ui, -apple-system, sans-serif",
      background:"#000", overflowY:"auto", padding:"24px 16px",
    }}>
      <GlobalStyles />

      {/* Background */}
      <div style={{ position:"fixed", inset:0, pointerEvents:"none", overflow:"hidden" }}>
        <div style={{
          position:"absolute", top:"-5%", right:"5%", width:650, height:650, borderRadius:"50%",
          background:"radial-gradient(circle, rgba(180,130,60,0.11) 0%, rgba(180,130,60,0.02) 45%, transparent 70%)",
          filter:"blur(60px)", animation:"orbFloat1 20s ease-in-out infinite",
        }} />
        <div style={{
          position:"absolute", bottom:"0%", left:"5%", width:500, height:500, borderRadius:"50%",
          background:"radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%)",
          filter:"blur(60px)", animation:"orbFloat2 26s ease-in-out infinite",
        }} />
        <div style={{
          position:"absolute", inset:0,
          backgroundImage:"radial-gradient(rgba(255,255,255,0.035) 1px, transparent 1px)",
          backgroundSize:"28px 28px",
        }} />
        <div style={{
          position:"absolute", inset:0,
          background:"radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.75) 100%)",
        }} />
      </div>

      <div style={{ position:"relative", zIndex:10, width:"100%", maxWidth:400 }}>

        {/* Logo */}
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", marginBottom:28, animation:"fadein 0.6s ease both" }}>
          <div style={{ position:"relative", marginBottom:14 }}>
            <div style={{
              position:"absolute", inset:-3, borderRadius:"50%",
              background:"conic-gradient(from 0deg, rgba(180,140,90,0.8) 0%, rgba(180,140,90,0.1) 40%, rgba(180,140,90,0.8) 60%, rgba(180,140,90,0.1) 80%, rgba(180,140,90,0.8) 100%)",
              animation:"logoSpin 6s linear infinite",
            }} />
            <div style={{ position:"absolute", inset:-1, borderRadius:"50%", border:"1px solid rgba(180,140,90,0.25)" }} />
            <div style={{ width:72, height:72, borderRadius:"50%", overflow:"hidden", position:"relative", zIndex:1, animation:"logoPulse 4s ease-in-out infinite" }}>
              <Image src="/ayra-logo.jpeg" alt="AYRA" width={72} height={72}
                style={{ width:"100%", height:"100%", objectFit:"cover", borderRadius:"50%" }} priority />
            </div>
          </div>
          <div style={{ textAlign:"center" }}>
            <div style={{
              fontSize:22, fontWeight:800, letterSpacing:"0.12em",
              background:"linear-gradient(135deg, #d4b896 0%, #fff 40%, #c9a87c 80%, #fff 100%)",
              WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
            }}>AYRA</div>
            <div style={{ fontSize:9, letterSpacing:"0.25em", color:"rgba(180,140,90,0.5)", marginTop:3, textTransform:"uppercase" as const, fontWeight:500 }}>— v1.0 —</div>
          </div>
        </div>

        {/* Heading */}
        <div style={{ textAlign:"center", marginBottom:20, animation:"fadein 0.6s 0.07s ease both" }}>
          <h1 style={{
            margin:"0 0 7px", fontSize:26, fontWeight:700, letterSpacing:"-0.02em",
            background:"linear-gradient(160deg,#fff 40%,rgba(255,255,255,0.5) 100%)",
            WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
          }}>Your AI starts here</h1>
          <p style={{ margin:0, fontSize:13, color:"rgba(255,255,255,0.35)" }}>
            Create your private AI operating system
          </p>
        </div>

        {/* Perks */}
        <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:20, animation:"fadein 0.6s 0.1s ease both" }}>
          {PERKS.map(p => (
            <div key={p} style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{
                width:17, height:17, borderRadius:"50%", flexShrink:0,
                background:"rgba(16,185,129,0.12)", border:"1px solid rgba(16,185,129,0.28)",
                display:"flex", alignItems:"center", justifyContent:"center",
              }}>
                <Check size={9} color="#34d399" strokeWidth={3} />
              </div>
              <span style={{ fontSize:12.5, color:"rgba(255,255,255,0.38)" }}>{p}</span>
            </div>
          ))}
        </div>

        {/* Card */}
        <div style={{
          background:"rgba(255,255,255,0.03)",
          backdropFilter:"blur(32px)", WebkitBackdropFilter:"blur(32px)",
          border:"1px solid rgba(255,255,255,0.07)", borderRadius:22, padding:"24px 22px",
          boxShadow:"0 40px 80px rgba(0,0,0,0.6), 0 1px 0 rgba(255,255,255,0.05) inset",
          animation:"fadein 0.6s 0.14s ease both",
        }}>
          <form action={formAction} style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <Field label="Full name" name="name"   placeholder="Shariar" autoComplete="name" />
              <Field label="Email"     name="email"  type="email" placeholder="you@example.com" autoComplete="email" />
            </div>
            <Field label="Password" name="password" type="password" placeholder="Min. 8 characters" autoComplete="new-password" hint="Letters, numbers and symbols" />
            <Field label="Confirm"  name="confirm"  type="password" placeholder="Repeat password" autoComplete="new-password" />

            {state?.error && (
              <motion.div
                initial={{ opacity:0, y:-6 }} animate={{ opacity:1, y:0 }}
                style={{
                  display:"flex", alignItems:"center", gap:10,
                  background:"rgba(244,63,94,0.08)", border:"1px solid rgba(244,63,94,0.22)",
                  borderRadius:11, padding:"11px 14px", fontSize:13, color:"#fb7185",
                }}
              >
                <div style={{ width:6, height:6, borderRadius:"50%", background:"#f43f5e", flexShrink:0 }} />
                {state.error}
              </motion.div>
            )}

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
                background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.09),transparent)",
                animation:"shimmer 3s linear infinite",
              }} />
              <div style={{
                position:"relative", zIndex:2,
                display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                background:"linear-gradient(135deg,#5c1f8a 0%,#7c3aed 45%,#a369f0 100%)",
                border:"1px solid rgba(168,85,247,0.5)", borderRadius:13,
                padding:"15px 24px", fontSize:14, fontWeight:700, color:"#fff", letterSpacing:"0.02em",
                boxShadow:"0 0 36px rgba(124,58,237,0.4), 0 2px 0 rgba(255,255,255,0.08) inset",
                opacity:isPending ? 0.65 : 1, transition:"opacity 0.2s",
              }}>
                {isPending && <Loader2 size={15} className="animate-spin" />}
                {isPending ? "Creating account…" : "Create account"}
                {!isPending && <ArrowRight size={15} />}
              </div>
            </motion.button>
          </form>
        </div>

        <div style={{ textAlign:"center", marginTop:20, fontSize:13, color:"rgba(255,255,255,0.25)", animation:"fadein 0.6s 0.22s ease both" }}>
          Already have an account?{" "}
          <Link href="/auth/sign-in" style={{ color:"#c4a97d", textDecoration:"none", fontWeight:600 }}>Sign in →</Link>
        </div>

        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:7, marginTop:14, animation:"fadein 0.6s 0.28s ease both" }}>
          <div style={{ width:5, height:5, borderRadius:"50%", background:"#10b981" }} />
          <span style={{ fontSize:11, color:"rgba(255,255,255,0.16)", letterSpacing:"0.06em" }}>
            Zero telemetry · Open source · Self-hosted
          </span>
        </div>
      </div>
    </div>
  );
}
