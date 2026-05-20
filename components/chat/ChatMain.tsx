"use client";

import React, { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { ConversationListItem, MOCK_CONVERSATIONS } from "./conversation-data";
import ChatEmptyState from "./ChatEmptyState";
import ChatActiveState, { ChatMessage } from "./ChatActiveState";
import PromptInput from "./PromptInput";
import MobileProjectSidebarToggle from "./MobileProjectSidebarToggle";

const MOCK_MESSAGES: Record<string, ChatMessage[]> = {
  conv_01: [
    {
      id: "m1",
      text: "Chào bạn, mình vừa xem qua bản thiết kế.",
      senderId: "user_other",
      senderName: "An Bình",
      senderAvatar: "/assets/home/iVBORw0KGg_3.png",
      timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
    },
    {
      id: "m2",
      text: "Chào bạn, mình vừa xem qua bản thiết kế.",
      senderId: "user_other",
      senderName: "An Bình",
      senderAvatar: "/assets/home/iVBORw0KGg_3.png",
      timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
    },
    {
      id: "m3",
      text: "Chào bạn, mình vừa xem qua bản thiết kế.",
      senderId: "user_other",
      senderName: "An Bình",
      senderAvatar: "/assets/home/iVBORw0KGg_3.png",
      timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
    }, {
      id: "m4",
      text: "Chào bạn, mình vừa xem qua bản thiết kế.",
      senderId: "user_other",
      senderName: "An Bình",
      senderAvatar: "/assets/home/iVBORw0KGg_3.png",
      timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
    },
    {
      id: "m5",
      text: "Chào bạn, mình vừa xem qua bản thiết kế.",
      senderId: "user_other",
      senderName: "An Bình",
      senderAvatar: "/assets/home/iVBORw0KGg_3.png",
      timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
    },
    {
      id: "m_system_1",
      text: "An Bình đã tham gia hội thoại.",
      senderId: "system",
      timestamp: new Date(Date.now() - 1000 * 60 * 7.5).toISOString(),
      type: "system",
      isSystem: true,
    },
    {
      id: "m6",
      text: "Phần header chưa đồng nhất với các section bên dưới.",
      senderId: "user_other",
      senderName: "An Bình",
      senderAvatar: "/assets/home/iVBORw0KGg_3.png",
      timestamp: new Date(Date.now() - 1000 * 60 * 7).toISOString(),
    },
    {
      id: "m7",
      text: "Ừ mình thấy rồi, để mình chỉnh lại spacing.",
      senderId: "user_me",
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      isOwn: true,
    },
    {
      id: "m8",
      text: "Mình vừa đẩy bản wireframe mới lên rồi, bạn xem giúp nhé.",
      senderId: "user_other",
      senderName: "An Bình",
      senderAvatar: "/assets/home/iVBORw0KGg_3.png",
      timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    },
    {
      id: "m9",
      text: "Mình vừa đẩy bản wireframe mới lên rồi, bạn xem giúp nhé.",
      senderId: "user_other",
      senderName: "An Bình",
      senderAvatar: "/assets/home/iVBORw0KGg_3.png",
      timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    },
    {
      id: "m10",
      text: "Mình vừa đẩy bản wireframe mới lên rồi, bạn xem giúp nhé.",
      senderId: "user_other",
      senderName: "An Bình",
      senderAvatar: "/assets/home/iVBORw0KGg_3.png",
      timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    },
    {
      id: "m11",
      text: "Mình vừa đẩy bản wireframe mới lên rồi, bạn xem giúp nhé.",
      senderId: "user_other",
      senderName: "An Bình",
      senderAvatar: "/assets/home/iVBORw0KGg_3.png",
      timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    },
    {
      id: "m12",
      text: "Mình vừa đẩy bản wireframe mới lên rồi, bạn xem giúp nhé.",
      senderId: "user_other",
      senderName: "An Bình",
      senderAvatar: "/assets/home/iVBORw0KGg_3.png",
      timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    },
  ],
};

interface ChatMainProps {
  activeConv?: ConversationListItem;
  isProjectSidebarOpen?: boolean;
  onToggleProjects?: () => void;
}

export default function ChatMain({
  activeConv,
  isProjectSidebarOpen = false,
  onToggleProjects,
}: ChatMainProps) {
  const [messageStore, setMessageStore] = useState<Record<string, ChatMessage[]>>(MOCK_MESSAGES);
  const shouldReduceMotion = useReducedMotion();

  const pageVariant = shouldReduceMotion
    ? {
      initial: { opacity: 1, y: 0 },
      animate: { opacity: 1, y: 0, transition: { duration: 0 } },
      exit: { opacity: 1, y: 0, transition: { duration: 0 } },
    }
    : {
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

  let stateKey: "empty" | "new" | "active";
  if (!activeConv) {
    stateKey = "empty";
  } else if (messages.length === 0) {
    stateKey = "new";
  } else {
    stateKey = "active";
  }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col w-full h-full overflow-hidden bg-transparent">
      {onToggleProjects ? (
        <MobileProjectSidebarToggle isOpen={isProjectSidebarOpen} onToggle={onToggleProjects} />
      ) : null}

      <AnimatePresence mode="sync" initial={false}>
        {stateKey === "empty" && (
          <motion.div
            key="empty"
            className="absolute inset-0 flex min-h-0"
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
            className="absolute inset-0 flex min-h-0"
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
            className="absolute inset-0 flex min-h-0"
            variants={pageVariant as any}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <ChatActiveState conv={activeConv} messages={messages} onSend={handleSend} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function ChatMainDemo() {
  const [activeConv, setActiveConv] = useState<ConversationListItem | undefined>(undefined);

  return (
    <div
      className="flex h-screen w-full bg-transparent"
      style={{ fontFamily: "var(--font-sans-theme, var(--font-sans), sans-serif)" }}
    >
      <div
        className="shrink-0 flex flex-col gap-1 p-3 border-r w-52 overflow-y-auto hide-scrollbar"
        style={{ borderColor: "rgb(var(--borderColor-secondary) / 0.12)" }}
      >
        <button
          type="button"
          className="text-left px-3 py-2 rounded-xl text-[13px] font-medium transition-all"
          style={{
            background: activeConv === undefined ? "rgb(var(--backgroundColor-state-active) / 1)" : "transparent",
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
              background: activeConv?.id === conv.id ? "rgb(var(--backgroundColor-state-active) / 1)" : "transparent",
              color: "rgb(var(--textColor-primary))",
            }}
            onClick={() => setActiveConv(conv)}
          >
            {conv.name}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-hidden">
        <ChatMain activeConv={activeConv} />
      </div>
    </div>
  );
}
