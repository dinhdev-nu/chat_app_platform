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
import { useCallback, useEffect, useMemo, useState } from "react";
import "./chat.css";
import { useConversations } from "@/hooks/use-conversations";
import { conversationService } from "@/services/conversationService";
import { toHexId, mapCreatedConversationToListItem } from "@/types/conversation";
import type { ConversationListItem } from "@/components/chat/conversation-data";
import type { ContactUserResponse, SearchUser } from "@/types/user";
import { userService } from "@/services/userService";

const Panel = dynamic(() => import("@/components/chat/Panel"), { ssr: false });

const CONTACT_CONVERSATION_FALLBACK_DATE = "1970-01-01T00:00:00.000Z";
const DRAFT_CONTACT_CONVERSATION_PREFIX = "draft-contact:";

const CHAT_ROOT_CLASS =
  "chat-root flex h-svh flex-col bg-[rgb(var(--backgroundColor-primary))] font-[var(--font-sans-theme),system-ui,sans-serif] text-[rgb(var(--textColor-primary))]";

type AuthState = "hydrating" | "unauthenticated" | "authenticated";

function hasValidStoredSession(
  accessToken: string | null,
  expiresAt: string | null,
): boolean {
  if (!accessToken || !expiresAt) return false;
  const expiresAtTime = Date.parse(expiresAt);
  return Number.isFinite(expiresAtTime) && expiresAtTime > Date.now();
}

function getContactConversationId(contactId: string) {
  return `contact:${contactId}`;
}

function getDraftContactConversationId(contactId: string) {
  return `${DRAFT_CONTACT_CONVERSATION_PREFIX}${contactId}`;
}

/**
 * Kiểm tra xem conversation có phải là DM với contact không.
 * DM conversation từ API: createBy là người tạo (có thể là current user),
 * nên cần kiểm tra thêm qua name hoặc dùng contact id trong prefix.
 * Hiện tại dùng prefix "contact:" được tạo locally để đối chiếu.
 */
function isContactConversation(conversation: ConversationListItem, contactId: string) {
  return conversation.type === 1 && conversation.id === `contact:${contactId}`;
}


function contactToDraftConversation(contact: ContactUserResponse): ConversationListItem {
  const lastActivityAt =
    contact.lastSeenAt ?? contact.createdAt ?? CONTACT_CONVERSATION_FALLBACK_DATE;

  return {
    id: getDraftContactConversationId(contact.id),
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
  };
}

function ChatSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Đang tải..."
      className="chat-root flex h-svh bg-[rgb(var(--backgroundColor-primary))] text-[rgb(var(--textColor-primary))]"
    />
  );
}

interface ChatPageClientProps {
  conversationList?: ConversationListItem[];
  contactList?: ContactUserResponse[];
}

export default function ChatPageClient({
  conversationList,
  contactList,
}: ChatPageClientProps) {
  const router = useRouter();
  const accessToken = useAuthStore((state) => state.accessToken);
  const expiresAt = useAuthStore((state) => state.expiresAt);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const refreshProfile = useAuthStore((state) => state.refreshProfile);
  const clearSession = useAuthStore((state) => state.clearSession);
  const [isProjectSidebarOpen, setIsProjectSidebarOpen] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [sidebarActiveTab, setSidebarActiveTab] = useState<"all" | "friends">("all");
  const [activeConversationId, setActiveConversationId] = useState<string | undefined>(undefined);
  const [activeDraftContact, setActiveDraftContact] = useState<ContactUserResponse | null>(null);


  const authState = useMemo<AuthState>(() => {
    if (!hasHydrated) return "hydrating";
    if (!hasValidStoredSession(accessToken, expiresAt)) return "unauthenticated";
    return "authenticated";
  }, [hasHydrated, accessToken, expiresAt]);

  useEffect(() => {
    if (authState !== "unauthenticated") return;
    clearSession();
    router.replace("/login");
  }, [authState, clearSession, router]);

  useEffect(() => {
    if (authState !== "authenticated") return;

    let cancelled = false;

    refreshProfile().catch((error: unknown) => {
      if (cancelled) return;

      const status =
        typeof error === "object" && error !== null && "status" in error
          ? Number((error as { status?: number }).status)
          : undefined;

      if (status === 401) {
        clearSession();
        router.replace("/login");
      }
    });

    return () => {
      cancelled = true;
    };
  }, [authState, clearSession, refreshProfile, router]);

  const chatContacts = useChatContacts({ enabled: authState === "authenticated" });

  const {
    hasRequestedIncomingRequests,
    isLoadingIncoming,
    loadIncomingRequests,
  } = chatContacts;

  const shouldLoadIncoming =
    authState === "authenticated" &&
    isPanelOpen &&
    !hasRequestedIncomingRequests &&
    !isLoadingIncoming;

  useEffect(() => {
    if (!shouldLoadIncoming) return;
    void loadIncomingRequests();
  }, [shouldLoadIncoming, loadIncomingRequests]);

  const contacts = contactList ?? chatContacts.contacts;

  const {
    conversations: apiConversations,
    pagination: conversationsPagination,
    prependConversation,
    isLoading: isConversationsLoading,
    loadMore: loadMoreConversations,
  } = useConversations({ enabled: authState === "authenticated" });

  // Dùng apiConversations sau khi đã load. Khi đang load, fallback về prop (SSR data).
  const conversations = isConversationsLoading && apiConversations.length === 0
    ? (conversationList ?? [])
    : apiConversations;

  const activeDraftConversation = useMemo(
    () => activeDraftContact ? contactToDraftConversation(activeDraftContact) : undefined,
    [activeDraftContact],
  );

  const activeConv = useMemo(
    () =>
      conversations.find((conversation) => conversation.id === activeConversationId) ??
      (activeDraftConversation?.id === activeConversationId ? activeDraftConversation : undefined),
    [activeConversationId, activeDraftConversation, conversations],
  );

  const closeProjectSidebar = useCallback(() => {
    setIsProjectSidebarOpen(false);
  }, []);

  const toggleProjectSidebar = useCallback(() => {
    setIsProjectSidebarOpen((prev) => !prev);
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

  const handleActiveTabChange = useCallback((tab: "all" | "friends") => {
    setSidebarActiveTab(tab);
  }, []);

  const handleSelectConversation = useCallback((conversation: ConversationListItem) => {
    setActiveDraftContact(null);
    setActiveConversationId(conversation.id);
  }, []);

  const handleSelectContact = useCallback(
    (contact: ContactUserResponse) => {
      const existingConversation = conversations.find((conversation) =>
        isContactConversation(conversation, contact.id),
      );

      if (existingConversation) {
        setActiveDraftContact(null);
        setActiveConversationId(existingConversation.id);
        return;
      }

      setActiveDraftContact(contact);
      setActiveConversationId(getDraftContactConversationId(contact.id));
    },
    [conversations],
  );

  const handleCreateConversation = useCallback(
    async (conversation: ConversationListItem, firstMessageText: string) => {
      if (!conversation.id.startsWith(DRAFT_CONTACT_CONVERSATION_PREFIX)) return undefined;

      const contactId = conversation.createBy;
      if (!contactId) return undefined;

      const existingConversation = conversations.find((item) =>
        isContactConversation(item, contactId),
      );

      if (existingConversation) {
        setActiveDraftContact(null);
        setActiveConversationId(existingConversation.id);
        return existingConversation;
      }

      try {
        const { conversation: newConv, isNew } = await conversationService.createDM(toHexId(contactId));
        const listItem = mapCreatedConversationToListItem(newConv);

        // Dù đã tồn tại (200) hay mới tạo (201), đều prepend để đảm bảo xuất hiện đầu list
        prependConversation(listItem);

        setActiveDraftContact(null);
        setActiveConversationId(listItem.id);

        return listItem;
      } catch (error) {
        console.error("Failed to create DM conversation:", error);
        return undefined;
      }
    },
    [conversations, prependConversation],
  );

  const handleSearchMembersForGroup = useCallback(
    async (q: string): Promise<SearchUser[]> => {
      try {
        if (q.trim() === "") {
          // q rỗng → trả danh sách bạn bè
          const result = await userService.getContacts({ limit: 50 });
          return result.data;
        } else {
          // q không rỗng → search user
          const result = await userService.searchUsers({ q: q.trim(), limit: 20 });
          return result.data;
        }
      } catch {
        return [];
      }
    },
    [],
  );

  const handleCreateGroup = useCallback(
    async (payload: { name: string; type: 2 | 3; avatar_url?: string; description?: string; member_user_ids: string[] }) => {
      try {
        const newGroup = await conversationService.createGroup({
          name: payload.name,
          type: payload.type,
          avatar_url: payload.avatar_url,
          description: payload.description,
          member_user_ids: payload.member_user_ids.map(toHexId),
        });

        const listItem = mapCreatedConversationToListItem(newGroup);
        prependConversation(listItem);
        setActiveDraftContact(null);
        setActiveConversationId(listItem.id);
        closePanel();
      } catch (error) {
        console.error("Failed to create group:", error);
      }
    },
    [prependConversation, closePanel],
  );

  if (authState === "hydrating") return <ChatSkeleton />;

  if (authState !== "authenticated") return null;

  return (
    <div dir="ltr" className={CHAT_ROOT_CLASS}>
      <div className="text-foreground relative flex h-svh w-full bg-[rgb(var(--backgroundColor-primary))] text-[rgb(var(--textColor-primary))]">
        <main className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
          <DotPattern />

          <ChatHeader />

          <div className="relative flex min-h-0 flex-1 overflow-hidden">
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
              onSelectContact={handleSelectContact}
              onLoadMoreConversations={loadMoreConversations}
              hasMoreConversations={conversationsPagination?.hasNext}
            />

            <div className="min-h-0 flex-1 overflow-hidden">
              <ChatMain
                activeConv={activeConv}
                isProjectSidebarOpen={isProjectSidebarOpen}
                onToggleProjects={toggleProjectSidebar}
                onCreateConversation={handleCreateConversation}
              />
            </div>
          </div>

          <DisplayToggle />
        </main>

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
