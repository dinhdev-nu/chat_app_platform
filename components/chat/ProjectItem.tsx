"use client";

import React from "react";
import {
  ConversationListItem,
  formatConversationActivity,
  getConversationTypeLabel,
} from "./conversation-data";
import { BellSlashIcon } from "@heroicons/react/24/outline";
import { UserIcon, ListBulletIcon, UsersIcon } from "./icons";

interface ProjectItemProps {
  conversation: ConversationListItem;
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

export default function ProjectItem({ conversation }: ProjectItemProps) {
  const initials = (conversation.name ?? "").trim().slice(0, 2).toUpperCase() || "CH";
  const typeLabel = getConversationTypeLabel(conversation.type);
  const activityLabel = formatConversationActivity(conversation.lastActivityAt);

  return (
    <li
      role="button"
      tabIndex={0}
      className="
        flex items-center justify-between gap-3 p-2 rounded-xl
        transition-colors duration-200 ease-out
        text-sm font-normal leading-[150%]
        border border-transparent opacity-100 scale-[0.985]
        hover:bg-[rgb(var(--backgroundColor-state-hover))]
      "
    >
      {/* Avatar */}
      <div
        className={`
          shrink-0 w-10 h-10 min-w-[2.5rem] rounded-xl
          flex items-center justify-center overflow-hidden bg-cover bg-center bg-no-repeat
          bg-[rgb(var(--backgroundColor-state-enabled)/.575)]
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

      {/* Info */}
      <div className="flex flex-1 flex-col justify-center min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="min-w-0 flex-1 truncate font-semibold text-[rgb(var(--textColor-primary))]">
            {conversation.name ?? "Không có tiêu đề"}
          </p>
          <div className="flex shrink-0 items-center gap-2 text-[11px] text-[rgb(var(--textColor-secondary))]">
            {conversation.isMuted && (
              <span
                title="Đang tắt thông báo"
                aria-label="Đang tắt thông báo"
                className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[rgb(var(--backgroundColor-state-active))] text-[rgb(var(--textColor-secondary))]"
              >
                <BellSlashIcon className="h-3.5 w-3.5" />
              </span>
            )}
            <span>{activityLabel}</span>
          </div>
        </div>

        <div className="mt-0.5 flex items-center gap-2 text-[12px] leading-[150%] text-[rgb(var(--textColor-secondary))]">
          <span
            title={typeLabel}
            aria-label={typeLabel}
            className="inline-flex items-center gap-1 rounded-full bg-[rgb(var(--backgroundColor-state-enabled)/.4)] px-2 py-0.5 text-[11px]"
          >
            <TypeIcon type={conversation.type} />
            <span className="sr-only">{typeLabel}</span>
          </span>
          <span className="truncate">
            {conversation.lastMessageText ?? conversation.description ?? "Chưa có tin nhắn"}
          </span>
          {conversation.unreadCount > 0 && (
            <span className="ml-auto inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-[rgb(var(--textColor-primary))] px-1.5 py-0.5 text-[10px] font-semibold text-[rgb(var(--backgroundColor-primary))]">
              {conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}
            </span>
          )}
        </div>

      </div>
    </li>
  );
}
