export type ChatMessageType = "user" | "system";

export interface ChatMessageReaction {
  emoji: string;
  count: number;
  reactedByMe?: boolean;
}

export interface ChatMessageAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  mimeType: string;
  fileSizeBytes: number;
}

export interface ChatMessage {
  id: string;
  conversationId?: string;
  text: string;
  senderId: string;
  senderName?: string;
  senderAvatar?: string;
  timestamp: string;
  editedAt?: string;
  reactions?: ChatMessageReaction[];
  attachments?: ChatMessageAttachment[];
  messageType?: number;
  type?: ChatMessageType;
  isSystem?: boolean;
  isOwn?: boolean;
  isDeleted?: boolean;
  deletedAt?: string;
  seq?: number;
}
