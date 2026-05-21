import type { ReactNode } from "react";
import { MoreHorizontal, Phone, Video } from "lucide-react";

import type { ConversationListItem } from "./conversation-data";

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

export default function ChatConversationHeader({ conv }: { conv: ConversationListItem }) {
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
