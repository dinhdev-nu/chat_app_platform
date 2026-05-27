import { API_ENDPOINTS } from "@/constants/config";
import type { ApiEnvelope, ApiPaginatedEnvelope, PaginatedResult } from "@/types/api";
import type {
  ConversationResponse,
  ConversationListItemResponse,
  CreateDMRequest,
  CreateGroupRequest,
  ListConversationsParams,
} from "@/types/conversation";
import { mapConversationResponseToListItem } from "@/types/conversation";
import type { ConversationListItem } from "@/components/chat/conversation-data";
import { http, normalizeApiError, unwrapApiData, unwrapPaginatedApiData } from "./http";

function toCursorParams({ cursor, limit = 20 }: ListConversationsParams = {}) {
  return {
    limit,
    ...(cursor ? { cursor } : {}),
  };
}

function ensurePaginatedListData<T>(result: PaginatedResult<T>): PaginatedResult<T> {
  const data: unknown = result.data;

  return {
    ...result,
    data: Array.isArray(data) ? data : [],
  };
}

export const conversationService = {
  /**
   * GET /api/v1/conversations
   * Lấy danh sách conversation của user hiện tại, có cursor pagination.
   */
  async listConversations(params: ListConversationsParams = {}): Promise<PaginatedResult<ConversationListItem>> {
    try {
      const response = await http.get<ApiPaginatedEnvelope<ConversationListItemResponse>>(
        API_ENDPOINTS.conversations.list,
        { params: toCursorParams(params) },
      );

      const raw = ensurePaginatedListData(unwrapPaginatedApiData(response.data));

      return {
        data: raw.data.map(mapConversationResponseToListItem),
        pagination: raw.pagination,
      };
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  /**
   * POST /api/v1/conversations/direct
   * Tạo hoặc lấy lại DM conversation với một user khác.
   * Idempotent: trả 200 nếu đã tồn tại, 201 nếu mới tạo.
   * @param targetUserId - id from API/contact payload
   */
  async createDM(targetUserId: string): Promise<{ conversation: ConversationResponse; isNew: boolean }> {
    try {
      const body: CreateDMRequest = { target_user_id: targetUserId };
      const response = await http.post<ApiEnvelope<ConversationResponse>>(
        API_ENDPOINTS.conversations.direct,
        body,
      );

      const conversation = unwrapApiData(response.data);
      const isNew = response.status === 201;

      return { conversation, isNew };
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  /**
   * POST /api/v1/conversations/group
   * Tạo group (type=2) hoặc channel (type=3).
   * @param payload.member_user_ids - ids from API/contact/search payloads, excluding creator
   */
  async createGroup(payload: CreateGroupRequest): Promise<ConversationResponse> {
    try {
      const response = await http.post<ApiEnvelope<ConversationResponse>>(
        API_ENDPOINTS.conversations.group,
        payload,
      );

      return unwrapApiData(response.data);
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  /**
   * DELETE /api/v1/conversations/{id}/members/{user_id}
   * Rời conversation (khi user_id = current user) hoặc xóa member khác (cần role admin/owner).
   */
  async removeMember(conversationId: string, userId: string): Promise<void> {
    try {
      await http.delete(API_ENDPOINTS.conversations.member(conversationId, userId));
    } catch (error) {
      throw normalizeApiError(error);
    }
  },
};
