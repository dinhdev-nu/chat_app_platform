"use client";

import React, { useEffect, useState } from "react";
import DesignListContent from "./DesignListContent";
import ThemeSettingsContent from "./ThemeSettingsContent";
import ListUserContent from "./ListUserContent";

interface PanelProps {
  isOpen?: boolean;
  onClose?: () => void;
  onOpenFriends?: () => void;
}

export default function Panel({ isOpen = false, onClose, onOpenFriends }: PanelProps) {
  const [mounted, setMounted] = useState(false);
  const [activeView, setActiveView] = useState<"list" | "details" | "friends">("list");
  const [initialThemeType, setInitialThemeType] = useState<2 | 3>(2);

  // Trigger entry animation after mount
  useEffect(() => {
    if (isOpen) {
      const raf = requestAnimationFrame(() => setMounted(true));
      return () => cancelAnimationFrame(raf);
    } else {
      setMounted(false);
      setTimeout(() => setActiveView("list"), 300);
    }
  }, [isOpen]);

  if (!isOpen && !mounted) return null;

  return (
    <>
      {/* Mobile Backdrop */}
      <div
        className={`md:hidden fixed inset-0 z-[50] bg-black/40 transition-opacity ${mounted ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
      />

      <div
        className={[
          "z-[60] pointer-events-auto flex flex-col",
          // Mobile: centered modal
          "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] h-[80vh]",
          // Desktop: absolute positioned next to sidebar
          "md:absolute md:left-[412px] md:-translate-x-0 md:w-[280px] md:h-[calc(100%-160px)]"
        ].join(" ")}
      >
        {/* ── Main panel card ──────────────────────────────────────────────── */}
        <div
          className={[
            "relative h-full min-h-[66vh] w-full bg-surface-container backdrop-blur-glass",
            "border border-chat-secondary rounded-3xl shadow-glass-soft overflow-hidden flex flex-col",
            // Entry animation from chat.css
            mounted ? "animate-slide-up" : "opacity-0",
          ].join(" ")}
          style={
            mounted
              ? { "--slide-up-amount": "12px" } as React.CSSProperties
              : { opacity: 0 }
          }
        >
          {/* Resize handle */}
          <div
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize panel"
            className="absolute left-0 top-0 bottom-0 w-1.5 cursor-col-resize z-30 hover:bg-state-hover active:bg-state-pressed transition-colors"
          />

          {/* Content wrapper */}
          <div className="flex flex-col flex-1 min-h-0 relative overflow-hidden" style={{ opacity: 1 }}>
            {/* Design List View */}
            <div
              className={`absolute inset-0 transition-transform duration-300 ease-in-out z-10 flex flex-col ${activeView === "list" ? "translate-x-0" : "-translate-x-full"
                }`}
            >
              <DesignListContent
                onClose={onClose}
                onSelectPreset={() => setActiveView("details")}
                onOpenFriends={onOpenFriends}
                onOpenAddFriends={() => {
                  setActiveView("friends");
                }}
                onOpenTheme={(type = 2) => {
                  setInitialThemeType(type);
                  setActiveView("details");
                }}
              />
            </div>

            {/* Theme Settings View */}
            <div
              className={`absolute inset-0 transition-transform duration-300 ease-in-out z-10 flex flex-col p-3 overflow-hidden text-primary ${activeView === "details" ? "translate-x-0" : "translate-x-full"
                }`}
            >
              <ThemeSettingsContent
                onBack={() => setActiveView("list")}
                initialType={initialThemeType}
              />
            </div>

            {/* Friends / Search User View */}
            <div
              className={`absolute inset-0 transition-transform duration-300 ease-in-out z-10 flex flex-col p-3 overflow-hidden text-primary ${activeView === "friends" ? "translate-x-0" : "translate-x-full"
                }`}
            >
              <ListUserContent
                onBack={() => setActiveView("list")}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
