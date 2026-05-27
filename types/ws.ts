import type { ConversationListItemResponse } from "./conversation";
import type { MessageResponse } from "./message";

export type WsInboundType = "typing" | "viewing" | "left" | "read";

export interface WsInboundEnvelope<TPayload extends object> {
  type: WsInboundType;
  payload: TPayload;
}

export interface WsConversationPayload {
  conv_id: string;
}

export interface WsReadPayload extends WsConversationPayload {
  last_read_msg_id: string;
}

export interface WsUserSummary {
  id: string;
  name: string;
  avatar_url?: string;
}

export interface WsTypingEvent {
  event: "typing";
  user_id: string;
  conv_id: string;
}

export interface WsPresenceEvent {
  event: "presence";
  user_id: string;
  is_online: boolean;
  conv_id?: string;
}

export interface WsMessageNewEvent {
  event: "message.new";
  conv_id: string;
  msg_id: string;
  sender_id: string;
  seq: number;
  type: MessageResponse["type"];
  message: MessageResponse;
}

export interface WsMessageReadEvent {
  event: "message.read";
  conv_id: string;
  user_id: string;
  last_read_msg_id: string;
  read_at: string;
}

export interface WsMessageEditedEvent {
  event: "message.edited";
  conv_id: string;
  msg_id: string;
  content: string;
  edited_at: string;
  message?: MessageResponse;
}

export interface WsMessageDeletedEvent {
  event: "message.deleted";
  conv_id: string;
  msg_id: string;
  is_deleted: true;
  deleted_at: string;
}

export interface WsReactionToggleEvent {
  event: "reaction.toggle";
  conv_id: string;
  msg_id: string;
  user_id: string;
  emoji: string;
  action: "added" | "removed";
}

export interface WsConversationCreatedEvent {
  event: "conversation.created";
  conv_id: string;
  conversation: ConversationListItemResponse;
}

export interface WsMemberAddedEvent {
  event: "member.added";
  conv_id: string;
  user_id: string;
  user?: WsUserSummary;
  actor?: WsUserSummary;
  conversation?: ConversationListItemResponse;
}

export interface WsMemberRemovedEvent {
  event: "member.removed";
  conv_id: string;
  user_id: string;
  user?: WsUserSummary;
  actor?: WsUserSummary;
}

export type WsOutboundEvent =
  | WsTypingEvent
  | WsPresenceEvent
  | WsMessageNewEvent
  | WsMessageReadEvent
  | WsMessageEditedEvent
  | WsMessageDeletedEvent
  | WsReactionToggleEvent
  | WsConversationCreatedEvent
  | WsMemberAddedEvent
  | WsMemberRemovedEvent;

export function isWsOutboundEvent(value: unknown): value is WsOutboundEvent {
  return (
    typeof value === "object" &&
    value !== null &&
    "event" in value &&
    typeof (value as { event?: unknown }).event === "string"
  );
}
