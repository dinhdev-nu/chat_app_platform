import type { ConversationListItem, ConversationType, ConversationRole } from "@/components/chat/conversation-data";
import type { CursorPaginationParams } from "./user";

// ─── Request types ───────────────────────────────────────────────────────────

/** Body gửi lên POST /api/v1/conversations/direct */
export interface CreateDMRequest {
  /** User id hex 32 ký tự, KHÔNG có dấu gạch ngang */
  target_user_id: string;
}

/** Body gửi lên POST /api/v1/conversations/group */
export interface CreateGroupRequest {
  name: string;
  /** 2 = group, 3 = channel */
  type: 2 | 3;
  avatar_url?: string;
  description?: string;
  /** Mảng user id hex 32 ký tự, KHÔNG bao gồm creator */
  member_user_ids: string[];
}

export type ListConversationsParams = CursorPaginationParams;

// ─── Response types ───────────────────────────────────────────────────────────

/** Response data của POST /api/v1/conversations/direct và POST /api/v1/conversations/group */
export interface ConversationResponse {
  id: string;
  type: ConversationType;
  name?: string;
  description?: string;
  avatar_url?: string;
  created_by?: string;
  last_message_id?: string;
  last_message_text?: string;
  last_activity_at?: string;
  created_at: string;
  updated_at: string;
}

/** Item trong data[] của GET /api/v1/conversations */
export interface ConversationListItemResponse {
  id: string;
  type: ConversationType;
  name?: string;
  description?: string;
  avatar_url?: string;
  created_by?: string;
  last_message_id?: string;
  last_message_text?: string;
  last_activity_at?: string;
  created_at: string;
  updated_at: string;
  role: ConversationRole;
  is_muted: boolean;
  unread_count: number;
}

// ─── Mappers ─────────────────────────────────────────────────────────────────

/**
 * Chuyển đổi API response item (snake_case) sang UI ConversationListItem (camelCase).
 * Dùng cho cả GET /conversations list và kết quả của POST direct/group.
 */
export function mapConversationResponseToListItem(
  raw: ConversationListItemResponse,
): ConversationListItem {
  return {
    id: raw.id,
    type: raw.type,
    name: raw.name,
    description: raw.description,
    avatarUrl: raw.avatar_url,
    createBy: raw.created_by,
    lastMessageId: raw.last_message_id,
    lastMessageText: raw.last_message_text,
    lastActivityAt: raw.last_activity_at,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
    role: raw.role,
    isMuted: raw.is_muted,
    unreadCount: raw.unread_count,
  };
}

/**
 * Chuyển ConversationResponse (từ POST direct/group) sang ConversationListItem.
 * Dùng để prepend conversation mới vào danh sách sau khi tạo.
 */
export function mapCreatedConversationToListItem(
  raw: ConversationResponse,
  role: ConversationRole = 3,
): ConversationListItem {
  return {
    id: raw.id,
    type: raw.type,
    name: raw.name,
    description: raw.description,
    avatarUrl: raw.avatar_url,
    createBy: raw.created_by,
    lastMessageId: raw.last_message_id,
    lastMessageText: raw.last_message_text,
    lastActivityAt: raw.last_activity_at,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
    role,
    isMuted: false,
    unreadCount: 0,
  };
}

/**
 * Chuyển UUID có dấu gạch ngang sang hex 32 ký tự (yêu cầu của API body).
 * Ví dụ: "0198f0f0-7a6c-7c1e-9f14-6ec6fd14f0de" → "0198f0f07a6c7c1e9f146ec6fd14f0de"
 */
export function toHexId(uuid: string): string {
  return uuid.replace(/-/g, "");
}
