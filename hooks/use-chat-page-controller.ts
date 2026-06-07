"use client";

import { useCallback, useEffect, useMemo, useReducer } from "react";
import { useRouter } from "next/navigation";

import { useChatContacts } from "@/hooks/use-chat-contacts";
import { useChatRealtime } from "@/hooks/use-chat-realtime";
import { useConversations } from "@/hooks/use-conversations";
import { conversationService } from "@/services/conversationService";
import { markConversationRead } from "@/services/readReceiptService";
import { userService } from "@/services/userService";
import { useAuthStore } from "@/stores/authStore";
import type { ConversationListItem } from "@/data/conversation-data";
import type { ChatMessage } from "@/types/message";
import { mapCreatedConversationToListItem } from "@/types/conversation";
import type { ContactUserResponse, SearchUser } from "@/types/user";

const CONTACT_CONVERSATION_FALLBACK_DATE = "1970-01-01T00:00:00.000Z";
const DRAFT_CONTACT_CONVERSATION_PREFIX = "draft-contact:";

type AuthState = "hydrating" | "unauthenticated" | "authenticated";

interface ChatPageState {
  isConversationSidebarOpen: boolean;
  isChatActionPanelOpen: boolean;
  sidebarActiveTab: "all" | "friends";
  activeConversationId?: string;
  activeDraftContact: ContactUserResponse | null;
}

type ChatPageAction =
  | { type: "setConversationSidebarOpen"; open: boolean }
  | { type: "toggleConversationSidebar" }
  | { type: "setChatActionPanelOpen"; open: boolean }
  | { type: "openFriends" }
  | { type: "setSidebarActiveTab"; tab: "all" | "friends" }
  | { type: "selectConversation"; conversationId: string }
  | { type: "selectDraftContact"; contact: ContactUserResponse }
  | { type: "clearActiveConversation" };

interface ChatPageControllerParams {
  conversationList?: ConversationListItem[];
  contactList?: ContactUserResponse[];
}

interface CreateGroupPayload {
  name: string;
  type: 2 | 3;
  avatar_url?: string;
  description?: string;
  member_user_ids: string[];
}

const initialChatPageState: ChatPageState = {
  isConversationSidebarOpen: false,
  isChatActionPanelOpen: false,
  sidebarActiveTab: "all",
  activeConversationId: undefined,
  activeDraftContact: null,
};

function hasValidStoredSession(accessToken: string | null, expiresAt: string | null): boolean {
  if (!accessToken || !expiresAt) return false;
  const expiresAtTime = Date.parse(expiresAt);
  return Number.isFinite(expiresAtTime) && expiresAtTime > Date.now();
}

function getDraftContactConversationId(contactId: string) {
  return `${DRAFT_CONTACT_CONVERSATION_PREFIX}${contactId}`;
}

function chatPageReducer(state: ChatPageState, action: ChatPageAction): ChatPageState {
  switch (action.type) {
    case "setConversationSidebarOpen":
      return { ...state, isConversationSidebarOpen: action.open };
    case "toggleConversationSidebar":
      return { ...state, isConversationSidebarOpen: !state.isConversationSidebarOpen };
    case "setChatActionPanelOpen":
      return { ...state, isChatActionPanelOpen: action.open };
    case "openFriends":
      return {
        ...state,
        isConversationSidebarOpen: true,
        sidebarActiveTab: "friends",
        isChatActionPanelOpen: false,
      };
    case "setSidebarActiveTab":
      return { ...state, sidebarActiveTab: action.tab };
    case "selectConversation":
      return {
        ...state,
        activeDraftContact: null,
        activeConversationId: action.conversationId,
      };
    case "selectDraftContact":
      return {
        ...state,
        activeDraftContact: action.contact,
        activeConversationId: getDraftContactConversationId(action.contact.id),
      };
    case "clearActiveConversation":
      return { ...state, activeDraftContact: null, activeConversationId: undefined };
  }
}

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
    memberOnlineCount: contact.isOnline ? 1 : 0,
    isOnline: Boolean(contact.isOnline),
  };
}

export function useChatPageController({
  conversationList,
  contactList,
}: ChatPageControllerParams) {
  const { replace } = useRouter();
  const accessToken = useAuthStore((state) => state.accessToken);
  const expiresAt = useAuthStore((state) => state.expiresAt);
  const currentUser = useAuthStore((state) => state.user);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const refreshProfile = useAuthStore((state) => state.refreshProfile);
  const clearSession = useAuthStore((state) => state.clearSession);
  const [pageState, dispatchPageState] = useReducer(chatPageReducer, initialChatPageState);
  const {
    isConversationSidebarOpen,
    isChatActionPanelOpen,
    sidebarActiveTab,
    activeConversationId,
    activeDraftContact,
  } = pageState;

  const authState = useMemo<AuthState>(() => {
    if (!hasHydrated) return "hydrating";
    if (!hasValidStoredSession(accessToken, expiresAt)) return "unauthenticated";
    return "authenticated";
  }, [hasHydrated, accessToken, expiresAt]);

  const handleCurrentUserRemovedFromConversation = useCallback(
    (conversationId: string) => {
      if (conversationId !== activeConversationId) return;

      dispatchPageState({ type: "clearActiveConversation" });
    },
    [activeConversationId],
  );

  useEffect(() => {
    if (authState !== "unauthenticated") return;
    clearSession();
    replace("/login");
  }, [authState, clearSession, replace]);

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
        replace("/login");
      }
    });

    return () => {
      cancelled = true;
    };
  }, [authState, clearSession, refreshProfile, replace]);

  const chatContacts = useChatContacts({ enabled: authState === "authenticated" });

  useChatRealtime({
    accessToken,
    activeConversationId,
    currentUserId: currentUser?.id,
    enabled: authState === "authenticated",
    onCurrentUserRemovedFromConversation: handleCurrentUserRemovedFromConversation,
    onPresenceChange: chatContacts.applyContactPresence,
  });

  const {
    hasRequestedIncomingRequests,
    isLoadingIncoming,
    loadIncomingRequests,
  } = chatContacts;

  const shouldLoadIncoming =
    authState === "authenticated" &&
    isChatActionPanelOpen &&
    !hasRequestedIncomingRequests &&
    !isLoadingIncoming;

  useEffect(() => {
    if (!shouldLoadIncoming) return;
    void loadIncomingRequests();
  }, [shouldLoadIncoming, loadIncomingRequests]);

  const contacts = chatContacts.contacts.length > 0 ? chatContacts.contacts : (contactList ?? []);

  const {
    conversations: apiConversations,
    pagination: conversationsPagination,
    prependConversation,
    updateConversation,
    isLoading: isConversationsLoading,
    loadMore: loadMoreConversations,
  } = useConversations({ enabled: authState === "authenticated" });

  const conversations = useMemo(
    () =>
      isConversationsLoading && apiConversations.length === 0
        ? (conversationList ?? [])
        : apiConversations,
    [apiConversations, conversationList, isConversationsLoading],
  );

  const activeDraftConversation = useMemo(
    () => (activeDraftContact ? contactToDraftConversation(activeDraftContact) : undefined),
    [activeDraftContact],
  );

  const activeConv = useMemo(
    () =>
      conversations.find((conversation) => conversation.id === activeConversationId) ??
      (activeDraftConversation?.id === activeConversationId ? activeDraftConversation : undefined),
    [activeConversationId, activeDraftConversation, conversations],
  );

  const closeConversationSidebar = useCallback(() => {
    dispatchPageState({ type: "setConversationSidebarOpen", open: false });
  }, []);

  const toggleConversationSidebar = useCallback(() => {
    dispatchPageState({ type: "toggleConversationSidebar" });
  }, []);

  const openChatActionPanel = useCallback(() => {
    dispatchPageState({ type: "setChatActionPanelOpen", open: true });
  }, []);

  const closeChatActionPanel = useCallback(() => {
    dispatchPageState({ type: "setChatActionPanelOpen", open: false });
  }, []);

  const openFriends = useCallback(() => {
    dispatchPageState({ type: "openFriends" });
  }, []);

  const handleActiveTabChange = useCallback((tab: "all" | "friends") => {
    dispatchPageState({ type: "setSidebarActiveTab", tab });
  }, []);

  const handleSelectConversation = useCallback((conversation: ConversationListItem) => {
    dispatchPageState({ type: "selectConversation", conversationId: conversation.id });
    if (conversation.unreadCount > 0) {
      void markConversationRead(conversation.id, conversation.lastMessageId);
      updateConversation({ ...conversation, unreadCount: 0 });
    }
  }, [updateConversation]);

  const handleSelectContact = useCallback(
    (contact: ContactUserResponse) => {
      const existingConversation = conversations.find((conversation) =>
        isContactConversation(conversation, contact.id),
      );

      if (existingConversation) {
        dispatchPageState({ type: "selectConversation", conversationId: existingConversation.id });
        return;
      }

      dispatchPageState({ type: "selectDraftContact", contact });
    },
    [conversations],
  );

  const handleCreateConversation = useCallback(
    async (conversation: ConversationListItem) => {
      if (!conversation.id.startsWith(DRAFT_CONTACT_CONVERSATION_PREFIX)) return undefined;

      const contactId = conversation.createBy;
      if (!contactId) return undefined;

      const existingConversation = conversations.find((item) =>
        isContactConversation(item, contactId),
      );

      if (existingConversation) {
        dispatchPageState({ type: "selectConversation", conversationId: existingConversation.id });
        return existingConversation;
      }

      try {
        const { conversation: newConv } = await conversationService.createDM(contactId);
        const listItem = mapCreatedConversationToListItem(newConv);

        prependConversation(listItem);
        dispatchPageState({ type: "selectConversation", conversationId: listItem.id });

        return listItem;
      } catch (error) {
        console.error("Failed to create DM conversation:", error);
        return undefined;
      }
    },
    [conversations, prependConversation],
  );

  const handleSearchMembersForGroup = useCallback(async (q: string): Promise<SearchUser[]> => {
    try {
      if (q.trim() === "") {
        const result = await userService.getContacts({ limit: 50 });
        return result.data;
      }

      const result = await userService.searchUsers({ q: q.trim(), limit: 20 });
      return result.data;
    } catch {
      return [];
    }
  }, []);

  const handleCreateGroup = useCallback(
    async (payload: CreateGroupPayload) => {
      try {
        const newGroup = await conversationService.createGroup({
          name: payload.name,
          type: payload.type,
          avatar_url: payload.avatar_url,
          description: payload.description,
          member_user_ids: payload.member_user_ids,
        });

        const listItem = mapCreatedConversationToListItem(newGroup);
        prependConversation(listItem);
        dispatchPageState({ type: "selectConversation", conversationId: listItem.id });
        closeChatActionPanel();
      } catch (error) {
        console.error("Failed to create group:", error);
      }
    },
    [prependConversation, closeChatActionPanel],
  );

  const handleConversationMessageUpdate = useCallback(
    (conversation: ConversationListItem, message: ChatMessage) => {
      const previewText =
        message.text || message.attachments?.[0]?.fileName || conversation.lastMessageText;
      const activityAt = message.timestamp;

      prependConversation({
        ...conversation,
        lastMessageId: message.id,
        lastMessageText: previewText,
        lastActivityAt: activityAt,
        updatedAt: activityAt,
        unreadCount: conversation.id === activeConversationId ? 0 : conversation.unreadCount,
      });
    },
    [activeConversationId, prependConversation],
  );

  return {
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
  };
}
