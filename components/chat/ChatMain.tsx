"use client";

import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { ConversationListItem, MOCK_CONVERSATIONS } from "./conversation-data";
import ChatEmptyState from "./ChatEmptyState";
import ChatActiveState from "./ChatActiveState";
import type { ChatTypingUser } from "./ChatActiveState";
import type { ChatMessage } from "./chat-message-types";
import { isSystemMessage } from "./chat-message-utils";
import PromptInput from "./PromptInput";
import MobileProjectSidebarToggle from "./MobileProjectSidebarToggle";

const CURRENT_USER_ID = "user_me";
const MOCK_TYPING_DELAY_MS = 1800;
const MOCK_REPLY_DELAY_MS = 2600;

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
      timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    },
  ],
};

function getConversationTypingUser(
  conv: ConversationListItem,
  messages: ChatMessage[],
): ChatTypingUser {
  const latestOtherMessage = messages.findLast((message) => {
    if (isSystemMessage(message)) return false;

    return !(message.isOwn ?? message.senderId === CURRENT_USER_ID);
  });

  return {
    id: latestOtherMessage?.senderId ?? `${conv.id}_assistant`,
    name: latestOtherMessage?.senderName ?? conv.name ?? "Ai đó",
    avatarUrl: latestOtherMessage?.senderAvatar ?? conv.avatarUrl,
  };
}

interface ChatMainProps {
  activeConv?: ConversationListItem;
  isProjectSidebarOpen?: boolean;
  onToggleProjects?: () => void;
  onCreateConversation?: (conversation: ConversationListItem, firstMessageText: string) => ConversationListItem | undefined;
}

export default function ChatMain({
  activeConv,
  isProjectSidebarOpen = false,
  onToggleProjects,
  onCreateConversation,
}: ChatMainProps) {
  const [messageStore, setMessageStore] = useState<Record<string, ChatMessage[]>>(MOCK_MESSAGES);
  const [typingStore, setTypingStore] = useState<Record<string, ChatTypingUser[]>>({});
  const typingTimeoutsRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const typingTimeouts = typingTimeoutsRef.current;

    return () => {
      Object.values(typingTimeouts).forEach((timeoutId) => clearTimeout(timeoutId));
    };
  }, []);

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
    const targetConversation = onCreateConversation?.(activeConv, text) ?? activeConv;
    const conversationId = targetConversation.id;
    const existingMessages = messageStore[conversationId] ?? [];
    const typingUser = getConversationTypingUser(targetConversation, existingMessages);
    const newMsg: ChatMessage = {
      id: `m_${Date.now()}`,
      text,
      senderId: CURRENT_USER_ID,
      timestamp: new Date().toISOString(),
      isOwn: true,
    };

    setMessageStore((prev) => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] ?? []), newMsg],
    }));

    if (typingTimeoutsRef.current[conversationId]) {
      clearTimeout(typingTimeoutsRef.current[conversationId]);
    }

    setTypingStore((prev) => {
      const next = { ...prev };
      delete next[conversationId];
      return next;
    });

    typingTimeoutsRef.current[conversationId] = setTimeout(() => {
      setTypingStore((prev) => ({
        ...prev,
        [conversationId]: [typingUser],
      }));

      typingTimeoutsRef.current[conversationId] = setTimeout(() => {
        const replyMessage: ChatMessage = {
          id: `m_${Date.now()}_reply`,
          text: "Mình nhận được rồi, để mình xem tiếp nhé.",
          senderId: typingUser.id,
          senderName: typingUser.name,
          senderAvatar: typingUser.avatarUrl ?? undefined,
          timestamp: new Date().toISOString(),
        };

        setMessageStore((prev) => ({
          ...prev,
          [conversationId]: [...(prev[conversationId] ?? []), replyMessage],
        }));

        setTypingStore((prev) => {
          const next = { ...prev };
          delete next[conversationId];
          return next;
        });
        delete typingTimeoutsRef.current[conversationId];
      }, MOCK_REPLY_DELAY_MS - MOCK_TYPING_DELAY_MS);
    }, MOCK_TYPING_DELAY_MS);
  };

  const handleEditMessage = (messageId: string, text: string) => {
    if (!activeConv) return;

    setMessageStore((prev) => ({
      ...prev,
      [activeConv.id]: (prev[activeConv.id] ?? []).map((message) =>
        message.id === messageId
          ? { ...message, text, editedAt: new Date().toISOString() }
          : message
      ),
    }));
  };

  const handleReactMessage = (messageId: string, emoji: string) => {
    if (!activeConv) return;

    setMessageStore((prev) => ({
      ...prev,
      [activeConv.id]: (prev[activeConv.id] ?? []).map((message) => {
        if (message.id !== messageId) return message;

        const reactions = message.reactions ?? [];
        const existingReaction = reactions.find((reaction) => reaction.emoji === emoji);

        if (!existingReaction) {
          return {
            ...message,
            reactions: [...reactions, { emoji, count: 1, reactedByMe: true }],
          };
        }

        if (existingReaction.reactedByMe) {
          const nextCount = existingReaction.count - 1;
          return {
            ...message,
            reactions: reactions
              .map((reaction) =>
                reaction.emoji === emoji
                  ? { ...reaction, count: nextCount, reactedByMe: false }
                  : reaction
              )
              .filter((reaction) => reaction.count > 0),
          };
        }

        return {
          ...message,
          reactions: reactions.map((reaction) =>
            reaction.emoji === emoji
              ? { ...reaction, count: reaction.count + 1, reactedByMe: true }
              : reaction
          ),
        };
      }),
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
            <PromptInput conv={activeConv} onSend={handleSend} />
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
            <ChatActiveState
              conv={activeConv}
              messages={messages}
              currentUserId={CURRENT_USER_ID}
              typingUsers={typingStore[activeConv.id]}
              onSend={handleSend}
              onEditMessage={handleEditMessage}
              onReactMessage={handleReactMessage}
            />
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
