const MESSAGE_REACTION_OPTIONS = ["ðŸ‘", "â¤ï¸", "ðŸ˜‚", "ðŸ˜®", "ðŸ˜¢", "ðŸ‘"];

interface MessageReactionPickerProps {
  isOwn: boolean;
  onReact: (emoji: string) => void;
}

export function MessageReactionPicker({
  isOwn,
  onReact,
}: MessageReactionPickerProps) {
  return (
    <div className={`absolute bottom-full z-50 pb-2 ${isOwn ? "right-0" : "left-0"}`}>
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
            aria-label={`Tháº£ cáº£m xÃºc ${emoji}`}
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
