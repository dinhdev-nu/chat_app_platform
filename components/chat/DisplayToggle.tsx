"use client";

import React, { useState } from "react";
import { useTheme } from "next-themes";
import { SunIcon, MoonIcon, MonitorCheckIcon } from "./icons";

export default function DisplayToggle() {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const themes = [
    { value: "light", label: "Sáng", icon: SunIcon },
    { value: "system", label: "Hệ thống", icon: MonitorCheckIcon },
    { value: "dark", label: "Tối", icon: MoonIcon },
  ] as const;

  return (
    <div className="fixed bottom-4 right-4 z-40">
      {/* Menu Container */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <button
            className="fixed inset-0 cursor-default"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          
          {/* Menu */}
          <div className="absolute bottom-full right-0 mb-2 flex flex-col gap-1 rounded-2xl p-3 bg-[rgb(var(--backgroundColor-surface-container)/.5)] backdrop-blur-[40px] border border-[rgb(var(--borderColor-secondary)/.15)]">
            {themes.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => {
                  setTheme(value);
                  setIsOpen(false);
                }}
                className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
                style={{
                  backgroundColor: theme === value ? "rgb(var(--backgroundColor-state-active))" : "transparent",
                  color: "rgb(var(--textColor-primary))",
                }}
                onMouseEnter={(e) => {
                  if (theme !== value) {
                    e.currentTarget.style.backgroundColor = "rgb(var(--backgroundColor-state-hover))";
                  }
                }}
                onMouseLeave={(e) => {
                  if (theme !== value) {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }
                }}
              >
                <span className="text-[16px]"><Icon size={16} /></span>
                <span className="flex-1 text-left">{label}</span>
                {theme === value && (
                  <span className="text-[16px]">✓</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Toggle Button */}
      <button
        type="button"
        tabIndex={0}
        aria-label="Giao diện"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        className="chat-display-toggle-btn"
      >
        <span className="text-inherit">
          {theme === "light" ? (
            <SunIcon size={18} />
          ) : theme === "dark" ? (
            <MoonIcon size={18} />
          ) : (
            <MonitorCheckIcon size={18} />
          )}
        </span>
      </button>
    </div>
  );
}
