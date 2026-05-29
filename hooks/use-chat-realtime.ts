"use client";

import { useCallback, useEffect, useRef } from "react";

import { conversationService } from "@/services/conversationService";
import { messageService } from "@/services/messageService";
import { markConversationRead } from "@/services/readReceiptService";
import { wsService } from "@/services/wsService";
import { useChatStore } from "@/stores/chatStore";
import { useWsStore } from "@/stores/wsStore";
import type { WsOutboundEvent } from "@/types/ws";

interface UseChatRealtimeOptions {
  accessToken?: string | null;
  activeConversationId?: string | null;
  currentUserId?: string | null;
  enabled?: boolean;
  onCurrentUserRemovedFromConversation?: (conversationId: string) => void;
  onPresenceChange?: (userId: string, isOnline: boolean) => void;
}

const SYNC_DEBOUNCE_MS = 250;
const DEFAULT_SYNC_LIMIT = 20;

export function useChatRealtime({
  accessToken,
  activeConversationId,
  currentUserId,
  enabled = true,
  onCurrentUserRemovedFromConversation,
  onPresenceChange,
}: UseChatRealtimeOptions) {
  const activeConversationIdRef = useRef(activeConversationId);
  const currentUserIdRef = useRef(currentUserId);
  const removedCallbackRef = useRef(onCurrentUserRemovedFromConversation);
  const presenceCallbackRef = useRef(onPresenceChange);
  const typingCleanupTimersRef = useRef<Record<string, number>>({});
  const messageSyncTimersRef = useRef<Record<string, number>>({});
  const conversationSyncTimerRef = useRef<number | null>(null);

  const setConnectionState = useWsStore((state) => state.setConnectionState);
  const resetWsState = useWsStore((state) => state.reset);
  const setConversations = useChatStore((state) => state.setConversations);
  const setMessages = useChatStore((state) => state.setMessages);
  const resetChatState = useChatStore((state) => state.reset);

  useEffect(() => {
    activeConversationIdRef.current = activeConversationId;
  }, [activeConversationId]);

  useEffect(() => {
    currentUserIdRef.current = currentUserId;
  }, [currentUserId]);

  useEffect(() => {
    removedCallbackRef.current = onCurrentUserRemovedFromConversation;
  }, [onCurrentUserRemovedFromConversation]);

  useEffect(() => {
    presenceCallbackRef.current = onPresenceChange;
  }, [onPresenceChange]);

  const syncConversations = useCallback(async () => {
    const result = await conversationService.listConversations({ limit: DEFAULT_SYNC_LIMIT });
    setConversations(result.data);
  }, [setConversations]);

  const syncMessages = useCallback(
    async (conversationId: string) => {
      const result = await messageService.listMessages(conversationId, {
        limit: DEFAULT_SYNC_LIMIT,
      });

      setMessages(conversationId, result.data.slice().reverse());
    },
    [setMessages],
  );

  const scheduleConversationSync = useCallback(() => {
    if (conversationSyncTimerRef.current) {
      window.clearTimeout(conversationSyncTimerRef.current);
    }

    conversationSyncTimerRef.current = window.setTimeout(() => {
      conversationSyncTimerRef.current = null;
      void syncConversations().catch(() => undefined);
    }, SYNC_DEBOUNCE_MS);
  }, [syncConversations]);

  const scheduleMessageSync = useCallback(
    (conversationId: string) => {
      const conversationKey = conversationId;
      if (!conversationKey) return;

      const existingTimer = messageSyncTimersRef.current[conversationKey];
      if (existingTimer) window.clearTimeout(existingTimer);

      messageSyncTimersRef.current[conversationKey] = window.setTimeout(() => {
        delete messageSyncTimersRef.current[conversationKey];
        void syncMessages(conversationId).catch(() => undefined);
      }, SYNC_DEBOUNCE_MS);
    },
    [syncMessages],
  );

  const scheduleTypingCleanup = useCallback((conversationId: string, userId: string) => {
    const timerKey = `${conversationId}:${userId}`;
    const existingTimer = typingCleanupTimersRef.current[timerKey];
    if (existingTimer) window.clearTimeout(existingTimer);

    typingCleanupTimersRef.current[timerKey] = window.setTimeout(() => {
      delete typingCleanupTimersRef.current[timerKey];
      useChatStore.getState().pruneTyping();
    }, 4200);
  }, []);

  const syncAfterOpen = useCallback(async () => {
    await syncConversations();

    const activeConversation = activeConversationIdRef.current;
    if (!activeConversation) return;

    await syncMessages(activeConversation);
    wsService.sendViewing(activeConversation);

    const thread =
      useChatStore.getState().messageThreadsByConvId[activeConversation];
    const latestMessageId = thread?.ids.at(-1);
    const latestMessage = latestMessageId ? thread?.byId[latestMessageId] : undefined;

    if (latestMessage && !latestMessage.id.startsWith("local_")) {
      void markConversationRead(activeConversation, latestMessage.id);
    }
  }, [syncConversations, syncMessages]);

  const handleEvent = useCallback(
    (event: WsOutboundEvent) => {
      const store = useChatStore.getState();
      const currentUser = currentUserIdRef.current;
      const activeConversation = activeConversationIdRef.current;

      switch (event.event) {
        case "typing":
          store.applyTyping(event);
          scheduleTypingCleanup(event.conv_id, event.user_id);
          break;

        case "presence":
          store.applyPresence(event);
          presenceCallbackRef.current?.(event.user_id, event.is_online);
          break;

        case "message.new": {
          const conversationKey = event.conv_id;
          const hasConversation = Boolean(store.conversationsById[conversationKey]);

          store.applyIncomingMessage(event, {
            activeConversationId: activeConversation,
            currentUserId: currentUser,
          });

          if (!hasConversation) scheduleConversationSync();
          break;
        }

        case "message.read":
          store.applyMessageRead(event, currentUser);
          break;

        case "message.edited":
          if (!store.applyMessageEdited(event)) scheduleMessageSync(event.conv_id);
          break;

        case "message.deleted":
          if (!store.applyMessageDeleted(event)) scheduleMessageSync(event.conv_id);
          break;

        case "reaction.toggle":
          if (!store.applyReactionToggle(event)) scheduleMessageSync(event.conv_id);
          break;

        case "conversation.created":
          store.applyConversationCreated(event);
          break;

        case "member.added": {
          const isCurrentUser = store.applyMemberAdded(event, currentUser);
          if (isCurrentUser && !event.conversation) scheduleConversationSync();
          break;
        }

        case "member.removed": {
          const isCurrentUser = store.applyMemberRemoved(event, currentUser);
          if (isCurrentUser) {
            removedCallbackRef.current?.(event.conv_id);
          }
          break;
        }
      }
    },
    [scheduleConversationSync, scheduleMessageSync, scheduleTypingCleanup],
  );

  useEffect(() => {
    if (!enabled || !accessToken) {
      wsService.disconnect();
      resetWsState();
      resetChatState();
      return;
    }

    wsService.connect({
      accessToken,
      onEvent: handleEvent,
      onOpen: () => {
        void syncAfterOpen().catch(() => undefined);
      },
      onStatusChange: setConnectionState,
    });

    return () => {
      wsService.disconnect();
    };
  }, [
    accessToken,
    enabled,
    handleEvent,
    resetChatState,
    resetWsState,
    setConnectionState,
    syncAfterOpen,
  ]);

  useEffect(() => {
    const messageSyncTimers = messageSyncTimersRef.current;
    const typingCleanupTimers = typingCleanupTimersRef.current;

    return () => {
      const conversationSyncTimer = conversationSyncTimerRef.current;
      if (conversationSyncTimer) {
        window.clearTimeout(conversationSyncTimer);
      }

      Object.values(messageSyncTimers).forEach((timer) => window.clearTimeout(timer));
      Object.values(typingCleanupTimers).forEach((timer) => window.clearTimeout(timer));
    };
  }, []);
}
