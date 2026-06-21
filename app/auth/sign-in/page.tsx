"use client";

import { useActionState, useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { signInWithEmail } from "./actions";
import Link from "next/link";
import { Loader2, ArrowRight, Sparkles } from "lucide-react";

/* ── Animated aurora background ─────────────────────────── */
function Aurora() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Base */}
      <div style={{ position:"absolute", inset:0, background:"#000000" }} />

      {/* Orb 1 — violet */}
      <motion.div
        animate={{ x:[0,80,-40,0], y:[0,-60,40,0], scale:[1,1.2,0.9,1] }}
        transition={{ duration:18, repeat:Infinity, ease:"easeInOut" }}
        style={{
          position:"absolute", top:"10%", left:"15%",
          width:700, height:700, borderRadius:"50%",
          background:"radial-gradient(circle, rgba(124,58,237,0.18) 0%, rgba(124,58,237,0.04) 50%, transparent 70%)",
          filter:"blur(40px)",
        }}
      />
      {/* Orb 2 — cyan */}
      <motion.div
        animate={{ x:[0,-60,80,0], y:[0,80,-40,0], scale:[1,0.85,1.15,1] }}
        transition={{ duration:22, repeat:Infinity, ease:"easeInOut", delay:3 }}
        style={{
          position:"absolute", top:"50%", right:"10%",
          width:500, height:500, borderRadius:"50%",
          background:"radial-gradient(circle, rgba(6,182,212,0.12) 0%, rgba(6,182,212,0.03) 50%, transparent 70%)",
          filter:"blur(40px)",
        }}
      />
      {/* Orb 3 — rose */}
      <motion.div
        animate={{ x:[0,40,-80,0], y:[0,-40,60,0], scale:[1,1.1,0.95,1] }}
        transition={{ duration:26, repeat:Infinity, ease:"easeInOut", delay:7 }}
        style={{
          position:"absolute", bottom:"5%", left:"30%",
          width:400, height:400, borderRadius:"50%",
          background:"radial-gradient(circle, rgba(244,63,94,0.08) 0%, transparent 70%)",
          filter:"blur(40px)",
        }}
      />

      {/* Dot grid */}
      <div style={{
        position:"absolute", inset:0,
        backgroundImage:"radial-gradient(circle, rgba(255,255,255,0.035) 1px, transparent 1px)",
        backgroundSize:"32px 32px",
      }} />

      {/* Top vignette */}
      <div style={{
        position:"absolute", top:0, left:0, right:0, height:200,
        background:"linear-gradient(to bottom, rgba(0,0,0,0.6), transparent)",
      }} />

      {/* Noise */}
      <div style={{
        position:"absolute", inset:0, opacity:0.025,
        backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
      }} />
    </div>
  );
}

/* ── Magnetic button ─────────────────────────────────────── */
function MagneticButton({ children, loading, onClick }: { children: React.ReactNode; loading?: boolean; onClick?: () => void }) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 300, damping: 25 });
  const sy = useSpring(y, { stiffness: 300, damping: 25 });

  const handleMouse = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    x.set((e.clientX - cx) * 0.25);
    y.set((e.clientY - cy) * 0.25);
  };

  return (
    <motion.button
      ref={ref}
      type="submit"
      disabled={loading}
      onMouseMove={handleMouse}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      style={{ x: sx, y: sy }}
      whileTap={{ scale: 0.97 }}
      className="relative w-full overflow-hidden"
    >
      {/* Shimmer */}
      <motion.div
        animate={{ x: ["-100%", "200%"] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
        style={{
          position:"absolute", inset:0,
          background:"linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)",
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
        cursor: loading ? "not-allowed" : "pointer",
        opacity: loading ? 0.7 : 1,
        transition:"all 0.2s ease",
        letterSpacing:"0.01em",
      }}>
        {loading ? <Loader2 size={16} className="animate-spin" /> : null}
        {children}
        {!loading && <ArrowRight size={15} />}
      </div>
    </motion.button>
  );
}

/* ── Premium input ───────────────────────────────────────── */
function PremiumInput({ label, name, type = "text", placeholder, autoComplete }: {
  label: string; name: string; type?: string; placeholder: string; autoComplete?: string;
}) {
  return (
    <div style={{ position:"relative" }}>
      <label style={{ display:"block", fontSize:11, fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", color:"rgba(255,255,255,0.35)", marginBottom:8 }}>
        {label}
      </label>
      <input
        name={name} type={type} placeholder={placeholder}
        autoComplete={autoComplete} required
        style={{
          width:"100%", background:"rgba(255,255,255,0.04)",
          border:"1px solid rgba(255,255,255,0.08)",
          borderRadius:12, padding:"14px 16px",
          fontSize:14, color:"#fff",
          outline:"none", transition:"all 0.2s ease",
          letterSpacing:"0.01em",
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
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────── */
export default function SignInPage() {
  const [state, formAction, isPending] = useActionState(signInWithEmail, null);

  const containerVariants = {
    hidden: {},
    show:   { transition: { staggerChildren: 0.07 } },
  };
  const itemVariants = {
    hidden: { opacity:0, y:20, filter:"blur(8px)" },
    show:   { opacity:1, y:0,  filter:"blur(0px)", transition:{ duration:0.5, ease:[0.16,1,0.3,1] } },
  };

  return (
    <div style={{ minHeight:"100dvh", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"Inter, system-ui, sans-serif", padding:20 }}>
      <Aurora />

      <motion.div
        variants={containerVariants} initial="hidden" animate="show"
        style={{ position:"relative", zIndex:10, width:"100%", maxWidth:420 }}
      >
        {/* Logo mark */}
        <motion.div variants={itemVariants} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:40, justifyContent:"center" }}>
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
        <motion.div variants={itemVariants} style={{ textAlign:"center", marginBottom:36 }}>
          <h1 style={{
            fontSize:32, fontWeight:800, letterSpacing:"-0.03em",
            background:"linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.7) 100%)",
            WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
            margin:"0 0 10px",
          }}>
            Welcome back
          </h1>
          <p style={{ fontSize:14, color:"rgba(255,255,255,0.4)", margin:0, letterSpacing:"0.01em" }}>
            Sign in to your private AI system
          </p>
        </motion.div>

        {/* Card */}
        <motion.div variants={itemVariants} style={{
          background:"rgba(255,255,255,0.03)",
          backdropFilter:"blur(24px)", WebkitBackdropFilter:"blur(24px)",
          border:"1px solid rgba(255,255,255,0.08)",
          borderRadius:24,
          padding:32,
          boxShadow:"0 32px 64px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.06) inset",
        }}>
          <form action={formAction} style={{ display:"flex", flexDirection:"column", gap:20 }}>
            <PremiumInput label="Email" name="email" type="email" placeholder="you@example.com" autoComplete="email" />
            <PremiumInput label="Password" name="password" type="password" placeholder="••••••••" autoComplete="current-password" />

            {/* Error */}
            {state?.error && (
              <motion.div
                initial={{ opacity:0, y:-8, scale:0.97 }}
                animate={{ opacity:1, y:0,  scale:1 }}
                style={{
                  display:"flex", alignItems:"center", gap:10,
                  background:"rgba(244,63,94,0.08)",
                  border:"1px solid rgba(244,63,94,0.25)",
                  borderRadius:12, padding:"12px 14px",
                  fontSize:13, color:"#fb7185",
                }}
              >
                <div style={{ width:6, height:6, borderRadius:"50%", background:"#f43f5e", flexShrink:0 }} />
                {state.error}
              </motion.div>
            )}

            <div style={{ paddingTop:4 }}>
              <MagneticButton loading={isPending}>
                {isPending ? "Signing in…" : "Sign in"}
              </MagneticButton>
            </div>
          </form>
        </motion.div>

        {/* Footer */}
        <motion.p variants={itemVariants} style={{ textAlign:"center", marginTop:24, fontSize:13, color:"rgba(255,255,255,0.25)" }}>
          No account?{" "}
          <Link href="/auth/sign-up" style={{ color:"#a78bfa", textDecoration:"none", fontWeight:600 }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color="#c4b5fd"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color="#a78bfa"}
          >
            Create one →
          </Link>
        </motion.p>

        {/* Privacy badge */}
        <motion.div variants={itemVariants} style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:6, marginTop:20 }}>
          <div style={{ width:6, height:6, borderRadius:"50%", background:"#10b981", animation:"pulse 2s infinite" }} />
          <span style={{ fontSize:11, color:"rgba(255,255,255,0.2)", letterSpacing:"0.05em" }}>
            End-to-end private · Stored in your Neon DB
          </span>
        </motion.div>
      </motion.div>
    </div>
  );
}
