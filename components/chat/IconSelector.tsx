"use client";

import { createPortal } from "react-dom";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties, RefObject } from "react";
import { EmojiIcon } from "./icons";

const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

interface IconSelectorProps {
  id?: string;
  labelledBy?: string;
  anchorRef?: RefObject<HTMLElement | null>;
  className?: string;
  showOverlay?: boolean;
  onClose?: () => void;
  onSelectIcon?: (iconText: string) => void;
}

interface TextIconOption {
  id: string;
  icon: string;
}

const ICON_SELECTOR_WIDTH = 280;
const ICON_SELECTOR_MAX_HEIGHT = 320;
const ICON_SELECTOR_GAP = 6;
const VIEWPORT_PADDING = 8;

const focusGuardStyle = {
  clip: "rect(0px, 0px, 0px, 0px)",
  overflow: "hidden",
  whiteSpace: "nowrap",
  position: "fixed",
  top: "0px",
  left: "0px",
  border: "0px",
  padding: "0px",
  width: "1px",
  height: "1px",
  margin: "-1px",
} satisfies CSSProperties;

const overlayClipStyle = {
  position: "fixed",
  inset: "0px",
  userSelect: "none",
  pointerEvents: "auto",
} satisfies CSSProperties;

const defaultFloatingStyle = {
  position: "fixed",
  right: "16px",
  bottom: "120px",
  "--available-width": "100vw",
  "--available-height": `${ICON_SELECTOR_MAX_HEIGHT}px`,
  "--anchor-width": "28px",
  "--anchor-height": "28px",
  "--transform-origin": "calc(100% - 14px) calc(100% + 6px)",
} as CSSProperties;

const textIconButtonClass =
  "border-0 bg-transparent relative z-0 list-none box-border cursor-pointer outline-0 select-none before:absolute before:inset-x-1 before:inset-y-0 before:z-[-1] before:rounded-[6px] active:before:bg-state-menu-active data-[disabled]:opacity-50 data-[disabled]:cursor-default motion-safe:animate-m3-menu-item-enter data-[highlighted]:before:bg-state-menu-hover flex items-center justify-center rounded-full text-caption data-[highlighted]:before:hidden data-[highlighted]:bg-state-menu-hover focus-ring size-9";

const TEXT_ICON_OPTIONS: TextIconOption[] = [
  { id: "text-icon-smile", icon: "😀" },
  { id: "text-icon-laugh", icon: "😂" },
  { id: "text-icon-heart", icon: "❤️" },
  { id: "text-icon-like", icon: "👍" },
  { id: "text-icon-clap", icon: "👏" },
  { id: "text-icon-fire", icon: "🔥" },
  { id: "text-icon-star", icon: "⭐" },
  { id: "text-icon-sparkles", icon: "✨" },
  { id: "text-icon-thinking", icon: "🤔" },
  { id: "text-icon-party", icon: "🎉" },
  { id: "text-icon-sad", icon: "😢" },
  { id: "text-icon-check", icon: "✅" },
  { id: "text-icon-pray", icon: "🙏" },
  { id: "text-icon-cool", icon: "😎" },
  { id: "text-icon-wow", icon: "😮" },
  { id: "text-icon-cry-laugh", icon: "🤣" },
  { id: "text-icon-rocket", icon: "🚀" },
  { id: "text-icon-eyes", icon: "👀" },
  { id: "text-icon-ok", icon: "👌" },
  { id: "text-icon-100", icon: "💯" },
  { id: "text-icon-question", icon: "❓" },
  { id: "text-icon-exclamation", icon: "❗" },
  { id: "text-icon-wave", icon: "👋" },
  { id: "text-icon-light", icon: "💡" },
];

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), Math.max(min, max));
}

function TextIconGlyph({ icon }: { icon: string }) {
  return (
    <span className="text-[20px] leading-none">
      {icon}
    </span>
  );
}

function TextIconItem({
  option,
  index,
  onSelect,
}: {
  option: TextIconOption;
  index: number;
  onSelect?: (iconText: string) => void;
}) {
  const selectIcon = () => onSelect?.(option.icon);

  return (
    <button
      type="button"
      role="menuitem"
      id={option.id}
      draggable={false}
      className={textIconButtonClass}
      style={{ "--stagger-index": index + 2 } as CSSProperties}
      onClick={selectIcon}
    >
      <TextIconGlyph icon={option.icon} />
    </button>
  );
}

export default function IconSelector({
  id = "_r_dc_",
  labelledBy = "_r_dd_",
  anchorRef,
  className,
  showOverlay = true,
  onClose,
  onSelectIcon,
}: IconSelectorProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [anchoredStyle, setAnchoredStyle] = useState<CSSProperties>();
  const [placementSide, setPlacementSide] = useState<"top" | "bottom">("top");

  const updatePosition = useCallback(() => {
    const anchor = anchorRef?.current;
    if (!anchor || typeof window === "undefined") return;

    const rect = anchor.getBoundingClientRect();
    const menuRect = menuRef.current?.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const availableWidth = Math.max(0, viewportWidth - VIEWPORT_PADDING * 2);
    const availableHeight = Math.max(0, viewportHeight - VIEWPORT_PADDING * 2);
    const menuWidth = Math.min(menuRect?.width || ICON_SELECTOR_WIDTH, availableWidth);
    const menuHeight = Math.min(menuRect?.height || ICON_SELECTOR_MAX_HEIGHT, availableHeight);
    const availableAbove = rect.top - ICON_SELECTOR_GAP - VIEWPORT_PADDING;
    const availableBelow = viewportHeight - rect.bottom - ICON_SELECTOR_GAP - VIEWPORT_PADDING;
    const placeAbove = availableAbove >= menuHeight || availableAbove >= availableBelow;
    const left = clamp(rect.right - menuWidth, VIEWPORT_PADDING, viewportWidth - menuWidth - VIEWPORT_PADDING);
    const preferredTop = placeAbove ? rect.top - menuHeight - ICON_SELECTOR_GAP : rect.bottom + ICON_SELECTOR_GAP;
    const top = clamp(preferredTop, VIEWPORT_PADDING, viewportHeight - menuHeight - VIEWPORT_PADDING);
    const transformOriginX = clamp(rect.left + rect.width / 2 - left, 0, menuWidth);
    const transformOriginY = placeAbove ? `calc(100% + ${ICON_SELECTOR_GAP}px)` : `-${ICON_SELECTOR_GAP}px`;

    setPlacementSide(placeAbove ? "top" : "bottom");
    setAnchoredStyle({
      position: "fixed",
      left,
      top,
      "--available-width": `${availableWidth}px`,
      "--available-height": `${Math.min(ICON_SELECTOR_MAX_HEIGHT, availableHeight)}px`,
      "--anchor-width": `${rect.width}px`,
      "--anchor-height": `${rect.height}px`,
      "--transform-origin": `${transformOriginX}px ${transformOriginY}`,
    } as CSSProperties);
  }, [anchorRef]);
  const updatePositionRef = useRef(updatePosition);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    updatePositionRef.current = updatePosition;
    onCloseRef.current = onClose;
  }, [onClose, updatePosition]);

  useIsomorphicLayoutEffect(() => {
    updatePosition();
  }, [updatePosition]);

  useEffect(() => {
    updatePositionRef.current();

    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") onCloseRef.current?.();
    };
    const handlePositionChange = () => updatePositionRef.current();

    window.addEventListener("resize", handlePositionChange);
    window.addEventListener("scroll", handlePositionChange, true);
    document.addEventListener("keydown", handleKeyDown);

    const resizeObserver =
      typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(handlePositionChange);
    if (menuRef.current) resizeObserver?.observe(menuRef.current);

    return () => {
      window.removeEventListener("resize", handlePositionChange);
      window.removeEventListener("scroll", handlePositionChange, true);
      document.removeEventListener("keydown", handleKeyDown);
      resizeObserver?.disconnect();
    };
  }, []);

  const mergedFloatingStyle = {
    ...defaultFloatingStyle,
    ...anchoredStyle,
    visibility: anchorRef && !anchoredStyle ? "hidden" : undefined,
  } as CSSProperties;

  const selector = (
    <>
      {showOverlay ? <div role="presentation" data-base-ui-inert="" style={overlayClipStyle} onMouseDown={onClose} /> : null}

      <div
        data-open=""
        data-side={placementSide}
        data-align="end"
        role="presentation"
        className={["pointer-events-auto", className ?? "z-50"].filter(Boolean).join(" ")}
        style={mergedFloatingStyle}
      >
        <button type="button" aria-label="Focus guard" data-type="inside" data-base-ui-focus-guard="" style={focusGuardStyle} />

        <div
          ref={menuRef}
          data-side={placementSide}
          data-align="end"
          data-open=""
          tabIndex={-1}
          data-base-ui-focusable=""
          id={id}
          role="menu"
          aria-labelledby={labelledBy}
          aria-orientation="vertical"
          data-rootownerid="_r_db_"
          className="gap-1 py-2 px-1 overflow-auto thin-scrollbar border border-secondary outline-0 rounded-xl box-border text-subtitle-md text-primary bg-surface-container backdrop-blur-glass shadow-xl motion-safe:transition-[transform,scale,opacity] motion-safe:data-[ending-style]:scale-90 motion-safe:data-[ending-style]:opacity-0 motion-safe:data-[starting-style]:scale-90 motion-safe:data-[starting-style]:opacity-0 w-[280px] min-w-[280px] max-w-[280px] max-h-[320px] !px-2 flex flex-col"
        >
          <div className="flex items-center justify-between py-1.5 pl-2 shrink-0" style={{ "--stagger-index": 0 } as CSSProperties}>
            <div className="flex items-center gap-2">
              <EmojiIcon size={16} />
              <span className="text-xs font-medium">ICONS</span>
            </div>
          </div>

          <div
            className="overflow-y-auto thin-scrollbar min-h-0 flex-1 grid grid-cols-6 content-start justify-items-center gap-1 -mr-2 pr-2"
            style={{ "--stagger-index": 1 } as CSSProperties}
          >
            {TEXT_ICON_OPTIONS.map((option, index) => (
              <TextIconItem key={option.id} option={option} index={index} onSelect={onSelectIcon} />
            ))}
          </div>
        </div>

        <button type="button" aria-label="Focus guard" data-type="inside" data-base-ui-focus-guard="" style={focusGuardStyle} />
      </div>
    </>
  );

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="chat-root fixed inset-0 z-[60] pointer-events-none">
      {selector}
    </div>,
    document.body
  );
}
