"use client";

import { useEffect, useReducer, useRef, type CSSProperties } from "react";
import Image from "next/image";
import { m } from "framer-motion";
import { Check, MoreHorizontal, Paperclip, Pencil, SmilePlus, X } from "lucide-react";

import { MessageActionButton, MessageMoreMenu, MessageReactionPicker } from "./ChatMessageActions";
import type { ChatMessage } from "@/types/message";
import { formatTime, isGroupedWithMessage, msgVariants } from "@/lib/chat-message-utils";

const EDIT_WINDOW_MS = 24 * 60 * 60 * 1000;

interface MessageBubbleState {
  isActionBarOpen: boolean;
  isReactionPickerOpen: boolean;
  isMoreMenuOpen: boolean;
  isEditing: boolean;
  draftText: string;
}

type MessageBubbleAction =
  | { type: "showActionBar" }
  | { type: "closeFloating" }
  | { type: "toggleReactionPicker" }
  | { type: "toggleMoreMenu" }
  | { type: "startEdit"; text: string }
  | { type: "cancelEdit"; text: string }
  | { type: "setDraftText"; text: string }
  | { type: "finishEdit" };

const initialMessageBubbleState: MessageBubbleState = {
  isActionBarOpen: false,
  isReactionPickerOpen: false,
  isMoreMenuOpen: false,
  isEditing: false,
  draftText: "",
};

function messageBubbleReducer(
  state: MessageBubbleState,
  action: MessageBubbleAction,
): MessageBubbleState {
  switch (action.type) {
    case "showActionBar":
      return { ...state, isActionBarOpen: true };
    case "closeFloating":
      return {
        ...state,
        isActionBarOpen: false,
        isReactionPickerOpen: false,
        isMoreMenuOpen: false,
      };
    case "toggleReactionPicker":
      return {
        ...state,
        isActionBarOpen: true,
        isReactionPickerOpen: !state.isReactionPickerOpen,
        isMoreMenuOpen: false,
      };
    case "toggleMoreMenu":
      return {
        ...state,
        isActionBarOpen: true,
        isMoreMenuOpen: !state.isMoreMenuOpen,
        isReactionPickerOpen: false,
      };
    case "startEdit":
      return {
        ...state,
        isActionBarOpen: false,
        isReactionPickerOpen: false,
        isMoreMenuOpen: false,
        isEditing: true,
        draftText: action.text,
      };
    case "cancelEdit":
      return { ...state, isEditing: false, draftText: action.text };
    case "setDraftText":
      return { ...state, draftText: action.text };
    case "finishEdit":
      return { ...state, isEditing: false };
  }
}

function isWithinEditWindow(timestamp: string) {
  const createdAt = Date.parse(timestamp);

  return Number.isFinite(createdAt) && Date.now() - createdAt <= EDIT_WINDOW_MS;
}

function formatFileSize(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface ChatMessageBubbleProps {
  msg: ChatMessage;
  prevMsg?: ChatMessage;
  nextMsg?: ChatMessage;
  currentUserId?: string;
  reduceMotion?: boolean;
  canManageMessages?: boolean;
  onEditMessage?: (messageId: string, text: string) => void | Promise<void>;
  onDeleteMessage?: (messageId: string) => void | Promise<void>;
  onReactMessage?: (messageId: string, emoji: string) => void | Promise<void>;
}

function MessageSenderAvatar({
  msg,
  isGroupedWithNext,
}: {
  msg: ChatMessage;
  isGroupedWithNext: boolean;
}) {
  return (
    <div className="shrink-0 size-7 self-end">
      {!isGroupedWithNext ? (
        <div
          className="size-7 rounded-full flex items-center justify-center text-[11px] font-semibold overflow-hidden"
          style={{
            background: "rgb(var(--backgroundColor-state-enabled) / 0.8)",
            border: "1px solid rgb(var(--borderColor-secondary) / 0.15)",
            color: "rgb(var(--textColor-primary))",
          }}
        >
          {msg.senderAvatar ? (
            <Image
              src={msg.senderAvatar}
              alt={msg.senderName ?? ""}
              width={28}
              height={28}
              unoptimized
              className="size-7 object-cover rounded-full"
            />
          ) : (
            (msg.senderName ?? "?")[0].toUpperCase()
          )}
        </div>
      ) : null}
    </div>
  );
}

function MessageEditor({
  draftText,
  bubbleStyle,
  onDraftTextChange,
  onCancel,
  onSave,
}: {
  draftText: string;
  bubbleStyle: CSSProperties;
  onDraftTextChange: (text: string) => void;
  onCancel: () => void;
  onSave: () => void;
}) {
  return (
    <div
      className="w-[min(360px,72vw)] rounded-2xl px-3 py-2 font-sans"
      style={bubbleStyle}
    >
      <textarea
        value={draftText}
        aria-label="Chỉnh sửa tin nhắn"
        className="block min-h-16 w-full resize-none bg-transparent text-[14px] leading-[1.5] outline-none"
        style={{ color: "rgb(var(--textColor-primary))" }}
        onChange={(event) => onDraftTextChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            onCancel();
          }

          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            onSave();
          }
        }}
      />
      <div className="mt-2 flex items-center justify-end gap-1">
        <button
          type="button"
          aria-label="Hủy chỉnh sửa"
          className="flex size-7 cursor-pointer items-center justify-center rounded-full hover:bg-[rgb(var(--backgroundColor-state-hover))] focus-ring"
          onClick={onCancel}
        >
          <X size={15} strokeWidth={1.8} aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label="Lưu chỉnh sửa"
          className="flex size-7 cursor-pointer items-center justify-center rounded-full hover:bg-[rgb(var(--backgroundColor-state-hover))] focus-ring disabled:cursor-not-allowed disabled:opacity-40"
          disabled={!draftText.trim()}
          onClick={onSave}
        >
          <Check size={16} strokeWidth={1.8} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

function MessageReadView({
  msg,
  bubbleStyle,
  onShowActionBar,
}: {
  msg: ChatMessage;
  bubbleStyle: CSSProperties;
  onShowActionBar: () => void;
}) {
  const isDeleted = Boolean(msg.isDeleted);

  return (
    <div className="relative flex max-w-full flex-col rounded-2xl font-sans text-[14px] leading-[1.5] break-words">
      <button
        type="button"
        aria-label="Mở thao tác tin nhắn"
        className="absolute inset-0 rounded-2xl border-none p-0 text-left focus-ring"
        style={bubbleStyle}
        onClick={onShowActionBar}
      />
      <div className="relative z-10 flex max-w-full flex-col gap-2 px-3 py-2 pointer-events-none">
        {msg.text ? <p className="whitespace-pre-wrap">{msg.text}</p> : null}
        {!isDeleted && msg.attachments?.length ? (
          <div className="relative z-20 flex max-w-full flex-col gap-1.5 pointer-events-auto">
            {msg.attachments.map((attachment) => (
              <a
                key={attachment.id}
                href={attachment.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="flex min-w-0 items-center gap-2 rounded-xl border px-2.5 py-2 text-[12px] transition-colors hover:bg-[rgb(var(--backgroundColor-state-hover))] focus-ring"
                style={{
                  borderColor: "rgb(var(--borderColor-secondary) / 0.12)",
                  color: "rgb(var(--textColor-primary))",
                }}
              >
                <Paperclip size={14} strokeWidth={1.7} aria-hidden="true" className="shrink-0" />
                <span className="min-w-0 flex-1 truncate">{attachment.fileName}</span>
                <span
                  className="shrink-0 text-[10px]"
                  style={{ color: "rgb(var(--textColor-secondary))" }}
                >
                  {formatFileSize(attachment.fileSizeBytes)}
                </span>
              </a>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

interface MessageActionBarState {
  isOwn: boolean;
  isVisible: boolean;
  isReactionPickerOpen: boolean;
  isMoreMenuOpen: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

interface MessageActionBarHandlers {
  onReact: (emoji: string) => void;
  onCopy: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleReactionPicker: () => void;
  onToggleMoreMenu: () => void;
}

function MessageActionBar({
  state,
  handlers,
}: {
  state: MessageActionBarState;
  handlers: MessageActionBarHandlers;
}) {
  return (
    <div
      className={`absolute bottom-full z-10 mb-1 flex translate-y-0 items-center gap-0.5 rounded-full border px-1 py-0.5 shadow-lg backdrop-blur-glass transition-opacity sm:top-1/2 sm:bottom-auto sm:mb-0 sm:-translate-y-1/2 ${state.isVisible ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0 group-focus-within:opacity-100 group-hover:opacity-100 sm:pointer-events-auto"
        } ${state.isOwn ? "right-0 sm:right-full sm:mr-1" : "left-0 sm:left-full sm:ml-1"
        }`}
      style={{
        background: "rgb(var(--backgroundColor-surface-container) / 0.84)",
        borderColor: "rgb(var(--borderColor-secondary) / 0.12)",
      }}
    >
      {state.isReactionPickerOpen ? (
        <MessageReactionPicker isOwn={state.isOwn} onReact={handlers.onReact} />
      ) : null}
      {state.isMoreMenuOpen ? (
        <MessageMoreMenu
          isOwn={state.isOwn}
          canDelete={state.canDelete}
          onCopy={handlers.onCopy}
          onEdit={state.canEdit ? handlers.onEdit : undefined}
          onDelete={state.canDelete ? handlers.onDelete : undefined}
        />
      ) : null}

      <MessageActionButton label="Thả cảm xúc" onClick={handlers.onToggleReactionPicker}>
        <SmilePlus size={16} strokeWidth={1.7} />
      </MessageActionButton>

      {state.canEdit ? (
        <MessageActionButton label="Chỉnh sửa" onClick={handlers.onEdit}>
          <Pencil size={16} strokeWidth={1.7} />
        </MessageActionButton>
      ) : null}

      <MessageActionButton label="Tùy chọn khác" onClick={handlers.onToggleMoreMenu}>
        <MoreHorizontal size={17} strokeWidth={1.7} />
      </MessageActionButton>
    </div>
  );
}

function MessageReactions({
  msg,
  isOwn,
  onReact,
}: {
  msg: ChatMessage;
  isOwn: boolean;
  onReact: (emoji: string) => void;
}) {
  if (msg.isDeleted || !msg.reactions?.length) return null;

  return (
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
          onClick={() => onReact(reaction.emoji)}
        >
          <span>{reaction.emoji}</span>
          <span className="text-[10px]" style={{ color: "rgb(var(--textColor-secondary))" }}>
            {reaction.count}
          </span>
        </button>
      ))}
    </div>
  );
}

function MessageTimestamp({
  msg,
  isGroupedWithNext,
}: {
  msg: ChatMessage;
  isGroupedWithNext: boolean;
}) {
  if (isGroupedWithNext && !msg.editedAt) return null;

  return (
    <span
      className="text-[10px] mt-0.5 px-1"
      style={{ color: "rgb(var(--textColor-secondary))", opacity: 0.6 }}
    >
      {!isGroupedWithNext ? formatTime(msg.timestamp) : ""}
      {msg.editedAt ? `${!isGroupedWithNext ? " · " : ""}đã sửa` : ""}
    </span>
  );
}

export default function ChatMessageBubble({
  msg,
  prevMsg,
  nextMsg,
  currentUserId,
  reduceMotion,
  canManageMessages = false,
  onEditMessage,
  onDeleteMessage,
  onReactMessage,
}: ChatMessageBubbleProps) {
  const isOwn = msg.isOwn ?? msg.senderId === currentUserId;
  const isGroupedWithPrev = isGroupedWithMessage(msg, prevMsg);
  const isGroupedWithNext = isGroupedWithMessage(msg, nextMsg);
  const messageRootRef = useRef<HTMLDivElement>(null);
  const [state, dispatch] = useReducer(messageBubbleReducer, initialMessageBubbleState);
  const {
    isActionBarOpen,
    isReactionPickerOpen,
    isMoreMenuOpen,
    isEditing,
    draftText,
  } = state;
  const hasOpenFloatingMenu = isReactionPickerOpen || isMoreMenuOpen;
  const isActionBarVisible = isActionBarOpen || hasOpenFloatingMenu;
  const isDeleted = Boolean(msg.isDeleted);
  const canEditMessage =
    !isDeleted &&
    isOwn &&
    (msg.messageType === undefined || msg.messageType === 1) &&
    isWithinEditWindow(msg.timestamp) &&
    !msg.id.startsWith("local_");
  const canDeleteMessage = !isDeleted && !msg.id.startsWith("local_") && (isOwn || canManageMessages);

  useEffect(() => {
    if (!isActionBarVisible) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (target instanceof Node && messageRootRef.current?.contains(target)) return;

      dispatch({ type: "closeFloating" });
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;

      dispatch({ type: "closeFloating" });
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
    if (isDeleted) return;

    void onReactMessage?.(msg.id, emoji);
    dispatch({ type: "closeFloating" });
  };

  const handleCopy = () => {
    dispatch({ type: "closeFloating" });
    const attachmentText = msg.attachments
      ?.map((attachment) => `${attachment.fileName}: ${attachment.fileUrl}`)
      .join("\n");
    const copyText = [msg.text, attachmentText].filter(Boolean).join("\n");

    void navigator.clipboard?.writeText(copyText);
  };

  const startEdit = () => {
    if (!canEditMessage) return;

    dispatch({ type: "startEdit", text: msg.text });
  };

  const showActionBar = () => {
    if (isEditing || isDeleted) return;

    dispatch({ type: "showActionBar" });
  };

  const cancelEdit = () => {
    dispatch({ type: "cancelEdit", text: msg.text });
  };

  const saveEdit = () => {
    const nextText = draftText.trim();
    if (!nextText) return;

    void onEditMessage?.(msg.id, nextText);
    dispatch({ type: "finishEdit" });
  };

  const handleDelete = () => {
    if (!canDeleteMessage) return;

    dispatch({ type: "closeFloating" });
    void onDeleteMessage?.(msg.id);
  };

  return (
    <m.div
      variants={msgVariants}
      initial={reduceMotion ? false : "hidden"}
      animate="visible"
      className={`flex items-end gap-2 ${isOwn ? "flex-row-reverse" : "flex-row"}`}
      style={{ marginTop: isGroupedWithPrev ? 2 : 10 }}
    >
      {!isOwn ? <MessageSenderAvatar msg={msg} isGroupedWithNext={isGroupedWithNext} /> : null}

      <div
        ref={messageRootRef}
        className={`group relative max-w-[72%] flex flex-col ${isActionBarVisible ? "z-30" : "z-0"} ${isOwn ? "items-end" : "items-start"
          }`}
      >
        {!isOwn && !isGroupedWithPrev && msg.senderName ? (
          <span
            className="text-[11px] font-medium mb-0.5 px-1"
            style={{ color: "rgb(var(--textColor-secondary))" }}
          >
            {msg.senderName}
          </span>
        ) : null}

        <div className="relative max-w-full">
          {isEditing ? (
            <MessageEditor
              draftText={draftText}
              bubbleStyle={bubbleStyle}
              onDraftTextChange={(text) => dispatch({ type: "setDraftText", text })}
              onCancel={cancelEdit}
              onSave={saveEdit}
            />
          ) : (
            <MessageReadView
              msg={msg}
              bubbleStyle={bubbleStyle}
              onShowActionBar={showActionBar}
            />
          )}

          {!isEditing && !isDeleted ? (
            <MessageActionBar
              state={{
                isOwn,
                isVisible: isActionBarVisible,
                isReactionPickerOpen,
                isMoreMenuOpen,
                canEdit: canEditMessage,
                canDelete: canDeleteMessage,
              }}
              handlers={{
                onReact: handleReact,
                onCopy: handleCopy,
                onEdit: startEdit,
                onDelete: handleDelete,
                onToggleReactionPicker: () => dispatch({ type: "toggleReactionPicker" }),
                onToggleMoreMenu: () => dispatch({ type: "toggleMoreMenu" }),
              }}
            />
          ) : null}
        </div>

        <MessageReactions msg={msg} isOwn={isOwn} onReact={handleReact} />
        <MessageTimestamp msg={msg} isGroupedWithNext={isGroupedWithNext} />
      </div>
    </m.div>
  );
}
