"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import type { ConversationListItem } from "./conversation-data";
import ChatInput from "./ChatInput";
import ChatConversationHeader from "./ChatConversationHeader";
import ChatDateSeparator from "./ChatDateSeparator";
import ChatMessageBubble from "./ChatMessageBubble";
import ChatSystemMessage from "./ChatSystemMessage";
import type { ChatMessage } from "./chat-message-types";
import { isSystemMessage } from "./chat-message-utils";

export type { ChatMessage, ChatMessageReaction } from "./chat-message-types";

interface ChatActiveStateProps {
  conv: ConversationListItem;
  messages: ChatMessage[];
  currentUserId?: string;
  onSend?: (text: string) => void;
  onEditMessage?: (messageId: string, text: string) => void;
  onReactMessage?: (messageId: string, emoji: string) => void;
}

export default function ChatActiveState({
  conv,
  messages,
  currentUserId,
  onSend,
  onEditMessage,
  onReactMessage,
}: ChatActiveStateProps) {
  const shouldReduceMotion = useReducedMotion() ?? false;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: shouldReduceMotion ? "auto" : "smooth" });
  }, [messages.length, shouldReduceMotion]);

  return (
    <div className="grid h-full min-h-0 w-full grid-rows-[auto_minmax(0,1fr)_auto] bg-transparent overflow-hidden">
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        <ChatConversationHeader conv={conv} />
      </motion.div>

      <div className="message-scrollbar min-h-0 overflow-x-hidden overflow-y-scroll overscroll-contain px-4 py-3">
        <div className="flex min-h-full flex-col justify-end">
          <ChatDateSeparator label="Hôm nay" />

          <AnimatePresence initial={false}>
            {messages.map((msg, i) =>
              isSystemMessage(msg) ? (
                <ChatSystemMessage key={msg.id} msg={msg} reduceMotion={shouldReduceMotion} />
              ) : (
                <ChatMessageBubble
                  key={msg.id}
                  msg={msg}
                  prevMsg={messages[i - 1]}
                  nextMsg={messages[i + 1]}
                  currentUserId={currentUserId}
                  reduceMotion={shouldReduceMotion}
                  onEditMessage={onEditMessage}
                  onReactMessage={onReactMessage}
                />
              )
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>
      </div>

      <motion.div
        className="shrink-0 flex justify-center px-4 pb-4 pt-2"
        initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      >
        <ChatInput
          ariaLabel={conv.name ? `Nhắn tin tới ${conv.name}` : "Nhắn tin"}
          placeholder={`Nhắn tin ${conv.name ? `tới ${conv.name}` : ""}...`}
          sendLabel="Gửi tin nhắn"
          onSend={onSend}
        />
      </motion.div>
    </div>
  );
}
