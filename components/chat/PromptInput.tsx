"use client";

import React, { useState } from "react";
import {
  PlusIcon,
  PaletteIcon,
  MobileDeviceIcon,
  DesktopDeviceIcon,
  SparkleIcon,
  ChevronDownIcon,
  LiveModeIcon,
  ArrowUpIcon,
} from "./icons";
import { ConversationListItem } from "./conversation-data";

const SUGGESTION_PROMPTS = [
  "Tôi là (tên của bạn). Rất vui được gặp bạn.",
  "Chào ngày mới! Ngày hôm nay của bạn thế nào rồi?",
  "Bạn có rảnh không?",
  "Bạn có thể giúp mình một chút được không?",
  "Mình muốn giới thiệu về bản thân — bạn có muốn nghe không?",
  "Bạn đang làm gì đấy?",
];

interface PromptInputProps {
  conv?: ConversationListItem;
}

export default function PromptInput({ conv }: PromptInputProps) {
  const [deviceMode, setDeviceMode] = useState<"app" | "web">("app");
  const [promptText, setPromptText] = useState("");

  return (
    <section
      id="create-scroll-container"
      className="relative hide-scrollbar flex max-w-full flex-1 flex-col items-center overflow-y-auto"
    >
      {/* Outer wrapper */}
      <div
        className="flex min-h-full w-full flex-1 flex-col items-center justify-center bg-transparent pb-8 pt-20 md:py-12"
      >
        <div
          className="flex w-full flex-col items-center px-2 md:px-4 [max-width:calc(100vw-16px)]"
        >
          <div className="w-full flex flex-col items-center gap-10 max-w-[720px]">

            {/* Main Content */}
            <div className="w-full flex flex-col gap-6">

              {/* Heading */}
              <h1
                className="
                  text-left font-normal leading-none
                  font-sans
                  text-[rgb(var(--textColor-primary))]
                  text-[clamp(2.25rem,6vw,4rem)] 
                "
              >
                {conv ? `Cùng trò chuyện với ${conv.name}` : "Hãy bắt đầu tạo một design"}
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
                            aria-label="Mô tả ý tưởng thiết kế"
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
                              aria-label="Thêm nội dung đính kèm"
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
                              aria-label="Mở bảng màu"
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
                              aria-label="Chọn mô hình"
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

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
