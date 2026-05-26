"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { ChatMessage } from "@/components/chat/chat-message-types";
import { getApiErrorMessage } from "@/services/http";
import { messageService } from "@/services/messageService";
import type { PaginationMeta } from "@/types/api";
import type { AuthUser } from "@/types/user";
import { MESSAGE_TYPE, mapMessageResponseToChatMessage } from "@/types/message";

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

function mergeMessages(nextMessages: ChatMessage[], currentMessages: ChatMessage[]) {
  const seenIds = new Set<string>();
  const merged: ChatMessage[] = [];

  for (const message of [...nextMessages, ...currentMessages]) {
    if (seenIds.has(message.id)) continue;

    seenIds.add(message.id);
    merged.push(message);
  }

  return merged;
}

function replaceOrAppendMessage(messages: ChatMessage[], targetId: string, nextMessage: ChatMessage) {
  let didReplace = false;
  const nextMessages = messages.map((message) => {
    if (message.id !== targetId) return message;

    didReplace = true;
    return nextMessage;
  });

  return didReplace ? nextMessages : [...nextMessages, nextMessage];
}

function createOptimisticTextMessage(text: string, currentUser?: AuthUser | null): ChatMessage {
  return {
    id: `local_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    text,
    senderId: currentUser?.id ?? "current-user",
    senderName: currentUser?.name,
    senderAvatar: currentUser?.avatarUrl,
    timestamp: new Date().toISOString(),
    isOwn: true,
    messageType: MESSAGE_TYPE.text,
  };
}

function setOwnReactionState(
  messages: ChatMessage[],
  messageId: string,
  emoji: string,
  shouldReact: boolean,
) {
  return messages.map((message) => {
    if (message.id !== messageId) return message;

    const reactions = message.reactions ?? [];
    const existingReaction = reactions.find((reaction) => reaction.emoji === emoji);

    if (shouldReact) {
      if (!existingReaction) {
        return {
          ...message,
          reactions: [...reactions, { emoji, count: 1, reactedByMe: true }],
        };
      }

      if (existingReaction.reactedByMe) return message;

      return {
        ...message,
        reactions: reactions.map((reaction) =>
          reaction.emoji === emoji
            ? { ...reaction, count: reaction.count + 1, reactedByMe: true }
            : reaction,
        ),
      };
    }

    if (!existingReaction || !existingReaction.reactedByMe) return message;

    const nextCount = existingReaction.count - 1;

    return {
      ...message,
      reactions: reactions
        .map((reaction) =>
          reaction.emoji === emoji
            ? { ...reaction, count: nextCount, reactedByMe: false }
            : reaction,
        )
        .filter((reaction) => reaction.count > 0),
    };
  });
}

function toggleOwnReaction(messages: ChatMessage[], messageId: string, emoji: string) {
  const message = messages.find((item) => item.id === messageId);
  const existingReaction = message?.reactions?.find((reaction) => reaction.emoji === emoji);

  return setOwnReactionState(messages, messageId, emoji, !existingReaction?.reactedByMe);
}

export function useConversationMessages({
  conversationId,
  currentUser,
  enabled = true,
  limit = DEFAULT_PAGE_LIMIT,
}: UseConversationMessagesOptions = {}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const isMountedRef = useRef(true);
  const latestRequestIdRef = useRef(0);
  const messagesRef = useRef<ChatMessage[]>([]);
  const lastReadMarkerRef = useRef<string | null>(null);

  const mappingOptions = useMemo(
    () => ({
      currentUserId: currentUser?.id,
      currentUserName: currentUser?.name,
      currentUserAvatarUrl: currentUser?.avatarUrl,
    }),
    [currentUser?.avatarUrl, currentUser?.id, currentUser?.name],
  );

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const loadMessages = useCallback(
    async ({ cursor, append = false, silent = false }: LoadPageOptions = {}) => {
      if (!enabled || !conversationId) return;

      const requestId = ++latestRequestIdRef.current;

      if (!silent) {
        if (append) setIsLoadingMore(true);
        else setIsLoading(true);
      }
      setError(null);

      try {
        const result = await messageService.listMessages(conversationId, { cursor, limit });
        const mappedMessages = result.data
          .map((message) => mapMessageResponseToChatMessage(message, mappingOptions))
          .reverse();

        if (!isMountedRef.current || requestId !== latestRequestIdRef.current) return;

        setMessages((currentMessages) =>
          append ? mergeMessages(mappedMessages, currentMessages) : mappedMessages,
        );
        setPagination(result.pagination);
      } catch (err) {
        if (!isMountedRef.current || requestId !== latestRequestIdRef.current) return;
        setError(getApiErrorMessage(err));
      } finally {
        if (isMountedRef.current && requestId === latestRequestIdRef.current && !silent) {
          if (append) setIsLoadingMore(false);
          else setIsLoading(false);
        }
      }
    },
    [conversationId, enabled, limit, mappingOptions],
  );

  useEffect(() => {
    latestRequestIdRef.current += 1;
    lastReadMarkerRef.current = null;

    if (!enabled || !conversationId) {
      setMessages([]);
      setPagination(null);
      setError(null);
      setActionError(null);
      setIsLoading(false);
      setIsLoadingMore(false);
      return;
    }

    void loadMessages();
  }, [conversationId, enabled, loadMessages]);

  useEffect(() => {
    if (!enabled || !conversationId || messages.length === 0) return;

    const latestMessage = messages[messages.length - 1];
    if (!latestMessage || latestMessage.id.startsWith("local_")) return;

    const readMarker = `${conversationId}:${latestMessage.id}`;
    if (lastReadMarkerRef.current === readMarker) return;

    lastReadMarkerRef.current = readMarker;
    void messageService.markAsRead(conversationId, latestMessage.id).catch(() => undefined);
  }, [conversationId, enabled, messages]);

  const loadMore = useCallback(async () => {
    if (!pagination?.hasNext || !pagination.nextCursor || isLoadingMore) return;

    await loadMessages({ cursor: pagination.nextCursor, append: true });
  }, [isLoadingMore, loadMessages, pagination]);

  const sendMessage = useCallback(
    async (text: string, options: SendMessageOptions = {}) => {
      const trimmedText = text.trim();
      const targetConversationId = options.conversationId ?? conversationId;

      if (!trimmedText || !targetConversationId) return undefined;

      const optimisticMessage = createOptimisticTextMessage(trimmedText, currentUser);

      setIsSending(true);
      setActionError(null);
      setMessages((currentMessages) => [...currentMessages, optimisticMessage]);

      try {
        const response = await messageService.sendMessage(targetConversationId, {
          type: MESSAGE_TYPE.text,
          content: trimmedText,
        });
        const sentMessage = mapMessageResponseToChatMessage(response, mappingOptions);

        if (!isMountedRef.current) return sentMessage;

        setMessages((currentMessages) =>
          replaceOrAppendMessage(currentMessages, optimisticMessage.id, sentMessage),
        );

        return sentMessage;
      } catch (err) {
        if (isMountedRef.current) {
          setMessages((currentMessages) =>
            currentMessages.filter((message) => message.id !== optimisticMessage.id),
          );
          setActionError(getApiErrorMessage(err));
        }

        throw err;
      } finally {
        if (isMountedRef.current) setIsSending(false);
      }
    },
    [conversationId, currentUser, mappingOptions],
  );

  const editMessage = useCallback(
    async (messageId: string, text: string) => {
      const trimmedText = text.trim();
      if (!trimmedText) return undefined;

      const snapshot = messagesRef.current;
      setActionError(null);
      setMessages((currentMessages) =>
        currentMessages.map((message) =>
          message.id === messageId
            ? { ...message, text: trimmedText, editedAt: new Date().toISOString() }
            : message,
        ),
      );

      try {
        const response = await messageService.editMessage(messageId, trimmedText);
        const editedMessage = mapMessageResponseToChatMessage(response, mappingOptions);

        if (isMountedRef.current) {
          setMessages((currentMessages) =>
            replaceOrAppendMessage(currentMessages, messageId, editedMessage),
          );
        }

        return editedMessage;
      } catch (err) {
        if (isMountedRef.current) {
          setMessages(snapshot);
          setActionError(getApiErrorMessage(err));
        }

        throw err;
      }
    },
    [mappingOptions],
  );

  const deleteMessage = useCallback(async (messageId: string) => {
    const snapshot = messagesRef.current;

    setActionError(null);
    setMessages((currentMessages) =>
      currentMessages.filter((message) => message.id !== messageId),
    );

    try {
      await messageService.deleteMessage(messageId);
    } catch (err) {
      if (isMountedRef.current) {
        setMessages(snapshot);
        setActionError(getApiErrorMessage(err));
      }

      throw err;
    }
  }, []);

  const toggleReaction = useCallback(async (messageId: string, emoji: string) => {
    const snapshot = messagesRef.current;

    setActionError(null);
    setMessages((currentMessages) => toggleOwnReaction(currentMessages, messageId, emoji));

    try {
      const response = await messageService.toggleReaction(messageId, emoji);

      if (isMountedRef.current) {
        setMessages((currentMessages) =>
          setOwnReactionState(currentMessages, messageId, emoji, response.action === "added"),
        );
      }
    } catch (err) {
      if (isMountedRef.current) {
        setMessages(snapshot);
        setActionError(getApiErrorMessage(err));
      }

      throw err;
    }
  }, []);

  return {
    messages,
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
    clearActionError: () => setActionError(null),
  };
}
