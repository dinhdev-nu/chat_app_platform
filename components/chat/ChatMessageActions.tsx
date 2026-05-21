import type { ReactNode } from "react";
import { Copy, Pencil } from "lucide-react";

const MESSAGE_REACTION_OPTIONS = ["👍", "❤️", "😂", "😮", "😢", "👏"];
const messageActionButtonClass =
  "size-8 cursor-pointer rounded-full p-0 inline-flex items-center justify-center text-[rgb(var(--textColor-secondary))] transition-colors hover:bg-[rgb(var(--backgroundColor-state-hover))] hover:text-[rgb(var(--textColor-primary))] focus-ring";

export function MessageActionButton({
  label,
  children,
  onClick,
}: {
  label: string;
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={messageActionButtonClass}
      onClick={onClick}
    >
      <span className="text-inherit" aria-hidden="true">
        {children}
      </span>
    </button>
  );
}

export function MessageReactionPicker({
  isOwn,
  onReact,
}: {
  isOwn: boolean;
  onReact: (emoji: string) => void;
}) {
  return (
    <div
      className={`absolute bottom-full z-50 pb-2 ${
        isOwn ? "right-0" : "left-0"
      }`}
    >
      <div
        className="flex items-center gap-1 rounded-full border px-1.5 py-1 shadow-xl backdrop-blur-glass"
        style={{
          background: "rgb(var(--backgroundColor-surface-container) / 0.82)",
          borderColor: "rgb(var(--borderColor-secondary) / 0.14)",
        }}
      >
        {MESSAGE_REACTION_OPTIONS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            aria-label={`Thả cảm xúc ${emoji}`}
            className="flex size-8 cursor-pointer items-center justify-center rounded-full text-[18px] leading-none transition-transform hover:scale-110 hover:bg-[rgb(var(--backgroundColor-state-hover))] focus-ring"
            onClick={() => onReact(emoji)}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}

export function MessageMoreMenu({
  isOwn,
  onCopy,
  onEdit,
}: {
  isOwn: boolean;
  onCopy: () => void;
  onEdit: () => void;
}) {
  return (
    <div
      className={`absolute top-full z-50 min-w-32 pt-2 ${
        isOwn ? "right-0" : "left-0"
      }`}
    >
      <div
        className="overflow-hidden rounded-xl border py-1 shadow-xl backdrop-blur-glass"
        style={{
          background: "rgb(var(--backgroundColor-surface-container) / 0.9)",
          borderColor: "rgb(var(--borderColor-secondary) / 0.14)",
        }}
      >
        <button
          type="button"
          className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-[13px] hover:bg-[rgb(var(--backgroundColor-state-hover))] focus-ring"
          style={{ color: "rgb(var(--textColor-primary))" }}
          onClick={onCopy}
        >
          <Copy size={15} strokeWidth={1.7} aria-hidden="true" />
          Sao chép
        </button>
        {isOwn ? (
          <button
            type="button"
            className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-[13px] hover:bg-[rgb(var(--backgroundColor-state-hover))] focus-ring"
            style={{ color: "rgb(var(--textColor-primary))" }}
            onClick={onEdit}
          >
            <Pencil size={15} strokeWidth={1.7} aria-hidden="true" />
            Chỉnh sửa
          </button>
        ) : null}
      </div>
    </div>
  );
}
