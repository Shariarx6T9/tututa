"use client";

import { useActionState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, User, Loader2, AlertCircle, Check } from "lucide-react";
import { signUpWithEmail } from "./actions";
import { QuantumOrb } from "@/components/ui/QuantumOrb";
import Link from "next/link";
import { useState } from "react";

const inputStyle = {
  width: "100%",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 10,
  padding: "9px 12px 9px 36px",
  fontSize: 13,
  color: "var(--color-text-primary, #f0f0f8)",
  outline: "none",
} as const;

function AuthInput({
  id, name, type = "text", placeholder, icon: Icon, label,
  hint, autoComplete,
}: {
  id: string; name: string; type?: string; placeholder: string;
  icon: React.ElementType; label: string; hint?: string; autoComplete?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-medium mb-1.5"
        style={{ color: "var(--color-text-secondary, #9090a8)" }}>
        {label}
      </label>
      <div className="relative">
        <Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2"
          style={{ color: focused ? "#a78bfa" : "var(--color-text-muted, #4a4a62)", transition: "color 0.15s" }} />
        <input
          id={id} name={name} type={type}
          placeholder={placeholder} autoComplete={autoComplete}
          required
          style={{
            ...inputStyle,
            borderColor: focused ? "rgba(124,58,237,0.5)" : "rgba(255,255,255,0.08)",
            background:  focused ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.04)",
            transition: "all 0.15s ease",
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      </div>
      {hint && (
        <p className="text-[10px] mt-1" style={{ color: "var(--color-text-muted, #4a4a62)" }}>{hint}</p>
      )}
    </div>
  );
}

export default function SignUpPage() {
  const [state, formAction, isPending] = useActionState(signUpWithEmail, null);

  return (
    <div className="min-h-dvh flex items-center justify-center p-4"
      style={{ background: "var(--color-void, #050507)" }}>
      {/* Ambient */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%)" }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0,  scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-sm"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <QuantumOrb size={56} />
          <h1 className="mt-4 text-2xl font-bold tracking-tight"
            style={{ background: "linear-gradient(135deg, #a78bfa, #7c3aed)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            AYRA
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-text-muted, #4a4a62)" }}>
            Create your private AI account
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-7"
          style={{
            background: "var(--color-surface-1, #0f0f14)",
            border: "1px solid rgba(255,255,255,0.07)",
            boxShadow: "0 24px 48px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.05) inset",
          }}>
          <h2 className="text-base font-semibold mb-5"
            style={{ color: "var(--color-text-primary, #f0f0f8)" }}>
            Set up your account
          </h2>

          <form action={formAction} className="space-y-4">
            <AuthInput id="name" name="name" placeholder="Shariar" icon={User} label="Your name" autoComplete="name" />
            <AuthInput id="email" name="email" type="email" placeholder="you@example.com" icon={Mail} label="Email address" autoComplete="email" />
            <AuthInput id="password" name="password" type="password" placeholder="••••••••" icon={Lock} label="Password" hint="Minimum 8 characters" autoComplete="new-password" />
            <AuthInput id="confirm" name="confirm" type="password" placeholder="••••••••" icon={Lock} label="Confirm password" autoComplete="new-password" />

            {/* Password strength hints */}
            <PasswordHints />

            {/* Error */}
            {state?.error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs"
                style={{ background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.25)", color: "#fb7185" }}>
                <AlertCircle size={13} className="flex-shrink-0" />
                {state.error}
              </motion.div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isPending}
              style={{
                width: "100%", background: isPending ? "rgba(124,58,237,0.4)" : "#7c3aed",
                border: "1px solid rgba(124,58,237,0.6)", borderRadius: 10,
                padding: "10px", fontSize: 13, fontWeight: 600, color: "#fff",
                cursor: isPending ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                boxShadow: "0 2px 12px rgba(124,58,237,0.4)", transition: "all 0.15s ease",
              }}
              onMouseEnter={e => { if (!isPending) (e.currentTarget as HTMLButtonElement).style.background = "#6d28d9"; }}
              onMouseLeave={e => { if (!isPending) (e.currentTarget as HTMLButtonElement).style.background = "#7c3aed"; }}
            >
              {isPending ? <><Loader2 size={14} className="animate-spin" />Creating account…</> : "Create account"}
            </button>
          </form>

          <p className="text-center text-xs mt-5" style={{ color: "var(--color-text-muted, #4a4a62)" }}>
            Already have an account?{" "}
            <Link href="/auth/sign-in" style={{ color: "#a78bfa" }} className="hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>

        <p className="text-center text-xs mt-5" style={{ color: "var(--color-text-ghost, #2a2a3a)" }}>
          🔒 Stored securely in your Neon database
        </p>
      </motion.div>
    </div>
  );
}

function PasswordHints() {
  const hints = [
    "At least 8 characters",
    "Letters and numbers recommended",
  ];
  return (
    <div className="space-y-1 pt-0.5">
      {hints.map(h => (
        <p key={h} className="flex items-center gap-1.5 text-[10px]"
          style={{ color: "var(--color-text-ghost, #2a2a3a)" }}>
          <Check size={9} />
          {h}
        </p>
      ))}
    </div>
  );
}
