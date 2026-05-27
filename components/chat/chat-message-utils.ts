import type { Variants } from "framer-motion";
import type { ChatMessage } from "./chat-message-types";
import {
  formatVietnamRelativeDate,
  formatVietnamTime,
  isSameVietnamDate,
} from "./chat-time-utils";

export const msgVariants: Variants = {
  hidden: { opacity: 0, y: 10, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] },
  },
};

const MESSAGE_GROUP_WINDOW_MS = 5 * 60 * 1000;

export function formatTime(iso: string) {
  return formatVietnamTime(iso);
}

export function formatMessageDateLabel(iso: string) {
  return formatVietnamRelativeDate(iso);
}

export function isSameMessageDate(left?: string | null, right?: string | null) {
  return isSameVietnamDate(left, right);
}

export function isSystemMessage(msg: ChatMessage) {
  return msg.isSystem || msg.type === "system" || msg.senderId === "system";
}

export function isGroupedWithMessage(current: ChatMessage, adjacent?: ChatMessage) {
  if (!adjacent || isSystemMessage(current) || isSystemMessage(adjacent)) return false;
  if (adjacent.senderId !== current.senderId) return false;

  const currentTime = Date.parse(current.timestamp);
  const adjacentTime = Date.parse(adjacent.timestamp);
  if (!Number.isFinite(currentTime) || !Number.isFinite(adjacentTime)) return false;

  return Math.abs(currentTime - adjacentTime) <= MESSAGE_GROUP_WINDOW_MS;
}
