"use client";

import { useEffect, useMemo, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import type { ConversationListItem } from "./conversation-data";
import ChatInput from "./ChatInput";
import ChatConversationHeader from "./ChatConversationHeader";
import ChatDateSeparator from "./ChatDateSeparator";
import ChatMessageBubble from "./ChatMessageBubble";
import ChatSystemMessage from "./ChatSystemMessage";
import type { ChatMessage } from "./chat-message-types";
import { isSystemMessage } from "./chat-message-utils";

export type { ChatMessage, ChatMessageReaction } from "./chat-message-types";

interface ChatActiveStateProps {
  conv: ConversationListItem;
  messages: ChatMessage[];
  currentUserId?: string;
  typingUsers?: ChatTypingUser[];
  onSend?: (text: string) => void;
  onEditMessage?: (messageId: string, text: string) => void;
  onReactMessage?: (messageId: string, emoji: string) => void;
}

function getFallbackTypingUsers(messages: ChatMessage[], currentUserId?: string): ChatTypingUser[] {
  const candidate = messages.findLast((message) => {
    if (isSystemMessage(message)) return false;

    return !(message.isOwn ?? message.senderId === currentUserId);
  });

  if (!candidate) return [];

  return [
    {
      id: candidate.senderId,
      name: candidate.senderName ?? "Ai đó",
      avatarUrl: candidate.senderAvatar,
    },
  ];
}

export interface ChatTypingUser {
  id: string;
  name: string;
  avatarUrl?: string | null;
}

function getVisibleTypingUsers(users: ChatTypingUser[], currentUserId?: string) {
  const seenUserIds = new Set<string>();
  const visibleUsers: ChatTypingUser[] = [];

  for (const user of users) {
    if (user.id === currentUserId || seenUserIds.has(user.id)) continue;

    seenUserIds.add(user.id);
    visibleUsers.push(user);
  }

  return visibleUsers;
}

function formatTypingLabel(users: ChatTypingUser[]) {
  if (users.length === 1) return `${users[0].name} đang nhập`;
  if (users.length === 2) return `${users[0].name} và ${users[1].name} đang nhập`;

  return `${users[0].name} và ${users.length - 1} người khác đang nhập`;
}

function TypingIndicator({
  users,
  reduceMotion,
}: {
  users: ChatTypingUser[];
  reduceMotion: boolean;
}) {
  if (users.length === 0) return null;

  const primaryUser = users[0];
  const initials = primaryUser.name.trim().slice(0, 2).toUpperCase() || "?";
  const label = formatTypingLabel(users);

  return (
    <motion.div
      key="typing-indicator"
      role="status"
      aria-live="polite"
      initial={reduceMotion ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 4 }}
      transition={reduceMotion ? { duration: 0 } : { duration: 0.18, ease: "easeOut" }}
      className="mt-3 flex items-end gap-2"
    >
      <div className="shrink-0 w-7 h-7 self-end">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold overflow-hidden"
          style={{
            background: "rgb(var(--backgroundColor-state-enabled) / 0.8)",
            border: "1px solid rgb(var(--borderColor-secondary) / 0.15)",
            color: "rgb(var(--textColor-primary))",
          }}
        >
          {primaryUser.avatarUrl ? (
            <img
              src={primaryUser.avatarUrl}
              alt=""
              className="w-7 h-7 object-cover rounded-full"
            />
          ) : (
            initials
          )}
        </div>
      </div>

      <div className="flex max-w-[72%] flex-col items-start">
        <div
          className="rounded-2xl px-3 py-2 font-sans text-[14px] leading-[1.5]"
          style={{
            background: "rgb(var(--backgroundColor-surface-container) / 0.45)",
            backdropFilter: "blur(40px)",
            WebkitBackdropFilter: "blur(40px)",
            border: "1px solid rgb(var(--borderColor-secondary) / 0.1)",
            borderBottomLeftRadius: "6px",
            color: "rgb(var(--textColor-primary))",
          }}
        >
          <span className="sr-only">{label}</span>
          <span aria-hidden="true" className="flex items-center gap-1">
            {[0, 1, 2].map((dot) => (
              <motion.span
                key={dot}
                className="block size-1.5 rounded-full bg-[rgb(var(--textColor-secondary))]"
                animate={reduceMotion ? { opacity: 0.65 } : { opacity: [0.35, 1, 0.35], y: [0, -2, 0] }}
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : {
                      duration: 0.85,
                      ease: "easeInOut",
                      repeat: Infinity,
                      delay: dot * 0.12,
                    }
                }
              />
            ))}
          </span>
        </div>
        <span
          className="mt-0.5 px-1 text-[10px]"
          style={{ color: "rgb(var(--textColor-secondary))", opacity: 0.72 }}
        >
          {label}
        </span>
      </div>
    </motion.div>
  );
}


export default function ChatActiveState({
  conv,
  messages,
  currentUserId,
  typingUsers,
  onSend,
  onEditMessage,
  onReactMessage,
}: ChatActiveStateProps) {
  const shouldReduceMotion = useReducedMotion() ?? false;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const visibleTypingUsers = useMemo(
    () => getVisibleTypingUsers(typingUsers ?? getFallbackTypingUsers(messages, currentUserId), currentUserId),
    [currentUserId, messages, typingUsers],
  );
  const typingUsersKey = visibleTypingUsers.map((user) => user.id).join("|");

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: shouldReduceMotion ? "auto" : "smooth" });
  }, [messages.length, shouldReduceMotion, typingUsersKey]);

  return (
    <div className="grid h-full min-h-0 w-full grid-rows-[auto_minmax(0,1fr)_auto] bg-transparent overflow-hidden">
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        <ChatConversationHeader conv={conv} />
      </motion.div>

      <div className="message-scrollbar min-h-0 overflow-x-hidden overflow-y-scroll overscroll-contain px-4 py-3">
        <div className="flex min-h-full flex-col justify-end">
          <ChatDateSeparator label="Hôm nay" />

          <AnimatePresence initial={false}>
            {messages.map((msg, i) =>
              isSystemMessage(msg) ? (
                <ChatSystemMessage key={msg.id} msg={msg} reduceMotion={shouldReduceMotion} />
              ) : (
                <ChatMessageBubble
                  key={msg.id}
                  msg={msg}
                  prevMsg={messages[i - 1]}
                  nextMsg={messages[i + 1]}
                  currentUserId={currentUserId}
                  reduceMotion={shouldReduceMotion}
                  onEditMessage={onEditMessage}
                  onReactMessage={onReactMessage}
                />
              )
            )}

            {visibleTypingUsers.length ? (
              <TypingIndicator
                key="typing-indicator"
                users={visibleTypingUsers}
                reduceMotion={shouldReduceMotion}
              />
            ) : null}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>
      </div>

      <motion.div
        className="shrink-0 flex justify-center px-4 pb-4 pt-2"
        initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      >
        <ChatInput
          ariaLabel={conv.name ? `Nhắn tin tới ${conv.name}` : "Nhắn tin"}
          placeholder={`Nhắn tin ${conv.name ? `tới ${conv.name}` : ""}...`}
          sendLabel="Gửi tin nhắn"
          onSend={onSend}
        />
      </motion.div>
    </div>
  );
}
