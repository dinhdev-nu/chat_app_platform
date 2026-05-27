"use client";

import { useCallback, useEffect, useRef } from "react";

import { markConversationRead } from "@/services/readReceiptService";
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

    let cancelled = false;
    const timeoutId = window.setTimeout(() => {
      void markConversationRead(conversationId, latestReadMessageId)
        .then((didMarkRead) => {
          if (!didMarkRead) return;
          if (!cancelled) lastReadMarkerRef.current = readMarker;
        })
        .catch(() => undefined);
    }, readDebounceMs);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [conversationId, enabled, latestReadMessageId, readDebounceMs]);

  return useCallback(() => {
    if (!enabled || !conversationId) return;

    const now = Date.now();
    if (now - lastTypingAtRef.current < typingThrottleMs) return;

    const sent = wsService.sendTyping(conversationId);
    if (sent) lastTypingAtRef.current = now;
  }, [conversationId, enabled, typingThrottleMs]);
}
