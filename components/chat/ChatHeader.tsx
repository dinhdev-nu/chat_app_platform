"use client";

import React, { useState } from "react";
import { DocsIcon, DiscordIcon, XIcon, GiftIcon, MoreDotsIcon } from "./icons";
import ShareProjectModal from "./ShareProjectModal";

export default function ChatHeader() {
  const [isShareOpen, setIsShareOpen] = useState(false);
  return (
    <>
      <header
        className="
        sticky top-0 z-30 flex w-full shrink-0 box-border
        justify-between items-center gap-3 md:gap-8
        pl-4 pr-2 md:px-6
        h-14 bg-transparent border-b border-transparent
      "
      >
        {/* Left: Logo */}
        <div className="flex w-full flex-row gap-5 items-center">
          <div role="link" tabIndex={0} className="select-none outline-none cursor-pointer">
            <img
              alt="Tên sản phẩm, Stitch (beta)"
              className="block dark:invert dark:opacity-90"
              src="/assets/home/ICA8c3ZnIH.svg"
            />
          </div>
        </div>

        {/* Right: Navigation icons */}
        <div className="flex gap-1 md:gap-2 items-center shrink-0">

          {/* Docs */}
          <span
            tabIndex={0}
            role="link"
            className="no-underline hidden md:flex"
          >
            <span
              className="
              cursor-pointer p-2 rounded-full select-none
              transition-colors flex items-center gap-1.5
              text-[rgb(var(--textColor-primary))]
              hover:bg-[rgb(var(--backgroundColor-state-hover))]
            "
              aria-label="Docs"
            >
              <span className="text-inherit"><DocsIcon /></span>
              <span className="font-medium text-[13px] leading-[150%] text-[rgb(var(--textColor-primary))]">
                Docs
              </span>
            </span>
          </span>

          {/* Discord */}
          <a
            href="https://discord.com/invite/googlelabs"
            target="_blank"
            rel="noopener noreferrer"
            className="no-underline hidden md:flex"
          >
            <span
              className="
              cursor-pointer p-2 rounded-full select-none
              transition-colors text-[rgb(var(--textColor-primary))]
              hover:bg-[rgb(var(--backgroundColor-state-hover))]
            "
              aria-label="Discord"
            >
              <span className="text-inherit"><DiscordIcon /></span>
            </span>
          </a>

          {/* X (Twitter) */}
          <a
            href="https://x.com/stitchbygoogle"
            target="_blank"
            rel="noopener noreferrer"
            className="no-underline hidden md:flex"
          >
            <span
              className="
              cursor-pointer p-2 rounded-full select-none
              transition-colors text-[rgb(var(--textColor-primary))]
              hover:bg-[rgb(var(--backgroundColor-state-hover))]
            "
              aria-label="X"
            >
              <span className="text-inherit"><XIcon /></span>
            </span>
          </a>

          {/* Gift / What's New */}
          <button
            type="button"
            tabIndex={0}
            aria-label="Tính năng mới"
            title="Có gì mới?"
            className="
            relative cursor-pointer p-2 rounded-full select-none
            transition-colors text-[rgb(var(--textColor-primary))]
            hover:bg-[rgb(var(--backgroundColor-state-hover))]
          "
          >
            <span className="text-inherit"><GiftIcon /></span>
          </button>

          {/* More menu */}
          <button
            type="button"
            tabIndex={0}
            className="
            cursor-pointer p-2 rounded-full select-none
            transition-colors text-[rgb(var(--textColor-primary))]
            hover:bg-[rgb(var(--backgroundColor-state-hover))]
          "
          >
            <MoreDotsIcon />
          </button>

          {/* Avatar */}
          <div className="relative flex">
            <button
              type="button"
              tabIndex={0}
              aria-label="Trình đơn tài khoản"
              className="rounded-full focus-ring"
              onClick={() => setIsShareOpen(true)}
            >
              <div
                className="
                flex items-center justify-center rounded-full
                text-lg font-medium select-none p-0
                font-sans
                text-white
                bg-[rgb(var(--backgroundColor-secondary)/.5)]
                border border-[rgb(var(--borderColor-wash)/.2)]
                h-8 w-8 min-w-[2rem]
              "
              >
                <img
                  alt="Profile image"
                  className="rounded-full h-8 w-8 min-w-[2rem]"
                  referrerPolicy="no-referrer"
                  src="/assets/home/iVBORw0KGg_3.png"
                />
              </div>
            </button>
          </div>

        </div>
      </header>
      <ShareProjectModal open={isShareOpen} onOpenChange={setIsShareOpen} />
    </>
  );
}