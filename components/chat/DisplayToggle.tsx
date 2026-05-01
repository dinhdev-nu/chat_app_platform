"use client";

import React from "react";
import { DisplayIcon } from "./icons";

export default function DisplayToggle() {
  return (
    <div className="fixed bottom-4 right-4 z-40 flex items-center gap-2">
      <div>
        <button
          type="button"
          tabIndex={0}
          aria-expanded={false}
          aria-haspopup="dialog"
          aria-label="Giao diện"
          className="flex items-center justify-center rounded-full select-none transition-colors"
          style={{
            width: "2rem",
            height: "2rem",
            backgroundColor: "rgb(var(--backgroundColor-surface-container) / .5)",
            backdropFilter: "blur(40px)",
            WebkitBackdropFilter: "blur(40px)",
            border: "1px solid rgb(var(--borderColor-secondary) / .15)",
            color: "rgb(var(--textColor-primary))",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.backgroundColor = "rgb(var(--backgroundColor-state-hover))";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.backgroundColor = "rgb(var(--backgroundColor-surface-container) / .5)";
          }}
        >
          <span className="text-inherit">
            <DisplayIcon />
          </span>
        </button>
      </div>
    </div>
  );
}
