"use client";

import React, { useState } from "react";
import { GridIcon, UsersIcon, SearchIcon, CloseIcon, ListBulletIcon } from "./icons";
import ProjectItem from "./ProjectItem";
import { ConversationListItem, MOCK_CONVERSATIONS } from "./conversation-data";

type SidebarFilter = "all" | "unread";

interface ProjectSidebarProps {
  isMobileOpen?: boolean;
  onClose?: () => void;
  conversations?: ConversationListItem[];
}

export default function ProjectSidebar({
  isMobileOpen = false,
  onClose,
  conversations = MOCK_CONVERSATIONS,
}: ProjectSidebarProps) {
  const [activeTab, setActiveTab] = useState<SidebarFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const visibleConversations = [...conversations]
    .sort((left, right) => {
      const leftTime = left.lastActivityAt ? new Date(left.lastActivityAt).getTime() : 0;
      const rightTime = right.lastActivityAt ? new Date(right.lastActivityAt).getTime() : 0;
      return rightTime - leftTime;
    })
    .filter((conversation) => {
      if (activeTab === "unread" && conversation.unreadCount <= 0) {
        return false;
      }

      const query = searchQuery.trim().toLowerCase();
      if (!query) return true;

      return [conversation.name, conversation.description, conversation.lastMessageText]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(query));
    });

  return (
    <section
      id="recent-projects-panel"
      className={`
        flex flex-col gap-2 fixed inset-x-0 bottom-0 z-20 p-4
        overflow-y-auto rounded-t-2xl
        transition-transform duration-300 ease-in-out
        md:pointer-events-auto md:static md:translate-y-0 md:z-auto md:p-3 md:gap-4
        md:overflow-visible md:rounded-none md:border-t-0 md:shrink-0
        [height:calc(100vh-80px)] md:h-full
        ${isMobileOpen ? "pointer-events-auto translate-y-0" : "pointer-events-none translate-y-full"}
      `}
    >
      <div
        className="
          flex flex-col flex-1 min-h-0
          rounded-2xl p-3 overflow-y-auto hide-scrollbar
          bg-[rgb(var(--backgroundColor-surface-container)/.5)]
          backdrop-blur-[40px]
          border border-[rgb(var(--borderColor-secondary)/.15)]
          w-full md:w-[375px]
        "
      >
        <div className="md:hidden flex items-center justify-between gap-3 pb-3">
          <div className="flex items-center gap-2 text-sm font-medium text-[rgb(var(--textColor-primary))]">
            <span className="text-[rgb(var(--textColor-primary))]">
              <ListBulletIcon />
            </span>
            Hội thoại gần đây
          </div>
          <button
            type="button"
            aria-label="Đóng menu"
            className="flex h-8 w-8 items-center justify-center rounded-full text-[rgb(var(--textColor-primary))] transition-colors hover:bg-[rgb(var(--backgroundColor-state-hover))]"
            onClick={onClose}
          >
            <CloseIcon />
          </button>
        </div>

        <div className="hide-scrollbar flex w-full flex-1 flex-col gap-1 overflow-y-scroll pb-4">

          {/* Tab Toggle */}
          <div
            role="radiogroup"
            className="
              relative flex gap-1 p-0.5 rounded-[32px] mb-2
              bg-[rgb(var(--backgroundColor-surface-container)/.5)]
              backdrop-blur-[40px]
            "
          >
            {/* My Projects Tab */}
            <button
              type="button"
              role="radio"
              aria-checked={activeTab === "all"}
              className={`
                relative flex-1 px-2 py-2 rounded-[32px]
                text-sm font-medium cursor-pointer transition-colors z-10 text-center
                ${activeTab === "all" ? "text-[rgb(var(--textColor-primary))]" : "text-[rgb(var(--textColor-secondary))]"}
              `}
              tabIndex={0}
              onClick={() => setActiveTab("all")}
            >
              {activeTab === "all" && (
                <div className="absolute inset-0 z-0 rounded-[32px] bg-[rgb(var(--backgroundColor-state-active))]" />
              )}
              <span className="relative z-10 flex items-center justify-center gap-1.5">
                <span className="text-[rgb(var(--textColor-primary))]">
                  <GridIcon />
                </span>
                Tất cả
              </span>
            </button>

            {/* Shared Tab */}
            <button
              type="button"
              role="radio"
              aria-checked={activeTab === "unread"}
              className={`
                relative flex-1 px-2 py-2 rounded-[32px]
                text-sm font-medium cursor-pointer transition-colors z-10 text-center
                ${activeTab === "unread" ? "text-[rgb(var(--textColor-primary))]" : "text-[rgb(var(--textColor-secondary))]"}
              `}
              tabIndex={0}
              onClick={() => setActiveTab("unread")}
            >
              {activeTab === "unread" && (
                <div className="absolute inset-0 z-0 rounded-[32px] bg-[rgb(var(--backgroundColor-state-active))]" />
              )}
              <span className="relative z-10 flex items-center justify-center gap-1.5">
                <span className="text-[#757575]">
                  <ListBulletIcon />
                </span>
                Chưa đọc
              </span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="sticky top-0 z-10">
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
                placeholder={activeTab === "all" ? "Tìm kiếm hội thoại" : "Tìm kiếm hội thoại chưa đọc"}
                className="w-full bg-transparent text-sm outline-none text-[rgb(var(--textColor-primary))]"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="h-3" />
          </div>

          {/* Project List */}
          <ul>
            {visibleConversations.map((conversation) => (
              <ProjectItem
                key={conversation.id}
                conversation={conversation}
              />
            ))}
          </ul>
        </div>
      </div>

    </section>
  );
}