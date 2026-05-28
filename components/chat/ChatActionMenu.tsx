import React from "react";

import type { SearchUser } from "@/types/user";
import {
  CloseIcon,
  PaletteIcon,
  PlusIcon,
} from "./icons";

interface ChatActionMenuProps {
  onClose?: () => void;
  onOpenFriends?: () => void;
  onOpenAddFriends?: () => void;
  onOpenCreateConversation?: (type?: 2 | 3) => void;
  incomingRequests?: SearchUser[];
  isIncomingLoading?: boolean;
  incomingError?: string | null;
  pendingContactActionIds?: string[];
  onAcceptContactRequest?: (senderUserId: string) => Promise<void> | void;
}

function ChatActionMenu({
  onClose,
  onOpenFriends,
  onOpenAddFriends,
  onOpenCreateConversation,
  incomingRequests = [],
  isIncomingLoading = false,
  incomingError,
  pendingContactActionIds = [],
  onAcceptContactRequest,
}: ChatActionMenuProps) {
  const handleAccept = (senderUserId: string) => {
    void Promise.resolve(onAcceptContactRequest?.(senderUserId)).catch(() => undefined);
  };

  return (
    <div className="flex flex-1 flex-col min-h-0 text-primary">
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
          onClick={() => { onOpenCreateConversation?.(2); }}
          aria-label="Tạo nhóm mới"
          className="flex items-center gap-3 p-1.5 font-medium text-sm hover-surface rounded-xl transition-colors"
        >
          <PlusIcon size={16} />
          Tạo nhóm mới
        </button>
        <button
          type="button"
          onClick={() => { onOpenCreateConversation?.(3); }}
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

      <div className="flex-1 overflow-y-auto px-3 pb-4 flex flex-col gap-2 hide-scrollbar">
        {isIncomingLoading && incomingRequests.length === 0 ? (
          <div className="px-2 py-8 text-center text-sm text-secondary">Đang tải yêu cầu...</div>
        ) : incomingError ? (
          <div className="px-2 py-8 text-center text-sm text-[rgb(var(--textColor-danger))]" role="alert">
            {incomingError}
          </div>
        ) : incomingRequests.length > 0 ? (
          incomingRequests.map((contact) => {
            const isPending = pendingContactActionIds.includes(contact.id);
            const initials = contact.username.trim().slice(0, 2).toUpperCase() || "US";

            return (
              <div
                key={contact.id}
                className="flex items-center gap-3 p-2 rounded-xl hover-surface transition-colors"
              >
                <div
                  className="w-10 h-10 rounded-full flex-shrink-0 overflow-hidden bg-[rgb(var(--backgroundColor-state-enabled)/.5)] bg-cover bg-center flex items-center justify-center"
                  style={{ backgroundImage: contact.avatarUrl ? `url(${contact.avatarUrl})` : undefined }}
                  aria-hidden="true"
                >
                  {!contact.avatarUrl ? (
                    <span className="text-xs font-semibold text-primary">{initials}</span>
                  ) : null}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-primary truncate" style={{ fontWeight: 600 }}>
                    {contact.username}
                  </div>
                  {contact.bio ? (
                    <div className="text-xs text-secondary line-clamp-1">
                      {contact.bio}
                    </div>
                  ) : null}
                </div>

                <button
                  type="button"
                  aria-label={`Chấp nhận ${contact.username}`}
                  className="p-1 hover-surface rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                  title="Chấp nhận"
                  disabled={isPending || !onAcceptContactRequest}
                  onClick={() => handleAccept(contact.id)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-64-64a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z" />
                  </svg>
                </button>
              </div>
            );
          })
        ) : (
          <div className="px-2 py-8 text-center text-sm text-secondary">Không có yêu cầu mới</div>
        )}
      </div>
    </div>
  );
}

export default React.memo(ChatActionMenu);
