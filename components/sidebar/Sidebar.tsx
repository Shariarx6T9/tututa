"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, MessageSquare, Brain, Code2, Image,
  CheckSquare, BookOpen, Settings, ChevronLeft, ChevronRight,
  Plus, Search, Folder, FolderOpen, MoreHorizontal, Pin,
  Archive, Trash2, Edit3, Sparkles,
} from "lucide-react";
import { useUIStore, useChatStore } from "@/lib/store";
import { QuantumOrb } from "@/components/ui/QuantumOrb";
import { cn, truncate } from "@/lib/utils";
import type { Chat, ChatFolder } from "@/types";

// ── Nav items ─────────────────────────────────────────────────

const NAV_ITEMS = [
  { href: "/",        icon: LayoutDashboard, label: "Dashboard",  shortcut: "1" },
  { href: "/chat",    icon: MessageSquare,   label: "Chat",        shortcut: "2" },
  { href: "/memory",  icon: Brain,           label: "Memory",      shortcut: "3" },
  { href: "/code",    icon: Code2,           label: "Code",        shortcut: "4" },
  { href: "/studio",  icon: Image,           label: "Studio",      shortcut: "5" },
  { href: "/tasks",   icon: CheckSquare,     label: "Tasks",       shortcut: "6" },
  { href: "/vault",   icon: BookOpen,        label: "Vault",       shortcut: "7" },
] as const;

// ── Sidebar ───────────────────────────────────────────────────

import { useSession } from "@/lib/auth/use-session";
import type { SessionUser } from "@/lib/auth/session";

export function Sidebar({ user }: { user?: SessionUser }) {
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const { chats } = useChatStore();
  const pathname = usePathname();
  const [search, setSearch] = useState("");
  const [hoveredChat, setHoveredChat] = useState<string | null>(null);
  const { signOut } = useSession();

  const recentChats = chats
    .filter((c) => !c.isArchived && c.title.toLowerCase().includes(search.toLowerCase()))
    .slice(0, 12);

  const inChat = pathname.startsWith("/chat");

  return (
    <motion.aside
      className="fixed left-0 top-0 h-full z-[100] flex flex-col"
      style={{ background: "rgba(8, 8, 12, 0.95)" }}
      animate={{ width: sidebarCollapsed ? 64 : 260 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Glass border right */}
      <div className="absolute right-0 top-0 bottom-0 w-px bg-[rgba(255,255,255,0.06)]" />

      {/* Header */}
      <div className="flex items-center h-14 px-3 flex-shrink-0">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <QuantumOrb size={32} />
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <span className="text-[15px] font-semibold tracking-tight gradient-text-violet">
                  AYRA
                </span>
                <span className="text-[10px] text-[var(--color-text-muted)] ml-1.5 font-mono">
                  v1.0
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleSidebar}
              className="ml-auto p-1.5 rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[rgba(255,255,255,0.06)] transition-all"
              title="Collapse sidebar"
            >
              <ChevronLeft size={15} />
            </motion.button>
          )}
        </AnimatePresence>

        {sidebarCollapsed && (
          <button
            onClick={toggleSidebar}
            className="ml-auto p-1.5 rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[rgba(255,255,255,0.06)] transition-all"
            title="Expand sidebar"
          >
            <ChevronRight size={15} />
          </button>
        )}
      </div>

      {/* Nav Items */}
      <nav className="px-2 flex-shrink-0 space-y-0.5">
        {NAV_ITEMS.map(({ href, icon: Icon, label, shortcut }) => {
          const isActive =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <NavItem
              key={href}
              href={href}
              icon={Icon}
              label={label}
              shortcut={shortcut}
              isActive={isActive}
              collapsed={sidebarCollapsed}
            />
          );
        })}
      </nav>

      {/* Divider */}
      {!sidebarCollapsed && (
        <div className="mx-4 my-3 h-px bg-[rgba(255,255,255,0.05)]" />
      )}

      {/* Recent Chats (only when sidebar expanded and on chat page) */}
      <AnimatePresence>
        {!sidebarCollapsed && inChat && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col min-h-0 px-2"
          >
            {/* Search + New Chat */}
            <div className="flex items-center gap-1.5 mb-2">
              <div className="flex-1 flex items-center gap-2 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] rounded-lg px-2.5 py-1.5">
                <Search size={12} className="text-[var(--color-text-muted)]" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search chats…"
                  className="flex-1 bg-transparent text-[12px] text-[var(--color-text-secondary)] placeholder:text-[var(--color-text-muted)] outline-none"
                />
              </div>
              <Link
                href="/chat/new"
                className="p-1.5 rounded-lg bg-[rgba(124,58,237,0.15)] border border-[rgba(124,58,237,0.2)] text-violet-400 hover:bg-[rgba(124,58,237,0.25)] transition-all"
                title="New chat"
              >
                <Plus size={14} />
              </Link>
            </div>

            {/* Chat list */}
            <div className="flex-1 overflow-y-auto space-y-0.5 pr-0.5">
              <p className="text-[10px] font-medium uppercase tracking-widest text-[var(--color-text-muted)] px-2 mb-1.5">
                Recent
              </p>
              {recentChats.map((chat) => (
                <SidebarChatItem
                  key={chat.id}
                  chat={chat}
                  isActive={pathname === `/chat/${chat.id}`}
                  isHovered={hoveredChat === chat.id}
                  onHover={setHoveredChat}
                />
              ))}
              {recentChats.length === 0 && (
                <div className="text-center py-6">
                  <MessageSquare size={20} className="mx-auto text-[var(--color-text-ghost)] mb-2" />
                  <p className="text-[11px] text-[var(--color-text-muted)]">No chats yet</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Bottom: User + Settings + Sign out */}
      <div className="px-2 pb-3 flex-shrink-0 space-y-0.5">
        <div className="mx-2 mb-2 h-px bg-[rgba(255,255,255,0.05)]" />

        <NavItem
          href="/settings"
          icon={Settings}
          label="Settings"
          isActive={pathname === "/settings"}
          collapsed={sidebarCollapsed}
        />

        {/* User card */}
        {user && (
          <div className={cn(
            "flex items-center gap-2.5 px-2.5 py-2 rounded-lg",
            sidebarCollapsed ? "justify-center" : ""
          )}>
            {/* Avatar */}
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-violet-800 flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-white shadow-[0_0_8px_rgba(124,58,237,0.4)]">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="flex-1 min-w-0 overflow-hidden"
                >
                  <p className="text-[11px] font-medium text-[var(--color-text-secondary)] truncate leading-tight">
                    {user.name}
                  </p>
                  <p className="text-[10px] text-[var(--color-text-muted)] truncate leading-tight">
                    {user.email}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={signOut}
                  title="Sign out"
                  className="p-1 rounded-md text-[var(--color-text-muted)] hover:text-rose-400 hover:bg-[rgba(244,63,94,0.08)] transition-all flex-shrink-0"
                >
                  {/* Log-out icon */}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.aside>
  );
}

// ── Nav Item ──────────────────────────────────────────────────

function NavItem({
  href,
  icon: Icon,
  label,
  shortcut,
  isActive,
  collapsed,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  shortcut?: string;
  isActive: boolean;
  collapsed: boolean;
}) {
  return (
    <Link
      href={href as never}
      className={cn(
        "flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 group relative",
        isActive
          ? "bg-[rgba(124,58,237,0.15)] text-violet-300 border border-[rgba(124,58,237,0.2)]"
          : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[rgba(255,255,255,0.05)] border border-transparent"
      )}
      title={collapsed ? label : undefined}
    >
      {isActive && (
        <motion.div
          layoutId="nav-active"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-violet-400 rounded-full"
          transition={{ duration: 0.2, ease: "easeOut" }}
        />
      )}
      <Icon
        size={16}
        className={cn(
          "flex-shrink-0 transition-colors",
          isActive ? "text-violet-400" : "text-[var(--color-text-muted)] group-hover:text-[var(--color-text-secondary)]"
        )}
      />
      <AnimatePresence>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            className="flex-1 truncate"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
      {!collapsed && shortcut && (
        <span className="text-[10px] text-[var(--color-text-ghost)] font-mono opacity-0 group-hover:opacity-100 transition-opacity">
          ⌘{shortcut}
        </span>
      )}
    </Link>
  );
}

// ── Sidebar Chat Item ─────────────────────────────────────────

function SidebarChatItem({
  chat,
  isActive,
  isHovered,
  onHover,
}: {
  chat: Chat;
  isActive: boolean;
  isHovered: boolean;
  onHover: (id: string | null) => void;
}) {
  return (
    <div
      className={cn(
        "group relative flex items-center gap-2 px-2.5 py-1.5 rounded-lg cursor-pointer transition-all duration-150",
        isActive
          ? "bg-[rgba(124,58,237,0.1)] text-[var(--color-text-primary)]"
          : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:bg-[rgba(255,255,255,0.04)]"
      )}
      onMouseEnter={() => onHover(chat.id)}
      onMouseLeave={() => onHover(null)}
    >
      {chat.isPinned && (
        <Pin size={10} className="text-violet-400 flex-shrink-0" />
      )}
      <Link href={`/chat/${chat.id}`} className="flex-1 min-w-0">
        <p className="text-[12px] truncate leading-tight">
          {truncate(chat.title, 28)}
        </p>
      </Link>
      {isHovered && (
        <button className="p-0.5 rounded hover:bg-[rgba(255,255,255,0.08)] transition-colors">
          <MoreHorizontal size={12} className="text-[var(--color-text-muted)]" />
        </button>
      )}
    </div>
  );
}
