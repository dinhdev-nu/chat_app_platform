"use client";

import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, KeyboardEvent } from "react";

import IconSelector from "./IconSelector";
import ModelSelector from "./ModelSelector";
import {
  ArrowUpIcon,
  ChevronDownIcon,
  LayoutToolIcon,
  PaletteIcon,
  PlusIcon,
  SlashIcon,
  VoiceSparkleIcon,
} from "@/components/ui/icons";

const FILE_ACCEPT =
  "image/png,.png,image/jpeg,.jpg,.jpeg,image/gif,.gif,image/webp,.webp,image/heic,.heic,image/heif,.heif,text/plain,.txt,text/markdown,.md,.markdown,text/html,.html,.htm,text/javascript,.js,.jsx,.ts,.tsx,application/json,.json,text/css,.css,text/x-scss,.scss,text/x-sass,.sass,text/less,.less,text/x-vue,.vue,text/x-svelte,.svelte,text/x-astro,.astro,text/mdx,.mdx,image/svg+xml,.svg,text/csv,.csv,text/vnd.mermaid,.mmd,.mermaid,application/x-figma,.fig";

const hiddenInputClass =
  "absolute h-px w-px overflow-hidden whitespace-nowrap border-0 p-0 [clip:rect(0px,0px,0px,0px)] [clip-path:inset(50%)]";

const iconButtonClass =
  "outline-none select-none focus-ring disabled:opacity-50 disabled:cursor-not-allowed p-2 flex items-center justify-center rounded-full size-7 bg-transparent hover:bg-[rgb(var(--backgroundColor-state-hover))] active:bg-[rgb(var(--backgroundColor-state-pressed))] data-[popup-open]:bg-[rgb(var(--backgroundColor-state-hover))] transition-colors cursor-pointer shrink-0";

const MODEL_LABEL_MAP: Record<string, string> = {
  "3-flash": "Nhanh",
  code: "Mã hóa",
};

interface ChatInputProps {
  ariaLabel?: string;
  placeholder?: string;
  sendLabel?: string;
  suggestedText?: string;
  suggestedTextKey?: number;
  isSending?: boolean;
  onSend?: (text: string) => void | Promise<void>;
  onTyping?: () => void;
}

function focusEditorEnd(editor: HTMLTextAreaElement) {
  editor.focus();
  const end = editor.value.length;
  editor.setSelectionRange(end, end);
}

export default function ChatInput({
  ariaLabel = "Bạn muốn thay đổi hoặc tạo nội dung gì?",
  placeholder = "Bạn muốn thay đổi hoặc tạo nội dung gì?",
  sendLabel = "Tạo",
  suggestedText,
  suggestedTextKey,
  isSending = false,
  onSend,
  onTyping,
}: ChatInputProps) {
  const paletteButtonRef = useRef<HTMLButtonElement>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const [inputText, setInputText] = useState("");
  const [isIconSelectorOpen, setIsIconSelectorOpen] = useState(false);

  const modelButtonRef = useRef<HTMLButtonElement>(null);
  const [isModelSelectorOpen, setIsModelSelectorOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState("3-flash");

  const trimmedText = inputText.trim();
  const canSend = Boolean(onSend && trimmedText && !isSending);

  useEffect(() => {
    if (suggestedTextKey === undefined || suggestedText === undefined) return;

    const editor = editorRef.current;
    if (editor) editor.value = suggestedText;

    const timeoutId = window.setTimeout(() => {
      setInputText(suggestedText);
      if (editorRef.current) focusEditorEnd(editorRef.current);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [suggestedText, suggestedTextKey]);

  const handleEditorInput = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const nextText = event.currentTarget.value;

    setInputText(nextText);
    if (nextText.trim()) onTyping?.();
  };

  const handleSend = () => {
    if (!canSend) return;
    void onSend?.(trimmedText);
    setInputText("");
  };

  const handleEditorKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (onSend && event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const handleSelectIcon = (iconText: string) => {
    const nextText = `${inputText}${iconText}`;
    const editor = editorRef.current;

    setInputText(nextText);
    setIsIconSelectorOpen(false);

    if (!editor) return;

    editor.value = nextText;
    focusEditorEnd(editor);
  };

  return (
    <div className="relative z-[1] flex h-[101px] w-full max-w-[720px] flex-col justify-end overflow-hidden rounded-[20px] cursor-text bg-surface-container backdrop-blur-glass text-primary border border-secondary shadow-glass-soft outline-none">
      <div>
        <div>
          <div
            role="presentation"
            className="relative flex flex-col px-4 pt-3 text-primary text-start text-sm leading-[1.6] focus:outline-none focus-visible:outline-2 transition-all duration-200 pb-3"
          >
            {/* Attachment chips row (empty placeholder) */}
            <div className="flex w-full flex-nowrap gap-2 overflow-x-scroll no-scrollbar transition-all ease-in-out duration-300" />

            {/* Text editor */}
            <div className="chat-tiptap-v3">
              <div className="relative w-full overflow-auto">
                <div className="tiptap-editor">
                  <textarea
                    ref={editorRef}
                    translate="no"
                    className="tiptap ProseMirror min-h-[24px] w-full resize-none bg-transparent"
                    aria-label={ariaLabel}
                    placeholder={placeholder}
                    value={inputText}
                    rows={1}
                    onChange={handleEditorInput}
                    onKeyDown={handleEditorKeyDown}
                  />
                </div>
              </div>
            </div>

            {/* Toolbar row */}
            <div className="flex items-center gap-2 flex-shrink-0 pt-5">
              {/* Hidden file input */}
              <input
                accept={FILE_ACCEPT}
                multiple
                tabIndex={-1}
                type="file"
                aria-label="Tep dinh kem"
                className={hiddenInputClass}
              />

              {/* Add attachment — not yet wired up */}
              <div data-base-ui-inert="">
                <button
                  type="button"
                  tabIndex={0}
                  aria-haspopup="menu"
                  aria-expanded={false}
                  aria-label="Thêm"
                  className={iconButtonClass}
                  style={{ transform: "none" }}
                >
                  <PlusIcon />
                </button>
              </div>

              {/* Slash commands — not yet wired up */}
              <div data-base-ui-inert="">
                <button
                  type="button"
                  tabIndex={0}
                  aria-haspopup="menu"
                  aria-expanded={false}
                  aria-label="Lệnh nhanh"
                  className={iconButtonClass}
                  style={{ transform: "none" }}
                >
                  <SlashIcon />
                </button>
              </div>

              {/* Spacer */}
              <div className="flex-1" />

              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Layout tool — not yet wired up */}
                <div data-base-ui-inert="">
                  <button
                    type="button"
                    className="items-center justify-center py-1.5 pl-2 pr-3 gap-2 rounded-full text-subtitle-sm bg-transparent border-transparent shadow-none text-primary flex h-7 focus-ring"
                    aria-label="Bố cục"
                  >
                    <span className="cursor-ns-resize">
                      <LayoutToolIcon />
                    </span>
                  </button>
                </div>

                {/* Palette / icon picker */}
                <button
                  ref={paletteButtonRef}
                  id="chat-input-palette-trigger"
                  type="button"
                  tabIndex={0}
                  aria-haspopup="menu"
                  aria-expanded={isIconSelectorOpen}
                  aria-controls="chat-input-palette-menu"
                  aria-label="Màu sắc"
                  className="outline-none select-none focus-ring disabled:opacity-50 disabled:cursor-not-allowed p-2 flex items-center justify-center rounded-full size-7 bg-transparent hover:bg-[rgb(var(--backgroundColor-state-hover))] active:bg-[rgb(var(--backgroundColor-state-pressed))] data-[popup-open]:bg-[rgb(var(--backgroundColor-state-hover))] transition-colors cursor-pointer shrink-0"
                  data-popup-open={isIconSelectorOpen ? "" : undefined}
                  data-pressed={isIconSelectorOpen ? "" : undefined}
                  style={{ transform: "none" }}
                  onClick={() => setIsIconSelectorOpen((open) => !open)}
                >
                  <span className="text-primary">
                    <PaletteIcon />
                  </span>
                </button>

                {/* Model selector trigger — FIX: no data-base-ui-inert on interactive button */}
                <button
                  ref={modelButtonRef}
                  id="chat-input-model-trigger"
                  type="button"
                  tabIndex={0}
                  aria-haspopup="menu"
                  aria-expanded={isModelSelectorOpen}
                  aria-controls="chat-input-model-menu"
                  aria-label="Chọn mô hình"
                  className="flex items-center justify-center outline-none select-none cursor-pointer focus-ring hover:bg-[rgb(var(--backgroundColor-state-hover))] active:bg-[rgb(var(--backgroundColor-state-pressed))] disabled:opacity-50 disabled:cursor-not-allowed rounded-full gap-1.5 px-2.5 py-1.5 text-subtitle-sm text-primary bg-state-enabled shadow-sm relative overflow-visible backdrop-blur-glass data-[popup-open]:bg-[rgb(var(--backgroundColor-state-pressed))] data-[popup-open]:border-transparent h-7"
                  data-popup-open={isModelSelectorOpen ? "" : undefined}
                  style={{ transform: "none" }}
                  onClick={() => setIsModelSelectorOpen((open) => !open)}
                >
                  <span className="whitespace-nowrap">{MODEL_LABEL_MAP[selectedModel]}</span>
                  <ChevronDownIcon />
                </button>

                {/* Voice input */}
                <button
                  type="button"
                  className="size-8 flex items-center justify-center rounded-full transition-colors focus-ring active:bg-[rgb(var(--backgroundColor-state-pressed))] active:scale-95 hover:bg-[rgb(var(--backgroundColor-state-hover))]"
                  aria-label="Giọng nói"
                >
                  <VoiceSparkleIcon size={16} />
                </button>

                {/* Send */}
                <button
                  type="button"
                  className={`gap-2 bg-clip-border focus-visible:outline-2 focus-visible:outline-current focus-visible:-outline-offset-2 border border-primary/[.13] enabled:active:bg-[rgb(var(--backgroundColor-state-pressed))] backdrop-blur-glass text-subtitle-md px-3 border-none bg-transparent flex items-center justify-center aspect-square rounded-full size-8 transition-all will-change-transform duration-150 ease-out shadow-sm enabled:hover:bg-transparent enabled:hover:scale-[1.04] enabled:active:scale-[0.96] ${canSend ? "cursor-pointer text-primary" : "cursor-not-allowed text-disabled"
                    }`}
                  tabIndex={0}
                  data-testid="generate-button"
                  aria-disabled={!canSend}
                  aria-label={sendLabel}
                  disabled={!canSend}
                  data-loading={isSending ? "" : undefined}
                  onClick={handleSend}
                >
                  <ArrowUpIcon />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isIconSelectorOpen && (
        <IconSelector
          id="chat-input-palette-menu"
          labelledBy="chat-input-palette-trigger"
          anchorRef={paletteButtonRef}
          onClose={() => setIsIconSelectorOpen(false)}
          onSelectIcon={handleSelectIcon}
        />
      )}

      {isModelSelectorOpen && (
        <ModelSelector
          id="chat-input-model-menu"
          labelledBy="chat-input-model-trigger"
          anchorRef={modelButtonRef}
          onClose={() => setIsModelSelectorOpen(false)}
          selectedModel={selectedModel}
          onSelectModel={setSelectedModel}
        />
      )}
    </div>
  );
}
