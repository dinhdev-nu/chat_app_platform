"use client";

import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import { useShallow } from "zustand/react/shallow";

import type { ChatTypingUser } from "@/components/chat/ChatActiveState";
import { useActiveConversationRealtime } from "@/hooks/use-active-conversation-realtime";
import { getApiErrorMessage } from "@/services/http";
import { messageService } from "@/services/messageService";
import {
  selectMessagesForConversation,
  selectTypingUsersForConversation,
  useChatStore,
} from "@/stores/chatStore";
import type { PaginationMeta } from "@/types/api";
import type { AuthUser } from "@/types/user";
import {
  MESSAGE_TYPE,
  mapMessageResponseToChatMessage,
} from "@/types/message";
import type { MessageResponse } from "@/types/message";
import type { WsReactionToggleEvent } from "@/types/ws";

const DEFAULT_PAGE_LIMIT = 20;

interface LoadPageOptions {
  cursor?: string;
  append?: boolean;
  silent?: boolean;
}

interface SendMessageOptions {
  conversationId?: string;
}

interface UseConversationMessagesOptions {
  conversationId?: string;
  currentUser?: AuthUser | null;
  enabled?: boolean;
  limit?: number;
}

interface MessageLoadState {
  pagination: PaginationMeta | null;
  isLoading: boolean;
  isLoadingMore: boolean;
  isSending: boolean;
  error: string | null;
  actionError: string | null;
}

type MessageLoadAction =
  | { type: "setPagination"; value: PaginationMeta | null }
  | { type: "setLoading"; value: boolean }
  | { type: "setLoadingMore"; value: boolean }
  | { type: "setSending"; value: boolean }
  | { type: "setError"; value: string | null }
  | { type: "setActionError"; value: string | null }
  | { type: "resetInactive" };

const initialMessageLoadState: MessageLoadState = {
  pagination: null,
  isLoading: false,
  isLoadingMore: false,
  isSending: false,
  error: null,
  actionError: null,
};

function messageLoadReducer(
  state: MessageLoadState,
  action: MessageLoadAction,
): MessageLoadState {
  switch (action.type) {
    case "setPagination":
      return { ...state, pagination: action.value };
    case "setLoading":
      return { ...state, isLoading: action.value };
    case "setLoadingMore":
      return { ...state, isLoadingMore: action.value };
    case "setSending":
      return { ...state, isSending: action.value };
    case "setError":
      return { ...state, error: action.value };
    case "setActionError":
      return { ...state, actionError: action.value };
    case "resetInactive":
      return {
        ...state,
        pagination: null,
        isLoading: false,
        isLoadingMore: false,
        error: null,
        actionError: null,
      };
  }
}

function isSameUser(left?: string | null, right?: string | null) {
  return Boolean(left && right && left === right);
}

function createOptimisticTextMessage(
  conversationId: string,
  text: string,
  currentUser?: AuthUser | null,
): MessageResponse {
  const now = new Date().toISOString();

  return {
    id: `local_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    conversation_id: conversationId,
    sender_id: currentUser?.id ?? "current-user",
    type: MESSAGE_TYPE.text,
    content: text,
    content_encrypted: false,
    seq: Date.now(),
    is_edited: false,
    is_deleted: false,
    created_at: now,
    updated_at: now,
    sender_name: currentUser?.name ?? "",
    sender_avatar_url: currentUser?.avatarUrl,
    attachments: [],
    reactions: [],
  };
}

function getOptimisticReactionAction(
  message: MessageResponse | undefined,
  currentUserId: string | undefined,
  emoji: string,
): WsReactionToggleEvent["action"] {
  const alreadyReacted = message?.reactions?.some(
    (reaction) => reaction.emoji === emoji && isSameUser(reaction.user_id, currentUserId),
  );

  return alreadyReacted ? "removed" : "added";
}

export function useConversationMessages({
  conversationId,
  currentUser,
  enabled = true,
  limit = DEFAULT_PAGE_LIMIT,
}: UseConversationMessagesOptions = {}) {
  const rawMessages = useChatStore(
    useShallow((state) => selectMessagesForConversation(state, conversationId)),
  );
  const typingUsers = useChatStore(
    useShallow((state) =>
      selectTypingUsersForConversation(state, conversationId, currentUser?.id),
    ),
  );
  const setStoreMessages = useChatStore((state) => state.setMessages);
  const upsertStoreMessage = useChatStore((state) => state.upsertMessage);
  const replaceStoreMessage = useChatStore((state) => state.replaceMessage);
  const patchStoreMessage = useChatStore((state) => state.patchMessage);
  const removeStoreMessage = useChatStore((state) => state.removeMessage);
  const getStoreMessage = useChatStore((state) => state.getMessage);
  const applyMessageEdited = useChatStore((state) => state.applyMessageEdited);
  const applyMessageDeleted = useChatStore((state) => state.applyMessageDeleted);
  const applyReactionToggle = useChatStore((state) => state.applyReactionToggle);
  const currentUserId = currentUser?.id;

  const [loadState, dispatchLoadState] = useReducer(
    messageLoadReducer,
    initialMessageLoadState,
  );
  const {
    pagination,
    isLoading,
    isLoadingMore,
    isSending,
    error,
    actionError,
  } = loadState;
  const isMountedRef = useRef(true);
  const latestRequestIdRef = useRef(0);
  const rawMessagesRef = useRef<MessageResponse[]>([]);

  const mappingOptions = useMemo(
    () => ({
      currentUserId,
      currentUserName: currentUser?.name,
      currentUserAvatarUrl: currentUser?.avatarUrl,
    }),
    [currentUser?.avatarUrl, currentUser?.name, currentUserId],
  );

  const messages = useMemo(
    () => rawMessages.map((message) => mapMessageResponseToChatMessage(message, mappingOptions)),
    [mappingOptions, rawMessages],
  );

  const latestReadMessageId = useMemo(() => {
    const latestMessage = rawMessages.at(-1);
    return latestMessage?.id ?? null;
  }, [rawMessages]);

  const sendTyping = useActiveConversationRealtime({
    conversationId,
    enabled: enabled && Boolean(conversationId),
    latestReadMessageId,
  });

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    rawMessagesRef.current = rawMessages;
  }, [rawMessages]);

  const loadMessages = useCallback(
    ({ cursor, append = false, silent = false }: LoadPageOptions = {}) => {
      if (!enabled || !conversationId) return;

      const requestId = ++latestRequestIdRef.current;

      if (!silent) {
        dispatchLoadState({
          type: append ? "setLoadingMore" : "setLoading",
          value: true,
        });
      }
      dispatchLoadState({ type: "setError", value: null });

      if (!isMountedRef.current || requestId !== latestRequestIdRef.current) return;

      return messageService
        .listMessages(conversationId, { cursor, limit })
        .then((result) => {
          const orderedMessages = result.data.slice().reverse();
          if (!isMountedRef.current || requestId !== latestRequestIdRef.current) return;
          setStoreMessages(conversationId, orderedMessages, { append });
          dispatchLoadState({ type: "setPagination", value: result.pagination });
        })
        .catch((err) => {
          if (!isMountedRef.current || requestId !== latestRequestIdRef.current) return;
          dispatchLoadState({ type: "setError", value: getApiErrorMessage(err) });
        })
        .finally(() => {
          if (isMountedRef.current && requestId === latestRequestIdRef.current && !silent) {
            dispatchLoadState({
              type: append ? "setLoadingMore" : "setLoading",
              value: false,
            });
          }
        });
    },
    [conversationId, enabled, limit, setStoreMessages],
  );

  useEffect(() => {
    latestRequestIdRef.current += 1;

    if (!enabled || !conversationId) {
      const timeoutId = window.setTimeout(() => {
        dispatchLoadState({ type: "resetInactive" });
      }, 0);

      return () => window.clearTimeout(timeoutId);
    }

    const timeoutId = window.setTimeout(() => {
      void loadMessages();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [conversationId, enabled, loadMessages]);

  const loadMore = useCallback(() => {
    if (!pagination?.hasNext || !pagination.nextCursor || isLoadingMore) return;

    return loadMessages({ cursor: pagination.nextCursor, append: true });
  }, [isLoadingMore, loadMessages, pagination]);

  const sendMessage = useCallback(
    async (text: string, options: SendMessageOptions = {}) => {
      const trimmedText = text.trim();
      const targetConversationId = options.conversationId ?? conversationId;

      if (!trimmedText || !targetConversationId) return undefined;

      const optimisticMessage = createOptimisticTextMessage(
        targetConversationId,
        trimmedText,
        currentUser,
      );

      dispatchLoadState({ type: "setSending", value: true });
      dispatchLoadState({ type: "setActionError", value: null });
      upsertStoreMessage(targetConversationId, optimisticMessage);

      try {
        const response = await messageService.sendMessage(targetConversationId, {
          type: MESSAGE_TYPE.text,
          content: trimmedText,
        });

        if (!isMountedRef.current) {
          return mapMessageResponseToChatMessage(response, mappingOptions);
        }

        replaceStoreMessage(targetConversationId, optimisticMessage.id, response);

        return mapMessageResponseToChatMessage(response, mappingOptions);
      } catch (err) {
        if (isMountedRef.current) {
          removeStoreMessage(targetConversationId, optimisticMessage.id);
          dispatchLoadState({ type: "setActionError", value: getApiErrorMessage(err) });
        }

        throw err;
      } finally {
        if (isMountedRef.current) {
          dispatchLoadState({ type: "setSending", value: false });
        }
      }
    },
    [
      conversationId,
      currentUser,
      mappingOptions,
      removeStoreMessage,
      replaceStoreMessage,
      upsertStoreMessage,
    ],
  );

  const editMessage = useCallback(
    async (messageId: string, text: string) => {
      const trimmedText = text.trim();
      if (!trimmedText || !conversationId) return undefined;

      const snapshot = rawMessagesRef.current;
      const editedAt = new Date().toISOString();

      dispatchLoadState({ type: "setActionError", value: null });
      patchStoreMessage(conversationId, messageId, {
        content: trimmedText,
        is_edited: true,
        updated_at: editedAt,
      });

      try {
        const response = await messageService.editMessage(messageId, trimmedText);

        if (isMountedRef.current) {
          applyMessageEdited({
            event: "message.edited",
            conv_id: conversationId,
            msg_id: messageId,
            content: response.content ?? trimmedText,
            edited_at: response.updated_at,
            message: response,
          });
        }

        return mapMessageResponseToChatMessage(response, mappingOptions);
      } catch (err) {
        if (isMountedRef.current) {
          setStoreMessages(conversationId, snapshot);
          dispatchLoadState({ type: "setActionError", value: getApiErrorMessage(err) });
        }

        throw err;
      }
    },
    [applyMessageEdited, conversationId, mappingOptions, patchStoreMessage, setStoreMessages],
  );

  const deleteMessage = useCallback(
    async (messageId: string) => {
      if (!conversationId) return;

      const snapshot = rawMessagesRef.current;

      dispatchLoadState({ type: "setActionError", value: null });
      removeStoreMessage(conversationId, messageId);

      try {
        await messageService.deleteMessage(messageId);

        if (isMountedRef.current) {
          applyMessageDeleted({
            event: "message.deleted",
            conv_id: conversationId,
            msg_id: messageId,
            is_deleted: true,
            deleted_at: new Date().toISOString(),
          });
        }
      } catch (err) {
        if (isMountedRef.current) {
          setStoreMessages(conversationId, snapshot);
          dispatchLoadState({ type: "setActionError", value: getApiErrorMessage(err) });
        }

        throw err;
      }
    },
    [applyMessageDeleted, conversationId, removeStoreMessage, setStoreMessages],
  );

  const toggleReaction = useCallback(
    async (messageId: string, emoji: string) => {
      if (!conversationId || !currentUserId) return;

      const snapshot = rawMessagesRef.current;
      const currentMessage = getStoreMessage(conversationId, messageId);
      const optimisticAction = getOptimisticReactionAction(currentMessage, currentUserId, emoji);

      dispatchLoadState({ type: "setActionError", value: null });
      applyReactionToggle({
        event: "reaction.toggle",
        conv_id: conversationId,
        msg_id: messageId,
        user_id: currentUserId,
        emoji,
        action: optimisticAction,
      });

      try {
        const response = await messageService.toggleReaction(messageId, emoji);

        if (isMountedRef.current) {
          applyReactionToggle({
            event: "reaction.toggle",
            conv_id: conversationId,
            msg_id: messageId,
            user_id: currentUserId,
            emoji,
            action: response.action,
          });
        }
      } catch (err) {
        if (isMountedRef.current) {
          setStoreMessages(conversationId, snapshot);
          dispatchLoadState({ type: "setActionError", value: getApiErrorMessage(err) });
        }

        throw err;
      }
    },
    [
      applyReactionToggle,
      conversationId,
      currentUserId,
      getStoreMessage,
      setStoreMessages,
    ],
  );

  return {
    messages: enabled ? messages : [],
    typingUsers: enabled ? (typingUsers as ChatTypingUser[]) : [],
    pagination,
    isLoading,
    isLoadingMore,
    isSending,
    error,
    actionError,
    loadMessages,
    loadMore,
    sendMessage,
    editMessage,
    deleteMessage,
    toggleReaction,
    sendTyping,
    clearActionError: () => dispatchLoadState({ type: "setActionError", value: null }),
  };
}
