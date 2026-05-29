"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { getApiErrorMessage } from "@/services/http";
import { conversationService } from "@/services/conversationService";
import { selectConversationList, useChatStore } from "@/stores/chatStore";
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
  const conversations = useChatStore(useShallow(selectConversationList));
  const setStoreConversations = useChatStore((state) => state.setConversations);
  const upsertConversation = useChatStore((state) => state.upsertConversation);
  const patchConversation = useChatStore((state) => state.patchConversation);
  const removeStoreConversation = useChatStore((state) => state.removeConversation);
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
    ({ cursor, append = false, silent = false }: LoadPageOptions = {}) => {
      if (!enabled) return;
      if (!silent) setIsLoading(true);
      setError(null);

      if (!isMountedRef.current) return;

      return conversationService
        .listConversations({ cursor, limit })
        .then((result) => {
          if (!isMountedRef.current) return;
          setStoreConversations(result.data, { append });
          setPagination(result.pagination);
        })
        .catch((err) => {
          if (!isMountedRef.current) return;
          setError(getApiErrorMessage(err));
        })
        .finally(() => {
          if (isMountedRef.current && !silent) setIsLoading(false);
        });
    },
    [enabled, limit, setStoreConversations],
  );

  // Auto-load khi mount
  useEffect(() => {
    if (!enabled) return;

    const timeoutId = window.setTimeout(() => {
      void loadConversations();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [enabled, loadConversations]);

  const loadMore = useCallback(() => {
    if (!pagination?.hasNext || !pagination.nextCursor) return;
    return loadConversations({ cursor: pagination.nextCursor, append: true });
  }, [pagination, loadConversations]);

  /**
   * Prepend một conversation mới vào đầu danh sách.
   * Dùng sau khi tạo DM hoặc group thành công.
   * Nếu đã tồn tại (cùng id), di chuyển lên đầu thay vì thêm mới.
   */
  const prependConversation = useCallback((conversation: ConversationListItem) => {
    upsertConversation(conversation, { moveToTop: true });
  }, [upsertConversation]);

  /**
   * Cập nhật một conversation trong danh sách (ví dụ sau khi gửi tin nhắn).
   */
  const updateConversation = useCallback((updatedConv: ConversationListItem) => {
    upsertConversation(updatedConv);
  }, [upsertConversation]);

  /**
   * Xóa một conversation khỏi danh sách (ví dụ sau khi rời nhóm).
   */
  const removeConversation = useCallback((conversationId: string) => {
    removeStoreConversation(conversationId);
  }, [removeStoreConversation]);

  return {
    conversations: enabled ? conversations : [],
    pagination: enabled ? pagination : null,
    isLoading: enabled ? isLoading : false,
    error: enabled ? error : null,
    loadConversations,
    loadMore,
    prependConversation,
    updateConversation,
    patchConversation,
    removeConversation,
  };
}
