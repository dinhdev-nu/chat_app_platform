"use client";

import React, { useCallback, useMemo } from "react";
import { AnimatePresence, m, useReducedMotion, type Variants } from "framer-motion";

import { useConversationMessages } from "@/hooks/use-conversation-messages";
import type { AuthUser } from "@/types/user";
import { ConversationListItem } from "@/data/conversation-data";
import ChatEmptyState from "./ChatEmptyState";
import ChatActiveState from "./ChatActiveState";
import type { ChatMessage } from "@/types/message";
import ConversationStarter from "./ConversationStarter";
import MobileConversationSidebarToggle from "./MobileConversationSidebarToggle";

interface ChatMainProps {
  activeConv?: ConversationListItem;
  currentUser?: AuthUser | null;
  isDraftConversation?: boolean;
  isConversationSidebarOpen?: boolean;
  useMessageApi?: boolean;
  onToggleConversationSidebar?: () => void;
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
  isConversationSidebarOpen = false,
  useMessageApi = true,
  onToggleConversationSidebar,
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
      {onToggleConversationSidebar ? (
        <MobileConversationSidebarToggle
          isOpen={isConversationSidebarOpen}
          onToggle={onToggleConversationSidebar}
        />
      ) : null}

      <AnimatePresence mode="sync" initial={false}>
        {stateKey === "empty" && (
          <m.div
            key="empty"
            className="absolute inset-0 flex min-h-0"
            variants={pageVariant}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <ChatEmptyState />
          </m.div>
        )}

        {stateKey === "new" && activeConv && (
          <m.div
            key={`new-${activeConv.id}`}
            className="absolute inset-0 flex min-h-0"
            variants={pageVariant}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <ConversationStarter
              conv={activeConv}
              isSending={isSending}
              onSend={handleSend}
              onTyping={sendTyping}
            />
          </m.div>
        )}

        {stateKey === "active" && activeConv && (
          <m.div
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
              activityState={{
                isLoadingMessages: isLoading,
                isLoadingMoreMessages: isLoadingMore,
                hasMoreMessages: Boolean(pagination?.hasNext),
                isSending,
              }}
              messagesError={error}
              actionError={actionError}
              onRetryLoad={() => void loadMessages()}
              onLoadMoreMessages={() => void loadMore()}
              onSend={handleSend}
              onTyping={sendTyping}
              onEditMessage={handleEditMessage}
              onDeleteMessage={handleDeleteMessage}
              onReactMessage={handleReactMessage}
            />
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
