"use client";

import React from "react";
import {
    ContactUserResponse,
    formatContactLastSeen,
} from "./contact-data";
import { UserGroupIcon } from "./icons";

interface ContactItemProps {
    contact: ContactUserResponse;
}

export default function ContactItem({ contact }: ContactItemProps) {
    const initials = contact.username.trim().slice(0, 2).toUpperCase() || "FR";
    const lastSeenLabel = formatContactLastSeen(contact.lastSeenAt);

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
            <div
                className={`
          shrink-0 w-10 h-10 min-w-[2.5rem] rounded-xl
          flex items-center justify-center overflow-hidden bg-cover bg-center bg-no-repeat
          bg-[rgb(var(--backgroundColor-state-enabled)/.575)]
          border border-[rgb(var(--borderColor-secondary)/.15)]
        `}
                style={{
                    backgroundImage: contact.avatarUrl ? `url(${contact.avatarUrl})` : undefined,
                    backgroundColor: contact.avatarUrl ? "transparent" : "rgb(var(--backgroundColor-state-active))",
                }}
            >
                {!contact.avatarUrl && (
                    <span className="text-[12px] font-semibold text-[rgb(var(--textColor-primary))]">
                        {initials}
                    </span>
                )}
            </div>

            <div className="flex flex-1 flex-col justify-center min-w-0">
                <div className="flex items-start justify-between gap-2">
                    <p className="min-w-0 flex-1 truncate font-semibold text-[rgb(var(--textColor-primary))]">
                        {contact.username}
                    </p>
                    <span className="flex shrink-0 items-center gap-1 text-[11px] text-[rgb(var(--textColor-secondary))]">
                        <UserGroupIcon size={14} className="text-[rgb(var(--textColor-secondary))]" />
                        Bạn bè
                    </span>
                </div>

                <div className="mt-0.5 flex items-center gap-2 text-[12px] leading-[150%] text-[rgb(var(--textColor-secondary))]">
                    <span className="truncate">
                        {contact.bio ?? "Không có mô tả"}
                    </span>
                    <span className="shrink-0">•</span>
                    <span className="shrink-0">{lastSeenLabel}</span>
                </div>
            </div>
        </li>
    );
}
