"use client";

import React from "react";
import {
    ContactUserResponse,
    formatContactLastSeen,
} from "./contact-data";
import { UserIcon } from "./icons";

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
        text-body-sm
        border border-transparent opacity-100 active:scale-[0.985]
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
                    <p className="min-w-0 flex-1 truncate text-body-md font-bold text-primary">
                        {contact.username}
                    </p>
                    <div className="flex shrink-0 items-center gap-2 text-[11px] text-secondary">
                        <span>{lastSeenLabel}</span>
                    </div>
                </div>

                <div className="mt-0.5 flex items-center gap-2 text-[12px] leading-[150%] text-[rgb(var(--textColor-secondary))]">
                    <span
                        title="Bạn bè"
                        aria-label="Bạn bè"
                        className="inline-flex items-center gap-1 rounded-full bg-[rgb(var(--backgroundColor-state-enabled)/.4)] px-2 py-0.5 text-caption text-secondary"
                    >
                        <UserIcon size={14} />
                        <span className="sr-only">Bạn bè</span>
                    </span>
                    <span className="truncate text-body-sm text-secondary">
                        {contact.bio ?? "Không có mô tả"}
                    </span>
                </div>
            </div>
        </li>
    );
}
