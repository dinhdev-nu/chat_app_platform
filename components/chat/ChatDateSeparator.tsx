export default function ChatDateSeparator({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center gap-3 my-3 select-none">
      <div className="h-px w-8 shrink-0" style={{ background: "rgb(var(--borderColor-secondary) / 0.12)" }} />
      <span className="text-caption shrink-0 px-2" style={{ color: "rgb(var(--textColor-secondary))", opacity: 0.7 }}>
        {label}
      </span>
      <div className="h-px w-8 shrink-0" style={{ background: "rgb(var(--borderColor-secondary) / 0.12)" }} />
    </div>
  );
}
