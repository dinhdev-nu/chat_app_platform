import { create } from "zustand";

import type { ConversationListItem } from "@/components/chat/conversation-data";
import type { MessageResponse, MessageReactionResponse } from "@/types/message";
import { mapConversationResponseToListItem } from "@/types/conversation";
import type {
  WsConversationCreatedEvent,
  WsMemberAddedEvent,
  WsMemberRemovedEvent,
  WsMessageDeletedEvent,
  WsMessageEditedEvent,
  WsMessageNewEvent,
  WsMessageReadEvent,
  WsPresenceEvent,
  WsReactionToggleEvent,
  WsTypingEvent,
  WsUserSummary,
} from "@/types/ws";

const TYPING_TTL_MS = 4000;

export interface ChatUserSummary {
  id: string;
  name: string;
  avatarUrl?: string | null;
}

interface MessageThread {
  ids: string[];
  byId: Record<string, MessageResponse>;
}

interface ReadReceipt {
  lastReadMsgId: string;
  readAt: string;
}

interface SetMessagesOptions {
  append?: boolean;
}

interface UpsertConversationOptions {
  moveToTop?: boolean;
}

interface ApplyNewMessageOptions {
  activeConversationId?: string | null;
  currentUserId?: string | null;
}

export interface ChatState {
  conversationIds: string[];
  conversationsById: Record<string, ConversationListItem>;
  messageThreadsByConvId: Record<string, MessageThread>;
  messageIdToConvId: Record<string, string>;
  usersById: Record<string, ChatUserSummary>;
  typingByConvId: Record<string, Record<string, number>>;
  presenceByUserId: Record<string, boolean>;
  presenceByConvId: Record<string, Record<string, boolean>>;
  readReceiptsByConvId: Record<string, Record<string, ReadReceipt>>;
  setConversations: (conversations: ConversationListItem[], options?: { append?: boolean }) => void;
  upsertConversation: (
    conversation: ConversationListItem,
    options?: UpsertConversationOptions,
  ) => void;
  patchConversation: (conversationId: string, patch: Partial<ConversationListItem>) => void;
  removeConversation: (conversationId: string) => void;
  setMessages: (
    conversationId: string,
    messages: MessageResponse[],
    options?: SetMessagesOptions,
  ) => void;
  upsertMessage: (conversationId: string, message: MessageResponse) => void;
  replaceMessage: (conversationId: string, targetMessageId: string, message: MessageResponse) => void;
  patchMessage: (
    conversationId: string,
    messageId: string,
    patch: Partial<MessageResponse>,
  ) => boolean;
  removeMessage: (conversationId: string, messageId: string) => void;
  getMessage: (conversationId: string, messageId: string) => MessageResponse | undefined;
  applyTyping: (event: WsTypingEvent) => void;
  pruneTyping: (now?: number) => void;
  applyPresence: (event: WsPresenceEvent) => void;
  applyIncomingMessage: (event: WsMessageNewEvent, options?: ApplyNewMessageOptions) => boolean;
  applyMessageRead: (event: WsMessageReadEvent, currentUserId?: string | null) => void;
  applyMessageEdited: (event: WsMessageEditedEvent) => boolean;
  applyMessageDeleted: (event: WsMessageDeletedEvent) => boolean;
  applyReactionToggle: (event: WsReactionToggleEvent) => boolean;
  applyConversationCreated: (event: WsConversationCreatedEvent) => void;
  applyMemberAdded: (event: WsMemberAddedEvent, currentUserId?: string | null) => boolean;
  applyMemberRemoved: (event: WsMemberRemovedEvent, currentUserId?: string | null) => boolean;
  reset: () => void;
}

function isSameId(left?: string | null, right?: string | null) {
  return Boolean(left && right && left === right);
}

function getConversationSortTime(conversation?: ConversationListItem) {
  const value = conversation?.lastActivityAt ?? conversation?.updatedAt ?? conversation?.createdAt;
  if (!value) return 0;

  const time = Date.parse(value);
  return Number.isFinite(time) ? time : 0;
}

function sortConversationIds(
  ids: string[],
  conversationsById: Record<string, ConversationListItem>,
) {
  return [...ids].sort(
    (left, right) =>
      getConversationSortTime(conversationsById[right]) -
      getConversationSortTime(conversationsById[left]),
  );
}

function getMessageSortValue(message?: MessageResponse) {
  if (!message) return 0;
  if (Number.isFinite(message.seq)) return message.seq;

  const time = Date.parse(message.created_at);
  return Number.isFinite(time) ? time : 0;
}

function sortMessageIds(ids: string[], messagesById: Record<string, MessageResponse>) {
  return [...ids].sort(
    (left, right) =>
      getMessageSortValue(messagesById[left]) - getMessageSortValue(messagesById[right]),
  );
}

function createEmptyThread(): MessageThread {
  return {
    ids: [],
    byId: {},
  };
}

function getMessagePreview(message: MessageResponse) {
  if (message.is_deleted) return "Tin nhắn đã bị xóa";
  if (message.content) return message.content;

  const firstAttachment = message.attachments?.[0];
  if (firstAttachment?.file_name) return firstAttachment.file_name;
  if (message.content_encrypted) return "Tin nhắn đã được mã hóa";

  return "";
}

function upsertUser(
  usersById: Record<string, ChatUserSummary>,
  user?: ChatUserSummary | WsUserSummary,
) {
  if (!user?.id) return usersById;

  const userKey = user.id;
  if (!userKey) return usersById;

  const existing = usersById[userKey];
  const nextUser: ChatUserSummary = {
    id: user.id,
    name: "name" in user ? user.name : existing?.name ?? "Ai đó",
    avatarUrl:
      "avatarUrl" in user
        ? user.avatarUrl
        : "avatar_url" in user
          ? user.avatar_url
          : existing?.avatarUrl,
  };

  return {
    ...usersById,
    [userKey]: {
      ...existing,
      ...nextUser,
    },
  };
}

function upsertMessageSender(
  usersById: Record<string, ChatUserSummary>,
  message: MessageResponse,
) {
  if (!message.sender_id || !message.sender_name) return usersById;

  return upsertUser(usersById, {
    id: message.sender_id,
    name: message.sender_name,
    avatarUrl: message.sender_avatar_url,
  });
}

function mergeConversation(
  current: ConversationListItem | undefined,
  next: ConversationListItem,
) {
  return current ? { ...current, ...next } : next;
}

const initialState = {
  conversationIds: [],
  conversationsById: {},
  messageThreadsByConvId: {},
  messageIdToConvId: {},
  usersById: {},
  typingByConvId: {},
  presenceByUserId: {},
  presenceByConvId: {},
  readReceiptsByConvId: {},
} satisfies Pick<
  ChatState,
  | "conversationIds"
  | "conversationsById"
  | "messageThreadsByConvId"
  | "messageIdToConvId"
  | "usersById"
  | "typingByConvId"
  | "presenceByUserId"
  | "presenceByConvId"
  | "readReceiptsByConvId"
>;

export const useChatStore = create<ChatState>()((set, get) => ({
  ...initialState,

  setConversations: (conversations, options = {}) =>
    set((state) => {
      const nextById = options.append ? { ...state.conversationsById } : {};
      const nextIds = options.append ? [...state.conversationIds] : [];

      for (const conversation of conversations) {
        const conversationKey = conversation.id;
        if (!conversationKey) continue;

        nextById[conversationKey] = mergeConversation(nextById[conversationKey], conversation);
        if (!nextIds.includes(conversationKey)) nextIds.push(conversationKey);
      }

      return {
        conversationsById: nextById,
        conversationIds: sortConversationIds(nextIds, nextById),
      };
    }),

  upsertConversation: (conversation, options = {}) =>
    set((state) => {
      const conversationKey = conversation.id;
      if (!conversationKey) return state;

      const conversationsById = {
        ...state.conversationsById,
        [conversationKey]: mergeConversation(state.conversationsById[conversationKey], conversation),
      };
      const ids = state.conversationIds.includes(conversationKey)
        ? [...state.conversationIds]
        : [conversationKey, ...state.conversationIds];

      return {
        conversationsById,
        conversationIds: options.moveToTop
          ? [conversationKey, ...ids.filter((id) => id !== conversationKey)]
          : sortConversationIds(ids, conversationsById),
      };
    }),

  patchConversation: (conversationId, patch) =>
    set((state) => {
      const conversationKey = conversationId;
      const current = state.conversationsById[conversationKey];
      if (!current) return state;

      const conversationsById = {
        ...state.conversationsById,
        [conversationKey]: {
          ...current,
          ...patch,
        },
      };

      return {
        conversationsById,
        conversationIds: sortConversationIds(state.conversationIds, conversationsById),
      };
    }),

  removeConversation: (conversationId) =>
    set((state) => {
      const conversationKey = conversationId;
      if (!state.conversationsById[conversationKey]) return state;

      const conversationsById = { ...state.conversationsById };
      const messageThreadsByConvId = { ...state.messageThreadsByConvId };
      const typingByConvId = { ...state.typingByConvId };
      const presenceByConvId = { ...state.presenceByConvId };
      const readReceiptsByConvId = { ...state.readReceiptsByConvId };
      const messageIdToConvId = { ...state.messageIdToConvId };
      const removedThread = messageThreadsByConvId[conversationKey];

      delete conversationsById[conversationKey];
      delete messageThreadsByConvId[conversationKey];
      delete typingByConvId[conversationKey];
      delete presenceByConvId[conversationKey];
      delete readReceiptsByConvId[conversationKey];

      for (const messageId of removedThread?.ids ?? []) {
        delete messageIdToConvId[messageId];
      }

      return {
        conversationsById,
        conversationIds: state.conversationIds.filter((id) => id !== conversationKey),
        messageThreadsByConvId,
        messageIdToConvId,
        typingByConvId,
        presenceByConvId,
        readReceiptsByConvId,
      };
    }),

  setMessages: (conversationId, messages, options = {}) =>
    set((state) => {
      const conversationKey = conversationId;
      if (!conversationKey) return state;

      const currentThread = options.append
        ? state.messageThreadsByConvId[conversationKey] ?? createEmptyThread()
        : createEmptyThread();
      const byId = { ...currentThread.byId };
      const ids = [...currentThread.ids];
      const messageIdToConvId = { ...state.messageIdToConvId };
      let usersById = state.usersById;

      for (const message of messages) {
        const messageKey = message.id;
        if (!messageKey) continue;

        byId[messageKey] = message;
        if (!ids.includes(messageKey)) ids.push(messageKey);
        messageIdToConvId[messageKey] = conversationKey;
        usersById = upsertMessageSender(usersById, message);
      }

      const thread = {
        byId,
        ids: sortMessageIds(ids, byId),
      };

      return {
        messageThreadsByConvId: {
          ...state.messageThreadsByConvId,
          [conversationKey]: thread,
        },
        messageIdToConvId,
        usersById,
      };
    }),

  upsertMessage: (conversationId, message) =>
    set((state) => {
      const conversationKey = conversationId;
      const messageKey = message.id;
      if (!conversationKey || !messageKey) return state;

      const currentThread = state.messageThreadsByConvId[conversationKey] ?? createEmptyThread();
      const byId = {
        ...currentThread.byId,
        [messageKey]: message,
      };
      const ids = currentThread.ids.includes(messageKey)
        ? [...currentThread.ids]
        : [...currentThread.ids, messageKey];

      return {
        messageThreadsByConvId: {
          ...state.messageThreadsByConvId,
          [conversationKey]: {
            byId,
            ids: sortMessageIds(ids, byId),
          },
        },
        messageIdToConvId: {
          ...state.messageIdToConvId,
          [messageKey]: conversationKey,
        },
        usersById: upsertMessageSender(state.usersById, message),
      };
    }),

  replaceMessage: (conversationId, targetMessageId, message) =>
    set((state) => {
      const conversationKey = conversationId;
      const targetKey = targetMessageId;
      const messageKey = message.id;
      if (!conversationKey || !targetKey || !messageKey) return state;

      const currentThread = state.messageThreadsByConvId[conversationKey] ?? createEmptyThread();
      const byId = { ...currentThread.byId };
      const messageIdToConvId = { ...state.messageIdToConvId };

      if (targetKey !== messageKey) {
        delete byId[targetKey];
        delete messageIdToConvId[targetKey];
      }

      byId[messageKey] = message;

      const ids = currentThread.ids
        .filter((id) => id !== targetKey && id !== messageKey)
        .concat(messageKey);

      return {
        messageThreadsByConvId: {
          ...state.messageThreadsByConvId,
          [conversationKey]: {
            byId,
            ids: sortMessageIds(ids, byId),
          },
        },
        messageIdToConvId: {
          ...messageIdToConvId,
          [messageKey]: conversationKey,
        },
        usersById: upsertMessageSender(state.usersById, message),
      };
    }),

  patchMessage: (conversationId, messageId, patch) => {
    let didPatch = false;

    set((state) => {
      const conversationKey = conversationId;
      const messageKey = messageId;
      const currentThread = state.messageThreadsByConvId[conversationKey];
      const currentMessage = currentThread?.byId[messageKey];

      if (!currentThread || !currentMessage) return state;

      didPatch = true;
      const byId = {
        ...currentThread.byId,
        [messageKey]: {
          ...currentMessage,
          ...patch,
        },
      };

      return {
        messageThreadsByConvId: {
          ...state.messageThreadsByConvId,
          [conversationKey]: {
            byId,
            ids: sortMessageIds(currentThread.ids, byId),
          },
        },
      };
    });

    return didPatch;
  },

  removeMessage: (conversationId, messageId) =>
    set((state) => {
      const conversationKey = conversationId;
      const messageKey = messageId;
      const currentThread = state.messageThreadsByConvId[conversationKey];
      if (!currentThread?.byId[messageKey]) return state;

      const byId = { ...currentThread.byId };
      const messageIdToConvId = { ...state.messageIdToConvId };

      delete byId[messageKey];
      delete messageIdToConvId[messageKey];

      return {
        messageThreadsByConvId: {
          ...state.messageThreadsByConvId,
          [conversationKey]: {
            byId,
            ids: currentThread.ids.filter((id) => id !== messageKey),
          },
        },
        messageIdToConvId,
      };
    }),

  getMessage: (conversationId, messageId) => {
    const conversationKey = conversationId;
    const messageKey = messageId;

    return get().messageThreadsByConvId[conversationKey]?.byId[messageKey];
  },

  applyTyping: (event) =>
    set((state) => {
      const conversationKey = event.conv_id;
      const userKey = event.user_id;
      if (!conversationKey || !userKey) return state;

      return {
        typingByConvId: {
          ...state.typingByConvId,
          [conversationKey]: {
            ...state.typingByConvId[conversationKey],
            [userKey]: Date.now() + TYPING_TTL_MS,
          },
        },
        usersById: state.usersById[userKey]
          ? state.usersById
          : {
              ...state.usersById,
              [userKey]: {
                id: event.user_id,
                name: "Ai đó",
              },
            },
      };
    }),

  pruneTyping: (now = Date.now()) =>
    set((state) => {
      let changed = false;
      const typingByConvId: ChatState["typingByConvId"] = {};

      for (const [conversationKey, users] of Object.entries(state.typingByConvId)) {
        const activeUsers = Object.fromEntries(
          Object.entries(users).filter(([, expiresAt]) => expiresAt > now),
        );

        if (Object.keys(activeUsers).length > 0) {
          typingByConvId[conversationKey] = activeUsers;
        }

        if (Object.keys(activeUsers).length !== Object.keys(users).length) changed = true;
      }

      return changed ? { typingByConvId } : state;
    }),

  applyPresence: (event) =>
    set((state) => {
      const userKey = event.user_id;
      if (!userKey) return state;

      const presenceByUserId = {
        ...state.presenceByUserId,
        [userKey]: event.is_online,
      };
      const conversationKey = event.conv_id;

      if (!conversationKey || !state.conversationsById[conversationKey]) {
        return { presenceByUserId };
      }

      const conversation = state.conversationsById[conversationKey];
      const currentConvPresence = state.presenceByConvId[conversationKey] ?? {};
      const previousUserPresence = currentConvPresence[userKey];
      const presenceByConvId = {
        ...state.presenceByConvId,
        [conversationKey]: {
          ...currentConvPresence,
          [userKey]: event.is_online,
        },
      };
      let memberOnlineCount = conversation.memberOnlineCount;

      if (conversation.type === 1) {
        memberOnlineCount = event.is_online ? 1 : 0;
      } else if (previousUserPresence !== event.is_online) {
        memberOnlineCount = Math.max(
          0,
          conversation.memberOnlineCount + (event.is_online ? 1 : -1),
        );
      }

      const isOnline =
        conversation.type === 1 ? event.is_online : memberOnlineCount > 0;
      const conversationsById = {
        ...state.conversationsById,
        [conversationKey]: {
          ...conversation,
          memberOnlineCount,
          isOnline,
        },
      };

      return { presenceByUserId, presenceByConvId, conversationsById };
    }),

  applyIncomingMessage: (event, options = {}) => {
    let didInsert = false;

    set((state) => {
      const conversationKey = event.conv_id;
      const messageKey = event.message.id;
      if (!conversationKey || !messageKey) return state;

      const currentThread = state.messageThreadsByConvId[conversationKey] ?? createEmptyThread();
      const alreadyExists = Boolean(currentThread.byId[messageKey]);
      didInsert = !alreadyExists;

      const byId = {
        ...currentThread.byId,
        [messageKey]: event.message,
      };
      const ids = currentThread.ids.includes(messageKey)
        ? [...currentThread.ids]
        : [...currentThread.ids, messageKey];
      const messageIdToConvId = {
        ...state.messageIdToConvId,
        [messageKey]: conversationKey,
      };
      let conversationsById = state.conversationsById;
      let conversationIds = state.conversationIds;
      const conversation = state.conversationsById[conversationKey];

      if (conversation) {
        const isActiveConversation = isSameId(options.activeConversationId, event.conv_id);
        const isOwnMessage = isSameId(options.currentUserId, event.sender_id);
        const shouldIncrementUnread = didInsert && !isActiveConversation && !isOwnMessage;
        const previewText = getMessagePreview(event.message) || conversation.lastMessageText;

        conversationsById = {
          ...state.conversationsById,
          [conversationKey]: {
            ...conversation,
            lastMessageId: event.message.id,
            lastMessageText: previewText,
            lastActivityAt: event.message.created_at,
            updatedAt: event.message.updated_at,
            unreadCount: isActiveConversation
              ? 0
              : shouldIncrementUnread
                ? conversation.unreadCount + 1
                : conversation.unreadCount,
          },
        };
        conversationIds = [conversationKey, ...state.conversationIds.filter((id) => id !== conversationKey)];
      }

      return {
        messageThreadsByConvId: {
          ...state.messageThreadsByConvId,
          [conversationKey]: {
            byId,
            ids: sortMessageIds(ids, byId),
          },
        },
        messageIdToConvId,
        usersById: upsertMessageSender(state.usersById, event.message),
        conversationsById,
        conversationIds,
      };
    });

    return didInsert;
  },

  applyMessageRead: (event, currentUserId) =>
    set((state) => {
      const conversationKey = event.conv_id;
      const userKey = event.user_id;
      if (!conversationKey || !userKey) return state;

      const readReceiptsByConvId = {
        ...state.readReceiptsByConvId,
        [conversationKey]: {
          ...state.readReceiptsByConvId[conversationKey],
          [userKey]: {
            lastReadMsgId: event.last_read_msg_id,
            readAt: event.read_at,
          },
        },
      };

      if (!isSameId(event.user_id, currentUserId)) {
        return { readReceiptsByConvId };
      }

      const conversation = state.conversationsById[conversationKey];
      if (!conversation) return { readReceiptsByConvId };

      return {
        readReceiptsByConvId,
        conversationsById: {
          ...state.conversationsById,
          [conversationKey]: {
            ...conversation,
            unreadCount: 0,
          },
        },
      };
    }),

  applyMessageEdited: (event) => {
    const nextMessage = event.message;

    if (nextMessage) {
      get().replaceMessage(event.conv_id, event.msg_id, nextMessage);
    } else {
      get().patchMessage(event.conv_id, event.msg_id, {
        content: event.content,
        is_edited: true,
        updated_at: event.edited_at,
      });
    }

    const currentMessage = get().getMessage(event.conv_id, nextMessage?.id ?? event.msg_id);
    const conversationKey = event.conv_id;
    const conversation = get().conversationsById[conversationKey];

    if (conversation) {
      get().patchConversation(event.conv_id, {
        lastMessageText: currentMessage ? getMessagePreview(currentMessage) : event.content,
        updatedAt: currentMessage?.updated_at ?? event.edited_at,
      });
    }

    return Boolean(currentMessage);
  },

  applyMessageDeleted: (event) => {
    const didPatch = get().patchMessage(event.conv_id, event.msg_id, {
      is_deleted: true,
      deleted_at: event.deleted_at,
      updated_at: event.deleted_at,
    });

    const conversationKey = event.conv_id;
    const conversation = get().conversationsById[conversationKey];

    if (conversation) {
      get().patchConversation(event.conv_id, {
        lastMessageText: "Tin nhắn đã bị xóa",
        updatedAt: event.deleted_at,
      });
    }

    return didPatch;
  },

  applyReactionToggle: (event) => {
    let didPatch = false;

    set((state) => {
      const conversationKey = event.conv_id;
      const messageKey = event.msg_id;
      const currentThread = state.messageThreadsByConvId[conversationKey];
      const currentMessage = currentThread?.byId[messageKey];

      if (!currentThread || !currentMessage) return state;

      didPatch = true;
      const reactions = currentMessage.reactions ?? [];
      const nextReactions =
        event.action === "added"
          ? reactions.some(
              (reaction) =>
                isSameId(reaction.user_id, event.user_id) && reaction.emoji === event.emoji,
            )
            ? reactions
            : [
                ...reactions,
                {
                  id: 0,
                  message_id: event.msg_id,
                  user_id: event.user_id,
                  emoji: event.emoji,
                  created_at: new Date().toISOString(),
                } satisfies MessageReactionResponse,
              ]
          : reactions.filter(
              (reaction) =>
                !(isSameId(reaction.user_id, event.user_id) && reaction.emoji === event.emoji),
            );

      return {
        messageThreadsByConvId: {
          ...state.messageThreadsByConvId,
          [conversationKey]: {
            ...currentThread,
            byId: {
              ...currentThread.byId,
              [messageKey]: {
                ...currentMessage,
                reactions: nextReactions,
              },
            },
          },
        },
      };
    });

    return didPatch;
  },

  applyConversationCreated: (event) => {
    get().upsertConversation(mapConversationResponseToListItem(event.conversation), {
      moveToTop: true,
    });
  },

  applyMemberAdded: (event, currentUserId) => {
    if (event.user) {
      set((state) => ({
        usersById: upsertUser(state.usersById, event.user),
      }));
    }

    if (event.actor) {
      set((state) => ({
        usersById: upsertUser(state.usersById, event.actor),
      }));
    }

    const isCurrentUser = isSameId(event.user_id, currentUserId);

    if (isCurrentUser && event.conversation) {
      get().upsertConversation(mapConversationResponseToListItem(event.conversation), {
        moveToTop: true,
      });
      return true;
    }

    return isCurrentUser;
  },

  applyMemberRemoved: (event, currentUserId) => {
    if (event.user) {
      set((state) => ({
        usersById: upsertUser(state.usersById, event.user),
      }));
    }

    if (event.actor) {
      set((state) => ({
        usersById: upsertUser(state.usersById, event.actor),
      }));
    }

    const isCurrentUser = isSameId(event.user_id, currentUserId);
    if (isCurrentUser) get().removeConversation(event.conv_id);

    return isCurrentUser;
  },

  reset: () => set(initialState),
}));

export function selectConversationList(state: ChatState) {
  return state.conversationIds
    .map((id) => state.conversationsById[id])
    .filter(Boolean);
}

export function selectMessagesForConversation(state: ChatState, conversationId?: string) {
  const conversationKey = conversationId;
  if (!conversationKey) return [];

  const thread = state.messageThreadsByConvId[conversationKey];
  if (!thread) return [];

  return thread.ids.map((id) => thread.byId[id]).filter(Boolean);
}

export function selectTypingUsersForConversation(
  state: ChatState,
  conversationId?: string,
  currentUserId?: string | null,
) {
  const conversationKey = conversationId;
  if (!conversationKey) return [];

  const currentUserKey = currentUserId;
  const typingUsers = state.typingByConvId[conversationKey] ?? {};
  const now = Date.now();

  return Object.entries(typingUsers)
    .filter(([userId, expiresAt]) => expiresAt > now && userId !== currentUserKey)
    .map(([userId]) => state.usersById[userId] ?? { id: userId, name: "Ai đó" });
}
