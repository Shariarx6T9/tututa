"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  MessageSquare, Plus, Search, Pin, Archive,
  Clock, Folder, MoreHorizontal, Trash2,
} from "lucide-react";
import { useChatStore } from "@/lib/store";
import { PageHeader, GlassCard, Button, Badge, Input, EmptyState } from "@/components/ui";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { cn, formatRelativeDate, truncate } from "@/lib/utils";
import type { Chat } from "@/types";

export default function ChatPage() {
  const { chats, setChats, activeChat } = useChatStore();
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/chats")
      .then((r) => r.json())
      .then((data) => { setChats(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [setChats]);

  const filtered = chats.filter(
    (c) =>
      !c.isArchived &&
      c.title.toLowerCase().includes(search.toLowerCase())
  );

  const pinned  = filtered.filter((c) => c.isPinned);
  const regular = filtered.filter((c) => !c.isPinned);

  return (
    <div className="flex h-full">
      {/* Left panel — chat list */}
      <div className="w-[300px] flex-shrink-0 flex flex-col border-r border-[rgba(255,255,255,0.06)] h-full">
        <div className="px-4 py-4 flex-shrink-0 border-b border-[rgba(255,255,255,0.06)]">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-[14px] font-semibold text-[var(--color-text-primary)] flex-1">
              Chats
            </h2>
            <Link href="/chat/new">
              <Button variant="violet" size="sm" leftIcon={<Plus size={13} />}>
                New
              </Button>
            </Link>
          </div>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search chats…"
            leftIcon={<Search size={13} />}
          />
        </div>

        <div className="flex-1 overflow-y-auto py-2 px-2">
          {loading ? (
            <ChatListSkeleton />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={<MessageSquare size={22} />}
              title="No chats yet"
              description="Start a conversation to see it here."
              action={
                <Link href="/chat/new">
                  <Button variant="violet" size="sm" leftIcon={<Plus size={13} />}>
                    New Chat
                  </Button>
                </Link>
              }
            />
          ) : (
            <>
              {pinned.length > 0 && (
                <ChatGroup label="Pinned" chats={pinned} />
              )}
              {regular.length > 0 && (
                <ChatGroup label={pinned.length > 0 ? "Recent" : undefined} chats={regular} />
              )}
            </>
          )}
        </div>
      </div>

      {/* Right panel — empty state / instructions */}
      <div className="flex-1 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-[rgba(124,58,237,0.08)] border border-[rgba(124,58,237,0.15)] flex items-center justify-center mx-auto mb-4">
            <MessageSquare size={24} className="text-violet-400" />
          </div>
          <h3 className="text-[15px] font-semibold text-[var(--color-text-primary)] mb-2">
            Select a chat
          </h3>
          <p className="text-[12px] text-[var(--color-text-muted)] max-w-xs">
            Choose a conversation from the left or start a new one.
          </p>
          <Link href="/chat/new" className="mt-4 inline-block">
            <Button variant="violet" size="md" leftIcon={<Plus size={14} />}>
              New Chat
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

function ChatGroup({ label, chats }: { label?: string; chats: Chat[] }) {
  return (
    <div className="mb-2">
      {label && (
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-muted)] px-2 py-1.5 mb-0.5">
          {label}
        </p>
      )}
      {chats.map((chat, i) => (
        <ChatListItem key={chat.id} chat={chat} index={i} />
      ))}
    </div>
  );
}

function ChatListItem({ chat, index }: { chat: Chat; index: number }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03, duration: 0.2 }}
    >
      <Link href={`/chat/${chat.id}`}>
        <div
          className={cn(
            "group relative flex flex-col gap-1 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150 mb-0.5",
            "hover:bg-[rgba(255,255,255,0.04)] border border-transparent hover:border-[rgba(255,255,255,0.06)]"
          )}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              {chat.isPinned && <Pin size={10} className="text-violet-400 flex-shrink-0" />}
              <p className="text-[12.5px] font-medium text-[var(--color-text-primary)] truncate">
                {truncate(chat.title, 32)}
              </p>
            </div>
            {hovered ? (
              <button
                className="p-1 rounded-md hover:bg-[rgba(255,255,255,0.08)] text-[var(--color-text-muted)]"
                onClick={(e) => { e.preventDefault(); }}
              >
                <MoreHorizontal size={12} />
              </button>
            ) : (
              <span className="text-[10px] text-[var(--color-text-ghost)] flex-shrink-0">
                {chat.lastMessageAt ? formatRelativeDate(chat.lastMessageAt) : ""}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[var(--color-text-muted)] truncate flex-1">
              {chat.summary ?? `${chat.model} · ${(chat as any)._count?.messages ?? 0} messages`}
            </span>
            {chat.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="ghost" className="text-[9px] px-1.5 py-0">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function ChatListSkeleton() {
  return (
    <div className="space-y-1.5 px-2 pt-1">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="px-3 py-2.5 rounded-xl">
          <div className="skeleton h-3 w-3/4 rounded mb-2" />
          <div className="skeleton h-2.5 w-1/2 rounded" />
        </div>
      ))}
    </div>
  );
}
