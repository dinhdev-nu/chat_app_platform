"use client";

import {
  ChatHeader,
  ProjectSidebar,
  DotPattern,
  DisplayToggle,
  ChatMain,
} from "@/components/chat";
import dynamic from "next/dynamic";
import React, { useCallback, useState } from "react";
import "./chat.css";
import type { ConversationListItem } from "@/components/chat/conversation-data";
import type { ContactUserResponse } from "@/components/chat/contact-data";

const Panel = dynamic(() => import("@/components/chat/Panel"), { ssr: false });

interface ChatPageClientProps {
  conversationList?: ConversationListItem[];
  contactList?: ContactUserResponse[];
}

export default function ChatPageClient({ conversationList, contactList }: ChatPageClientProps) {
  const [isProjectSidebarOpen, setIsProjectSidebarOpen] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [sidebarActiveTab, setSidebarActiveTab] = useState<"all" | "friends">("all");
  const [activeConv, setActiveConv] = useState<ConversationListItem | undefined>(undefined);

  const closeProjectSidebar = useCallback(() => {
    setIsProjectSidebarOpen(false);
  }, []);

  const openPanel = useCallback(() => {
    setIsPanelOpen(true);
  }, []);

  const closePanel = useCallback(() => {
    setIsPanelOpen(false);
  }, []);

  const openFriends = useCallback(() => {
    setIsProjectSidebarOpen(true);
    setSidebarActiveTab("friends");
    setIsPanelOpen(false);
  }, []);

  const toggleProjectSidebar = useCallback(() => {
    setIsProjectSidebarOpen((isOpen) => !isOpen);
  }, []);

  const handleActiveTabChange = useCallback((tab: "all" | "friends") => {
    setSidebarActiveTab(tab);
  }, []);

  const handleSelectConversation = useCallback((conversation: ConversationListItem) => {
    setActiveConv(conversation);
  }, []);

  return (
    <div
      dir="ltr"
      className="chat-root flex h-svh flex-col bg-[rgb(var(--backgroundColor-primary))] font-[var(--font-sans-theme),system-ui,sans-serif] text-[rgb(var(--textColor-primary))]"
    >
      <div
        className="text-foreground relative flex h-svh w-full bg-[rgb(var(--backgroundColor-primary))] text-[rgb(var(--textColor-primary))]"
      >
        <main className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
          {/* Dot Pattern Background */}
          <DotPattern />

          {/* Header */}
          <ChatHeader />

          {/* Main Content Area */}
          <div className="relative flex min-h-0 flex-1 overflow-hidden">
            {/* Left Sidebar */}
            <ProjectSidebar
              isMobileOpen={isProjectSidebarOpen}
              onClose={closeProjectSidebar}
              onOpenPanel={openPanel}
              activeTab={sidebarActiveTab}
              onActiveTabChange={handleActiveTabChange}
              conversations={conversationList}
              contacts={contactList}
              activeConversationId={activeConv?.id}
              onSelectConversation={handleSelectConversation}
            />

            {/* Center: Chat main */}
            <div className="min-h-0 flex-1 overflow-hidden">
              <ChatMain
                activeConv={activeConv}
                isProjectSidebarOpen={isProjectSidebarOpen}
                onToggleProjects={toggleProjectSidebar}
              />
            </div>
          </div>

          {/* Display Toggle */}
          <DisplayToggle />
        </main>

        {/* Panel (right side) */}
        <Panel
          isOpen={isPanelOpen}
          onClose={closePanel}
          onOpenFriends={openFriends}
          contacts={contactList}
        />

        {/* Toast Container */}
        <div
          data-rht-toaster=""
          className="fixed inset-4 z-[9999] pointer-events-none md:!top-8 md:!left-9 md:!bottom-20 md:!right-20"
        />
      </div>
    </div>
  );
}
