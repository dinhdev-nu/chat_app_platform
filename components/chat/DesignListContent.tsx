import React from "react";
import {
  PaletteIcon,
  CloseIcon,
  PlusIcon,
} from "./icons";

interface DesignListContentProps {
  onClose?: () => void;
  onSelectPreset?: (preset: string) => void;
  onOpenFriends?: () => void;
  onOpenAddFriends?: () => void;
  onOpenTheme?: (type?: 2 | 3) => void;
}

interface ContactUserIncomingResponse {
  id: string;
  username: string;
  avatarUrl?: string | null;
  bio?: string | null;
  lastSeenAt?: string | null;
  createdAt: string;
}

export default function DesignListContent({ onClose, onSelectPreset, onOpenFriends, onOpenAddFriends, onOpenTheme }: DesignListContentProps) {
  const presets = [
    { name: "Alexandria", topColor: "#0f4a8a", bottomColor: "#fde047", btnColor: "#3b82f6" },
    { name: "Bauhaus", topColor: "#b91c1c", bottomColor: "#1d4ed8", btnColor: "#1f2937" },
    { name: "Glacier", topColor: "#7dd3fc", bottomColor: "#c4b5fd", btnColor: "#7dd3fc", btnText: "#000" },
    { name: "Carbon", topColor: "#1d4ed8", bottomColor: "#15803d", btnColor: "#2563eb" },
    { name: "Neon Tokyo", topColor: "#10b981", bottomColor: "#facc15", btnColor: "#f43f5e" },
    { name: "Terra", topColor: "#4ade80", bottomColor: "#a16207", btnColor: "#4ade80" },
  ];

  const incomingRequests: ContactUserIncomingResponse[] = [
    {
      id: "1",
      username: "Alex Nguyen",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=alex",
      bio: "Love to chat",
      createdAt: "2024-05-15T10:30:00Z"
    },
    {
      id: "2",
      username: "Emma Smith",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=emma",
      bio: "Coffee enthusiast",
      createdAt: "2024-05-14T14:20:00Z"
    },
    {
      id: "3",
      username: "John Doe",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
      createdAt: "2024-05-13T09:15:00Z"
    },
  ];

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMins = Math.floor(diffMs / (1000 * 60));
        return `${diffMins}m`;
      }
      return `${diffHours}h`;
    } else if (diffDays === 1) {
      return "1d";
    } else if (diffDays < 7) {
      return `${diffDays}d`;
    } else {
      return date.toLocaleDateString("vi-VN", { month: "short", day: "numeric" });
    }
  };

  return (
    <div className="flex flex-1 flex-col min-h-0 text-primary">
      {/* Header */}
      <div className="flex items-center justify-between p-4 flex-shrink-0">
        <div className="flex items-center gap-2 font-medium text-sm">
          <PaletteIcon size={20} />
          <span>KHÁM PHÁ</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-full hover:bg-[rgba(0,0,0,0.08)] dark:hover:bg-[rgba(255,255,255,0.05)] text-secondary transition-colors"
        >
          <CloseIcon size={16} />
        </button>
      </div>

      <div className="flex flex-col gap-0 px-3 pb-2">
        <button
          onClick={() => { onClose?.(); /* close panel */ onOpenFriends?.(); /* open friends tab */ }}
          className="flex items-center gap-3 p-1.5 font-medium text-sm hover:bg-[rgba(0,0,0,0.08)] dark:hover:bg-[rgba(255,255,255,0.05)] rounded-xl transition-colors"
        >
          <PlusIcon size={16} />
          Trò chuyện với bạn bè
        </button>
        <button
          onClick={() => { onOpenTheme?.(2); }}
          className="flex items-center gap-3 p-1.5 font-medium text-sm hover:bg-[rgba(0,0,0,0.08)] dark:hover:bg-[rgba(255,255,255,0.05)] rounded-xl transition-colors"
        >
          <PlusIcon size={16} />
          Tạo nhóm mới
        </button>
        <button
          onClick={() => { onOpenTheme?.(3); }}
          className="flex items-center gap-3 p-1.5 font-medium text-sm hover:bg-[rgba(0,0,0,0.08)] dark:hover:bg-[rgba(255,255,255,0.05)] rounded-xl transition-colors"
        >
          <PlusIcon size={16} />
          Tạo kênh mới
        </button>
        <button
          onClick={() => { onOpenAddFriends?.(); }}
          className="flex items-center gap-3 p-1.5 font-medium text-sm hover:bg-[rgba(0,0,0,0.08)] dark:hover:bg-[rgba(255,255,255,0.05)] rounded-xl transition-colors"
        >
          <PlusIcon size={16} />
          Thêm bạn bè
        </button>
      </div>

      <div className="px-5 text-sm text-secondary font-medium mt-1 mb-2">
        Yêu cầu
      </div>

      {/* Incoming Requests List */}
      <div className="flex-1 overflow-y-auto px-3 pb-4 flex flex-col gap-2 hide-scrollbar">
        {incomingRequests.map((contact) => (
          <div
            key={contact.id}
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-[rgba(0,0,0,0.08)] dark:hover:bg-[rgba(255,255,255,0.05)] transition-colors"
          >
            {/* Avatar */}
            <img
              src={contact.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${contact.username}`}
              alt={contact.username}
              className="w-10 h-10 rounded-full flex-shrink-0"
            />

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-primary truncate" style={{ fontWeight: 600 }}>
                {contact.username}
              </div>
              {contact.bio && (
                <div className="text-xs text-secondary line-clamp-1">
                  {contact.bio}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <button className="p-1 hover:bg-[rgba(0,0,0,0.08)] dark:hover:bg-[rgba(255,255,255,0.05)] rounded-lg transition-colors" title="Accept">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-64-64a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"></path>
                </svg>
              </button>
              <button className="p-1 hover:bg-[rgba(0,0,0,0.08)] dark:hover:bg-[rgba(255,255,255,0.05)] rounded-lg transition-colors" title="Decline">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M205.66,50.34a8,8,0,0,0-11.32,0L128,117.66,61.66,51.34a8,8,0,0,0-11.32,11.32L116.69,129l-66.35,66.34a8,8,0,0,0,11.32,11.32L128,140.34l66.34,66.35a8,8,0,0,0,11.32-11.32L139.31,129l66.35-66.34A8,8,0,0,0,205.66,50.34Z"></path>
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
