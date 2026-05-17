"use client";

import React, { useState, useEffect, useRef } from "react";
import { GridIcon, SearchIcon, CloseIcon, UserGroupIcon, UsersIcon, PlusIcon } from "./icons";
import { ConversationListItem, MOCK_CONVERSATIONS } from "./conversation-data";
import { ContactUserResponse, MOCK_CONTACT_USERS } from "./contact-data";
import SidebarList from "./SidebarList";

type SidebarFilter = "all" | "friends";

interface ProjectSidebarProps {
  isMobileOpen?: boolean;
  onClose?: () => void;
  onOpenPanel?: () => void;
  conversations?: ConversationListItem[];
  contacts?: ContactUserResponse[];
  activeTab?: SidebarFilter;
  onActiveTabChange?: (tab: SidebarFilter) => void;
}

export default function ProjectSidebar({
  isMobileOpen = false,
  onClose,
  onOpenPanel,
  conversations = MOCK_CONVERSATIONS,
  contacts = MOCK_CONTACT_USERS,
  activeTab: activeTabProp,
  onActiveTabChange,
}: ProjectSidebarProps) {
  const [activeTab, setActiveTab] = useState<SidebarFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const query = searchQuery.trim().toLowerCase();

  const tabsRef = useRef<HTMLDivElement | null>(null);
  const buttonsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const [indicator, setIndicator] = useState({ left: 0, width: 0, visible: false });

  function measureActive() {
    const container = tabsRef.current;
    if (!container) return setIndicator((s) => ({ ...s, visible: false }));
    const index = activeTab === "all" ? 0 : 1;
    const btn = buttonsRef.current[index];
    if (!btn) return setIndicator((s) => ({ ...s, visible: false }));

    const cRect = container.getBoundingClientRect();
    const bRect = btn.getBoundingClientRect();
    const left = bRect.left - cRect.left + container.scrollLeft;
    setIndicator({ left, width: bRect.width, visible: true });
  }

  // sync controlled prop -> internal state
  useEffect(() => {
    if (activeTabProp && activeTabProp !== activeTab) {
      setActiveTab(activeTabProp);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTabProp]);

  useEffect(() => {
    measureActive();
    const onResize = () => measureActive();
    window.addEventListener("resize", onResize);
    const RO = (window as any).ResizeObserver;
    const ro = RO ? new RO(measureActive) : undefined;
    if (ro && tabsRef.current) ro.observe(tabsRef.current);
    buttonsRef.current.forEach((b) => b && ro?.observe(b));
    return () => {
      window.removeEventListener("resize", onResize);
      ro?.disconnect?.();
    };
  }, [activeTab, searchQuery]);

  const visibleConversations = [...conversations]
    .sort((left, right) => {
      const leftTime = left.lastActivityAt ? new Date(left.lastActivityAt).getTime() : 0;
      const rightTime = right.lastActivityAt ? new Date(right.lastActivityAt).getTime() : 0;
      return rightTime - leftTime;
    })
    .filter((conversation) => {
      if (query.length === 0) return true;

      return [conversation.name, conversation.description, conversation.lastMessageText]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(query));
    });

  const visibleContacts = [...contacts]
    .sort((left, right) => {
      const leftTime = left.lastSeenAt ? new Date(left.lastSeenAt).getTime() : 0;
      const rightTime = right.lastSeenAt ? new Date(right.lastSeenAt).getTime() : 0;
      return rightTime - leftTime;
    })
    .filter((contact) => {
      if (query.length === 0) return true;

      return [contact.username, contact.bio]
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
          rounded-3xl p-3 overflow-y-auto hide-scrollbar
          bg-surface-container backdrop-blur-glass
          border border-chat-secondary shadow-glass-soft
          w-full md:w-[375px]
        "
      >
        <div className="md:hidden flex items-center justify-between gap-3 pb-3">
          <div className="flex items-center gap-2 text-lg font-bold text-primary">
            <span className="text-primary">
              <UserGroupIcon />
            </span>
            Bạn bè & hội thoại
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
          <div
            role="radiogroup"
            ref={tabsRef}
            className="
              relative flex gap-1 p-0.5 rounded-[32px] mb-2
              bg-[rgb(var(--backgroundColor-surface-container)/.5)]
              backdrop-blur-[40px]
            "
          >
            {/* sliding active indicator */}
            <div
              aria-hidden
              className={`absolute z-0 rounded-[32px] bg-[rgb(var(--backgroundColor-state-active))] `}
              style={
                indicator.visible
                  ? {
                    left: `${indicator.left}px`,
                    width: `${indicator.width}px`,
                    top: 0,
                    bottom: 0,
                    transition: "left 520ms cubic-bezier(0.16, 1, 0.3, 1), width 520ms cubic-bezier(0.16, 1, 0.3, 1)",
                    willChange: "left, width",
                  }
                  : { opacity: 0, transition: "opacity 200ms ease-out" }
              }
            />
            <button
              type="button"
              role="radio"
              aria-checked={activeTab === "all"}
              className={`
                relative flex-1 px-2 py-2 rounded-[32px]
                text-subtitle-sm font-bold cursor-pointer transition-colors z-10 text-center
                ${activeTab === "all" ? "text-primary" : "text-secondary"}
              `}
              tabIndex={0}
              ref={(el) => { buttonsRef.current[0] = el; }}
              onClick={() => {
                setActiveTab("all");
                onActiveTabChange?.("all");
              }}
              style={{ fontWeight: 600 }}
            >
              <span className="relative z-10 flex items-center justify-center gap-1.5">
                <span className="text-[rgb(var(--textColor-primary))]">
                  <GridIcon size={20} />
                </span>
                Tất cả
              </span>
            </button>

            <button
              type="button"
              role="radio"
              aria-checked={activeTab === "friends"}
              className={`
                relative flex-1 px-2 py-2 rounded-[32px]
                text-subtitle-sm font-bold cursor-pointer transition-colors z-10 text-center
                ${activeTab === "friends" ? "text-primary" : "text-secondary"}
              `}
              tabIndex={0}
              ref={(el) => { buttonsRef.current[1] = el; }}
              onClick={() => {
                setActiveTab("friends");
                onActiveTabChange?.("friends");
              }}
              style={{ fontWeight: 600 }}
            >
              <span className="relative z-10 flex items-center justify-center gap-1.5">
                <span className="text-[#757575]">
                  <UsersIcon size={20} />
                </span>
                Bạn bè
              </span>
            </button>
          </div>

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
                  placeholder={activeTab === "all" ? "Tìm kiếm hội thoại" : "Tìm kiếm bạn bè"}
                  className="w-full bg-transparent text-body-sm outline-none text-primary"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button
                type="button"
                onClick={onOpenPanel}
                aria-label="Tạo hội thoại hoặc thêm contact"
                title="Tạo hội thoại hoặc thêm contact"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[rgb(var(--textColor-primary))] transition-colors hover:bg-[rgb(var(--backgroundColor-state-hover))]"
              >
                <PlusIcon size={16} />
              </button>
            </div>
            <div className="h-3" />
          </div>

          <SidebarList
            activeTab={activeTab}
            conversations={visibleConversations}
            contacts={visibleContacts}
          />
        </div>
      </div>
    </section>
  );
}