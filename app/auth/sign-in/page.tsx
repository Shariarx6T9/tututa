"use client";

import { useActionState, useRef, useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { signInWithEmail } from "./actions";
import Link from "next/link";
import { Loader2, ArrowRight, Sparkles } from "lucide-react";

/* ── CSS injected once to handle input placeholders + body bg ── */
function GlobalStyles() {
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      body { background: #000 !important; margin: 0; padding: 0; }
      input::placeholder { color: rgba(255,255,255,0.2) !important; }
      input { color-scheme: dark; }
      @keyframes orbFloat1 {
        0%,100% { transform: translate(0,0) scale(1); }
        33%      { transform: translate(60px,-40px) scale(1.15); }
        66%      { transform: translate(-30px,60px) scale(0.9); }
      }
      @keyframes orbFloat2 {
        0%,100% { transform: translate(0,0) scale(1); }
        33%      { transform: translate(-50px,70px) scale(0.85); }
        66%      { transform: translate(80px,-30px) scale(1.1); }
      }
      @keyframes shimmer {
        from { transform: translateX(-100%); }
        to   { transform: translateX(300%); }
      }
      @keyframes fadein {
        from { opacity:0; transform:translateY(16px); filter:blur(8px); }
        to   { opacity:1; transform:translateY(0);    filter:blur(0); }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);
  return null;
}

export default function SignInPage() {
  const [state, formAction, isPending] = useActionState(signInWithEmail, null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const bx = useMotionValue(0);
  const by = useMotionValue(0);
  const sx = useSpring(bx, { stiffness: 300, damping: 25 });
  const sy = useSpring(by, { stiffness: 300, damping: 25 });

  /* page wrapper — true viewport-fill centering */
  const page: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "Inter, system-ui, -apple-system, sans-serif",
    background: "#000",
    overflow: "auto",
    padding: "24px 16px",
  };

  return (
    <div style={page}>
      <GlobalStyles />

      {/* ── Background orbs ── */}
      <div style={{ position:"fixed", inset:0, pointerEvents:"none", overflow:"hidden" }}>
        {/* Orb violet */}
        <div style={{
          position:"absolute", top:"8%", left:"12%",
          width:640, height:640, borderRadius:"50%",
          background:"radial-gradient(circle, rgba(124,58,237,0.2) 0%, rgba(124,58,237,0.05) 45%, transparent 70%)",
          filter:"blur(48px)",
          animation:"orbFloat1 18s ease-in-out infinite",
        }} />
        {/* Orb cyan */}
        <div style={{
          position:"absolute", top:"45%", right:"8%",
          width:480, height:480, borderRadius:"50%",
          background:"radial-gradient(circle, rgba(6,182,212,0.14) 0%, rgba(6,182,212,0.03) 50%, transparent 70%)",
          filter:"blur(48px)",
          animation:"orbFloat2 24s ease-in-out infinite",
        }} />
        {/* Dot grid */}
        <div style={{
          position:"absolute", inset:0,
          backgroundImage:"radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize:"28px 28px",
        }} />
        {/* Vignette */}
        <div style={{
          position:"absolute", inset:0,
          background:"radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)",
        }} />
      </div>

      {/* ── Card wrapper ── */}
      <div style={{ position:"relative", zIndex:10, width:"100%", maxWidth:400 }}>

        {/* Logo */}
        <div style={{
          display:"flex", alignItems:"center", gap:12, justifyContent:"center",
          marginBottom:44,
          animation:"fadein 0.5s ease both",
        }}>
          <div style={{
            width:46, height:46, borderRadius:14, flexShrink:0,
            background:"linear-gradient(135deg, rgba(124,58,237,0.35), rgba(124,58,237,0.08))",
            border:"1px solid rgba(124,58,237,0.45)",
            display:"flex", alignItems:"center", justifyContent:"center",
            boxShadow:"0 0 32px rgba(124,58,237,0.28), 0 0 8px rgba(124,58,237,0.5) inset",
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
        <div style={{
          textAlign:"center", marginBottom:32,
          animation:"fadein 0.5s 0.06s ease both",
        }}>
          <h1 style={{
            margin:"0 0 8px", fontSize:34, fontWeight:800, letterSpacing:"-0.03em",
            background:"linear-gradient(160deg, #fff 30%, rgba(255,255,255,0.55) 100%)",
            WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
          }}>
            Welcome back
          </h1>
          <p style={{ margin:0, fontSize:14, color:"rgba(255,255,255,0.38)", letterSpacing:"0.01em" }}>
            Sign in to your private AI system
          </p>
        </div>

        {/* Glass card */}
        <div style={{
          background:"rgba(255,255,255,0.03)",
          backdropFilter:"blur(32px)", WebkitBackdropFilter:"blur(32px)",
          border:"1px solid rgba(255,255,255,0.08)",
          borderRadius:24, padding:"32px 28px",
          boxShadow:"0 40px 80px rgba(0,0,0,0.6), 0 1px 0 rgba(255,255,255,0.05) inset",
          animation:"fadein 0.5s 0.12s ease both",
        }}>
          <form action={formAction} style={{ display:"flex", flexDirection:"column", gap:20 }}>

            {/* Email */}
            <Field label="Email address" name="email" type="email" placeholder="you@example.com" autoComplete="email" />

            {/* Password */}
            <Field label="Password" name="password" type="password" placeholder="••••••••" autoComplete="current-password" />

            {/* Error */}
            {state?.error && (
              <div style={{
                display:"flex", alignItems:"center", gap:10,
                background:"rgba(244,63,94,0.08)", border:"1px solid rgba(244,63,94,0.22)",
                borderRadius:12, padding:"12px 14px", fontSize:13, color:"#fb7185",
              }}>
                <div style={{ width:6, height:6, borderRadius:"50%", background:"#f43f5e", flexShrink:0 }} />
                {state.error}
              </div>
            )}

            {/* Button */}
            <motion.button
              ref={btnRef}
              type="submit"
              disabled={isPending}
              onMouseMove={e => {
                if (!btnRef.current) return;
                const r = btnRef.current.getBoundingClientRect();
                bx.set((e.clientX - r.left - r.width / 2) * 0.2);
                by.set((e.clientY - r.top - r.height / 2) * 0.2);
              }}
              onMouseLeave={() => { bx.set(0); by.set(0); }}
              style={{ x:sx, y:sy, position:"relative", overflow:"hidden", background:"none", border:"none", padding:0, cursor:"pointer", marginTop:4 }}
              whileTap={{ scale: 0.97 }}
            >
              {/* Shimmer sweep */}
              <div style={{
                position:"absolute", inset:0, zIndex:1,
                background:"linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)",
                animation:"shimmer 2.8s linear infinite",
                pointerEvents:"none",
              }} />
              <div style={{
                position:"relative", zIndex:2,
                display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                background:"linear-gradient(135deg, #6d28d9 0%, #7c3aed 40%, #a855f7 100%)",
                border:"1px solid rgba(168,85,247,0.55)",
                borderRadius:14, padding:"15px 24px",
                fontSize:14, fontWeight:700, color:"#fff", letterSpacing:"0.015em",
                boxShadow:"0 0 40px rgba(124,58,237,0.4), 0 2px 0 rgba(255,255,255,0.1) inset",
                opacity: isPending ? 0.65 : 1, transition:"opacity 0.2s",
              }}>
                {isPending ? <Loader2 size={15} className="animate-spin" /> : null}
                {isPending ? "Signing in…" : "Sign in"}
                {!isPending && <ArrowRight size={15} />}
              </div>
            </motion.button>
          </form>
        </div>

        {/* Footer links */}
        <div style={{
          textAlign:"center", marginTop:24, fontSize:13,
          color:"rgba(255,255,255,0.25)",
          animation:"fadein 0.5s 0.22s ease both",
        }}>
          No account?{" "}
          <Link href="/auth/sign-up" style={{ color:"#a78bfa", textDecoration:"none", fontWeight:600 }}>
            Create one →
          </Link>
        </div>

        <div style={{
          display:"flex", alignItems:"center", justifyContent:"center", gap:7, marginTop:18,
          animation:"fadein 0.5s 0.28s ease both",
        }}>
          <div style={{ width:6, height:6, borderRadius:"50%", background:"#10b981", flexShrink:0 }} />
          <span style={{ fontSize:11, color:"rgba(255,255,255,0.18)", letterSpacing:"0.06em" }}>
            End-to-end private · Stored in your Neon database
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── Shared field component ─────────────────────────────── */
function Field({ label, name, type, placeholder, autoComplete }: {
  label:string; name:string; type:string; placeholder:string; autoComplete?:string;
}) {
  return (
    <div>
      <label style={{
        display:"block", fontSize:11, fontWeight:600,
        letterSpacing:"0.08em", textTransform:"uppercase",
        color:"rgba(255,255,255,0.32)", marginBottom:8,
      }}>
        {label}
      </label>
      <input
        name={name} type={type} placeholder={placeholder}
        autoComplete={autoComplete} required
        style={{
          display:"block", width:"100%", boxSizing:"border-box",
          background:"rgba(255,255,255,0.05)",
          border:"1px solid rgba(255,255,255,0.1)",
          borderRadius:12, padding:"14px 16px",
          fontSize:14, color:"#fff",
          outline:"none", transition:"border-color 0.2s, box-shadow 0.2s, background 0.2s",
          letterSpacing:"0.01em",
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
    </div>
  );
}