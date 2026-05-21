"use client";

import { useRef, useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";

import IconSelector from "./IconSelector";
import { ArrowUpIcon, ChevronDownIcon, PaletteIcon, PlusIcon } from "./icons";

const FILE_ACCEPT =
  "image/png,.png,image/jpeg,.jpg,.jpeg,image/gif,.gif,image/webp,.webp,image/heic,.heic,image/heif,.heif,text/plain,.txt,text/markdown,.md,.markdown,text/html,.html,.htm,text/javascript,.js,.jsx,.ts,.tsx,application/json,.json,text/css,.css,text/x-scss,.scss,text/x-sass,.sass,text/less,.less,text/x-vue,.vue,text/x-svelte,.svelte,text/x-astro,.astro,text/mdx,.mdx,image/svg+xml,.svg,text/csv,.csv,text/vnd.mermaid,.mmd,.mermaid,application/x-figma,.fig";

const hiddenInputClass =
  "absolute h-px w-px overflow-hidden whitespace-nowrap border-0 p-0 [clip:rect(0px,0px,0px,0px)] [clip-path:inset(50%)]";

const iconButtonClass =
  "flex items-center justify-center outline-none select-none cursor-pointer focus-ring hover:bg-[rgb(var(--backgroundColor-state-hover))] active:bg-[rgb(var(--backgroundColor-state-pressed))] data-[popup-open]:bg-[rgb(var(--backgroundColor-state-hover))] disabled:opacity-50 disabled:cursor-not-allowed rounded-full p-2 size-7";

interface ChatInputProps {
  ariaLabel?: string;
  placeholder?: string;
  sendLabel?: string;
  onSend?: (text: string) => void;
}

const hiddenGuardStyle = {
  clip: "rect(0px, 0px, 0px, 0px)",
  overflow: "hidden",
  whiteSpace: "nowrap",
  position: "fixed",
  top: 0,
  left: 0,
  border: 0,
  padding: 0,
  width: 1,
  height: 1,
  margin: -1,
} as const;

function SlashIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" width={18} height={18} fill="currentColor">
      <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle" fontSize={25} fontWeight={300} fontFamily="inherit">
        /
      </text>
    </svg>
  );
}

function LayoutToolIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={18} height={18} viewBox="0 0 20 20" fill="none">
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.6 3.396H4.25c-.314 0-.568.283-.568.633v12.665c0 .35.254.633.568.633H15.6c.314 0 .568-.284.568-.633V4.029c0-.35-.254-.633-.567-.633ZM6.8 10.361h6.25M9.925 7.236v6.25"
      />
      <path stroke="currentColor" strokeLinecap="round" d="M17.747 5.02v10.682M19.312 6.019v8.685" />
    </svg>
  );
}

function VoiceSparkleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-[20px] leading-none">
      <path d="M18.062 14.5a1 1 0 1 1 1.732 1A9 9 0 0 1 13 19.942V22a1 1 0 0 1-2 0v-2.058A9 9 0 0 1 4.206 15.5a1 1 0 0 1 1.731-1 7.002 7.002 0 0 0 9.563 2.563 7.003 7.003 0 0 0 2.562-2.563ZM12 1a4.98 4.98 0 0 1 2.141.48 5.976 5.976 0 0 0-.89 1.795A3 3 0 0 0 9 6v5a3 3 0 0 0 6 0V9.47a5.992 5.992 0 0 0 2 1.186V11a5 5 0 0 1-9.992.257L7 11V6a5 5 0 0 1 5-5Zm7 0c.155 0 .283.121.304.275a4 4 0 0 0 3.42 3.414c.154.021.276.15.276.306a.315.315 0 0 1-.277.307 4 4 0 0 0-3.42 3.423A.312.312 0 0 1 19 9a.313.313 0 0 1-.304-.275 4 4 0 0 0-3.42-3.423.315.315 0 0 1-.276-.307c0-.156.122-.284.276-.306a4 4 0 0 0 3.418-3.414A.314.314 0 0 1 19 1Z" />
    </svg>
  );
}

export default function ChatInput({
  ariaLabel = "Bạn muốn thay đổi hoặc tạo nội dung gì?",
  placeholder = "Bạn muốn thay đổi hoặc tạo nội dung gì?",
  sendLabel = "Tạo",
  onSend,
}: ChatInputProps) {
  const paletteButtonRef = useRef<HTMLButtonElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const [editorResetKey, setEditorResetKey] = useState(0);
  const [inputText, setInputText] = useState("");
  const [isIconSelectorOpen, setIsIconSelectorOpen] = useState(false);

  const trimmedText = inputText.trim();
  const canSend = Boolean(onSend && trimmedText);

  const handleEditorInput = (event: FormEvent<HTMLDivElement>) => {
    setInputText(event.currentTarget.textContent ?? "");
  };

  const handleSend = () => {
    if (!canSend) return;

    onSend?.(trimmedText);
    setInputText("");
    setEditorResetKey((key) => key + 1);
  };

  const handleEditorKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (onSend && event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const handlePaletteToggle = () => {
    setIsIconSelectorOpen((isOpen) => !isOpen);
  };

  const handleSelectIcon = (iconText: string) => {
    const nextText = `${inputText}${iconText}`;
    const editor = editorRef.current;

    setInputText(nextText);
    setIsIconSelectorOpen(false);

    if (!editor) return;

    editor.textContent = nextText;
    editor.focus();

    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(editor);
    range.collapse(false);
    selection?.removeAllRanges();
    selection?.addRange(range);
  };

  return (
    <div
      className="relative z-[1] flex h-[101px] w-full max-w-[720px] flex-col justify-end overflow-hidden rounded-[24px] cursor-text bg-surface-container backdrop-blur-glass text-primary border border-secondary shadow-lg outline-none"
    >
      <div>
        <div>
          <div
            role="presentation"
            className="relative flex flex-col px-4 pt-3 text-primary text-start text-sm leading-[1.6] focus:outline-none focus-visible:outline-2 transition-all duration-200 pb-3"
          >
            <div
              className="flex w-full flex-nowrap gap-2 overflow-x-scroll no-scrollbar transition-all ease-in-out duration-300"
              data-base-ui-inert=""
            />

            <div className="chat-tiptap-v3" data-base-ui-inert="">
              <div className="relative w-full overflow-auto">
                <div className="tiptap-editor">
                  <div
                    ref={editorRef}
                    key={editorResetKey}
                    contentEditable
                    role="textbox"
                    translate="no"
                    className="tiptap ProseMirror"
                    tabIndex={0}
                    aria-label={ariaLabel}
                    suppressContentEditableWarning
                    onInput={handleEditorInput}
                    onKeyDown={handleEditorKeyDown}
                  >
                    <p data-placeholder={placeholder} className={trimmedText === "" ? "is-empty is-editor-empty" : undefined}>
                      <br className="ProseMirror-trailingBreak" />
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0 pt-5">
              <input accept={FILE_ACCEPT} multiple tabIndex={-1} type="file" className={hiddenInputClass} data-base-ui-inert="" />
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
                  <span className="text-inherit">
                    <PlusIcon />
                  </span>
                </button>
              </div>

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

              <div className="flex items-center gap-2 flex-shrink-0" data-base-ui-inert="" />
              <div className="flex-1" data-base-ui-inert="" />

              <div className="flex items-center gap-2 flex-shrink-0">
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
                <div data-base-ui-inert="">
                  <button
                    ref={paletteButtonRef}
                    id="chat-input-palette-trigger"
                    type="button"
                    tabIndex={0}
                    aria-haspopup="menu"
                    aria-expanded={isIconSelectorOpen}
                    aria-controls="chat-input-palette-menu"
                    className="outline-none select-none focus-ring disabled:opacity-50 disabled:cursor-not-allowed p-2 flex items-center justify-center rounded-full size-7 bg-transparent hover:bg-[rgb(var(--backgroundColor-state-hover))] active:bg-[rgb(var(--backgroundColor-state-pressed))] data-[popup-open]:bg-[rgb(var(--backgroundColor-state-hover))] transition-colors cursor-pointer shrink-0"
                    data-popup-open={isIconSelectorOpen ? "" : undefined}
                    data-pressed={isIconSelectorOpen ? "" : undefined}
                    aria-label="Màu sắc"
                    style={{ transform: "none" }}
                    onClick={handlePaletteToggle}
                  >
                    <span className="text-primary">
                      <PaletteIcon />
                    </span>
                  </button>
                  <span tabIndex={-1} aria-hidden="true" style={hiddenGuardStyle} />
                </div>

                <span data-type="outside" aria-hidden="true" tabIndex={0} data-base-ui-focus-guard="" style={hiddenGuardStyle} />
                <span aria-owns="chat-input-floating-layer" data-base-ui-inert="" style={hiddenGuardStyle} />
                <span data-type="outside" aria-hidden="true" tabIndex={0} data-base-ui-focus-guard="" style={hiddenGuardStyle} />

                <button
                  type="button"
                  tabIndex={0}
                  aria-haspopup="menu"
                  aria-expanded={false}
                  className="flex items-center justify-center outline-none select-none cursor-pointer focus-ring hover:bg-[rgb(var(--backgroundColor-state-hover))] active:bg-[rgb(var(--backgroundColor-state-pressed))] disabled:opacity-50 disabled:cursor-not-allowed rounded-full gap-1.5 px-2.5 py-1.5 text-subtitle-sm text-primary bg-state-enabled shadow-sm relative overflow-visible backdrop-blur-glass data-[popup-open]:bg-[rgb(var(--backgroundColor-state-pressed))] data-[popup-open]:border-transparent h-7"
                  data-base-ui-inert=""
                  aria-label="Chọn mô hình"
                  style={{ transform: "none" }}
                >
                  <span className="whitespace-nowrap">Nhanh</span>
                  <span className="text-inherit">
                    <ChevronDownIcon />
                  </span>
                </button>

                <div className="relative flex items-center" data-base-ui-inert="">
                  <div>
                    <button
                      type="button"
                      className="w-8 h-8 flex items-center justify-center rounded-full transition-colors focus-ring active:bg-[rgb(var(--backgroundColor-state-pressed))] active:scale-95 hover:bg-[rgb(var(--backgroundColor-state-hover))]"
                      aria-label="Giọng nói"
                    >
                      <VoiceSparkleIcon />
                    </button>
                  </div>
                </div>

                <div data-base-ui-inert="">
                  <button
                    type="button"
                    className={`gap-2 bg-clip-border focus-visible:outline-2 focus-visible:outline-current focus-visible:-outline-offset-2 border border-primary/[.13] enabled:active:bg-[rgb(var(--backgroundColor-state-pressed))] backdrop-blur-glass text-subtitle-md px-3 border-none bg-transparent flex items-center justify-center aspect-square rounded-full size-8 transition-all will-change-transform duration-150 ease-out shadow-sm enabled:hover:bg-transparent enabled:hover:scale-[1.04] enabled:active:scale-[0.96] ${canSend ? "cursor-pointer text-primary" : "cursor-not-allowed text-disabled"}`}
                    tabIndex={0}
                    data-testid="generate-button"
                    aria-disabled={!canSend}
                    aria-label={sendLabel}
                    disabled={!canSend}
                    onClick={handleSend}
                  >
                    <span className="text-inherit">
                      <ArrowUpIcon />
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isIconSelectorOpen ? (
        <IconSelector
          id="chat-input-palette-menu"
          labelledBy="chat-input-palette-trigger"
          anchorRef={paletteButtonRef}
          onClose={() => setIsIconSelectorOpen(false)}
          onSelectIcon={handleSelectIcon}
        />
      ) : null}
    </div>
  );
}
