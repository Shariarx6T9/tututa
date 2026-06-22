"use client";

import { useActionState, useRef, useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { signInWithEmail } from "./actions";
import Link from "next/link";
import { Loader2, ArrowRight } from "lucide-react";
import Image from "next/image";

function GlobalStyles() {
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      body { background:#000 !important; margin:0; padding:0; }
      input::placeholder { color:rgba(255,255,255,0.2) !important; }
      input { color-scheme:dark; }
      @keyframes orbFloat1 {
        0%,100% { transform:translate(0,0) scale(1); }
        33%      { transform:translate(60px,-40px) scale(1.15); }
        66%      { transform:translate(-30px,60px) scale(0.9); }
      }
      @keyframes orbFloat2 {
        0%,100% { transform:translate(0,0) scale(1); }
        33%      { transform:translate(-50px,70px) scale(0.85); }
        66%      { transform:translate(80px,-30px) scale(1.1); }
      }
      @keyframes logoSpin {
        from { transform:rotate(0deg); }
        to   { transform:rotate(360deg); }
      }
      @keyframes logoPulse {
        0%,100% { box-shadow: 0 0 24px rgba(180,140,90,0.3), 0 0 60px rgba(180,140,90,0.1); }
        50%      { box-shadow: 0 0 40px rgba(180,140,90,0.5), 0 0 80px rgba(180,140,90,0.2); }
      }
      @keyframes shimmer { from{transform:translateX(-100%)} to{transform:translateX(300%)} }
      @keyframes fadein  { from{opacity:0;transform:translateY(14px);filter:blur(6px)} to{opacity:1;transform:translateY(0);filter:blur(0)} }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);
  return null;
}

function Field({ label, name, type="text", placeholder, autoComplete }: {
  label:string; name:string; type?:string; placeholder:string; autoComplete?:string;
}) {
  return (
    <div>
      <label style={{ display:"block", fontSize:11, fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase" as const, color:"rgba(255,255,255,0.3)", marginBottom:8 }}>
        {label}
      </label>
      <input
        name={name} type={type} placeholder={placeholder} autoComplete={autoComplete} required
        style={{
          display:"block", width:"100%", boxSizing:"border-box" as const,
          background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.09)",
          borderRadius:12, padding:"14px 16px", fontSize:14, color:"#fff",
          outline:"none", transition:"all 0.2s ease", letterSpacing:"0.01em",
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
    </div>
  );
}

export default function SignInPage() {
  const [state, formAction, isPending] = useActionState(signInWithEmail, null);
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

      {/* ── Aurora background ── */}
      <div style={{ position:"fixed", inset:0, pointerEvents:"none", overflow:"hidden" }}>
        {/* Warm gold orb top-right */}
        <div style={{
          position:"absolute", top:"-5%", right:"5%", width:700, height:700, borderRadius:"50%",
          background:"radial-gradient(circle, rgba(180,130,60,0.12) 0%, rgba(180,130,60,0.03) 45%, transparent 70%)",
          filter:"blur(60px)", animation:"orbFloat1 22s ease-in-out infinite",
        }} />
        {/* Cool violet orb bottom-left */}
        <div style={{
          position:"absolute", bottom:"0%", left:"5%", width:550, height:550, borderRadius:"50%",
          background:"radial-gradient(circle, rgba(124,58,237,0.1) 0%, rgba(124,58,237,0.02) 50%, transparent 70%)",
          filter:"blur(60px)", animation:"orbFloat2 28s ease-in-out infinite",
        }} />
        {/* Dot grid */}
        <div style={{
          position:"absolute", inset:0,
          backgroundImage:"radial-gradient(rgba(255,255,255,0.035) 1px, transparent 1px)",
          backgroundSize:"28px 28px",
        }} />
        {/* Radial vignette */}
        <div style={{
          position:"absolute", inset:0,
          background:"radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.75) 100%)",
        }} />
      </div>

      {/* ── Content ── */}
      <div style={{ position:"relative", zIndex:10, width:"100%", maxWidth:380 }}>

        {/* ── LOGO ── */}
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", marginBottom:36, animation:"fadein 0.6s ease both" }}>
          {/* Circular logo with gold ring */}
          <div style={{ position:"relative", marginBottom:18 }}>
            {/* Spinning outer ring */}
            <div style={{
              position:"absolute", inset:-3,
              borderRadius:"50%",
              background:"conic-gradient(from 0deg, rgba(180,140,90,0.8) 0%, rgba(180,140,90,0.1) 40%, rgba(180,140,90,0.8) 60%, rgba(180,140,90,0.1) 80%, rgba(180,140,90,0.8) 100%)",
              animation:"logoSpin 6s linear infinite",
            }} />
            {/* Static gold ring */}
            <div style={{
              position:"absolute", inset:-1, borderRadius:"50%",
              border:"1px solid rgba(180,140,90,0.3)",
            }} />
            {/* Image */}
            <div style={{
              width:88, height:88, borderRadius:"50%", overflow:"hidden",
              position:"relative", zIndex:1,
              animation:"logoPulse 4s ease-in-out infinite",
            }}>
              <Image
                src="/ayra-logo.jpeg"
                alt="AYRA"
                width={88} height={88}
                style={{ width:"100%", height:"100%", objectFit:"cover", borderRadius:"50%" }}
                priority
              />
            </div>
          </div>

          {/* Wordmark */}
          <div style={{ textAlign:"center" }}>
            <div style={{
              fontSize:28, fontWeight:800, letterSpacing:"0.12em",
              background:"linear-gradient(135deg, #d4b896 0%, #fff 40%, #c9a87c 80%, #fff 100%)",
              WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
              lineHeight:1,
            }}>
              AYRA
            </div>
            <div style={{ fontSize:10, letterSpacing:"0.25em", color:"rgba(180,140,90,0.6)", marginTop:5, textTransform:"uppercase" as const, fontWeight:500 }}>
              — v1.0 —
            </div>
          </div>
        </div>

        {/* Heading */}
        <div style={{ textAlign:"center", marginBottom:28, animation:"fadein 0.6s 0.08s ease both" }}>
          <h1 style={{
            margin:"0 0 8px", fontSize:26, fontWeight:700, letterSpacing:"-0.02em",
            background:"linear-gradient(160deg,#fff 40%,rgba(255,255,255,0.5) 100%)",
            WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
          }}>Welcome back</h1>
          <p style={{ margin:0, fontSize:13, color:"rgba(255,255,255,0.35)", letterSpacing:"0.01em" }}>
            Sign in to your private AI system
          </p>
        </div>

        {/* Glass card */}
        <div style={{
          background:"rgba(255,255,255,0.03)",
          backdropFilter:"blur(32px)", WebkitBackdropFilter:"blur(32px)",
          border:"1px solid rgba(255,255,255,0.07)",
          borderRadius:22, padding:"28px 26px",
          boxShadow:"0 40px 80px rgba(0,0,0,0.6), 0 1px 0 rgba(255,255,255,0.05) inset",
          animation:"fadein 0.6s 0.14s ease both",
        }}>
          <form action={formAction} style={{ display:"flex", flexDirection:"column", gap:18 }}>
            <Field label="Email address" name="email" type="email" placeholder="you@example.com" autoComplete="email" />
            <Field label="Password"      name="password" type="password" placeholder="••••••••" autoComplete="current-password" />

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

            {/* CTA button */}
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
              {/* shimmer */}
              <div style={{
                position:"absolute", inset:0, zIndex:1, pointerEvents:"none",
                background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.09),transparent)",
                animation:"shimmer 3s linear infinite",
              }} />
              <div style={{
                position:"relative", zIndex:2,
                display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                background:"linear-gradient(135deg, #5c1f8a 0%, #7c3aed 45%, #a369f0 100%)",
                border:"1px solid rgba(168,85,247,0.5)", borderRadius:13,
                padding:"15px 24px", fontSize:14, fontWeight:700, color:"#fff", letterSpacing:"0.02em",
                boxShadow:"0 0 36px rgba(124,58,237,0.4), 0 2px 0 rgba(255,255,255,0.08) inset",
                opacity:isPending ? 0.65 : 1, transition:"opacity 0.2s",
              }}>
                {isPending && <Loader2 size={15} className="animate-spin" />}
                {isPending ? "Signing in…" : "Sign in"}
                {!isPending && <ArrowRight size={15} />}
              </div>
            </motion.button>
          </form>
        </div>

        {/* Footer */}
        <div style={{ textAlign:"center", marginTop:22, fontSize:13, color:"rgba(255,255,255,0.25)", animation:"fadein 0.6s 0.22s ease both" }}>
          No account?{" "}
          <Link href="/auth/sign-up" style={{ color:"#c4a97d", textDecoration:"none", fontWeight:600 }}>
            Create one →
          </Link>
        </div>

        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:7, marginTop:16, animation:"fadein 0.6s 0.28s ease both" }}>
          <div style={{ width:5, height:5, borderRadius:"50%", background:"#10b981" }} />
          <span style={{ fontSize:11, color:"rgba(255,255,255,0.16)", letterSpacing:"0.06em" }}>
            End-to-end private · Stored in your Neon database
          </span>
        </div>
      </div>
    </div>
  );
}
