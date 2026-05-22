"use client";

import {
  ChatHeader,
  ProjectSidebar,
  DotPattern,
  DisplayToggle,
  ChatMain,
} from "@/components/chat";
import { useChatContacts } from "@/hooks/use-chat-contacts";
import { useAuthStore } from "@/stores/authStore";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import "./chat.css";
import type { ConversationListItem } from "@/components/chat/conversation-data";
import type { ContactUserResponse } from "@/types/user";

const Panel = dynamic(() => import("@/components/chat/Panel"), { ssr: false });
const CONTACT_CONVERSATION_FALLBACK_DATE = "1970-01-01T00:00:00.000Z";

function contactToConversation(contact: ContactUserResponse): ConversationListItem {
  const lastActivityAt = contact.lastSeenAt ?? contact.createdAt ?? CONTACT_CONVERSATION_FALLBACK_DATE;

  return {
    id: `contact:${contact.id}`,
    type: 1,
    name: contact.username,
    description: contact.bio ?? undefined,
    avatarUrl: contact.avatarUrl ?? undefined,
    createBy: contact.id,
    lastActivityAt,
    createdAt: contact.createdAt ?? lastActivityAt,
    updatedAt: lastActivityAt,
    role: 3,
    isMuted: false,
    unreadCount: 0,
    lastMessageText: contact.bio ?? "Bắt đầu trò chuyện",
  };
}

interface ChatPageClientProps {
  conversationList?: ConversationListItem[];
  contactList?: ContactUserResponse[];
}

export default function ChatPageClient({ conversationList, contactList }: ChatPageClientProps) {
  const router = useRouter();
  const accessToken = useAuthStore((state) => state.accessToken);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const refreshProfile = useAuthStore((state) => state.refreshProfile);
  const clearSession = useAuthStore((state) => state.clearSession);
  const [isProjectSidebarOpen, setIsProjectSidebarOpen] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [sidebarActiveTab, setSidebarActiveTab] = useState<"all" | "friends">("all");
  const [activeConversationId, setActiveConversationId] = useState<string | undefined>(undefined);
  const canLoadProtectedData = hasHydrated && Boolean(accessToken);
  const chatContacts = useChatContacts({ enabled: canLoadProtectedData });
  const contacts = contactList ?? chatContacts.contacts;
  const conversations = useMemo(
    () => conversationList ?? contacts.map(contactToConversation),
    [contacts, conversationList],
  );
  const activeConv = useMemo(
    () => conversations.find((conversation) => conversation.id === activeConversationId),
    [activeConversationId, conversations],
  );

  useEffect(() => {
    if (!hasHydrated) return;

    if (!accessToken) {
      router.replace("/login");
      return;
    }

    void refreshProfile().catch((error) => {
      const status =
        typeof error === "object" && error !== null && "status" in error
          ? Number((error as { status?: number }).status)
          : undefined;

      if (status === 401) {
        clearSession();
        router.replace("/login");
      }
    });
  }, [accessToken, clearSession, hasHydrated, refreshProfile, router]);

  const closeProjectSidebar = useCallback(() => {
    setIsProjectSidebarOpen(false);
  }, []);

  const openPanel = useCallback(() => {
    setIsPanelOpen(true);
  }, []);

  const closePanel = useCallback(() => {
    setIsPanelOpen(false);
  }, []);

  const openFriends = useCallback(() => {
    setIsProjectSidebarOpen(true);
    setSidebarActiveTab("friends");
    setIsPanelOpen(false);
  }, []);

  const toggleProjectSidebar = useCallback(() => {
    setIsProjectSidebarOpen((isOpen) => !isOpen);
  }, []);

  const handleActiveTabChange = useCallback((tab: "all" | "friends") => {
    setSidebarActiveTab(tab);
  }, []);

  const handleSelectConversation = useCallback((conversation: ConversationListItem) => {
    setActiveConversationId(conversation.id);
  }, []);

  return (
    <div
      dir="ltr"
      className="chat-root flex h-svh flex-col bg-[rgb(var(--backgroundColor-primary))] font-[var(--font-sans-theme),system-ui,sans-serif] text-[rgb(var(--textColor-primary))]"
    >
      <div
        className="text-foreground relative flex h-svh w-full bg-[rgb(var(--backgroundColor-primary))] text-[rgb(var(--textColor-primary))]"
      >
        <main className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
          {/* Dot Pattern Background */}
          <DotPattern />

          {/* Header */}
          <ChatHeader />

          {/* Main Content Area */}
          <div className="relative flex min-h-0 flex-1 overflow-hidden">
            {/* Left Sidebar */}
            <ProjectSidebar
              isMobileOpen={isProjectSidebarOpen}
              onClose={closeProjectSidebar}
              onOpenPanel={openPanel}
              activeTab={sidebarActiveTab}
              onActiveTabChange={handleActiveTabChange}
              conversations={conversations}
              contacts={contacts}
              isContactsLoading={chatContacts.isLoadingContacts}
              contactsError={chatContacts.contactsError}
              activeConversationId={activeConversationId}
              onSelectConversation={handleSelectConversation}
            />

            {/* Center: Chat main */}
            <div className="min-h-0 flex-1 overflow-hidden">
              <ChatMain
                activeConv={activeConv}
                isProjectSidebarOpen={isProjectSidebarOpen}
                onToggleProjects={toggleProjectSidebar}
              />
            </div>
          </div>

          {/* Display Toggle */}
          <DisplayToggle />
        </main>

        {/* Panel (right side) */}
        <Panel
          isOpen={isPanelOpen}
          onClose={closePanel}
          onOpenFriends={openFriends}
          contacts={contacts}
          incomingRequests={chatContacts.incomingRequests}
          searchResults={chatContacts.searchResults}
          isIncomingLoading={chatContacts.isLoadingIncoming}
          isSearchingUsers={chatContacts.isSearchingUsers}
          incomingError={chatContacts.incomingError ?? chatContacts.contactActionError}
          searchError={chatContacts.searchError}
          pendingContactActionIds={chatContacts.pendingContactActionIds}
          onAcceptContactRequest={chatContacts.acceptContactRequest}
          onSearchUsers={chatContacts.searchUsers}
          onSendContactRequest={chatContacts.sendContactRequest}
        />

        {/* Toast Container */}
        <div
          data-rht-toaster=""
          className="fixed inset-4 z-[9999] pointer-events-none md:!top-8 md:!left-9 md:!bottom-20 md:!right-20"
        />
      </div>
    </div>
  );
}
