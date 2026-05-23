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
import type { ConversationListItem } from "@/components/chat/conversation-data";
import type { ContactUserResponse } from "@/types/user";

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

function isContactConversation(conversation: ConversationListItem, contactId: string) {
  return conversation.type === 1 && conversation.createBy === contactId;
}

function mergeConversations(
  baseConversations: ConversationListItem[],
  localConversations: ConversationListItem[],
) {
  const localIds = new Set(localConversations.map((conversation) => conversation.id));

  return [
    ...localConversations,
    ...baseConversations.filter((conversation) => !localIds.has(conversation.id)),
  ].sort((left, right) => {
    const leftTime = left.lastActivityAt ? new Date(left.lastActivityAt).getTime() : 0;
    const rightTime = right.lastActivityAt ? new Date(right.lastActivityAt).getTime() : 0;

    return rightTime - leftTime;
  });
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

function createContactConversation(
  draftConversation: ConversationListItem,
  firstMessageText: string,
): ConversationListItem | undefined {
  if (!draftConversation.createBy) return undefined;

  const now = new Date().toISOString();

  return {
    ...draftConversation,
    id: getContactConversationId(draftConversation.createBy),
    createdAt: now,
    updatedAt: now,
    lastActivityAt: now,
    lastMessageText: firstMessageText,
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
  const [localConversations, setLocalConversations] = useState<ConversationListItem[]>([]);

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

  const conversations = useMemo(
    () => mergeConversations(conversationList ?? [], localConversations),
    [conversationList, localConversations],
  );

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
    (conversation: ConversationListItem, firstMessageText: string) => {
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

      const createdConversation = createContactConversation(conversation, firstMessageText);
      if (!createdConversation) return undefined;

      setLocalConversations((currentConversations) => [
        createdConversation,
        ...currentConversations.filter((item) => item.id !== createdConversation.id),
      ]);
      setActiveDraftContact(null);
      setActiveConversationId(createdConversation.id);

      return createdConversation;
    },
    [conversations],
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
        />

        <div
          data-rht-toaster=""
          className="fixed inset-4 z-[9999] pointer-events-none md:!top-8 md:!left-9 md:!bottom-20 md:!right-20"
        />
      </div>
    </div>
  );
}
