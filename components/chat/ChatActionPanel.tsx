"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import ChatActionMenu from "./ChatActionMenu";
import CreateConversationForm from "./CreateConversationForm";
import AddFriendPanel from "./AddFriendPanel";
import type { ContactRequestStatusResponse, ContactUserResponse, SearchUser } from "@/types/user";

interface ChatActionPanelProps {
  isOpen?: boolean;
  onClose?: () => void;
  onOpenFriends?: () => void;
  contacts?: ContactUserResponse[];
  incomingRequests?: SearchUser[];
  searchResults?: SearchUser[];
  isIncomingLoading?: boolean;
  isSearchingUsers?: boolean;
  incomingError?: string | null;
  searchError?: string | null;
  pendingContactActionIds?: string[];
  onAcceptContactRequest?: (senderUserId: string) => Promise<void> | void;
  onSearchUsers?: (query: string) => Promise<SearchUser[]> | SearchUser[];
  onSendContactRequest?: (targetUserId: string) => Promise<ContactRequestStatusResponse | undefined> | ContactRequestStatusResponse | undefined;
  onCreateConversation?: (payload: { name: string; type: 2 | 3; avatar_url?: string; description?: string; member_user_ids: string[] }) => void;
  onSearchMembers?: (q: string) => Promise<SearchUser[]>;
}

export default function ChatActionPanel({
  isOpen = false,
  onClose,
  onOpenFriends,
  incomingRequests,
  searchResults,
  isIncomingLoading,
  isSearchingUsers,
  incomingError,
  searchError,
  pendingContactActionIds,
  onAcceptContactRequest,
  onSearchUsers,
  onSendContactRequest,
  onCreateConversation,
  onSearchMembers,
}: ChatActionPanelProps) {
  const [activeView, setActiveView] = useState<"menu" | "createConversation" | "addFriend">("menu");
  const [initialConversationType, setInitialConversationType] = useState<2 | 3>(2);

  return (
    <AnimatePresence initial={false} onExitComplete={() => setActiveView("menu")}>
      {isOpen ? (
        <motion.div
          key="panel-backdrop"
          className="md:hidden fixed inset-0 z-[50] bg-black/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          onClick={onClose}
        />
      ) : null}

      {isOpen ? (
        <motion.div
          key="panel-shell"
          className={[
            "z-[60] pointer-events-auto flex flex-col",
            "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] h-[80vh]",
            "md:absolute md:left-[412px] md:-translate-x-0 md:w-[280px] md:h-[calc(100%-160px)]"
          ].join(" ")}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.24, ease: "easeOut" }}
        >
          <motion.div
            className="relative h-full min-h-[66vh] w-full bg-surface-container backdrop-blur-glass border border-chat-secondary rounded-3xl shadow-glass-soft overflow-hidden flex flex-col"
            initial={{ y: 12 }}
            animate={{ y: 0 }}
            exit={{ y: 12 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex flex-col flex-1 min-h-0 relative overflow-hidden">
              <div
                className={`absolute inset-0 transition-transform duration-300 ease-in-out z-10 flex flex-col ${activeView === "menu" ? "translate-x-0" : "-translate-x-full"
                  }`}
                aria-hidden={activeView !== "menu"}
                inert={activeView !== "menu"}
              >
                <ChatActionMenu
                  onClose={onClose}
                  onOpenFriends={onOpenFriends}
                  onOpenAddFriends={() => {
                    setActiveView("addFriend");
                  }}
                  onOpenCreateConversation={(type = 2) => {
                    setInitialConversationType(type);
                    setActiveView("createConversation");
                  }}
                  incomingRequests={incomingRequests}
                  isIncomingLoading={isIncomingLoading}
                  incomingError={incomingError}
                  pendingContactActionIds={pendingContactActionIds}
                  onAcceptContactRequest={onAcceptContactRequest}
                />
              </div>

              <div
                className={`absolute inset-0 transition-transform duration-300 ease-in-out z-10 flex flex-col p-3 overflow-hidden text-primary ${activeView === "createConversation" ? "translate-x-0" : "translate-x-full"
                  }`}
                aria-hidden={activeView !== "createConversation"}
                inert={activeView !== "createConversation"}
              >
                <CreateConversationForm
                  key={initialConversationType}
                  onBack={() => setActiveView("menu")}
                  initialType={initialConversationType}
                  onSearchMembers={onSearchMembers}
                  onCreateConversation={onCreateConversation}
                />
              </div>

              <div
                className={`absolute inset-0 transition-transform duration-300 ease-in-out z-10 flex flex-col p-3 overflow-hidden text-primary ${activeView === "addFriend" ? "translate-x-0" : "translate-x-full"
                  }`}
                aria-hidden={activeView !== "addFriend"}
                inert={activeView !== "addFriend"}
              >
                <AddFriendPanel
                  isActive={activeView === "addFriend"}
                  onBack={() => setActiveView("menu")}
                  users={searchResults}
                  isSearching={isSearchingUsers}
                  error={searchError}
                  pendingActionIds={pendingContactActionIds}
                  onSearchUsers={onSearchUsers}
                  onSendContactRequest={onSendContactRequest}
                  onAcceptContactRequest={onAcceptContactRequest}
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
