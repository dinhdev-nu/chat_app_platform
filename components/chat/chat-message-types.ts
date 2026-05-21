export type ChatMessageType = "user" | "system";

export interface ChatMessageReaction {
  emoji: string;
  count: number;
  reactedByMe?: boolean;
}

export interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
  senderName?: string;
  senderAvatar?: string;
  timestamp: string;
  editedAt?: string;
  reactions?: ChatMessageReaction[];
  type?: ChatMessageType;
  isSystem?: boolean;
  isOwn?: boolean;
}
