"use client";

import React, { useState } from "react";
import { BackIcon, SearchIcon, CloseIcon } from "@/components/chat/icons";
import { User, Send, Check, UserPlus } from "lucide-react";
import { SearchUser, ContactStatus } from "@/components/chat/contact-data";

interface ListUserContentProps {
  onBack?: () => void;
}

const MOCK_SEARCH_USERS: SearchUser[] = [
  {
    id: "search_01",
    username: "An Bình",
    avatarUrl: "/assets/home/iVBORw0KGg_3.png",
    bio: "Thiết kế landing page và tối ưu flow onboarding.",
    lastSeenAt: "2026-05-16T09:10:00.000Z",
    outgoingStatus: ContactStatus.Accepted,
  },
  {
    id: "search_02",
    username: "Hoàng Tuấn",
    bio: "Frontend Developer",
    lastSeenAt: "2026-05-15T09:10:00.000Z",
    outgoingStatus: ContactStatus.Pending,
  },
  {
    id: "search_03",
    username: "Minh Nguyệt",
    avatarUrl: "/assets/home/iVBORw0KGg_5.png",
    bio: null,
    lastSeenAt: "2026-05-16T12:00:00.000Z",
    incomingStatus: ContactStatus.Pending,
  },
  {
    id: "search_04",
    username: "Hải Đăng",
    bio: "Sẵn sàng trò chuyện",
    lastSeenAt: "2026-05-16T10:00:00.000Z",
  },
];

export default function ListUserContent({ onBack }: ListUserContentProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = MOCK_SEARCH_USERS.filter((u) =>
    u.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderAction = (user: SearchUser) => {
    if (user.outgoingStatus === ContactStatus.Accepted || user.incomingStatus === ContactStatus.Accepted) {
      return (
        <button
          type="button"
          disabled
          aria-label="Đã là bạn bè"
          title="Bạn bè"
          className="p-2 rounded-lg text-secondary hover:text-secondary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <User size={16} />
        </button>
      );
    }

    if (user.outgoingStatus === ContactStatus.Pending) {
      return (
        <button
          type="button"
          disabled
          aria-label="Đã gửi lời mời"
          title="Đã gửi"
          className="p-2 rounded-lg text-secondary hover:text-secondary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send size={16} />
        </button>
      );
    }

    if (user.incomingStatus === ContactStatus.Pending) {
      return (
        <button
          type="button"
          aria-label="Chấp nhận lời mời"
          title="Chấp nhận"
          className="p-2 rounded-lg bg-[rgb(var(--backgroundColor-state-enabled)/.575)] text-primary hover-surface-soft transition-colors shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]"
        >
          <Check size={16} />
        </button>
      );
    }

    return (
      <button
        type="button"
        aria-label="Kết bạn"
        title="Kết bạn"
        className="p-2 rounded-lg bg-transparent text-primary border border-chat-secondary hover-surface-soft transition-colors"
      >
        <UserPlus size={16} />
      </button>
    );
  };

  return (
    <div className="flex flex-1 flex-col min-h-0 text-primary">
      <div className="flex items-center gap-2 flex-shrink-0 mb-4 px-1 pt-1">
        <div>
          <button
            type="button"
            onClick={onBack}
            aria-label="Quay lại"
            className="flex items-center justify-center gap-2 bg-clip-border focus-visible:outline-2 focus-visible:outline-current focus-visible:-outline-offset-2 border-none bg-transparent text-primary hover-surface text-subtitle-sm p-1.5 h-auto rounded-full transition-colors"
          >
            <span className="text-inherit">
              <BackIcon size={16} />
            </span>
          </button>
        </div>

        <span className="flex-1 text-sm font-medium text-primary py-1">Thêm bạn bè</span>
      </div>

      <div className="flex-1 flex flex-col gap-3 min-h-0 overflow-y-auto hide-scrollbar px-1 pb-4">
        <div className="sticky top-0 z-10 pb-2 pt-1">
          <div
            className="
              search-box flex items-center p-2.5 rounded-full
              transition-colors duration-200
              bg-[rgb(var(--backgroundColor-state-enabled)/.575)]
              backdrop-blur-[12px]
            "
          >
            <span className="pl-1 pr-2 text-[rgb(var(--textColor-secondary))]">
              <SearchIcon />
            </span>
            <input
              placeholder="Tìm kiếm bạn bè..."
              className="w-full bg-transparent text-body-sm outline-none text-primary placeholder:text-[rgb(var(--textColor-secondary))]"
              type="text"
              name="friendSearch"
              autoComplete="off"
              aria-label="Tìm kiếm bạn bè"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                aria-label="Xóa từ khóa tìm kiếm"
                onClick={() => setSearchQuery("")}
                className="text-secondary hover:text-primary pl-2"
              >
                <CloseIcon size={14} />
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1 mt-2">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-3 p-2 rounded-xl hover-surface transition-colors"
              >
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-[rgb(var(--backgroundColor-surface-container))] overflow-hidden flex-shrink-0">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[rgb(var(--backgroundColor-state-enabled)/.5)] text-primary font-medium">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col flex-1 min-w-0 pr-2">
                  <span className="text-sm font-semibold text-primary truncate">{user.username}</span>
                  <span className="text-xs text-secondary truncate">{user.bio || "Sẵn sàng trò chuyện"}</span>
                </div>
                <div className="flex-shrink-0">{renderAction(user)}</div>
              </div>
            ))
          ) : (
            <div className="text-center text-sm text-secondary py-8">
              {searchQuery ? "Không tìm thấy người dùng nào" : "Nhập để tìm kiếm bạn bè"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
