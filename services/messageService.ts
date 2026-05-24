import { API_ENDPOINTS } from "@/constants/config";
import { http, normalizeApiError } from "./http";

export interface SendMessageRequest {
  text: string;
}

export const messageService = {
  /**
   * POST /api/v1/conversations/{id}/messages
   * Gửi tin nhắn mới vào cuộc hội thoại.
   * UI đã optimistic update trước, service chỉ cần fire request và throw nếu lỗi.
   */
  async sendMessage(conversationId: string, text: string): Promise<void> {
    try {
      const body: SendMessageRequest = { text };
      await http.post(
        API_ENDPOINTS.messages.send(conversationId),
        body,
      );
    } catch (error) {
      throw normalizeApiError(error);
    }
  },
};
