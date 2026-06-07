"use client";

import dynamic from "next/dynamic";

import {
  ChatHeader,
  ConversationSidebar,
  DotPattern,
  DisplayToggle,
  ChatMain,
} from "@/components/chat";
import { useChatPageController } from "@/hooks/use-chat-page-controller";
import type { ConversationListItem } from "@/data/conversation-data";
import type { ContactUserResponse } from "@/types/user";
import "./chat.css";

const ChatActionPanel = dynamic(() => import("@/components/chat/ChatActionPanel"), { ssr: false });

const CHAT_ROOT_CLASS =
  "chat-root flex h-svh flex-col bg-[rgb(var(--backgroundColor-primary))] font-[var(--font-sans-theme),system-ui,sans-serif] text-[rgb(var(--textColor-primary))]";

function ChatSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Đang tải…"
      className="chat-root flex h-svh bg-[rgb(var(--backgroundColor-primary))] text-[rgb(var(--textColor-primary))]"
    />
  );
}

interface ChatPageClientProps {
  conversationList?: ConversationListItem[];
  contactList?: ContactUserResponse[];
}

export default function ChatPageClient(props: ChatPageClientProps) {
  const {
    authState,
    currentUser,
    chatContacts,
    contacts,
    conversations,
    conversationsPagination,
    activeConv,
    activeConversationId,
    activeDraftConversation,
    isConversationSidebarOpen,
    isChatActionPanelOpen,
    sidebarActiveTab,
    closeConversationSidebar,
    toggleConversationSidebar,
    openChatActionPanel,
    closeChatActionPanel,
    openFriends,
    handleActiveTabChange,
    handleSelectConversation,
    handleSelectContact,
    handleCreateConversation,
    handleConversationMessageUpdate,
    handleCreateGroup,
    handleSearchMembersForGroup,
    loadMoreConversations,
  } = useChatPageController(props);

  if (authState === "hydrating") return <ChatSkeleton />;
  if (authState !== "authenticated") return null;

  return (
    <div dir="ltr" className={CHAT_ROOT_CLASS}>
      <div className="text-foreground relative flex h-svh w-full bg-[rgb(var(--backgroundColor-primary))] text-[rgb(var(--textColor-primary))]">
        <main className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
          <DotPattern />
          <ChatHeader />

          <div className="relative flex min-h-0 flex-1 overflow-hidden">
            <ConversationSidebar
              isMobileOpen={isConversationSidebarOpen}
              onClose={closeConversationSidebar}
              onOpenActionPanel={openChatActionPanel}
              activeTab={sidebarActiveTab}
              onActiveTabChange={handleActiveTabChange}
              conversations={conversations}
              contacts={contacts}
              isContactsLoading={chatContacts.isLoadingContacts}
              contactsError={chatContacts.contactsError}
              activeConversationId={activeConversationId}
              onSelectConversation={handleSelectConversation}
              onSelectContact={handleSelectContact}
              onLoadMoreConversations={loadMoreConversations}
              hasMoreConversations={conversationsPagination?.hasNext}
            />

            <div className="min-h-0 flex-1 overflow-hidden">
              <ChatMain
                activeConv={activeConv}
                currentUser={currentUser}
                isDraftConversation={activeDraftConversation?.id === activeConversationId}
                isConversationSidebarOpen={isConversationSidebarOpen}
                onToggleConversationSidebar={toggleConversationSidebar}
                onCreateConversation={handleCreateConversation}
                onConversationMessageUpdate={handleConversationMessageUpdate}
              />
            </div>
          </div>

          <DisplayToggle />
        </main>

        <ChatActionPanel
          isOpen={isChatActionPanelOpen}
          onClose={closeChatActionPanel}
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
          onCreateConversation={handleCreateGroup}
          onSearchMembers={handleSearchMembersForGroup}
        />

        <div
          data-rht-toaster=""
          className="fixed inset-4 z-[9999] pointer-events-none md:!top-8 md:!left-9 md:!bottom-20 md:!right-20"
        />
      </div>
    </div>
  );
}
