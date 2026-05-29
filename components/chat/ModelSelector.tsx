"use client";

import { createPortal } from "react-dom";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties, RefObject } from "react";
import { CheckIcon } from "./icons";

// SSR-safe layout effect: falls back to useEffect on the server.
const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

const MENU_WIDTH = 292;
const MENU_GAP = 8;
const VIEWPORT_PADDING = 8;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

const MODELS = [
  {
    id: "3-flash",
    name: "Nhanh",
    description: "Tin nhắn được xử lý cực nhanh. Tạo nội dung ngay lập tức với độ chính xác cao.",
  },
  {
    id: "code",
    name: "Mã hóa",
    description: "Tin nhăn được lưu trữ mã hóa. Tăng cường bảo mật cho tin nhắn.",
  },
];

interface ModelSelectorProps {
  id?: string;
  anchorRef: RefObject<HTMLElement | null>;
  labelledBy: string;
  onClose: () => void;
  selectedModel: string;
  onSelectModel: (model: string) => void;
}

export default function ModelSelector({
  id = "model-selector-menu",
  anchorRef,
  labelledBy,
  onClose,
  selectedModel,
  onSelectModel,
}: ModelSelectorProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // FIX: start hidden so menu never flashes at (0,0) before position is calculated.
  const [floatingStyle, setFloatingStyle] = useState<CSSProperties>({
    position: "fixed",
    visibility: "hidden",
  });

  const updatePosition = useCallback(() => {
    const anchor = anchorRef.current;
    if (!anchor || typeof window === "undefined") return;

    const anchorRect = anchor.getBoundingClientRect();
    const menuEl = menuRef.current;
    const menuHeight = menuEl ? menuEl.getBoundingClientRect().height || 280 : 280;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Center the menu horizontally over the anchor button.
    const menuWidth = Math.min(MENU_WIDTH, viewportWidth - VIEWPORT_PADDING * 2);
    const anchorCenterX = anchorRect.left + anchorRect.width / 2;
    const left = clamp(
      anchorCenterX - menuWidth / 2,
      VIEWPORT_PADDING,
      viewportWidth - menuWidth - VIEWPORT_PADDING,
    );
    const transformOriginX = clamp(anchorCenterX - left, 0, menuWidth);

    // Prefer showing above; fall back to below if not enough space.
    const spaceAbove = anchorRect.top - MENU_GAP - VIEWPORT_PADDING;
    const showAbove = spaceAbove >= menuHeight;

    let style: CSSProperties;

    if (showAbove) {
      const bottom = viewportHeight - anchorRect.top + MENU_GAP;
      style = {
        position: "fixed",
        left,
        bottom,
        width: menuWidth,
        "--available-height": `${spaceAbove}px`,
        "--transform-origin": `${transformOriginX}px calc(100% + ${MENU_GAP}px)`,
      } as CSSProperties;
    } else {
      const top = anchorRect.bottom + MENU_GAP;
      const availableHeight = viewportHeight - top - VIEWPORT_PADDING;
      style = {
        position: "fixed",
        left,
        top,
        width: menuWidth,
        "--available-height": `${Math.max(0, availableHeight)}px`,
        "--transform-origin": `${transformOriginX}px -${MENU_GAP}px`,
      } as CSSProperties;
    }

    setFloatingStyle(style);

    // Keep data-side attribute in sync for animation classes.
    if (menuEl) {
      const side = showAbove ? "top" : "bottom";
      menuEl.setAttribute("data-side", side);
      menuEl.parentElement?.setAttribute("data-side", side);
    }
  }, [anchorRef]);
  const updatePositionRef = useRef(updatePosition);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    updatePositionRef.current = updatePosition;
    onCloseRef.current = onClose;
  }, [onClose, updatePosition]);

  // Calculate position synchronously before the first paint to avoid flashing at (0,0).
  useIsomorphicLayoutEffect(() => {
    updatePosition();
  }, [updatePosition]);

  // Re-calculate on resize / scroll, and wire up Escape to close.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseRef.current();
    };
    const handlePositionChange = () => updatePositionRef.current();

    window.addEventListener("resize", handlePositionChange);
    window.addEventListener("scroll", handlePositionChange, true);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("resize", handlePositionChange);
      window.removeEventListener("scroll", handlePositionChange, true);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="chat-root fixed inset-0 z-[70] pointer-events-none">
      {/* Click-outside overlay */}
      <div
        role="presentation"
        style={{ position: "fixed", inset: "0px", userSelect: "none", pointerEvents: "auto" }}
        onMouseDown={onClose}
      />

      {/* Floating menu */}
      <div
        data-open=""
        data-side="top"
        role="presentation"
        className="z-10 pointer-events-auto"
        style={floatingStyle}
      >
        <div
          ref={menuRef}
          data-open=""
          tabIndex={-1}
          id={id}
          role="menu"
          aria-labelledby={labelledBy}
          aria-orientation="vertical"
          className="flex flex-col gap-1 p-1.5 overflow-auto thin-scrollbar border border-secondary outline-0 rounded-xl box-border text-primary bg-surface-container backdrop-blur-glass shadow-xl motion-safe:transition-[transform,scale,opacity] motion-safe:data-[ending-style]:scale-90 motion-safe:data-[ending-style]:opacity-0 motion-safe:data-[starting-style]:scale-90 motion-safe:data-[starting-style]:opacity-0 max-w-[calc(100vw-16px)] max-h-[var(--available-height)]"
        >
          {MODELS.map((model) => {
            const isSelected = selectedModel === model.id;
            return (
              <button
                key={model.id}
                type="button"
                role="menuitem"
                onClick={() => {
                  onSelectModel(model.id);
                  onClose();
                }}
                className={`flex gap-2.5 px-2.5 py-2 rounded-[10px] cursor-pointer outline-0 transition-colors text-left ${isSelected ? "bg-state-hover" : "hover:bg-state-hover bg-transparent"
                  }`}
              >
                <div className="flex flex-col flex-1 gap-0.5">
                  <div className="font-semibold text-[13px] leading-tight text-primary">
                    {model.name}
                  </div>
                  <div className="text-[12px] leading-[1.35] text-secondary">
                    {model.description}
                  </div>
                </div>
                {isSelected && (
                  <div className="flex-shrink-0 pt-0.5 text-primary">
                    <CheckIcon size={16} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>,
    document.body,
  );
}
