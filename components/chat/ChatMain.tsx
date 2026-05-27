"use client";

import React, { useCallback, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "framer-motion";

import { useConversationMessages } from "@/hooks/use-conversation-messages";
import type { AuthUser } from "@/types/user";
import { ConversationListItem, MOCK_CONVERSATIONS } from "./conversation-data";
import ChatEmptyState from "./ChatEmptyState";
import ChatActiveState from "./ChatActiveState";
import type { ChatMessage } from "./chat-message-types";
import PromptInput from "./PromptInput";
import MobileProjectSidebarToggle from "./MobileProjectSidebarToggle";

interface ChatMainProps {
  activeConv?: ConversationListItem;
  currentUser?: AuthUser | null;
  isDraftConversation?: boolean;
  isProjectSidebarOpen?: boolean;
  useMessageApi?: boolean;
  onToggleProjects?: () => void;
  onCreateConversation?: (
    conversation: ConversationListItem,
    firstMessageText: string,
  ) => Promise<ConversationListItem | undefined> | ConversationListItem | undefined;
  onConversationMessageUpdate?: (
    conversation: ConversationListItem,
    message: ChatMessage,
  ) => void;
}

export default function ChatMain({
  activeConv,
  currentUser,
  isDraftConversation = false,
  isProjectSidebarOpen = false,
  useMessageApi = true,
  onToggleProjects,
  onCreateConversation,
  onConversationMessageUpdate,
}: ChatMainProps) {
  const shouldReduceMotion = useReducedMotion();
  const shouldLoadMessages = Boolean(useMessageApi && activeConv && !isDraftConversation);
  const {
    messages,
    pagination,
    isLoading,
    isLoadingMore,
    isSending,
    error,
    actionError,
    loadMessages,
    loadMore,
    sendMessage,
    editMessage,
    deleteMessage,
    toggleReaction,
    sendTyping,
    typingUsers,
  } = useConversationMessages({
    conversationId: activeConv?.id,
    currentUser,
    enabled: shouldLoadMessages,
  });

  const pageVariant = useMemo<Variants>(
    () =>
      shouldReduceMotion
        ? {
          initial: { opacity: 1, y: 0 },
          animate: { opacity: 1, y: 0, transition: { duration: 0 } },
          exit: { opacity: 1, y: 0, transition: { duration: 0 } },
        }
        : {
          initial: { opacity: 0, y: 8 },
          animate: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.22, ease: "easeOut" },
          },
          exit: {
            opacity: 0,
            y: 6,
            transition: { duration: 0.12, ease: "easeInOut" },
          },
        },
    [shouldReduceMotion],
  );

  const handleSend = useCallback(
    async (text: string) => {
      if (!activeConv || !useMessageApi) return;

      const targetConversation = (await onCreateConversation?.(activeConv, text)) ?? activeConv;
      if (!targetConversation.id || targetConversation.id === activeConv.id && isDraftConversation) return;

      try {
        const sentMessage = await sendMessage(text, { conversationId: targetConversation.id });

        if (sentMessage) {
          onConversationMessageUpdate?.(targetConversation, sentMessage);
        }
      } catch (error) {
        console.error("Failed to send message:", error);
      }
    },
    [
      activeConv,
      isDraftConversation,
      onConversationMessageUpdate,
      onCreateConversation,
      sendMessage,
      useMessageApi,
    ],
  );

  const handleEditMessage = useCallback(
    async (messageId: string, text: string) => {
      try {
        await editMessage(messageId, text);
      } catch (error) {
        console.error("Failed to edit message:", error);
      }
    },
    [editMessage],
  );

  const handleDeleteMessage = useCallback(
    async (messageId: string) => {
      try {
        await deleteMessage(messageId);
      } catch (error) {
        console.error("Failed to delete message:", error);
      }
    },
    [deleteMessage],
  );

  const handleReactMessage = useCallback(
    async (messageId: string, emoji: string) => {
      try {
        await toggleReaction(messageId, emoji);
      } catch (error) {
        console.error("Failed to toggle reaction:", error);
      }
    },
    [toggleReaction],
  );

  let stateKey: "empty" | "new" | "active";
  if (!activeConv) {
    stateKey = "empty";
  } else if (messages.length === 0 && typingUsers.length === 0 && !isLoading && !error) {
    stateKey = "new";
  } else {
    stateKey = "active";
  }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col w-full h-full overflow-hidden bg-transparent">
      {onToggleProjects ? (
        <MobileProjectSidebarToggle isOpen={isProjectSidebarOpen} onToggle={onToggleProjects} />
      ) : null}

      <AnimatePresence mode="sync" initial={false}>
        {stateKey === "empty" && (
          <motion.div
            key="empty"
            className="absolute inset-0 flex min-h-0"
            variants={pageVariant}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <ChatEmptyState />
          </motion.div>
        )}

        {stateKey === "new" && activeConv && (
          <motion.div
            key={`new-${activeConv.id}`}
            className="absolute inset-0 flex min-h-0"
            variants={pageVariant}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <PromptInput
              conv={activeConv}
              isSending={isSending}
              onSend={handleSend}
              onTyping={sendTyping}
            />
          </motion.div>
        )}

        {stateKey === "active" && activeConv && (
          <motion.div
            key={`active-${activeConv.id}`}
            className="absolute inset-0 flex min-h-0"
            variants={pageVariant}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <ChatActiveState
              conv={activeConv}
              messages={messages}
              currentUserId={currentUser?.id}
              typingUsers={typingUsers}
              isLoadingMessages={isLoading}
              isLoadingMoreMessages={isLoadingMore}
              hasMoreMessages={Boolean(pagination?.hasNext)}
              messagesError={error}
              actionError={actionError}
              isSending={isSending}
              onRetryLoad={() => void loadMessages()}
              onLoadMoreMessages={() => void loadMore()}
              onSend={handleSend}
              onTyping={sendTyping}
              onEditMessage={handleEditMessage}
              onDeleteMessage={handleDeleteMessage}
              onReactMessage={handleReactMessage}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function ChatMainDemo() {
  const [activeConv, setActiveConv] = useState<ConversationListItem | undefined>(undefined);

  return (
    <div
      className="flex h-screen w-full bg-transparent"
      style={{ fontFamily: "var(--font-sans-theme, var(--font-sans), sans-serif)" }}
    >
      <div
        className="shrink-0 flex flex-col gap-1 p-3 border-r w-52 overflow-y-auto hide-scrollbar"
        style={{ borderColor: "rgb(var(--borderColor-secondary) / 0.12)" }}
      >
        <button
          type="button"
          className="text-left px-3 py-2 rounded-xl text-[13px] font-medium transition-all"
          style={{
            background: activeConv === undefined ? "rgb(var(--backgroundColor-state-active) / 1)" : "transparent",
            color: "rgb(var(--textColor-primary))",
          }}
          onClick={() => setActiveConv(undefined)}
        >
          (Không chọn) → State 1
        </button>
        {MOCK_CONVERSATIONS.map((conv) => (
          <button
            key={conv.id}
            type="button"
            className="text-left px-3 py-2 rounded-xl text-[13px] font-medium transition-all truncate"
            style={{
              background: activeConv?.id === conv.id ? "rgb(var(--backgroundColor-state-active) / 1)" : "transparent",
              color: "rgb(var(--textColor-primary))",
            }}
            onClick={() => setActiveConv(conv)}
          >
            {conv.name}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-hidden">
        <ChatMain activeConv={activeConv} useMessageApi={false} />
      </div>
    </div>
  );
}
