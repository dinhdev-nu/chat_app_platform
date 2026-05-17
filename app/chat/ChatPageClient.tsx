"use client";

import {
  ChatHeader,
  ProjectSidebar,
  PromptInput,
  DotPattern,
  DisplayToggle,
} from "@/components/chat";
import React, { useState } from "react";
import "./chat.css";
import type { ConversationListItem } from "@/components/chat/conversation-data";
import type { ContactUserResponse } from "@/components/chat/contact-data";

interface ChatPageClientProps {
  conversationList?: ConversationListItem[];
  contactList?: ContactUserResponse[];
}

export default function ChatPageClient({ conversationList, contactList }: ChatPageClientProps) {
  const [isProjectSidebarOpen, setIsProjectSidebarOpen] = useState(false);

  return (
    <div
      dir="ltr"
      className="chat-root flex h-svh flex-col bg-[rgb(var(--backgroundColor-primary))] font-[var(--font-sans-theme),system-ui,sans-serif] text-[rgb(var(--textColor-primary))]"
    >
      <div
        className="text-foreground relative flex h-svh w-full bg-[rgb(var(--backgroundColor-primary))] text-[rgb(var(--textColor-primary))]"
      >
        <main className="relative flex flex-1 flex-col overflow-y-auto">
          {/* Dot Pattern Background */}
          <DotPattern />

          {/* Header */}
          <ChatHeader />

          {/* Main Content Area */}
          <div className="relative flex flex-1 md:overflow-hidden">
            {/* Left Sidebar */}
            <ProjectSidebar
              isMobileOpen={isProjectSidebarOpen}
              onClose={() => setIsProjectSidebarOpen(false)}
              conversations={conversationList}
              contacts={contactList}
            />

            {/* Center: Prompt Input */}
            <PromptInput
              isProjectSidebarOpen={isProjectSidebarOpen}
              onToggleProjects={() => setIsProjectSidebarOpen((current) => !current)}
            />
          </div>

          {/* Display Toggle */}
          <DisplayToggle />
        </main>

        {/* Toast Container */}
        <div
          data-rht-toaster=""
          className="fixed inset-4 z-[9999] pointer-events-none md:!top-8 md:!left-9 md:!bottom-20 md:!right-20"
        />
      </div>
    </div>
  );
}