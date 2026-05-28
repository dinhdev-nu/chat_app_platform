"use client";

import React from "react";
import {
  ConversationListItem,
  formatConversationActivity,
  getConversationTypeLabel,
} from "./conversation-data";
import { UserIcon, ListBulletIcon, UsersIcon, BellSlashIcon } from "./icons";

interface ConversationItemProps {
  conversation: ConversationListItem;
  isActive?: boolean;
  onSelect?: (conv: ConversationListItem) => void;
}

function TypeIcon({ type }: { type: ConversationListItem["type"] }) {
  if (type === 1) {
    return <UserIcon size={14} />;
  }

  if (type === 2) {
    return <UsersIcon size={14} />;
  }

  return <ListBulletIcon size={14} />;
}

function ConversationItem({ conversation, isActive = false, onSelect }: ConversationItemProps) {
  const initials = (conversation.name ?? "").trim().slice(0, 2).toUpperCase() || "CH";
  const typeLabel = getConversationTypeLabel(conversation.type);
  const activityLabel = formatConversationActivity(conversation.lastActivityAt);
  const onlineLabel = conversation.isOnline ? "Đang online" : "Đang offline";

  return (
    <li>
      <button
        type="button"
        aria-current={isActive ? "true" : undefined}
        onClick={() => onSelect?.(conversation)}
        className={`
          flex w-full items-center justify-between gap-3 p-2 rounded-xl
          transition-colors duration-200 ease-out
          text-body-sm text-left
          border active:scale-[0.985]
          ${isActive
            ? "bg-[rgb(var(--backgroundColor-state-active)/0.12)] border-[rgb(var(--borderColor-secondary)/0.18)]"
            : "border-transparent hover:bg-[rgb(var(--backgroundColor-state-hover)/0.5)]"}
        `}
      >
        {/* Avatar */}
        <div className="relative shrink-0">
          <div
            className={`
              w-10 h-10 min-w-[2.5rem] rounded-xl
              flex items-center justify-center overflow-hidden bg-cover bg-center bg-no-repeat
              ${isActive ? "bg-[rgb(var(--backgroundColor-state-enabled)/.65)]" : "bg-[rgb(var(--backgroundColor-state-enabled)/.575)]"}
              border border-[rgb(var(--borderColor-secondary)/.15)]
            `}
            style={{
              backgroundImage: conversation.avatarUrl ? `url(${conversation.avatarUrl})` : undefined,
              backgroundColor: conversation.avatarUrl ? "transparent" : "rgb(var(--backgroundColor-state-active))",
            }}
          >
            {!conversation.avatarUrl && (
              <span className="text-[12px] font-semibold text-[rgb(var(--textColor-primary))]">
                {initials}
              </span>
            )}
          </div>
          <span
            aria-label={onlineLabel}
            title={onlineLabel}
            className={`absolute -bottom-0.5 -right-0.5 block size-3 rounded-full border-2 ${
              conversation.isOnline
                ? "bg-emerald-400 border-[rgb(var(--backgroundColor-primary))]"
                : "bg-[rgb(var(--textColor-disabled))] border-[rgb(var(--backgroundColor-primary))]"
            }`}
          />
        </div>

        {/* Info */}
        <div className="flex flex-1 flex-col justify-center min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p
              className="min-w-0 flex-1 truncate text-body-md font-bold text-primary"
              style={{ fontWeight: 700 }}
            >
              {conversation.name ?? "Không có tiêu đề"}
            </p>
            <div className={`flex shrink-0 items-center gap-2 text-[11px] ${isActive ? "text-[rgb(var(--textColor-primary))]" : "text-secondary"}`}>
              {conversation.isMuted && (
                <span
                  title="Đang tắt thông báo"
                  aria-label="Đang tắt thông báo"
                  className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[rgb(var(--backgroundColor-state-active))] text-[rgb(var(--textColor-secondary))]"
                >
                  <BellSlashIcon size={14} />
                </span>
              )}
              <span>{activityLabel}</span>
            </div>
          </div>

          <div className={`mt-0.5 flex items-center gap-2 text-[12px] leading-[150%] ${isActive ? "text-[rgb(var(--textColor-primary))]" : "text-[rgb(var(--textColor-secondary))]"}`}>
            <span
              title={typeLabel}
              aria-label={typeLabel}
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-caption ${isActive ? "bg-[rgb(var(--backgroundColor-state-enabled)/.6)] text-[rgb(var(--textColor-primary))]" : "bg-[rgb(var(--backgroundColor-state-enabled)/.4)] text-secondary"}`}
            >
              <TypeIcon type={conversation.type} />
              <span className="sr-only">{typeLabel}</span>
            </span>
            <span className={`truncate text-body-sm ${isActive ? "text-[rgb(var(--textColor-primary))]" : "text-secondary"}`}>
              {conversation.lastMessageText ?? conversation.description ?? "Chưa có tin nhắn"}
            </span>
            {conversation.unreadCount > 0 && (
              <span className="ml-auto inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-[rgb(var(--textColor-primary))] px-1.5 py-0.5 text-[10px] font-semibold text-[rgb(var(--backgroundColor-primary))]">
                {conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}
              </span>
            )}
          </div>
        </div>
      </button>
    </li>
  );
}

export default React.memo(ConversationItem);
