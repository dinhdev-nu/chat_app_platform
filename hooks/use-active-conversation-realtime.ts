"use client";

import { useCallback, useEffect, useRef } from "react";

import { messageService } from "@/services/messageService";
import { wsService } from "@/services/wsService";

interface UseActiveConversationRealtimeOptions {
  conversationId?: string;
  enabled?: boolean;
  latestReadMessageId?: string | null;
  readDebounceMs?: number;
  typingThrottleMs?: number;
}

export function useActiveConversationRealtime({
  conversationId,
  enabled = true,
  latestReadMessageId,
  readDebounceMs = 300,
  typingThrottleMs = 1500,
}: UseActiveConversationRealtimeOptions) {
  const lastTypingAtRef = useRef(0);
  const lastReadMarkerRef = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled || !conversationId) return;

    wsService.sendViewing(conversationId);

    return () => {
      wsService.sendLeft(conversationId);
    };
  }, [conversationId, enabled]);

  useEffect(() => {
    if (!enabled || !conversationId || !latestReadMessageId) return;
    if (latestReadMessageId.startsWith("local_")) return;

    const readMarker = `${conversationId}:${latestReadMessageId}`;
    if (lastReadMarkerRef.current === readMarker) return;

    const timeoutId = window.setTimeout(() => {
      lastReadMarkerRef.current = readMarker;

      const sent = wsService.sendRead(conversationId, latestReadMessageId);
      if (!sent) {
        void messageService
          .markAsRead(conversationId, latestReadMessageId)
          .catch(() => undefined);
      }
    }, readDebounceMs);

    return () => window.clearTimeout(timeoutId);
  }, [conversationId, enabled, latestReadMessageId, readDebounceMs]);

  return useCallback(() => {
    if (!enabled || !conversationId) return;

    const now = Date.now();
    if (now - lastTypingAtRef.current < typingThrottleMs) return;

    lastTypingAtRef.current = now;
    wsService.sendTyping(conversationId);
  }, [conversationId, enabled, typingThrottleMs]);
}
