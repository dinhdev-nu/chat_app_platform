import { API_ENDPOINTS } from "@/constants/config";
import type { ApiEnvelope, ApiPaginatedEnvelope, PaginatedResult } from "@/types/api";
import type {
  EditMessageRequest,
  ListMessagesParams,
  MarkAsReadRequest,
  MessageResponse,
  SendMessageRequest,
  ToggleReactionRequest,
  ToggleReactionResponse,
} from "@/types/message";
import { MESSAGE_TYPE } from "@/types/message";
import { http, normalizeApiError, unwrapApiData, unwrapPaginatedApiData } from "./http";

function toCursorParams({ cursor, limit = 20 }: ListMessagesParams = {}) {
  return {
    limit,
    ...(cursor ? { cursor } : {}),
  };
}

function ensurePaginatedMessageData(
  result: PaginatedResult<MessageResponse>,
): PaginatedResult<MessageResponse> {
  const data: unknown = result.data;

  return {
    ...result,
    data: Array.isArray(data) ? data : [],
  };
}

export const messageService = {
  async listMessages(
    conversationId: string,
    params: ListMessagesParams = {},
  ): Promise<PaginatedResult<MessageResponse>> {
    try {
      const response = await http.get<ApiPaginatedEnvelope<MessageResponse>>(
        API_ENDPOINTS.messages.list(conversationId),
        { params: toCursorParams(params) },
      );

      return ensurePaginatedMessageData(unwrapPaginatedApiData(response.data));
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async sendMessage(
    conversationId: string,
    payload: string | SendMessageRequest,
  ): Promise<MessageResponse> {
    try {
      const body: SendMessageRequest =
        typeof payload === "string"
          ? { type: MESSAGE_TYPE.text, content: payload }
          : payload;

      const response = await http.post<ApiEnvelope<MessageResponse>>(
        API_ENDPOINTS.messages.send(conversationId),
        body,
      );

      return unwrapApiData(response.data);
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async markAsRead(conversationId: string, lastReadMessageId: string): Promise<void> {
    try {
      const body: MarkAsReadRequest = { last_read_msg_id: lastReadMessageId };

      await http.post(API_ENDPOINTS.messages.read(conversationId), body);
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async editMessage(messageId: string, content: string): Promise<MessageResponse> {
    try {
      const body: EditMessageRequest = { content };
      const response = await http.put<ApiEnvelope<MessageResponse>>(
        API_ENDPOINTS.messages.detail(messageId),
        body,
      );

      return unwrapApiData(response.data);
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async deleteMessage(messageId: string): Promise<void> {
    try {
      await http.delete(API_ENDPOINTS.messages.detail(messageId));
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async toggleReaction(messageId: string, emoji: string): Promise<ToggleReactionResponse> {
    try {
      const body: ToggleReactionRequest = { emoji };
      const response = await http.post<ApiEnvelope<ToggleReactionResponse>>(
        API_ENDPOINTS.messages.reactions(messageId),
        body,
      );

      return unwrapApiData(response.data);
    } catch (error) {
      throw normalizeApiError(error);
    }
  },
};
