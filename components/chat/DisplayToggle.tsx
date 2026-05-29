"use client";

import React, { useState, useEffect } from "react";
import { SunIcon, MoonIcon } from "@/components/ui/icons";

function getInitialIsDark() {
  if (typeof document === "undefined") return true;

  return document.documentElement.classList.contains("dark");
}

export default function DisplayToggle() {
  const [isDark, setIsDark] = useState(getInitialIsDark);

  useEffect(() => {
    const saved = localStorage.getItem("chat-theme");
    const dark = saved !== "light";
    document.documentElement.classList.toggle("dark", dark);
    document.documentElement.style.colorScheme = dark ? "dark" : "light";
  }, []);

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    document.documentElement.style.colorScheme = next ? "dark" : "light";
    localStorage.setItem("chat-theme", next ? "dark" : "light");
  };

  return (
    <div className="fixed bottom-[calc(env(safe-area-inset-bottom)+8.75rem)] right-4 z-40 md:bottom-4">
      <button
        type="button"
        tabIndex={0}
        suppressHydrationWarning
        aria-label={isDark ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối"}
        onClick={toggle}
        className="
          flex items-center justify-center size-8 rounded-full cursor-pointer select-none
          transition-colors duration-200 ease-out
          backdrop-blur-[40px]
          border border-[rgb(var(--borderColor-secondary)/.15)]
          bg-[rgb(var(--backgroundColor-surface-container)/.5)]
          text-[rgb(var(--textColor-primary))]
          hover:bg-[rgb(var(--backgroundColor-state-hover))]
        "
      >
        <span className="text-inherit">
          {isDark ? <SunIcon size={18} /> : <MoonIcon size={18} />}
        </span>
      </button>
    </div>
  );
}
