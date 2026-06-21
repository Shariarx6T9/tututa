"use client";

import { useActionState, useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { signUpWithEmail } from "./actions";
import Link from "next/link";
import { Loader2, ArrowRight, Sparkles, Check } from "lucide-react";

function Aurora() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <div style={{ position:"absolute", inset:0, background:"#000000" }} />
      <motion.div
        animate={{ x:[0,-60,80,0], y:[0,80,-40,0], scale:[1,1.15,0.9,1] }}
        transition={{ duration:20, repeat:Infinity, ease:"easeInOut" }}
        style={{
          position:"absolute", top:"5%", right:"10%",
          width:700, height:700, borderRadius:"50%",
          background:"radial-gradient(circle, rgba(124,58,237,0.16) 0%, rgba(124,58,237,0.03) 50%, transparent 70%)",
          filter:"blur(40px)",
        }}
      />
      <motion.div
        animate={{ x:[0,70,-50,0], y:[0,-50,70,0], scale:[1,0.9,1.1,1] }}
        transition={{ duration:25, repeat:Infinity, ease:"easeInOut", delay:5 }}
        style={{
          position:"absolute", bottom:"10%", left:"5%",
          width:500, height:500, borderRadius:"50%",
          background:"radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)",
          filter:"blur(40px)",
        }}
      />
      <div style={{
        position:"absolute", inset:0,
        backgroundImage:"radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)",
        backgroundSize:"32px 32px",
      }} />
      <div style={{
        position:"absolute", inset:0, opacity:0.025,
        backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
      }} />
    </div>
  );
}

function MagneticButton({ children, loading }: { children: React.ReactNode; loading?: boolean }) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness:300, damping:25 });
  const sy = useSpring(y, { stiffness:300, damping:25 });

  return (
    <motion.button
      ref={ref}
      type="submit"
      disabled={loading}
      onMouseMove={e => {
        if (!ref.current) return;
        const r = ref.current.getBoundingClientRect();
        x.set((e.clientX - r.left - r.width / 2) * 0.25);
        y.set((e.clientY - r.top - r.height / 2) * 0.25);
      }}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      style={{ x:sx, y:sy, position:"relative", width:"100%", overflow:"hidden" }}
      whileTap={{ scale:0.97 }}
    >
      <motion.div
        animate={{ x:["-100%","200%"] }}
        transition={{ duration:2.5, repeat:Infinity, ease:"linear", repeatDelay:1.5 }}
        style={{
          position:"absolute", inset:0,
          background:"linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
          pointerEvents:"none",
        }}
      />
      <div style={{
        display:"flex", alignItems:"center", justifyContent:"center", gap:8,
        background:"linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #7c3aed 100%)",
        backgroundSize:"200% 100%",
        border:"1px solid rgba(168,85,247,0.5)",
        borderRadius:14, padding:"14px 24px",
        fontSize:14, fontWeight:700, color:"#fff",
        boxShadow:"0 0 30px rgba(124,58,237,0.35), 0 2px 0 rgba(255,255,255,0.08) inset",
        cursor:loading ? "not-allowed" : "pointer",
        opacity:loading ? 0.7 : 1, transition:"all 0.2s ease",
        letterSpacing:"0.01em",
      }}>
        {loading && <Loader2 size={16} className="animate-spin" />}
        {children}
        {!loading && <ArrowRight size={15} />}
      </div>
    </motion.button>
  );
}

function PremiumInput({ label, name, type="text", placeholder, autoComplete, hint }: {
  label:string; name:string; type?:string; placeholder:string; autoComplete?:string; hint?:string;
}) {
  return (
    <div>
      <label style={{ display:"block", fontSize:11, fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", color:"rgba(255,255,255,0.35)", marginBottom:8 }}>
        {label}
      </label>
      <input
        name={name} type={type} placeholder={placeholder}
        autoComplete={autoComplete} required
        style={{
          width:"100%", background:"rgba(255,255,255,0.04)",
          border:"1px solid rgba(255,255,255,0.08)", borderRadius:12,
          padding:"14px 16px", fontSize:14, color:"#fff",
          outline:"none", transition:"all 0.2s ease", letterSpacing:"0.01em",
        }}
        onFocus={e => {
          e.target.style.borderColor = "rgba(124,58,237,0.7)";
          e.target.style.background  = "rgba(124,58,237,0.06)";
          e.target.style.boxShadow   = "0 0 0 3px rgba(124,58,237,0.12)";
        }}
        onBlur={e => {
          e.target.style.borderColor = "rgba(255,255,255,0.08)";
          e.target.style.background  = "rgba(255,255,255,0.04)";
          e.target.style.boxShadow   = "none";
        }}
      />
      {hint && <p style={{ fontSize:11, color:"rgba(255,255,255,0.2)", marginTop:5, paddingLeft:2 }}>{hint}</p>}
    </div>
  );
}

const perks = [
  "End-to-end private — your data, your database",
  "Local AI via Ollama or cloud via Groq",
  "Memory, tasks, vault, code, and image studio",
];

export default function SignUpPage() {
  const [state, formAction, isPending] = useActionState(signUpWithEmail, null);

  const container = { hidden:{}, show:{ transition:{ staggerChildren:0.07 } } };
  const item = {
    hidden:{ opacity:0, y:20, filter:"blur(8px)" },
    show:  { opacity:1, y:0,  filter:"blur(0px)", transition:{ duration:0.5, ease:[0.16,1,0.3,1] } },
  };

  return (
    <div style={{ minHeight:"100dvh", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"Inter, system-ui, sans-serif", padding:20 }}>
      <Aurora />

      <motion.div
        variants={container} initial="hidden" animate="show"
        style={{ position:"relative", zIndex:10, width:"100%", maxWidth:440 }}
      >
        {/* Logo */}
        <motion.div variants={item} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:36, justifyContent:"center" }}>
          <div style={{
            width:44, height:44, borderRadius:14,
            background:"linear-gradient(135deg, rgba(124,58,237,0.3), rgba(124,58,237,0.1))",
            border:"1px solid rgba(124,58,237,0.4)",
            display:"flex", alignItems:"center", justifyContent:"center",
            boxShadow:"0 0 30px rgba(124,58,237,0.25)",
          }}>
            <Sparkles size={20} color="#a78bfa" />
          </div>
          <span style={{ fontSize:22, fontWeight:800, letterSpacing:"-0.02em", color:"#fff" }}>AYRA</span>
        </motion.div>

        {/* Heading */}
        <motion.div variants={item} style={{ textAlign:"center", marginBottom:28 }}>
          <h1 style={{
            fontSize:30, fontWeight:800, letterSpacing:"-0.03em",
            background:"linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.7) 100%)",
            WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
            margin:"0 0 10px",
          }}>
            Your AI starts here
          </h1>
          <p style={{ fontSize:14, color:"rgba(255,255,255,0.35)", margin:0 }}>
            Create your private AI operating system
          </p>
        </motion.div>

        {/* Perks */}
        <motion.div variants={item} style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:28 }}>
          {perks.map(p => (
            <div key={p} style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{
                width:20, height:20, borderRadius:"50%", flexShrink:0,
                background:"rgba(16,185,129,0.15)", border:"1px solid rgba(16,185,129,0.3)",
                display:"flex", alignItems:"center", justifyContent:"center",
              }}>
                <Check size={11} color="#34d399" strokeWidth={3} />
              </div>
              <span style={{ fontSize:13, color:"rgba(255,255,255,0.45)" }}>{p}</span>
            </div>
          ))}
        </motion.div>

        {/* Card */}
        <motion.div variants={item} style={{
          background:"rgba(255,255,255,0.03)",
          backdropFilter:"blur(24px)", WebkitBackdropFilter:"blur(24px)",
          border:"1px solid rgba(255,255,255,0.08)", borderRadius:24, padding:32,
          boxShadow:"0 32px 64px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.06) inset",
        }}>
          <form action={formAction} style={{ display:"flex", flexDirection:"column", gap:18 }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
              <PremiumInput label="Full name" name="name" placeholder="Shariar" autoComplete="name" />
              <PremiumInput label="Email" name="email" type="email" placeholder="you@example.com" autoComplete="email" />
            </div>
            <PremiumInput label="Password" name="password" type="password" placeholder="Min. 8 characters" autoComplete="new-password" hint="Use letters, numbers and symbols for strength" />
            <PremiumInput label="Confirm password" name="confirm" type="password" placeholder="Repeat password" autoComplete="new-password" />

            {state?.error && (
              <motion.div
                initial={{ opacity:0, y:-8, scale:0.97 }}
                animate={{ opacity:1, y:0,  scale:1 }}
                style={{
                  display:"flex", alignItems:"center", gap:10,
                  background:"rgba(244,63,94,0.08)", border:"1px solid rgba(244,63,94,0.25)",
                  borderRadius:12, padding:"12px 14px", fontSize:13, color:"#fb7185",
                }}
              >
                <div style={{ width:6, height:6, borderRadius:"50%", background:"#f43f5e", flexShrink:0 }} />
                {state.error}
              </motion.div>
            )}

            <div style={{ paddingTop:4 }}>
              <MagneticButton loading={isPending}>
                {isPending ? "Creating account…" : "Create account"}
              </MagneticButton>
            </div>
          </form>
        </motion.div>

        {/* Footer */}
        <motion.p variants={item} style={{ textAlign:"center", marginTop:24, fontSize:13, color:"rgba(255,255,255,0.25)" }}>
          Already have an account?{" "}
          <Link href="/auth/sign-in" style={{ color:"#a78bfa", textDecoration:"none", fontWeight:600 }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color="#c4b5fd"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color="#a78bfa"}
          >
            Sign in →
          </Link>
        </motion.p>

        <motion.div variants={item} style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:6, marginTop:20 }}>
          <div style={{ width:6, height:6, borderRadius:"50%", background:"#10b981" }} />
          <span style={{ fontSize:11, color:"rgba(255,255,255,0.2)", letterSpacing:"0.05em" }}>
            Zero telemetry · Open source · Self-hosted
          </span>
        </motion.div>
      </motion.div>
    </div>
  );
}
