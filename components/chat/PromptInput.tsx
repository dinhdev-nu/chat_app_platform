"use client";

import ChatInput from "./ChatInput";
import type { ConversationListItem } from "./conversation-data";

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
  return (
    <section
      id="create-scroll-container"
      className="relative hide-scrollbar flex max-w-full flex-1 flex-col items-center overflow-y-auto"
    >
      <div className="flex min-h-full w-full flex-1 flex-col items-center justify-center bg-transparent pb-8 pt-20 md:py-12">
        <div className="flex w-full flex-col items-center px-2 md:px-4 [max-width:calc(100vw-16px)]">
          <div className="w-full flex flex-col items-center gap-10 max-w-[720px]">
            <div className="w-full flex flex-col gap-6">
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
                      <span className="truncate min-w-0 whitespace-nowrap">{prompt}</span>
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex w-full self-start justify-center md:border-none transition-all duration-300 rounded-3xl">
                <ChatInput />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
