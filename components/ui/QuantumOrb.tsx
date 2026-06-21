"use client";

import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useChatStore } from "@/lib/store";

interface QuantumOrbProps {
  size?: number;
  className?: string;
  forceState?: "idle" | "thinking" | "speaking";
}

export function QuantumOrb({ size = 36, className = "", forceState }: QuantumOrbProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { stream } = useChatStore();
  const animFrameRef = useRef<number>();
  const timeRef = useRef(0);

  const state = forceState ?? (stream.isStreaming ? "speaking" : "idle");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio, 2);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;
    const r = size * 0.36;

    const animate = (ts: number) => {
      timeRef.current = ts * 0.001;
      const t = timeRef.current;

      ctx.clearRect(0, 0, size, size);

      // Speed based on state
      const speed = state === "speaking" ? 3 : state === "thinking" ? 1.5 : 0.5;
      const intensity = state === "speaking" ? 1 : state === "thinking" ? 0.7 : 0.45;

      // Outer glow rings
      const ringCount = state === "idle" ? 2 : 3;
      for (let ring = 0; ring < ringCount; ring++) {
        const ringR = r * (1.3 + ring * 0.4);
        const ringAlpha = (0.04 - ring * 0.01) * intensity;
        const ripple = Math.sin(t * speed + ring * 1.2) * 0.5 + 0.5;

        const grd = ctx.createRadialGradient(cx, cy, ringR * 0.8, cx, cy, ringR);
        grd.addColorStop(0, `rgba(139, 92, 246, ${ringAlpha * ripple})`);
        grd.addColorStop(1, "rgba(139, 92, 246, 0)");
        ctx.beginPath();
        ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();
      }

      // Core orb gradient
      const pulse = Math.sin(t * speed) * 0.08 + 1;
      const coreR = r * pulse;

      const core = ctx.createRadialGradient(
        cx - coreR * 0.25, cy - coreR * 0.3, 0,
        cx, cy, coreR
      );

      if (state === "speaking") {
        core.addColorStop(0, "rgba(200, 170, 255, 0.95)");
        core.addColorStop(0.3, "rgba(139, 92, 246, 0.85)");
        core.addColorStop(0.7, "rgba(79, 42, 197, 0.7)");
        core.addColorStop(1, "rgba(30, 10, 80, 0.2)");
      } else if (state === "thinking") {
        core.addColorStop(0, "rgba(150, 220, 255, 0.9)");
        core.addColorStop(0.3, "rgba(6, 182, 212, 0.8)");
        core.addColorStop(0.7, "rgba(4, 100, 160, 0.6)");
        core.addColorStop(1, "rgba(0, 20, 60, 0.2)");
      } else {
        core.addColorStop(0, "rgba(180, 150, 255, 0.8)");
        core.addColorStop(0.4, "rgba(109, 40, 217, 0.65)");
        core.addColorStop(0.75, "rgba(60, 20, 120, 0.45)");
        core.addColorStop(1, "rgba(10, 5, 30, 0.15)");
      }

      ctx.beginPath();
      ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
      ctx.fillStyle = core;
      ctx.fill();

      // Inner specular highlight
      const spec = ctx.createRadialGradient(
        cx - coreR * 0.28, cy - coreR * 0.28, 0,
        cx - coreR * 0.28, cy - coreR * 0.28, coreR * 0.55
      );
      spec.addColorStop(0, `rgba(255, 255, 255, ${0.18 * intensity})`);
      spec.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.beginPath();
      ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
      ctx.fillStyle = spec;
      ctx.fill();

      // Orbiting particles (active states)
      if (state !== "idle") {
        const particleCount = state === "speaking" ? 4 : 3;
        for (let i = 0; i < particleCount; i++) {
          const angle = (t * speed * 0.8) + (i * (Math.PI * 2) / particleCount);
          const orbitR = r * 1.35;
          const px = cx + Math.cos(angle) * orbitR;
          const py = cy + Math.sin(angle) * orbitR * 0.6;
          const pSize = 1.5 + Math.sin(t * 2 + i) * 0.5;

          ctx.beginPath();
          ctx.arc(px, py, pSize, 0, Math.PI * 2);
          ctx.fillStyle = state === "speaking"
            ? `rgba(167, 139, 250, ${0.7 + Math.sin(t * 3 + i) * 0.3})`
            : `rgba(34, 211, 238, ${0.6 + Math.sin(t * 2 + i) * 0.3})`;
          ctx.fill();
        }
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);
    return () => { if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current); };
  }, [size, state]);

  return (
    <motion.div
      className={`relative flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}
      animate={
        state === "speaking"
          ? { scale: [1, 1.05, 1], transition: { repeat: Infinity, duration: 1.2 } }
          : { scale: 1 }
      }
    >
      <canvas
        ref={canvasRef}
        style={{ width: size, height: size }}
        className="rounded-full"
      />
    </motion.div>
  );
}
