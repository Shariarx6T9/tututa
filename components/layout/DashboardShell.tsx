"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUIStore }        from "@/lib/store";
import { Sidebar }           from "@/components/sidebar/Sidebar";
import { CommandPalette }    from "@/components/layout/CommandPalette";
import type { SessionUser }  from "@/lib/auth/session";

interface Props {
  children: React.ReactNode;
  user:     SessionUser;
}

export default function DashboardShell({ children, user }: Props) {
  const { sidebarCollapsed, commandOpen, setCommandOpen, setIsMobile } = useUIStore();

  // ⌘K → command palette
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandOpen(true);
      }
      if (e.key === "Escape") setCommandOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [setCommandOpen]);

  // Mobile detection
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [setIsMobile]);

  return (
    <div className="flex h-dvh overflow-hidden bg-[var(--color-void)]">
      <Sidebar user={user} />

      <motion.main
        className="flex-1 flex flex-col overflow-hidden relative"
        animate={{ marginLeft: sidebarCollapsed ? 64 : 260 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Ambient background glows */}
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          <div className="absolute -top-40 -left-20 w-[600px] h-[600px] rounded-full opacity-[0.035]"
            style={{ background: "radial-gradient(circle, #7c3aed 0%, transparent 70%)" }} />
          <div className="absolute -bottom-40 -right-20 w-[400px] h-[400px] rounded-full opacity-[0.025]"
            style={{ background: "radial-gradient(circle, #06b6d4 0%, transparent 70%)" }} />
        </div>

        <div className="relative z-10 flex-1 overflow-hidden">
          <AnimatePresence mode="wait">{children}</AnimatePresence>
        </div>
      </motion.main>

      <AnimatePresence>
        {commandOpen && <CommandPalette onClose={() => setCommandOpen(false)} />}
      </AnimatePresence>
    </div>
  );
}
