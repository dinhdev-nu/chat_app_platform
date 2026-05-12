"use client";

import React, { useState } from "react";
import {
  PlusIcon,
  PaletteIcon,
  CloseIcon,
  MobileDeviceIcon,
  DesktopDeviceIcon,
  SparkleIcon,
  ChevronDownIcon,
  LiveModeIcon,
  ArrowUpIcon,
  ListBulletIcon,
} from "./icons";

const SUGGESTION_PROMPTS = [
  "Mobile-responsive ecommerce home page for a bird watching gear store",
  "Quiz page in a language learning app with a progress bar at the top. The title challenges you to match a Spanish word with the correct answer, offering four possible options.",
  "A mobile scavenger hunt app for exploring a new city, with clues, a map, and a photo challenge checklist",
];

interface PromptInputProps {
  isProjectSidebarOpen?: boolean;
  onToggleProjects?: () => void;
}

export default function PromptInput({
  isProjectSidebarOpen = false,
  onToggleProjects,
}: PromptInputProps) {
  const [deviceMode, setDeviceMode] = useState<"app" | "web">("app");
  const [promptText, setPromptText] = useState("");

  return (
    <section
      id="create-scroll-container"
      className="relative hide-scrollbar flex max-w-full flex-1 flex-col items-center md:overflow-y-auto"
    >
      {/* Mobile menu button */}
      <button
        type="button"
        className="
          fixed right-2 top-16 z-20 md:hidden
          flex items-center justify-center rounded-xl
          h-10 w-10
          bg-[rgb(var(--backgroundColor-surface-container)/.5)]
          backdrop-blur-[40px]
          border border-[rgb(var(--borderColor-secondary)/.15)]
          text-[rgb(var(--textColor-primary))]
        "
        aria-label="Open menu"
        aria-expanded={isProjectSidebarOpen}
        aria-controls="recent-projects-panel"
        onClick={onToggleProjects}
      >
        <span className="text-inherit">
          <ListBulletIcon />
        </span>
      </button>

      {/* Outer wrapper */}
      <div
        className="flex w-full shrink-0 flex-col items-center pb-16 md:pb-32 bg-transparent [height:calc(100%-3.5rem)]"
      >
        <div
          className="flex w-full flex-1 flex-col items-center justify-center px-2 md:px-4 [max-width:calc(100vw-16px)]"
        >
          <div className="w-full flex flex-col items-center gap-10 max-w-[720px]">

            {/* Announcement Banner */}
            <div
              className="
                flex justify-center items-center gap-2 z-10
                mx-4 md:mx-2 px-3 md:px-2 lg:px-8 py-2
                rounded-md self-center
                bg-[rgb(var(--backgroundColor-wash))]
                border border-[rgb(var(--borderColor-wash)/.1)]
              "
            >
              <div
                className="flex flex-wrap justify-center items-center gap-2 group text-xs md:text-sm [font-family:'Google_Sans',sans-serif]"
              >
                <div className="inline text-[rgb(var(--textColor-primary))] font-medium">
                  <p>
                    <a
                      href="https://x.com/stitchbygoogle/status/2034332847893574080"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium underline hover:text-[rgb(var(--textColor-secondary))]"
                    >
                      Meet the new Stitch
                    </a>
                  </p>
                </div>
              </div>
              <button
                className="
                  flex items-center justify-center gap-2 rounded-lg p-1 h-6
                  bg-transparent border-0
                  text-[rgb(var(--textColor-primary))]
                "
                tabIndex={0}
              >
                <span className="w-4 h-4 shrink-0 text-[rgb(var(--textColor-primary))]">
                  <CloseIcon size={16} />
                </span>
              </button>
            </div>

            {/* Main Content */}
            <div className="w-full flex flex-col gap-6">

              {/* Heading */}
              <h1
                className="
                  text-left font-normal leading-none
                  [font-family:'Google_Sans',sans-serif]
                  text-[rgb(var(--textColor-primary))]
                  text-[clamp(2.25rem,5vw,72px)]
                "
              >
                Chào mừng bạn đến với Stitch..
              </h1>

              {/* Suggestion Pills */}
              <div
                className="
                  flex flex-nowrap justify-start gap-2 overflow-x-auto
                  hide-scrollbar animate-slide-up select-none
                  cursor-grab active:cursor-grabbing
                  [--slide-up-amount:8px]
                  [mask-image:linear-gradient(to_right,black_calc(100%-24px),transparent)]
                  [-webkit-mask-image:linear-gradient(to_right,black_calc(100%-24px),transparent)]
                "
              >
                {SUGGESTION_PROMPTS.map((prompt, i) => (
                  <div className="shrink-0" key={i}>
                    <button
                      type="button"
                      className="
                        inline-flex items-center justify-center
                        py-1.5 px-3 rounded-full h-8 max-w-[280px]
                        text-[13px] font-medium leading-[150%]
                        transition-all duration-150 ease-out
                        bg-[rgb(var(--backgroundColor-state-enabled)/.575)]
                        backdrop-blur-[40px]
                        border border-[rgb(var(--borderColor-secondary)/.15)]
                        shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]
                        text-[rgb(var(--textColor-primary))]
                      "
                    >
                      <span className="truncate min-w-0 whitespace-nowrap">
                        {prompt}
                      </span>
                    </button>
                  </div>
                ))}
              </div>

              {/* Prompt Box */}
              <div className="flex w-full self-start md:border-none md:justify-center transition-all duration-300 rounded-3xl">
                <div className="w-full">
                  <div
                    role="presentation"
                    className="
                      flex w-full justify-between relative flex-col p-4
                      transition-all duration-200 rounded-3xl min-h-[220px]
                      bg-[rgb(var(--backgroundColor-surface-container)/.5)]
                      backdrop-blur-[40px]
                      text-[rgb(var(--textColor-primary))]
                      border border-[rgb(var(--borderColor-secondary)/.15)]
                    "
                  >
                    {/* Attachments area */}
                    <div className="flex w-full flex-wrap gap-2 overflow-x-scroll transition-all ease-in-out duration-300 [scrollbar-width:none]" />

                    {/* Editor area */}
                    <div className="relative flex flex-1 gap-2 create-tiptap mb-2 pt-1">
                      <div className="relative w-full overflow-auto">
                        <div className="tiptap-editor">
                          <div
                            contentEditable
                            role="textbox"
                            translate="no"
                            className="tiptap ProseMirror"
                            tabIndex={0}
                            suppressContentEditableWarning
                            onInput={(e) => setPromptText((e.target as HTMLDivElement).textContent || "")}
                          >
                            <p
                              data-placeholder="Chúng ta nên thiết kế ứng dụng gốc nào dành cho thiết bị di động?"
                              className={promptText === "" ? "is-empty is-editor-empty" : ""}
                            >
                              <br className="ProseMirror-trailingBreak" />
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom toolbar */}
                    <div>
                      {/* Hidden file input */}
                      <input
                        accept="image/png,.png,image/jpeg,.jpg,.jpeg,image/gif,.gif,image/webp,.webp,text/plain,.txt,text/markdown,.md,.markdown,text/html,.html,.htm,text/javascript,.js,.jsx,.ts,.tsx,application/json,.json,text/css,.css"
                        multiple
                        tabIndex={-1}
                        type="file"
                        className="
                          absolute border-0 overflow-hidden p-0 whitespace-nowrap
                          w-px h-px m-[-1px]
                          [clip:rect(0,0,0,0)] [clip-path:inset(50%)]
                        "
                      />

                      <div className="flex gap-2 flex-wrap items-center justify-between">
                        <div className="flex items-center gap-2 flex-wrap">

                          {/* Add button */}
                          <div className="m-auto">
                            <button
                              type="button"
                              tabIndex={0}
                              className="
                                flex items-center justify-center rounded-full p-2
                                w-9 h-9 outline-none
                                transition-all duration-150 ease-out
                                text-inherit
                                hover:bg-[rgb(var(--backgroundColor-state-hover))]
                              "
                            >
                              <PlusIcon />
                            </button>
                          </div>

                          {/* Device Type Toggle */}
                          <div role="radiogroup" className="relative flex gap-1 p-0.5 rounded-[32px]">
                            {/* App/Mobile */}
                            <button
                              type="button"
                              role="radio"
                              aria-checked={deviceMode === "app"}
                              className={`
                                relative flex-1 px-2 py-2 rounded-[32px]
                                text-sm font-medium cursor-pointer transition-colors z-10 text-center
                                ${deviceMode === "app"
                                  ? "text-[rgb(var(--textColor-primary))]"
                                  : "text-[rgb(var(--textColor-secondary))] hover:text-[rgb(var(--textColor-primary))] hover:bg-[rgb(var(--backgroundColor-state-hover))]"}
                              `}
                              tabIndex={0}
                              onClick={() => setDeviceMode("app")}
                            >
                              {deviceMode === "app" && (
                                <div className="absolute inset-0 z-0 rounded-[32px] bg-[rgb(var(--backgroundColor-state-active))]" />
                              )}
                              <span className="relative z-10 whitespace-nowrap flex items-center gap-1.5">
                                <span className="text-inherit"><MobileDeviceIcon size={16} /></span>
                                Ứng dụng
                              </span>
                            </button>

                            {/* Web */}
                            <button
                              type="button"
                              role="radio"
                              aria-checked={deviceMode === "web"}
                              className={`
                                relative flex-1 px-2 py-2 rounded-[32px]
                                text-sm font-medium cursor-pointer transition-colors z-10 text-center
                                ${deviceMode === "web"
                                  ? "text-[rgb(var(--textColor-primary))]"
                                  : "text-[rgb(var(--textColor-secondary))] hover:text-[rgb(var(--textColor-primary))] hover:bg-[rgb(var(--backgroundColor-state-hover))]"}
                              `}
                              tabIndex={0}
                              onClick={() => setDeviceMode("web")}
                            >
                              {deviceMode === "web" && (
                                <div className="absolute inset-0 z-0 rounded-[32px] bg-[rgb(var(--backgroundColor-state-active))]" />
                              )}
                              <span className="relative z-10 flex items-center gap-1.5">
                                <span className="text-inherit"><DesktopDeviceIcon size={16} /></span>
                                Web
                              </span>
                            </button>
                          </div>
                        </div>

                        {/* Right side controls */}
                        <div className="relative">
                          <div className="flex items-center gap-2 justify-end md:justify-normal w-full md:w-auto">

                            {/* Palette button */}
                            <button
                              type="button"
                              tabIndex={0}
                              className="
                                flex items-center justify-center rounded-full aspect-square h-9
                                transition-colors cursor-pointer shrink-0 outline-none
                                bg-transparent text-[rgb(var(--textColor-primary))]
                                hover:bg-[rgb(var(--backgroundColor-state-hover))]
                              "
                            >
                              <PaletteIcon />
                            </button>

                            {/* Model Selector */}
                            <button
                              type="button"
                              tabIndex={0}
                              className="
                                relative overflow-visible flex items-center justify-center gap-1.5
                                px-2 py-1.5 rounded-full h-9
                                text-[13px] font-medium leading-[150%]
                                transition-all duration-75 ease-out cursor-pointer
                                text-[rgb(var(--textColor-primary))]
                                bg-[rgb(var(--backgroundColor-state-enabled)/.575)]
                                shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]
                                backdrop-blur-[40px]
                                hover:bg-[rgb(var(--backgroundColor-state-hover))]
                              "
                            >
                              <span className="rotate-[360deg]">
                                <SparkleIcon size={20} className="text-primary" />
                              </span>
                              <span className="whitespace-nowrap">3 Flash</span>
                              <ChevronDownIcon />
                            </button>

                            {/* Live Mode */}
                            <button
                              className="
                                flex items-center justify-center aspect-square rounded-full w-9 h-9
                                transition-all duration-150 ease-out
                                bg-transparent text-[rgb(var(--textColor-primary))]
                                hover:bg-[rgb(var(--backgroundColor-state-hover))]
                                hover:scale-105
                              "
                              aria-label="Start Live Mode (Preview)"
                            >
                              <LiveModeIcon />
                            </button>

                            {/* Send/Submit */}
                            <button
                              className="
                                flex items-center justify-center aspect-square rounded-full w-9 h-9
                                transition-all duration-150 ease-out cursor-not-allowed
                                text-[rgb(var(--textColor-disabled)/.5)]
                              "
                              aria-label="Tạo bản thiết kế"
                              aria-disabled
                              disabled
                            >
                              <ArrowUpIcon />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Design.md button */}
              <div className="flex flex-col items-center w-full gap-3 animate-fade-in">
                <input accept=".md,.txt,.markdown" className="hidden" type="file" />
                <button
                  id="start-with-design-md-trigger"
                  className="
                    flex items-center gap-2 px-5 py-3 rounded-full
                    text-[14px] font-medium leading-[150%]
                    transition-colors duration-200
                    bg-[rgb(var(--backgroundColor-surface-container)/.5)]
                    border border-[rgb(var(--borderColor-secondary)/.15)]
                    text-[rgb(var(--textColor-primary))]
                    hover:bg-[rgb(var(--backgroundColor-state-hover))]
                    hover:border-[rgb(var(--borderColor-primary)/.3)]
                  "
                >
                  <span className="shrink-0 text-[rgb(var(--textColor-accent))]">
                    <PaletteIcon />
                  </span>
                  <span>Start with a DESIGN.md</span>
                  <span className="shrink-0 ml-1 text-[rgb(var(--textColor-secondary))]">
                    <ChevronDownIcon size={12} />
                  </span>
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}