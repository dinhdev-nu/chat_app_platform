"use client";

import React, { useCallback, useDeferredValue, useMemo, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { GridIcon, SearchIcon, CloseIcon, UserGroupIcon, UsersIcon, PlusIcon } from "@/components/ui/icons";
import { ConversationListItem, MOCK_CONVERSATIONS } from "@/data/conversation-data";
import { ContactUserResponse, MOCK_CONTACT_USERS } from "@/data/contact-data";
import SidebarList from "./SidebarList";

type SidebarFilter = "all" | "friends";

interface ConversationSidebarProps {
  isMobileOpen?: boolean;
  onClose?: () => void;
  onOpenActionPanel?: () => void;
  activeConversationId?: string;
  onSelectConversation?: (conv: ConversationListItem) => void;
  onSelectContact?: (contact: ContactUserResponse) => void;
  conversations?: ConversationListItem[];
  contacts?: ContactUserResponse[];
  isContactsLoading?: boolean;
  contactsError?: string | null;
  activeTab?: SidebarFilter;
  onActiveTabChange?: (tab: SidebarFilter) => void;
  onLoadMoreConversations?: () => void;
  hasMoreConversations?: boolean;
}

export default function ConversationSidebar({
  isMobileOpen = false,
  onClose,
  onOpenActionPanel,
  conversations = MOCK_CONVERSATIONS,
  contacts = MOCK_CONTACT_USERS,
  isContactsLoading = false,
  contactsError,
  activeConversationId,
  onSelectConversation,
  onSelectContact,
  activeTab: activeTabProp,
  onActiveTabChange,
  onLoadMoreConversations,
  hasMoreConversations,
}: ConversationSidebarProps) {
  const isMobile = useIsMobile();
  const isHiddenOnMobile = isMobile && !isMobileOpen;
  const [uncontrolledActiveTab, setUncontrolledActiveTab] = useState<SidebarFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const activeTab = activeTabProp ?? uncontrolledActiveTab;
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const query = useMemo(() => deferredSearchQuery.trim().toLowerCase(), [deferredSearchQuery]);

  const selectTab = useCallback(
    (tab: SidebarFilter) => {
      if (activeTabProp === undefined) {
        setUncontrolledActiveTab(tab);
      }
      onActiveTabChange?.(tab);
    },
    [activeTabProp, onActiveTabChange],
  );

  const visibleConversations = useMemo(() => {
    return conversations
      .filter((conversation) => {
        if (query.length === 0) return true;

        return [conversation.name, conversation.description, conversation.lastMessageText]
          .some((value) => value?.toLowerCase().includes(query));
      })
      .sort((left, right) => {
        const leftTime = left.lastActivityAt ? new Date(left.lastActivityAt).getTime() : 0;
        const rightTime = right.lastActivityAt ? new Date(right.lastActivityAt).getTime() : 0;
        return rightTime - leftTime;
      });
  }, [conversations, query]);

  const visibleContacts = useMemo(() => {
    return contacts
      .filter((contact) => {
        if (query.length === 0) return true;

        return [contact.username, contact.bio]
          .some((value) => value?.toLowerCase().includes(query));
      })
      .sort((left, right) => {
        const leftTime = left.lastSeenAt ? new Date(left.lastSeenAt).getTime() : 0;
        const rightTime = right.lastSeenAt ? new Date(right.lastSeenAt).getTime() : 0;
        return rightTime - leftTime;
      });
  }, [contacts, query]);

  return (
    <section
      id="conversation-sidebar-panel"
      aria-hidden={isHiddenOnMobile}
      inert={isHiddenOnMobile}
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
            className="flex size-8 items-center justify-center rounded-full text-[rgb(var(--textColor-primary))] transition-colors hover:bg-[rgb(var(--backgroundColor-state-hover))]"
            onClick={onClose}
          >
            <CloseIcon />
          </button>
        </div>

        <div className="hide-scrollbar flex w-full flex-1 flex-col gap-1 overflow-y-scroll pb-4">
          <div
            role="radiogroup"
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
              style={{
                left: activeTab === "all" ? "2px" : "calc(50% + 1px)",
                width: "calc(50% - 3px)",
                top: 2,
                bottom: 2,
                transition: "left 520ms cubic-bezier(0.16, 1, 0.3, 1)",
              }}
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
              onClick={() => selectTab("all")}
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
              onClick={() => selectTab("friends")}
              style={{ fontWeight: 600 }}
            >
              <span className="relative z-10 flex items-center justify-center gap-1.5">
                <span className="text-[rgb(var(--textColor-secondary))]">
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
                  name="sidebarSearch"
                  autoComplete="off"
                  aria-label={activeTab === "all" ? "Tìm kiếm hội thoại" : "Tìm kiếm bạn bè"}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button
                type="button"
                onClick={onOpenActionPanel}
                aria-label="Tạo hội thoại hoặc thêm contact"
                title="Tạo hội thoại hoặc thêm contact"
                className="flex size-8 shrink-0 items-center justify-center rounded-full text-[rgb(var(--textColor-primary))] transition-colors hover:bg-[rgb(var(--backgroundColor-state-hover))]"
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
            activeConversationId={activeConversationId}
            onSelectConversation={onSelectConversation}
            onSelectContact={onSelectContact}
            isContactsLoading={isContactsLoading}
            contactsError={contactsError}
            onLoadMoreConversations={onLoadMoreConversations}
            hasMoreConversations={hasMoreConversations}
          />
        </div>
      </div>
    </section>
  );
}
