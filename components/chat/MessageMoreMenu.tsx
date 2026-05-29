import { Copy, Pencil, Trash2 } from "lucide-react";

interface MessageMoreMenuProps {
  isOwn: boolean;
  canDelete: boolean;
  onCopy: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function MessageMoreMenu({
  isOwn,
  canDelete,
  onCopy,
  onEdit,
  onDelete,
}: MessageMoreMenuProps) {
  return (
    <div className={`absolute top-full z-50 min-w-32 pt-2 ${isOwn ? "right-0" : "left-0"}`}>
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
          Sao chÃ©p
        </button>
        {isOwn && onEdit ? (
          <button
            type="button"
            className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-[13px] hover:bg-[rgb(var(--backgroundColor-state-hover))] focus-ring"
            style={{ color: "rgb(var(--textColor-primary))" }}
            onClick={onEdit}
          >
            <Pencil size={15} strokeWidth={1.7} aria-hidden="true" />
            Chá»‰nh sá»­a
          </button>
        ) : null}
        {canDelete && onDelete ? (
          <button
            type="button"
            className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-[13px] hover:bg-[rgb(var(--backgroundColor-state-hover))] focus-ring"
            style={{ color: "rgb(var(--textColor-primary))" }}
            onClick={onDelete}
          >
            <Trash2 size={15} strokeWidth={1.7} aria-hidden="true" />
            XÃ³a
          </button>
        ) : null}
      </div>
    </div>
  );
}
