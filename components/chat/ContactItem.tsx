"use client";

import React from "react";
import {
    ContactUserResponse,
    formatContactPresence,
} from "@/data/contact-data";
import { UserIcon } from "@/components/ui/icons";

interface ContactItemProps {
    contact: ContactUserResponse;
    onSelect?: (contact: ContactUserResponse) => void;
}

function ContactItem({ contact, onSelect }: ContactItemProps) {
    const initials = contact.username.trim().slice(0, 2).toUpperCase() || "FR";
    const presenceLabel = formatContactPresence(contact);

    return (
        <li>
            <button
                type="button"
                className={`
                    flex w-full items-center justify-between gap-3 p-2 rounded-xl
                    transition-colors duration-200 ease-out
                    text-body-sm text-left
                    border border-transparent opacity-100 active:scale-[0.985]
                    hover:bg-[rgb(var(--backgroundColor-state-hover)/0.5)]
                `}
                onClick={() => onSelect?.(contact)}
            >
            <div className="relative shrink-0">
                <div
                    className={`
            size-10 min-w-[2.5rem] rounded-xl
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
                <span
                    aria-label={presenceLabel}
                    title={presenceLabel}
                    className={`absolute -bottom-0.5 -right-0.5 block size-3 rounded-full border-2 border-[rgb(var(--backgroundColor-primary))] ${contact.isOnline ? "bg-emerald-400" : "bg-[rgb(var(--textColor-disabled))]"
                        }`}
                />
            </div>

            <div className="flex flex-1 flex-col justify-center min-w-0">
                <div className="flex items-start justify-between gap-2">
                    <p className="min-w-0 flex-1 truncate text-body-md font-bold text-primary" style={{ fontWeight: 700 }}>
                        {contact.username}
                    </p>
                    <div className="flex shrink-0 items-center gap-2 text-[11px] text-secondary">
                        <span>{presenceLabel}</span>
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
            </button>
        </li>
    );
}

export default React.memo(ContactItem);
