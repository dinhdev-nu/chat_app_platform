import type { ReactNode } from "react";

const messageActionButtonClass =
  "size-8 cursor-pointer rounded-full p-0 inline-flex items-center justify-center text-[rgb(var(--textColor-secondary))] transition-colors hover:bg-[rgb(var(--backgroundColor-state-hover))] hover:text-[rgb(var(--textColor-primary))] focus-ring";

interface MessageActionButtonProps {
  label: string;
  children: ReactNode;
  onClick?: () => void;
}

export function MessageActionButton({
  label,
  children,
  onClick,
}: MessageActionButtonProps) {
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
