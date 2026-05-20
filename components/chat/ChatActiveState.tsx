"use client";

import { useRef, useEffect } from "react";
import type { ReactNode } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Info, MoreHorizontal, Phone, Video } from "lucide-react";
import { ConversationListItem } from "./conversation-data";
import ChatInput from "./ChatInput";

type ChatMessageType = "user" | "system";

export interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
  senderName?: string;
  senderAvatar?: string;
  timestamp: string;
  type?: ChatMessageType;
  isSystem?: boolean;
  isOwn?: boolean;
}

interface ChatActiveStateProps {
  conv: ConversationListItem;
  messages: ChatMessage[];
  currentUserId?: string;
  onSend?: (text: string) => void;
}

const msgVariants = {
  hidden: { opacity: 0, y: 10, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] },
  },
};

const MESSAGE_GROUP_WINDOW_MS = 5 * 60 * 1000;

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isSystemMessage(msg: ChatMessage) {
  return msg.isSystem || msg.type === "system" || msg.senderId === "system";
}

function isGroupedWithMessage(current: ChatMessage, adjacent?: ChatMessage) {
  if (!adjacent || isSystemMessage(current) || isSystemMessage(adjacent)) return false;
  if (adjacent.senderId !== current.senderId) return false;

  const currentTime = Date.parse(current.timestamp);
  const adjacentTime = Date.parse(adjacent.timestamp);
  if (!Number.isFinite(currentTime) || !Number.isFinite(adjacentTime)) return false;

  return Math.abs(currentTime - adjacentTime) <= MESSAGE_GROUP_WINDOW_MS;
}

function SystemMessage({
  msg,
  reduceMotion,
}: {
  msg: ChatMessage;
  reduceMotion?: boolean;
}) {
  return (
    <motion.div
      variants={msgVariants as any}
      initial={reduceMotion ? false : "hidden"}
      animate="visible"
      className="my-3 flex justify-center px-3"
    >
      <div
        className="inline-flex max-w-[86%] items-center gap-2 rounded-2xl px-3 py-1.5 text-[12px] leading-[1.45]"
        style={{
          background: "rgb(var(--backgroundColor-surface-container) / 0.36)",
          border: "1px solid rgb(var(--borderColor-secondary) / 0.12)",
          color: "rgb(var(--textColor-secondary))",
        }}
      >
        <Info size={14} strokeWidth={1.5} aria-hidden="true" className="shrink-0" />
        <span className="min-w-0 text-center">{msg.text}</span>
        <span className="hidden shrink-0 opacity-60 sm:inline">{formatTime(msg.timestamp)}</span>
      </div>
    </motion.div>
  );
}

function MessageBubble({
  msg,
  prevMsg,
  nextMsg,
  reduceMotion,
}: {
  msg: ChatMessage;
  prevMsg?: ChatMessage;
  nextMsg?: ChatMessage;
  reduceMotion?: boolean;
}) {
  const isOwn = msg.isOwn ?? false;
  const isGroupedWithPrev = isGroupedWithMessage(msg, prevMsg);
  const isGroupedWithNext = isGroupedWithMessage(msg, nextMsg);

  return (
    <motion.div
      variants={msgVariants as any}
      initial={reduceMotion ? false : "hidden"}
      animate="visible"
      className={`flex items-end gap-2 ${isOwn ? "flex-row-reverse" : "flex-row"}`}
      style={{ marginTop: isGroupedWithPrev ? 2 : 10 }}
    >
      {!isOwn && (
        <div className="shrink-0 w-7 h-7 self-end">
          {!isGroupedWithNext && (
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold overflow-hidden"
              style={{
                background: "rgb(var(--backgroundColor-state-enabled) / 0.8)",
                border: "1px solid rgb(var(--borderColor-secondary) / 0.15)",
                color: "rgb(var(--textColor-primary))",
              }}
            >
              {msg.senderAvatar ? (
                <img
                  src={msg.senderAvatar}
                  alt={msg.senderName ?? ""}
                  className="w-7 h-7 object-cover rounded-full"
                />
              ) : (
                (msg.senderName ?? "?")[0].toUpperCase()
              )}
            </div>
          )}
        </div>
      )}

      <div className={`relative max-w-[72%] flex flex-col ${isOwn ? "items-end" : "items-start"}`}>
        {!isOwn && !isGroupedWithPrev && msg.senderName && (
          <span
            className="text-[11px] font-medium mb-0.5 px-1"
            style={{ color: "rgb(var(--textColor-secondary))" }}
          >
            {msg.senderName}
          </span>
        )}

        <div
          className="px-3 py-2 rounded-2xl text-[14px] leading-[1.5] font-sans break-words"
          style={
            isOwn
              ? {
                background: "rgb(var(--backgroundColor-state-enabled) / 0.85)",
                backdropFilter: "blur(40px)",
                WebkitBackdropFilter: "blur(40px)",
                border: "1px solid rgb(var(--borderColor-secondary) / 0.15)",
                color: "rgb(var(--textColor-primary))",
                borderBottomRightRadius: "6px",
              }
              : {
                background: "rgb(var(--backgroundColor-surface-container) / 0.45)",
                backdropFilter: "blur(40px)",
                WebkitBackdropFilter: "blur(40px)",
                border: "1px solid rgb(var(--borderColor-secondary) / 0.1)",
                color: "rgb(var(--textColor-primary))",
                borderBottomLeftRadius: "6px",
              }
          }
        >
          {msg.text}
        </div>

        {!isGroupedWithNext && (
          <span
            className="text-[10px] mt-0.5 px-1"
            style={{ color: "rgb(var(--textColor-secondary))", opacity: 0.6 }}
          >
            {formatTime(msg.timestamp)}
          </span>
        )}
      </div>
    </motion.div>
  );
}

function DateSeparator({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center gap-3 my-3 select-none">
      <div className="h-px w-8 shrink-0" style={{ background: "rgb(var(--borderColor-secondary) / 0.12)" }} />
      <span className="text-caption shrink-0 px-2" style={{ color: "rgb(var(--textColor-secondary))", opacity: 0.7 }}>
        {label}
      </span>
      <div className="h-px w-8 shrink-0" style={{ background: "rgb(var(--borderColor-secondary) / 0.12)" }} />
    </div>
  );
}

function HeaderActionButton({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className="
        cursor-pointer p-2 rounded-full select-none shrink-0
        transition-colors text-[rgb(var(--textColor-primary))]
        hover:bg-[rgb(var(--backgroundColor-state-hover))]
        focus-ring
      "
    >
      <span className="text-inherit" aria-hidden="true">
        {children}
      </span>
    </button>
  );
}

function ConvHeader({ conv }: { conv: ConversationListItem }) {
  const typeLabel = conv.type === 1 ? "Tin nhắn trực tiếp" : conv.type === 2 ? "Nhóm" : "Kênh";

  return (
    <div
      className="shrink-0 flex items-center gap-3 py-3 pl-4 pr-5 md:px-6"
      style={{ background: "transparent" }}
    >
      <div className="relative shrink-0">
        {conv.avatarUrl ? (
          <img src={conv.avatarUrl} alt={conv.name ?? "Avatar"} className="rounded-full object-cover" style={{ width: 36, height: 36 }} />
        ) : (
          <div
            className="rounded-full flex items-center justify-center text-sm font-semibold"
            style={{
              width: 36,
              height: 36,
              background: "rgb(var(--backgroundColor-state-enabled) / 0.8)",
              border: "1px solid rgb(var(--borderColor-secondary) / 0.15)",
              color: "rgb(var(--textColor-primary))",
            }}
          >
            {(conv.name ?? "?")
              .split(" ")
              .map((w) => w[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </div>
        )}

        {conv.type === 1 && (
          <span
            className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2"
            style={{ background: "rgb(var(--colors-emerald-300))", borderColor: "transparent" }}
          />
        )}
      </div>

      <div className="flex flex-col min-w-0">
        <span className="font-semibold text-body-md truncate" style={{ color: "rgb(var(--textColor-primary))" }}>
          {conv.name ?? "Người dùng"}
        </span>
        <span className="text-[11px]" style={{ color: "rgb(var(--textColor-secondary))", opacity: 0.8 }}>
          {typeLabel}
        </span>
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-1 pr-12 md:gap-2 md:pr-1">
        <HeaderActionButton label="Gọi thoại">
          <Phone size={20} strokeWidth={1.5} aria-hidden="true" />
        </HeaderActionButton>
        <HeaderActionButton label="Gọi video">
          <Video size={20} strokeWidth={1.5} aria-hidden="true" />
        </HeaderActionButton>
        <HeaderActionButton label="Tùy chọn khác">
          <MoreHorizontal size={24} strokeWidth={1.5} aria-hidden="true" />
        </HeaderActionButton>
      </div>
    </div>
  );
}

export default function ChatActiveState({ conv, messages, onSend }: ChatActiveStateProps) {
  const shouldReduceMotion = useReducedMotion() ?? false;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: shouldReduceMotion ? "auto" : "smooth" });
  }, [messages.length, shouldReduceMotion]);

  return (
    <div className="grid h-full min-h-0 w-full grid-rows-[auto_minmax(0,1fr)_auto] bg-transparent overflow-hidden">
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        <ConvHeader conv={conv} />
      </motion.div>

      <div className="message-scrollbar min-h-0 overflow-y-scroll overscroll-contain px-4 py-3">
        <div className="flex min-h-full flex-col justify-end">
          <DateSeparator label="Hôm nay" />

          <AnimatePresence initial={false}>
            {messages.map((msg, i) =>
              isSystemMessage(msg) ? (
                <SystemMessage key={msg.id} msg={msg} reduceMotion={shouldReduceMotion} />
              ) : (
                <MessageBubble
                  key={msg.id}
                  msg={msg}
                  prevMsg={messages[i - 1]}
                  nextMsg={messages[i + 1]}
                  reduceMotion={shouldReduceMotion}
                />
              )
            )}
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
