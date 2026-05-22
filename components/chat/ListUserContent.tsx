"use client";

import React, { useDeferredValue, useEffect, useMemo, useState } from "react";
import { Check, Loader2, Send, User, UserPlus } from "lucide-react";

import { BackIcon, CloseIcon, SearchIcon } from "@/components/chat/icons";
import { ContactStatus } from "@/types/user";
import type { ContactRequestStatusResponse, SearchUser } from "@/types/user";

interface ListUserContentProps {
  onBack?: () => void;
  users?: SearchUser[];
  isSearching?: boolean;
  error?: string | null;
  pendingActionIds?: string[];
  onSearchUsers?: (query: string) => Promise<SearchUser[]> | SearchUser[];
  onSendContactRequest?: (targetUserId: string) => Promise<ContactRequestStatusResponse | undefined> | ContactRequestStatusResponse | undefined;
  onAcceptContactRequest?: (senderUserId: string) => Promise<void> | void;
}

interface UserActionProps {
  user: SearchUser;
  isPending: boolean;
  onSendContactRequest?: ListUserContentProps["onSendContactRequest"];
  onAcceptContactRequest?: ListUserContentProps["onAcceptContactRequest"];
}

function runAction(action?: () => Promise<unknown> | unknown) {
  void Promise.resolve(action?.()).catch(() => undefined);
}

function UserAction({
  user,
  isPending,
  onSendContactRequest,
  onAcceptContactRequest,
}: UserActionProps) {
  if (isPending) {
    return (
      <button
        type="button"
        disabled
        aria-label="Đang xử lý"
        title="Đang xử lý"
        className="p-2 rounded-lg text-secondary disabled:opacity-60 disabled:cursor-wait"
      >
        <Loader2 size={16} className="animate-spin" />
      </button>
    );
  }

  if (user.outgoingStatus === ContactStatus.Accepted || user.incomingStatus === ContactStatus.Accepted) {
    return (
      <button
        type="button"
        disabled
        aria-label="Đã là bạn bè"
        title="Bạn bè"
        className="p-2 rounded-lg text-secondary disabled:opacity-50 disabled:cursor-not-allowed"
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
        className="p-2 rounded-lg text-secondary disabled:opacity-50 disabled:cursor-not-allowed"
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
        disabled={!onAcceptContactRequest}
        className="p-2 rounded-lg bg-[rgb(var(--backgroundColor-state-enabled)/.575)] text-primary hover-surface-soft transition-colors shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] disabled:cursor-not-allowed disabled:opacity-50"
        onClick={() => runAction(() => onAcceptContactRequest?.(user.id))}
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
      disabled={!onSendContactRequest}
      className="p-2 rounded-lg bg-transparent text-primary border border-chat-secondary hover-surface-soft transition-colors disabled:cursor-not-allowed disabled:opacity-50"
      onClick={() => runAction(() => onSendContactRequest?.(user.id))}
    >
      <UserPlus size={16} />
    </button>
  );
}

function ListUserContent({
  onBack,
  users = [],
  isSearching = false,
  error,
  pendingActionIds = [],
  onSearchUsers,
  onSendContactRequest,
  onAcceptContactRequest,
}: ListUserContentProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const normalizedSearchQuery = useMemo(
    () => deferredSearchQuery.trim().toLowerCase(),
    [deferredSearchQuery],
  );
  const pendingActionIdSet = useMemo(() => new Set(pendingActionIds), [pendingActionIds]);

  useEffect(() => {
    if (!onSearchUsers) return;

    const timeoutId = window.setTimeout(() => {
      void Promise.resolve(onSearchUsers(searchQuery.trim())).catch(() => undefined);
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [onSearchUsers, searchQuery]);

  const filteredUsers = useMemo(() => {
    if (onSearchUsers) return users;
    if (!normalizedSearchQuery) return users;

    return users.filter((user) => user.username.toLowerCase().includes(normalizedSearchQuery));
  }, [normalizedSearchQuery, onSearchUsers, users]);

  const hasQuery = searchQuery.trim().length > 0;

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
              onChange={(event) => setSearchQuery(event.target.value)}
            />
            {searchQuery ? (
              <button
                type="button"
                aria-label="Xóa từ khóa tìm kiếm"
                onClick={() => setSearchQuery("")}
                className="text-secondary hover:text-primary pl-2"
              >
                <CloseIcon size={14} />
              </button>
            ) : null}
          </div>
        </div>

        {error ? (
          <div className="text-center text-sm text-[rgb(var(--textColor-danger))] py-3" role="alert">
            {error}
          </div>
        ) : null}

        <div className="flex flex-col gap-1 mt-2">
          {isSearching ? (
            <div className="flex items-center justify-center gap-2 text-sm text-secondary py-8">
              <Loader2 size={16} className="animate-spin" />
              Đang tìm...
            </div>
          ) : filteredUsers.length > 0 ? (
            filteredUsers.map((user) => {
              const initials = user.username.trim().charAt(0).toUpperCase() || "U";

              return (
                <div
                  key={user.id}
                  className="flex items-center gap-3 p-2 rounded-xl hover-surface transition-colors"
                >
                  <div className="relative">
                    <div
                      className="w-10 h-10 rounded-full bg-[rgb(var(--backgroundColor-surface-container))] overflow-hidden flex-shrink-0 bg-cover bg-center flex items-center justify-center"
                      style={{ backgroundImage: user.avatarUrl ? `url(${user.avatarUrl})` : undefined }}
                      aria-hidden="true"
                    >
                      {!user.avatarUrl ? (
                        <div className="w-full h-full flex items-center justify-center bg-[rgb(var(--backgroundColor-state-enabled)/.5)] text-primary font-medium">
                          {initials}
                        </div>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex flex-col flex-1 min-w-0 pr-2">
                    <span className="text-sm font-semibold text-primary truncate">{user.username}</span>
                    <span className="text-xs text-secondary truncate">{user.bio || "Sẵn sàng trò chuyện"}</span>
                  </div>
                  <div className="flex-shrink-0">
                    <UserAction
                      user={user}
                      isPending={pendingActionIdSet.has(user.id)}
                      onSendContactRequest={onSendContactRequest}
                      onAcceptContactRequest={onAcceptContactRequest}
                    />
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center text-sm text-secondary py-8">
              {hasQuery ? "Không tìm thấy người dùng nào" : "Nhập để tìm kiếm bạn bè"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default React.memo(ListUserContent);
