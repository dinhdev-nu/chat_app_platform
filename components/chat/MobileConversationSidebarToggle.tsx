import { ListBulletIcon } from "@/components/ui/icons";

interface MobileConversationSidebarToggleProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function MobileConversationSidebarToggle({
  isOpen,
  onToggle,
}: MobileConversationSidebarToggleProps) {
  return (
    <button
      type="button"
      className="
        fixed right-2 top-16 z-20 md:hidden
        flex items-center justify-center rounded-xl
        size-10
        bg-[rgb(var(--backgroundColor-surface-container)/.5)]
        backdrop-blur-[40px]
        border border-[rgb(var(--borderColor-secondary)/.15)]
        text-[rgb(var(--textColor-primary))]
      "
      aria-label={isOpen ? "Đóng danh sách hội thoại" : "Mở danh sách hội thoại"}
      aria-expanded={isOpen}
      aria-controls="conversation-sidebar-panel"
      onClick={onToggle}
    >
      <span className="text-inherit">
        <ListBulletIcon />
      </span>
    </button>
  );
}
