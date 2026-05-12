"use client";

import React, { useState, useEffect } from "react";
import { SunIcon, MoonIcon } from "./icons";

export default function DisplayToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("chat-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const dark = saved === "dark" || (!saved && prefersDark);
    setIsDark(dark);
    document.documentElement.classList.toggle("dark", dark);
  }, []);

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("chat-theme", next ? "dark" : "light");
  };

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <button
        type="button"
        tabIndex={0}
        aria-label={isDark ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối"}
        onClick={toggle}
        className="
          flex items-center justify-center w-8 h-8 rounded-full cursor-pointer select-none
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
