"use client";

import { useEffect, useRef } from "react";

export function AyraBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Orb definitions — color, x%, y%, radius, speed, phase
    const orbs = [
      { hue: 270, sat: 80, x: 0.15, y: 0.2,  r: 0.55, spd: 0.00018, ph: 0    },  // violet
      { hue: 195, sat: 90, x: 0.82, y: 0.75, r: 0.45, spd: 0.00023, ph: 2.1  },  // cyan
      { hue: 42,  sat: 95, x: 0.5,  y: 0.5,  r: 0.35, spd: 0.00014, ph: 4.2  },  // gold
      { hue: 300, sat: 70, x: 0.85, y: 0.15, r: 0.3,  spd: 0.0002,  ph: 1.05 },  // magenta
      { hue: 220, sat: 85, x: 0.1,  y: 0.82, r: 0.38, spd: 0.00016, ph: 3.14 },  // blue-violet
    ];

    const draw = () => {
      const W = canvas.width;
      const H = canvas.height;
      t++;

      // Deep void base
      ctx.fillStyle = "#030305";
      ctx.fillRect(0, 0, W, H);

      // Animated orbs
      for (const orb of orbs) {
        const angle = t * orb.spd + orb.ph;
        const cx = (orb.x + Math.sin(angle * 1.3) * 0.12) * W;
        const cy = (orb.y + Math.cos(angle * 0.9) * 0.1) * H;
        const r  = orb.r * Math.min(W, H);
        const pulse = 1 + Math.sin(angle * 2.1) * 0.08;

        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * pulse);
        grad.addColorStop(0,   `hsla(${orb.hue},${orb.sat}%,60%,0.18)`);
        grad.addColorStop(0.4, `hsla(${orb.hue},${orb.sat}%,50%,0.07)`);
        grad.addColorStop(1,   `hsla(${orb.hue},${orb.sat}%,40%,0)`);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, r * pulse, 0, Math.PI * 2);
        ctx.fill();
      }

      // Subtle grain overlay — drawn once every 3 frames for perf
      if (t % 3 === 0) {
        const imgData = ctx.getImageData(0, 0, W, H);
        const d = imgData.data;
        for (let i = 0; i < d.length; i += 16) {
          const n = (Math.random() - 0.5) * 12;
          d[i]     = Math.min(255, Math.max(0, d[i]     + n));
          d[i + 1] = Math.min(255, Math.max(0, d[i + 1] + n));
          d[i + 2] = Math.min(255, Math.max(0, d[i + 2] + n));
        }
        ctx.putImageData(imgData, 0, 0);
      }

      // Vignette
      const vig = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, Math.max(W, H) * 0.75);
      vig.addColorStop(0,   "rgba(0,0,0,0)");
      vig.addColorStop(0.6, "rgba(0,0,0,0.1)");
      vig.addColorStop(1,   "rgba(0,0,0,0.75)");
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, W, H);

      // Subtle dot grid
      ctx.fillStyle = "rgba(255,255,255,0.018)";
      const gs = 32;
      for (let x = 0; x < W; x += gs) {
        for (let y = 0; y < H; y += gs) {
          ctx.beginPath();
          ctx.arc(x, y, 0.8, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        width: "100%",
        height: "100%",
      }}
    />
  );
}
