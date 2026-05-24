import type { ChatMessage, ChatMessageReaction } from "@/components/chat/chat-message-types";
import type { CursorPaginationParams } from "./user";

export const MESSAGE_TYPE = {
  text: 1,
  image: 2,
  file: 3,
  audio: 4,
  video: 5,
  system: 6,
} as const;

export type SendableMessageType = 1 | 2 | 3 | 4 | 5;
export type MessageResponseType = SendableMessageType | 6;

export interface AttachmentRequest {
  file_url: string;
  file_name: string;
  mime_type: string;
  file_size_bytes: number;
  width?: number;
  height?: number;
  duration_sec?: number;
}

export interface AttachmentResponse {
  id: string;
  message_id?: string;
  file_name: string;
  file_url: string;
  mime_type: string;
  file_size_bytes: number;
  width?: number;
  height?: number;
  duration_sec?: number;
  created_at: string;
}

export interface MessageReactionResponse {
  id: number;
  message_id?: string;
  user_id?: string;
  emoji: string;
  created_at: string;
}

export interface MessageResponse {
  id: string;
  conversation_id: string;
  sender_id: string;
  parent_id?: string;
  type: MessageResponseType;
  content?: string;
  content_encrypted: boolean;
  iv?: string;
  seq: number;
  is_edited: boolean;
  is_deleted: boolean;
  deleted_at?: string;
  created_at: string;
  updated_at: string;
  sender_name?: string;
  sender_avatar_url?: string;
  attachments?: AttachmentResponse[];
  reactions?: MessageReactionResponse[];
}

export interface SendMessageRequest {
  type: SendableMessageType;
  content?: string;
  parent_id?: string;
  attachments?: AttachmentRequest[];
}

export type ListMessagesParams = CursorPaginationParams;

export interface MarkAsReadRequest {
  last_read_msg_id: string;
}

export interface EditMessageRequest {
  content: string;
}

export interface ToggleReactionRequest {
  emoji: string;
}

export interface ToggleReactionResponse {
  action: "added" | "removed";
}

export interface MessageMappingOptions {
  currentUserId?: string | null;
  currentUserName?: string | null;
  currentUserAvatarUrl?: string | null;
}

function normalizeComparableId(id?: string | null) {
  return id?.replace(/-/g, "").toLowerCase();
}

function isSameUser(left?: string | null, right?: string | null) {
  const normalizedLeft = normalizeComparableId(left);
  const normalizedRight = normalizeComparableId(right);

  return Boolean(normalizedLeft && normalizedRight && normalizedLeft === normalizedRight);
}

function aggregateReactions(
  reactions: MessageReactionResponse[] = [],
  currentUserId?: string | null,
): ChatMessageReaction[] {
  const grouped = new Map<string, ChatMessageReaction>();

  for (const reaction of reactions) {
    const current = grouped.get(reaction.emoji) ?? {
      emoji: reaction.emoji,
      count: 0,
      reactedByMe: false,
    };

    current.count += 1;
    current.reactedByMe = current.reactedByMe || isSameUser(reaction.user_id, currentUserId);
    grouped.set(reaction.emoji, current);
  }

  return Array.from(grouped.values());
}

function getFallbackContent(message: MessageResponse) {
  if (message.content) return message.content;
  if (message.content_encrypted) return "Tin nhan da duoc ma hoa";
  if (message.attachments?.length) return "";

  return message.type === MESSAGE_TYPE.system ? "" : "";
}

export function mapMessageResponseToChatMessage(
  message: MessageResponse,
  options: MessageMappingOptions = {},
): ChatMessage {
  const isOwn = isSameUser(message.sender_id, options.currentUserId);

  return {
    id: message.id,
    conversationId: message.conversation_id,
    text: getFallbackContent(message),
    senderId: message.sender_id,
    senderName: message.sender_name ?? (isOwn ? options.currentUserName ?? undefined : undefined),
    senderAvatar: message.sender_avatar_url ?? (isOwn ? options.currentUserAvatarUrl ?? undefined : undefined),
    timestamp: message.created_at,
    editedAt: message.is_edited ? message.updated_at : undefined,
    reactions: aggregateReactions(message.reactions, options.currentUserId),
    attachments: message.attachments?.map((attachment) => ({
      id: attachment.id,
      fileName: attachment.file_name,
      fileUrl: attachment.file_url,
      mimeType: attachment.mime_type,
      fileSizeBytes: attachment.file_size_bytes,
    })),
    messageType: message.type,
    type: message.type === MESSAGE_TYPE.system ? "system" : "user",
    isSystem: message.type === MESSAGE_TYPE.system,
    isOwn,
    seq: message.seq,
  };
}
