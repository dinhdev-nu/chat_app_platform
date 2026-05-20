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
        <div className="flex w-full flex-row gap-5 items-center">
          <a href="/" className="select-none cursor-pointer no-underline focus-ring rounded-md">
            <img
              alt="Tên sản phẩm, Stitch (beta)"
              className="block dark:invert dark:opacity-90"
              src="/assets/home/ICA8c3ZnIH.svg"
            />
          </a>
        </div>

        <div className="flex gap-1 md:gap-2 items-center shrink-0">
          <button type="button" aria-label="Docs" className="no-underline hidden md:flex">
            <span
              className="
              cursor-pointer p-2 rounded-full select-none
              transition-colors flex items-center gap-1.5
              text-[rgb(var(--textColor-primary))]
              hover:bg-[rgb(var(--backgroundColor-state-hover))]
            "
            >
              <span className="text-inherit" aria-hidden="true">
                <DocsIcon />
              </span>
              <span className="font-medium text-[13px] leading-[150%] text-[rgb(var(--textColor-primary))]">
                Docs
              </span>
            </span>
          </button>

          <a
            href="https://discord.com/invite/googlelabs"
            target="_blank"
            rel="noopener noreferrer"
            className="no-underline hidden md:flex"
            aria-label="Discord"
          >
            <span
              className="
              cursor-pointer p-2 rounded-full select-none
              transition-colors text-[rgb(var(--textColor-primary))]
              hover:bg-[rgb(var(--backgroundColor-state-hover))]
            "
            >
              <span className="text-inherit" aria-hidden="true">
                <DiscordIcon />
              </span>
            </span>
          </a>

          <a
            href="https://x.com/stitchbygoogle"
            target="_blank"
            rel="noopener noreferrer"
            className="no-underline hidden md:flex"
            aria-label="X"
          >
            <span
              className="
              cursor-pointer p-2 rounded-full select-none
              transition-colors text-[rgb(var(--textColor-primary))]
              hover:bg-[rgb(var(--backgroundColor-state-hover))]
            "
            >
              <span className="text-inherit" aria-hidden="true">
                <XIcon />
              </span>
            </span>
          </a>

          <button
            type="button"
            aria-label="Tính năng mới"
            title="Có gì mới?"
            className="
            relative cursor-pointer p-2 rounded-full select-none
            transition-colors text-[rgb(var(--textColor-primary))]
            hover:bg-[rgb(var(--backgroundColor-state-hover))]
          "
          >
            <span className="text-inherit" aria-hidden="true">
              <GiftIcon />
            </span>
          </button>

          <button
            type="button"
            aria-label="Mở thêm tùy chọn"
            title="Thêm tùy chọn"
            className="
            cursor-pointer p-2 rounded-full select-none
            transition-colors text-[rgb(var(--textColor-primary))]
            hover:bg-[rgb(var(--backgroundColor-state-hover))]
          "
          >
            <span aria-hidden="true">
              <MoreDotsIcon />
            </span>
          </button>

          <div className="relative flex">
            <button
              type="button"
              aria-label="Trình đơn tài khoản"
              className="rounded-full focus-ring"
              onClick={() => setIsShareOpen(true)}
            >
              <div
                className="
                flex items-center justify-center rounded-full
                text-lg font-medium select-none p-0
                font-sans text-white
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
