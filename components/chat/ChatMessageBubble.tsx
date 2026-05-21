"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Check, MoreHorizontal, Pencil, SmilePlus, X } from "lucide-react";

import { MessageActionButton, MessageMoreMenu, MessageReactionPicker } from "./ChatMessageActions";
import type { ChatMessage } from "./chat-message-types";
import { formatTime, isGroupedWithMessage, msgVariants } from "./chat-message-utils";

interface ChatMessageBubbleProps {
  msg: ChatMessage;
  prevMsg?: ChatMessage;
  nextMsg?: ChatMessage;
  currentUserId?: string;
  reduceMotion?: boolean;
  onEditMessage?: (messageId: string, text: string) => void;
  onReactMessage?: (messageId: string, emoji: string) => void;
}

export default function ChatMessageBubble({
  msg,
  prevMsg,
  nextMsg,
  currentUserId,
  reduceMotion,
  onEditMessage,
  onReactMessage,
}: ChatMessageBubbleProps) {
  const isOwn = msg.isOwn ?? msg.senderId === currentUserId;
  const isGroupedWithPrev = isGroupedWithMessage(msg, prevMsg);
  const isGroupedWithNext = isGroupedWithMessage(msg, nextMsg);
  const messageRootRef = useRef<HTMLDivElement>(null);
  const [isActionBarOpen, setIsActionBarOpen] = useState(false);
  const [isReactionPickerOpen, setIsReactionPickerOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [draftText, setDraftText] = useState(msg.text);
  const hasOpenFloatingMenu = isReactionPickerOpen || isMoreMenuOpen;
  const isActionBarVisible = isActionBarOpen || hasOpenFloatingMenu;

  useEffect(() => {
    if (!isEditing) setDraftText(msg.text);
  }, [isEditing, msg.text]);

  useEffect(() => {
    if (!isActionBarVisible) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (target instanceof Node && messageRootRef.current?.contains(target)) return;

      setIsActionBarOpen(false);
      setIsMoreMenuOpen(false);
      setIsReactionPickerOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;

      setIsActionBarOpen(false);
      setIsMoreMenuOpen(false);
      setIsReactionPickerOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isActionBarVisible]);

  const bubbleStyle = isOwn
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
    };

  const handleReact = (emoji: string) => {
    onReactMessage?.(msg.id, emoji);
    setIsActionBarOpen(false);
    setIsReactionPickerOpen(false);
  };

  const handleCopy = () => {
    setIsActionBarOpen(false);
    setIsMoreMenuOpen(false);
    void navigator.clipboard?.writeText(msg.text);
  };

  const startEdit = () => {
    setIsActionBarOpen(false);
    setIsMoreMenuOpen(false);
    setIsReactionPickerOpen(false);
    setDraftText(msg.text);
    setIsEditing(true);
  };

  const showActionBar = () => {
    if (isEditing) return;

    setIsActionBarOpen(true);
  };

  const cancelEdit = () => {
    setDraftText(msg.text);
    setIsEditing(false);
  };

  const saveEdit = () => {
    const nextText = draftText.trim();
    if (!nextText) return;

    onEditMessage?.(msg.id, nextText);
    setIsEditing(false);
  };

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

      <div
        ref={messageRootRef}
        className={`group relative max-w-[72%] flex flex-col ${isActionBarVisible ? "z-30" : "z-0"} ${isOwn ? "items-end" : "items-start"
          }`}
      >
        {!isOwn && !isGroupedWithPrev && msg.senderName && (
          <span
            className="text-[11px] font-medium mb-0.5 px-1"
            style={{ color: "rgb(var(--textColor-secondary))" }}
          >
            {msg.senderName}
          </span>
        )}

        <div className="relative max-w-full">
          {isEditing ? (
            <div
              className="w-[min(360px,72vw)] rounded-2xl px-3 py-2 font-sans"
              style={bubbleStyle}
            >
              <textarea
                value={draftText}
                aria-label="Chỉnh sửa tin nhắn"
                className="block min-h-16 w-full resize-none bg-transparent text-[14px] leading-[1.5] outline-none"
                style={{ color: "rgb(var(--textColor-primary))" }}
                autoFocus
                onChange={(event) => setDraftText(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    event.preventDefault();
                    cancelEdit();
                  }

                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    saveEdit();
                  }
                }}
              />
              <div className="mt-2 flex items-center justify-end gap-1">
                <button
                  type="button"
                  aria-label="Hủy chỉnh sửa"
                  className="flex size-7 cursor-pointer items-center justify-center rounded-full hover:bg-[rgb(var(--backgroundColor-state-hover))] focus-ring"
                  onClick={cancelEdit}
                >
                  <X size={15} strokeWidth={1.8} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  aria-label="Lưu chỉnh sửa"
                  className="flex size-7 cursor-pointer items-center justify-center rounded-full hover:bg-[rgb(var(--backgroundColor-state-hover))] focus-ring disabled:cursor-not-allowed disabled:opacity-40"
                  disabled={!draftText.trim()}
                  onClick={saveEdit}
                >
                  <Check size={16} strokeWidth={1.8} aria-hidden="true" />
                </button>
              </div>
            </div>
          ) : (
            <div
              className="rounded-2xl px-3 py-2 font-sans text-[14px] leading-[1.5] break-words"
              style={bubbleStyle}
              onClick={showActionBar}
            >
              {msg.text}
            </div>
          )}

          {!isEditing ? (
            <div
              className={`absolute bottom-full z-10 mb-1 flex translate-y-0 items-center gap-0.5 rounded-full border px-1 py-0.5 shadow-lg backdrop-blur-glass transition-opacity sm:top-1/2 sm:bottom-auto sm:mb-0 sm:-translate-y-1/2 ${isActionBarVisible ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0 group-focus-within:opacity-100 group-hover:opacity-100 sm:pointer-events-auto"
                } ${isOwn ? "right-0 sm:right-full sm:mr-1" : "left-0 sm:left-full sm:ml-1"
                }`}
              style={{
                background: "rgb(var(--backgroundColor-surface-container) / 0.84)",
                borderColor: "rgb(var(--borderColor-secondary) / 0.12)",
              }}
            >
              {isReactionPickerOpen ? <MessageReactionPicker isOwn={isOwn} onReact={handleReact} /> : null}
              {isMoreMenuOpen ? <MessageMoreMenu isOwn={isOwn} onCopy={handleCopy} onEdit={startEdit} /> : null}

              <MessageActionButton
                label="Thả cảm xúc"
                onClick={() => {
                  setIsReactionPickerOpen((isOpen) => !isOpen);
                  setIsMoreMenuOpen(false);
                }}
              >
                <SmilePlus size={16} strokeWidth={1.7} />
              </MessageActionButton>

              {isOwn ? (
                <MessageActionButton label="Chỉnh sửa" onClick={startEdit}>
                  <Pencil size={16} strokeWidth={1.7} />
                </MessageActionButton>
              ) : null}

              <MessageActionButton
                label="Tùy chọn khác"
                onClick={() => {
                  setIsMoreMenuOpen((isOpen) => !isOpen);
                  setIsReactionPickerOpen(false);
                }}
              >
                <MoreHorizontal size={17} strokeWidth={1.7} />
              </MessageActionButton>
            </div>
          ) : null}
        </div>

        {msg.reactions?.length ? (
          <div className={`mt-1 flex flex-wrap gap-1 px-1 ${isOwn ? "justify-end" : "justify-start"}`}>
            {msg.reactions.map((reaction) => (
              <button
                key={reaction.emoji}
                type="button"
                aria-label={`Cảm xúc ${reaction.emoji}`}
                className="inline-flex cursor-pointer items-center gap-1 rounded-full border px-1.5 py-0.5 text-[12px] leading-none transition-colors hover:bg-[rgb(var(--backgroundColor-state-hover))] focus-ring"
                style={{
                  background: reaction.reactedByMe
                    ? "rgb(var(--backgroundColor-state-active) / 0.72)"
                    : "rgb(var(--backgroundColor-surface-container) / 0.48)",
                  borderColor: "rgb(var(--borderColor-secondary) / 0.12)",
                  color: "rgb(var(--textColor-primary))",
                }}
                onClick={() => handleReact(reaction.emoji)}
              >
                <span>{reaction.emoji}</span>
                <span className="text-[10px]" style={{ color: "rgb(var(--textColor-secondary))" }}>
                  {reaction.count}
                </span>
              </button>
            ))}
          </div>
        ) : null}

        {(!isGroupedWithNext || msg.editedAt) && (
          <span
            className="text-[10px] mt-0.5 px-1"
            style={{ color: "rgb(var(--textColor-secondary))", opacity: 0.6 }}
          >
            {!isGroupedWithNext ? formatTime(msg.timestamp) : ""}
            {msg.editedAt ? `${!isGroupedWithNext ? " · " : ""}đã sửa` : ""}
          </span>
        )}
      </div>
    </motion.div>
  );
}
