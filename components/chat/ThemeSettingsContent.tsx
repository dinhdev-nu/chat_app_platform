"use client";

import React, { useState } from "react";
import {
  BackIcon,
  SearchIcon,
  CloseIcon,
  UserGroupIcon,
  UsersIcon,
  CheckIcon
} from "@/components/chat/icons";
import { MOCK_CONTACT_USERS, formatContactLastSeen } from "@/components/chat/contact-data";

interface ThemeSettingsContentProps {
  onBack?: () => void;
  initialType?: 2 | 3;
}

export default function ThemeSettingsContent({ onBack, initialType = 2 }: ThemeSettingsContentProps) {
  const [activeTab, setActiveTab] = useState<"info" | "members">("info");

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<2 | 3>(initialType); // 2: Group, 3: Channel

  React.useEffect(() => {
    setType(initialType);
  }, [initialType]);
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [memberIds, setMemberIds] = useState<string[]>([]);

  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = MOCK_CONTACT_USERS.filter((u) =>
    u.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleMember = (id: string) => {
    setMemberIds((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const handleSave = () => {
    const payload = {
      name,
      type,
      avatar_url: avatarUrl || undefined,
      description: description || undefined,
      member_user_ids: memberIds,
    };
    console.log("Create Payload:", payload);
    // TODO: Call API
  };

  return (
    <div className="flex flex-1 flex-col gap-2 min-h-0 text-primary">
      {/* ── Header ──────────────── */}
      <div className="flex items-center gap-2 flex-shrink-0 p-4 pb-0">
        <div>
          <button
            onClick={onBack}
            className="flex items-center justify-center gap-2 bg-clip-border focus-visible:outline-2 focus-visible:outline-current focus-visible:-outline-offset-2 border-none bg-transparent text-primary hover:bg-[rgba(0,0,0,0.08)] dark:hover:bg-[rgba(255,255,255,0.05)] text-subtitle-sm p-1.5 h-auto rounded-full transition-colors"
            tabIndex={0}
          >
            <span className="text-inherit">
              <BackIcon size={16} />
            </span>
          </button>
        </div>

        <span className="flex-1 text-sm font-medium text-primary py-1">
          {type === 2 ? "Tạo nhóm mới" : "Tạo kênh mới"}
        </span>
      </div>

      {/* ── Tabs ────────────────────────── */}
      <div className="flex items-center gap-6 flex-shrink-0 border-b border-[rgb(var(--backgroundColor-state-enabled))] px-4">
        <div className="flex flex-1 relative">
          <div className="flex flex-1">
            <button
              type="button"
              onClick={() => setActiveTab("info")}
              className={`relative flex-1 text-center px-1 pb-2.5 text-body-sm transition-colors ${activeTab === "info" ? "text-primary font-medium" : "text-secondary hover:text-primary"
                }`}
            >
              Thông tin
            </button>
          </div>
          <div className="flex flex-1">
            <button
              type="button"
              onClick={() => setActiveTab("members")}
              className={`relative flex-1 text-center px-1 pb-2.5 text-body-sm transition-colors ${activeTab === "members" ? "text-primary font-medium" : "text-secondary hover:text-primary"
                }`}
            >
              Thành viên ({memberIds.length})
            </button>
          </div>
          {/* Sliding Indicator */}
          <div
            className="absolute bottom-0 left-0 w-1/2 h-[3px] rounded-full bg-[rgb(var(--textColor-primary))] transition-transform duration-300 ease-out will-change-transform"
            style={{ transform: activeTab === "info" ? 'translateX(0)' : 'translateX(100%)' }}
          />
        </div>
      </div>

      {/* ── Scrollable content ─────────────────────────────── */}
      <div className="flex-1 relative min-h-0 overflow-hidden">

        {/* Info Content */}
        <div
          className={`absolute inset-0 flex flex-col gap-4 overflow-y-auto hide-scrollbar py-2 px-4 transition-all duration-300 ease-in-out ${activeTab === "info" ? "opacity-100 translate-x-0 z-10 pointer-events-auto" : "opacity-0 -translate-x-8 z-0 pointer-events-none"
            }`}
        >
          {/* Type Selection */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs text-secondary font-medium">Loại</h3>
            <div role="radiogroup" className="relative flex p-0.5 rounded-[32px] bg-[rgb(var(--backgroundColor-surface-container)/.5)] backdrop-blur-[40px]">
              {/* Sliding Background */}
              <div
                className="absolute top-0.5 bottom-0.5 left-0.5 w-[calc(50%-0.125rem)] rounded-[32px] bg-[rgb(var(--backgroundColor-state-active))] transition-transform duration-300 ease-out will-change-transform"
                style={{ transform: type === 2 ? 'translateX(0)' : 'translateX(calc(100% + 0.25rem))' }}
              />
              <button
                type="button"
                role="radio"
                aria-checked={type === 2}
                onClick={() => setType(2)}
                className={`relative flex-1 px-2 py-2 rounded-[32px] text-sm font-medium cursor-pointer transition-colors z-10 text-center ${type === 2 ? 'text-primary' : 'text-secondary hover:text-primary'}`}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <span className="text-primary"><UsersIcon size={18} /></span>
                  Nhóm
                </span>
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={type === 3}
                onClick={() => setType(3)}
                className={`relative flex-1 px-2 py-2 rounded-[32px] text-sm font-medium cursor-pointer transition-colors z-10 text-center ${type === 3 ? 'text-primary' : 'text-secondary hover:text-primary'}`}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <span className="text-primary"><UserGroupIcon size={18} /></span>
                  Kênh
                </span>
              </button>
            </div>
          </div>

          {/* Avatar & Name */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs text-secondary font-medium">Tên & Ảnh đại diện</h3>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[rgb(var(--backgroundColor-surface-container))] flex items-center justify-center flex-shrink-0 cursor-pointer overflow-hidden border border-[rgb(var(--backgroundColor-state-enabled))]">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-secondary"><UserGroupIcon size={24} /></span>
                )}
              </div>
              <input
                placeholder={type === 2 ? "Tên nhóm..." : "Tên kênh..."}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1 bg-transparent text-sm font-medium text-primary placeholder:text-[rgb(var(--textColor-secondary))] outline-none border-b border-transparent focus:border-[rgb(var(--textColor-primary)/0.3)] transition-colors py-2"
                type="text"
              />
            </div>
            {/* Optional: Input for Avatar URL */}
            <input
              placeholder="URL ảnh đại diện (tuỳ chọn)"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              className="w-full bg-transparent text-xs text-secondary placeholder:text-[rgb(var(--textColor-secondary))] outline-none border-b border-[rgb(var(--backgroundColor-state-enabled))] focus:border-[rgb(var(--textColor-primary)/0.3)] transition-colors py-1"
              type="text"
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs text-secondary font-medium">Mô tả</h3>
            <textarea
              placeholder="Thêm mô tả..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[rgb(var(--backgroundColor-surface-container)/.3)] text-sm text-primary placeholder:text-[rgb(var(--textColor-secondary))] outline-none border border-[rgb(var(--backgroundColor-state-enabled))] rounded-xl p-3 min-h-[80px] resize-none focus:border-[rgb(var(--textColor-primary)/0.3)] transition-colors"
            />
          </div>
        </div>

        {/* Members Content */}
        <div
          className={`absolute inset-0 flex flex-col gap-3 overflow-y-auto hide-scrollbar py-2 px-4 transition-all duration-300 ease-in-out ${activeTab === "members" ? "opacity-100 translate-x-0 z-10 pointer-events-auto" : "opacity-0 translate-x-8 z-0 pointer-events-none"
            }`}
        >
          {/* Search Bar */}
          <div className="sticky top-0 z-10">
            <div className="flex items-center gap-2">
              <div
                className="
                  search-box flex items-center p-2.5 rounded-full
                  transition-colors duration-200 flex-1
                  bg-[rgb(var(--backgroundColor-state-enabled)/.575)]
                  backdrop-blur-[12px]
                "
              >
                <span className="pl-1 pr-2 text-[rgb(var(--textColor-secondary))]">
                  <SearchIcon />
                </span>
                <input
                  placeholder="Tìm kiếm người dùng..."
                  className="w-full bg-transparent text-body-sm outline-none text-primary placeholder:text-[rgb(var(--textColor-secondary))]"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="text-secondary hover:text-primary pl-2"
                  >
                    <CloseIcon size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* User List */}
          <div className="flex flex-col gap-1 mt-2 pb-4">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => {
                const isSelected = memberIds.includes(user.id);
                return (
                  <div
                    key={user.id}
                    onClick={() => toggleMember(user.id)}
                    className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-colors ${isSelected ? "bg-[rgb(var(--backgroundColor-state-active))]" : "hover:bg-[rgba(0,0,0,0.08)] dark:hover:bg-[rgba(255,255,255,0.05)]"
                      }`}
                  >
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-[rgb(var(--backgroundColor-surface-container))] overflow-hidden flex-shrink-0">
                        {user.avatarUrl ? (
                          <img src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-[rgba(0,0,0,0.08)] dark:bg-[rgba(255,255,255,0.05)] text-primary font-medium">
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      {isSelected && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-[#1978E5] text-white rounded-full flex items-center justify-center border-2 border-[rgb(var(--backgroundColor-surface))]">
                          <CheckIcon size={10} />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="text-sm font-semibold text-primary truncate">
                        {user.username}
                      </span>
                      <span className="text-xs text-secondary truncate">
                        {user.bio || "Sẵn sàng trò chuyện"}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center text-sm text-secondary py-4">
                Không tìm thấy người dùng nào
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Footer: Create button ────────────────────────────── */}
      <div className="flex flex-shrink-0 pt-3 pb-4 px-4 border-t border-[rgb(var(--backgroundColor-state-enabled))]">
        <div className="flex flex-1 flex-row flex-wrap gap-2">
          <button
            onClick={handleSave}
            disabled={!name.trim() || memberIds.length === 0}
            className="flex items-center justify-center gap-2 bg-clip-border focus-visible:outline-2 focus-visible:outline-current focus-visible:-outline-offset-2 border border-[rgb(var(--textColor-primary)/0.13)] shadow-sm enabled:hover:bg-[rgba(0,0,0,0.08)] dark:enabled:hover:bg-[rgba(255,255,255,0.05)] enabled:active:bg-[rgb(var(--backgroundColor-state-active))] disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-glass text-subtitle-md px-3 h-9 flex-1 min-w-24 rounded-[20px] bg-[rgb(var(--backgroundColor-state-enabled))] text-primary transition-colors"
            tabIndex={0}
          >
            <span className="font-medium text-sm">
              {type === 2 ? "Tạo nhóm" : "Tạo kênh"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
