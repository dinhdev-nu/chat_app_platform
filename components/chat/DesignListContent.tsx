import React from "react";
import {
  PaletteIcon,
  CloseIcon,
  PlusIcon,
} from "./icons";

interface DesignListContentProps {
  onClose?: () => void;
  onOpenFriends?: () => void;
  onOpenAddFriends?: () => void;
  onOpenTheme?: (type?: 2 | 3) => void;
}

interface ContactUserIncomingResponse {
  id: string;
  username: string;
  avatarUrl?: string | null;
  bio?: string | null;
}

const INCOMING_REQUESTS: ContactUserIncomingResponse[] = [
  {
    id: "1",
    username: "Alex Nguyen",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=alex",
    bio: "Love to chat",
  },
  {
    id: "2",
    username: "Emma Smith",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=emma",
    bio: "Coffee enthusiast",
  },
  {
    id: "3",
    username: "John Doe",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
  },
];

function DesignListContent({ onClose, onOpenFriends, onOpenAddFriends, onOpenTheme }: DesignListContentProps) {
  return (
    <div className="flex flex-1 flex-col min-h-0 text-primary">
      {/* Header */}
      <div className="flex items-center justify-between p-4 flex-shrink-0">
        <div className="flex items-center gap-2 font-medium text-sm">
          <PaletteIcon size={20} />
          <span>KHÁM PHÁ</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng bảng khám phá"
          className="p-1 rounded-full hover-surface text-secondary transition-colors"
        >
          <CloseIcon size={16} />
        </button>
      </div>

      <div className="flex flex-col gap-0 px-3 pb-2">
        <button
          type="button"
          onClick={() => {
            onClose?.();
            onOpenFriends?.();
          }}
          aria-label="Trò chuyện với bạn bè"
          className="flex items-center gap-3 p-1.5 font-medium text-sm hover-surface rounded-xl transition-colors"
        >
          <PlusIcon size={16} />
          Trò chuyện với bạn bè
        </button>
        <button
          type="button"
          onClick={() => { onOpenTheme?.(2); }}
          aria-label="Tạo nhóm mới"
          className="flex items-center gap-3 p-1.5 font-medium text-sm hover-surface rounded-xl transition-colors"
        >
          <PlusIcon size={16} />
          Tạo nhóm mới
        </button>
        <button
          type="button"
          onClick={() => { onOpenTheme?.(3); }}
          aria-label="Tạo kênh mới"
          className="flex items-center gap-3 p-1.5 font-medium text-sm hover-surface rounded-xl transition-colors"
        >
          <PlusIcon size={16} />
          Tạo kênh mới
        </button>
        <button
          type="button"
          onClick={() => { onOpenAddFriends?.(); }}
          aria-label="Thêm bạn bè"
          className="flex items-center gap-3 p-1.5 font-medium text-sm hover-surface rounded-xl transition-colors"
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
        {INCOMING_REQUESTS.map((contact) => (
          <div
            key={contact.id}
            className="flex items-center gap-3 p-2 rounded-xl hover-surface transition-colors"
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
              <button type="button" aria-label={`Chấp nhận ${contact.username}`} className="p-1 hover-surface rounded-lg transition-colors" title="Accept">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-64-64a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"></path>
                </svg>
              </button>
              <button type="button" aria-label={`Từ chối ${contact.username}`} className="p-1 hover-surface rounded-lg transition-colors" title="Decline">
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

export default React.memo(DesignListContent);
