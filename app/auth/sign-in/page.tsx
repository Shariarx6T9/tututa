"use client";

import { useActionState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Loader2, AlertCircle } from "lucide-react";
import { signInWithEmail } from "./actions";
import { QuantumOrb } from "@/components/ui/QuantumOrb";
import Link from "next/link";

export default function SignInPage() {
  const [state, formAction, isPending] = useActionState(signInWithEmail, null);

  return (
    <div
      className="min-h-dvh flex items-center justify-center p-4"
      style={{ background: "var(--color-void, #050507)" }}
    >
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)",
          }}
        />
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
          <h1
            className="mt-4 text-2xl font-bold tracking-tight"
            style={{
              background: "linear-gradient(135deg, #a78bfa, #7c3aed)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            AYRA
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-text-muted, #4a4a62)" }}>
            Your private AI operating system
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-7"
          style={{
            background: "var(--color-surface-1, #0f0f14)",
            border: "1px solid rgba(255,255,255,0.07)",
            boxShadow: "0 24px 48px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.05) inset",
          }}
        >
          <h2
            className="text-base font-semibold mb-5"
            style={{ color: "var(--color-text-primary, #f0f0f8)" }}
          >
            Sign in to AYRA
          </h2>

          <form action={formAction} className="space-y-4">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-medium mb-1.5"
                style={{ color: "var(--color-text-secondary, #9090a8)" }}
              >
                Email address
              </label>
              <div className="relative">
                <Mail
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--color-text-muted, #4a4a62)" }}
                />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  style={{
                    width: "100%",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 10,
                    padding: "9px 12px 9px 36px",
                    fontSize: 13,
                    color: "var(--color-text-primary, #f0f0f8)",
                    outline: "none",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "rgba(124,58,237,0.5)";
                    e.target.style.background   = "rgba(255,255,255,0.06)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "rgba(255,255,255,0.08)";
                    e.target.style.background   = "rgba(255,255,255,0.04)";
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="block text-xs font-medium"
                  style={{ color: "var(--color-text-secondary, #9090a8)" }}
                >
                  Password
                </label>
                {/* Could add "Forgot password?" here once reset flow is set up */}
              </div>
              <div className="relative">
                <Lock
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--color-text-muted, #4a4a62)" }}
                />
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  style={{
                    width: "100%",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 10,
                    padding: "9px 12px 9px 36px",
                    fontSize: 13,
                    color: "var(--color-text-primary, #f0f0f8)",
                    outline: "none",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "rgba(124,58,237,0.5)";
                    e.target.style.background   = "rgba(255,255,255,0.06)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "rgba(255,255,255,0.08)";
                    e.target.style.background   = "rgba(255,255,255,0.04)";
                  }}
                />
              </div>
            </div>

            {/* Error */}
            {state?.error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs"
                style={{
                  background: "rgba(244,63,94,0.1)",
                  border: "1px solid rgba(244,63,94,0.25)",
                  color: "#fb7185",
                }}
              >
                <AlertCircle size={13} className="flex-shrink-0" />
                {state.error}
              </motion.div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isPending}
              style={{
                width: "100%",
                background: isPending ? "rgba(124,58,237,0.4)" : "#7c3aed",
                border: "1px solid rgba(124,58,237,0.6)",
                borderRadius: 10,
                padding: "10px",
                fontSize: 13,
                fontWeight: 600,
                color: "#fff",
                cursor: isPending ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                boxShadow: "0 2px 12px rgba(124,58,237,0.4)",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                if (!isPending)
                  (e.currentTarget as HTMLButtonElement).style.background = "#6d28d9";
              }}
              onMouseLeave={(e) => {
                if (!isPending)
                  (e.currentTarget as HTMLButtonElement).style.background = "#7c3aed";
              }}
            >
              {isPending ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Signing in…
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          {/* Sign-up link */}
          <p
            className="text-center text-xs mt-5"
            style={{ color: "var(--color-text-muted, #4a4a62)" }}
          >
            No account?{" "}
            <Link
              href="/auth/sign-up"
              style={{ color: "#a78bfa" }}
              className="hover:underline font-medium"
            >
              Create one
            </Link>
          </p>
        </div>

        {/* Privacy note */}
        <p
          className="text-center text-xs mt-5"
          style={{ color: "var(--color-text-ghost, #2a2a3a)" }}
        >
          🔒 All data stays in your Neon database
        </p>
      </motion.div>
    </div>
  );
}
