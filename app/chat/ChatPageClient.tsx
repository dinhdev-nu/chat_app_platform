"use client";

import {
  ChatHeader,
  ProjectSidebar,
  PromptInput,
  DotPattern,
  DisplayToggle,
} from "@/components/chat";
import "./chat.css";

export default function ChatPageClient() {
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
            <ProjectSidebar />

            {/* Center: Prompt Input */}
            <PromptInput />
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