"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { getApiErrorMessage } from "@/services/http";
import { conversationService } from "@/services/conversationService";
import type { PaginationMeta } from "@/types/api";
import type { ConversationListItem } from "@/components/chat/conversation-data";

const DEFAULT_PAGE_LIMIT = 20;

interface LoadPageOptions {
  cursor?: string;
  append?: boolean;
  silent?: boolean;
}

interface UseConversationsOptions {
  enabled?: boolean;
  limit?: number;
}

export function useConversations({ enabled = true, limit = DEFAULT_PAGE_LIMIT }: UseConversationsOptions = {}) {
  const [conversations, setConversations] = useState<ConversationListItem[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const loadConversations = useCallback(
    async ({ cursor, append = false, silent = false }: LoadPageOptions = {}) => {
      if (!enabled) return;
      if (!silent) setIsLoading(true);
      setError(null);

      try {
        const result = await conversationService.listConversations({ cursor, limit });

        if (!isMountedRef.current) return;

        setConversations((current) =>
          append ? [...current, ...result.data] : result.data,
        );
        setPagination(result.pagination);
      } catch (err) {
        if (!isMountedRef.current) return;
        setError(getApiErrorMessage(err));
      } finally {
        if (isMountedRef.current && !silent) setIsLoading(false);
      }
    },
    [enabled, limit],
  );

  // Auto-load khi mount
  useEffect(() => {
    if (!enabled) return;

    const timeoutId = window.setTimeout(() => {
      void loadConversations();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [enabled, loadConversations]);

  const loadMore = useCallback(async () => {
    if (!pagination?.hasNext || !pagination.nextCursor) return;
    await loadConversations({ cursor: pagination.nextCursor, append: true });
  }, [pagination, loadConversations]);

  /**
   * Prepend một conversation mới vào đầu danh sách.
   * Dùng sau khi tạo DM hoặc group thành công.
   * Nếu đã tồn tại (cùng id), di chuyển lên đầu thay vì thêm mới.
   */
  const prependConversation = useCallback((conversation: ConversationListItem) => {
    setConversations((current) => {
      const filtered = current.filter((item) => item.id !== conversation.id);
      return [conversation, ...filtered];
    });
  }, []);

  /**
   * Cập nhật một conversation trong danh sách (ví dụ sau khi gửi tin nhắn).
   */
  const updateConversation = useCallback((updatedConv: ConversationListItem) => {
    setConversations((current) =>
      current.map((item) => (item.id === updatedConv.id ? updatedConv : item)),
    );
  }, []);

  /**
   * Xóa một conversation khỏi danh sách (ví dụ sau khi rời nhóm).
   */
  const removeConversation = useCallback((conversationId: string) => {
    setConversations((current) => current.filter((item) => item.id !== conversationId));
  }, []);

  return {
    conversations: enabled ? conversations : [],
    pagination: enabled ? pagination : null,
    isLoading: enabled ? isLoading : false,
    error: enabled ? error : null,
    loadConversations,
    loadMore,
    prependConversation,
    updateConversation,
    removeConversation,
  };
}
