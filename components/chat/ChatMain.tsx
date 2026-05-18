"use client";

/**
 * ChatMain — Orchestrates the 3 UI states of the chat area:
 *
 *  State 1 — <ChatEmptyState>    : No active conversation selected.
 *  State 2 — <PromptInput>       : Conv selected but has no messages (reuse the design prompt UI).
 *  State 3 — <ChatActiveState>   : Conv with existing messages + active input.
 */

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { ConversationListItem, MOCK_CONVERSATIONS } from "./conversation-data";
import ChatEmptyState from "./ChatEmptyState";
import ChatActiveState, { ChatMessage } from "./ChatActiveState";
import PromptInput from "./PromptInput";

// ─── Mock message data (replace with real API/store) ─────────────────────────

const MOCK_MESSAGES: Record<string, ChatMessage[]> = {
  conv_01: [
    {
      id: "m1",
      text: "Chào bạn, mình vừa xem qua bản thiết kế 🎨",
      senderId: "user_other",
      senderName: "An Bình",
      senderAvatar: "/assets/home/iVBORw0KGg_3.png",
      timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
    },
    {
      id: "m2",
      text: "Mình thấy phần header chưa đồng nhất với các section dưới.",
      senderId: "user_other",
      senderName: "An Bình",
      senderAvatar: "/assets/home/iVBORw0KGg_3.png",
      timestamp: new Date(Date.now() - 1000 * 60 * 7).toISOString(),
    },
    {
      id: "m3",
      text: "Ừ mình thấy rồi, để mình chỉnh lại spacing.",
      senderId: "user_me",
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      isOwn: true,
    },
    {
      id: "m4",
      text: "Mình vừa đẩy bản wireframe mới lên rồi, bạn xem giúp nhé.",
      senderId: "user_other",
      senderName: "An Bình",
      senderAvatar: "/assets/home/iVBORw0KGg_3.png",
      timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    },
  ],
  // conv_02 → no messages → State 2
};

// ─── Page transition variant ──────────────────────────────────────────────────

const pageVariant = {
  initial: { opacity: 0, y: 8 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    y: 6,
    transition: { duration: 0.12, ease: "easeInOut" },
  },
};

// ─── Main component ───────────────────────────────────────────────────────────

interface ChatMainProps {
  /** Currently active conversation. Undefined → State 1. */
  activeConv?: ConversationListItem;
}

export default function ChatMain({ activeConv }: ChatMainProps) {
  // Local state for demo messages (replace with store/API in production)
  const [messageStore, setMessageStore] = useState<Record<string, ChatMessage[]>>(MOCK_MESSAGES);

  const handleSend = (text: string) => {
    if (!activeConv) return;
    const newMsg: ChatMessage = {
      id: `m_${Date.now()}`,
      text,
      senderId: "user_me",
      timestamp: new Date().toISOString(),
      isOwn: true,
    };
    setMessageStore((prev) => ({
      ...prev,
      [activeConv.id]: [...(prev[activeConv.id] ?? []), newMsg],
    }));
  };

  const messages = activeConv ? (messageStore[activeConv.id] ?? []) : [];

  // Determine which state to render
  let stateKey: "empty" | "new" | "active";
  if (!activeConv) {
    stateKey = "empty";
  } else if (messages.length === 0) {
    stateKey = "new";
  } else {
    stateKey = "active";
  }

  return (
    <div className="relative flex flex-1 flex-col w-full h-full overflow-hidden bg-transparent">
      <AnimatePresence mode="sync" initial={false}>
        {stateKey === "empty" && (
          <motion.div
            key="empty"
            className="absolute inset-0 flex"
            variants={pageVariant as any}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <ChatEmptyState />
          </motion.div>
        )}

        {stateKey === "new" && activeConv && (
          <motion.div
            key={`new-${activeConv.id}`}
            className="absolute inset-0 flex"
            variants={pageVariant as any}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <PromptInput conv={activeConv} />
          </motion.div>
        )}

        {stateKey === "active" && activeConv && (
          <motion.div
            key={`active-${activeConv.id}`}
            className="absolute inset-0 flex"
            variants={pageVariant as any}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <ChatActiveState
              conv={activeConv}
              messages={messages}
              onSend={handleSend}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Demo wrapper (used in page.tsx for testing) ──────────────────────────────

export function ChatMainDemo() {
  const [activeConv, setActiveConv] = useState<ConversationListItem | undefined>(undefined);

  return (
    <div
      className="flex h-screen w-full bg-transparent"
      style={{ fontFamily: "var(--font-sans-theme, 'Google Sans', sans-serif)" }}
    >
      {/* Mini sidebar for demo switching */}
      <div
        className="shrink-0 flex flex-col gap-1 p-3 border-r w-52 overflow-y-auto hide-scrollbar"
        style={{ borderColor: "rgb(var(--borderColor-secondary) / 0.12)" }}
      >
        <button
          type="button"
          className="text-left px-3 py-2 rounded-xl text-[13px] font-medium transition-all"
          style={{
            background:
              activeConv === undefined
                ? "rgb(var(--backgroundColor-state-active) / 1)"
                : "transparent",
            color: "rgb(var(--textColor-primary))",
          }}
          onClick={() => setActiveConv(undefined)}
        >
          (Không chọn) → State 1
        </button>
        {MOCK_CONVERSATIONS.map((conv) => (
          <button
            key={conv.id}
            type="button"
            className="text-left px-3 py-2 rounded-xl text-[13px] font-medium transition-all truncate"
            style={{
              background:
                activeConv?.id === conv.id
                  ? "rgb(var(--backgroundColor-state-active) / 1)"
                  : "transparent",
              color: "rgb(var(--textColor-primary))",
            }}
            onClick={() => setActiveConv(conv)}
          >
            {conv.name}
          </button>
        ))}
      </div>

      {/* Chat main area */}
      <div className="flex-1 overflow-hidden">
        <ChatMain activeConv={activeConv} />
      </div>
    </div>
  );
}
