"use client";

import { createPortal } from "react-dom";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties, MouseEvent, ReactNode, RefObject } from "react";

import NewFeaturesPanel from "./NewFeaturesPanel";
import {
  DiscordIcon,
  DocsIcon,
  FAQsIcon,
  FlySendIcon,
  ForumIcon,
  GiftIcon,
  MoreDotsIcon,
  XIcon,
} from "./icons";

const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

const MENU_WIDTH = 244;
const MENU_GAP = 8;
const VIEWPORT_PADDING = 8;

const overlayStyle = {
  position: "fixed",
  inset: "0px",
  userSelect: "none",
  pointerEvents: "auto",
} satisfies CSSProperties;

const headerActionButtonClass =
  "cursor-pointer p-2 rounded-full select-none transition-colors text-[rgb(var(--textColor-primary))] hover:bg-[rgb(var(--backgroundColor-state-hover))] data-[popup-open]:bg-[rgb(var(--backgroundColor-state-pressed))] active:bg-[rgb(var(--backgroundColor-state-pressed))] focus-ring";

// Simplified: replaced JS isHighlighted state with CSS hover pseudo-element
const menuItemClass =
  "flex gap-2 list-none pl-3 pr-4 py-2 box-border cursor-pointer outline-0 select-none relative z-0 items-center before:absolute before:inset-x-1 before:inset-y-0 before:z-[-1] before:rounded-[6px] hover:before:bg-state-menu-hover active:before:bg-state-menu-active data-[disabled]:opacity-50 data-[disabled]:cursor-default motion-safe:animate-m3-menu-item-enter";

const menuLinkClass =
  "inline cursor-pointer focus-visible:outline-0 no-underline hover:text-inherit";

interface HeaderActionsProps {
  userName?: string | null;
  userAvatarUrl?: string | null;
  onAccountClick?: () => void;
  onFaqClick?: () => void;
  onFeedbackClick?: () => void;
}

interface HeaderMoreMenuProps {
  anchorRef: RefObject<HTMLElement | null>;
  labelledBy: string;
  onClose: () => void;
  onFaqClick?: () => void;
  onFeedbackClick?: () => void;
}

interface HeaderMoreItemProps {
  id: string;
  index: number;
  icon: ReactNode;
  children: ReactNode;
  href?: string;
  external?: boolean;
  onSelect?: () => void;
  className?: string;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

// FIX: explicit active bg when expanded, data-[popup-open] alone may not compile in all configs
function HeaderIconButton({
  label,
  title,
  children,
  buttonRef,
  controls,
  expanded,
  hasPopup,
  onClick,
}: {
  label: string;
  title?: string;
  children: ReactNode;
  buttonRef?: RefObject<HTMLButtonElement | null>;
  controls?: string;
  expanded?: boolean;
  hasPopup?: "dialog" | "menu";
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
}) {
  return (
    <button
      ref={buttonRef}
      type="button"
      aria-label={label}
      title={title}
      aria-haspopup={hasPopup}
      aria-expanded={expanded}
      aria-controls={controls}
      className={`${headerActionButtonClass}${expanded ? " bg-[rgb(var(--backgroundColor-state-pressed))]" : ""}`}
      data-popup-open={expanded ? "" : undefined}
      onClick={onClick}
    >
      <span className="text-inherit" aria-hidden="true">
        {children}
      </span>
    </button>
  );
}

// Simplified: removed isHighlighted state, using CSS hover via menuItemClass
function HeaderMoreItem({
  id,
  index,
  icon,
  children,
  href,
  external = false,
  onSelect,
  className,
}: HeaderMoreItemProps) {
  const content = (
    <div
      className={menuItemClass}
      role="menuitem"
      tabIndex={-1}
      id={id}
      draggable={false}
      style={{ "--stagger-index": index } as CSSProperties}
    >
      <span className="text-primary">{icon}</span>
      {children}
    </div>
  );

  if (href) {
    return (
      <a
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        className={`${menuLinkClass} ${className || ""}`.trim()}
        style={{ "--stagger-index": index } as CSSProperties}
        tabIndex={-1}
        onClick={onSelect}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      type="button"
      role="link"
      tabIndex={-1}
      className={`${menuLinkClass} border-0 bg-transparent p-0 text-left font-inherit text-inherit ${className || ""}`.trim()}
      style={{ "--stagger-index": index } as CSSProperties}
      onClick={onSelect}
    >
      {content}
    </button>
  );
}

function HeaderMoreMenu({
  anchorRef,
  labelledBy,
  onClose,
  onFaqClick,
  onFeedbackClick,
}: HeaderMoreMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [floatingStyle, setFloatingStyle] = useState<CSSProperties>({
    position: "fixed",
    visibility: "hidden",
  });

  const updatePosition = useCallback(() => {
    const anchor = anchorRef.current;
    if (!anchor || typeof window === "undefined") return;

    const rect = anchor.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const menuWidth = Math.min(
      menuRef.current?.getBoundingClientRect().width || MENU_WIDTH,
      viewportWidth - VIEWPORT_PADDING * 2,
    );
    const left = clamp(rect.right - menuWidth, VIEWPORT_PADDING, viewportWidth - menuWidth - VIEWPORT_PADDING);
    const top = clamp(rect.bottom + MENU_GAP, VIEWPORT_PADDING, viewportHeight - VIEWPORT_PADDING);
    const transformOriginX = clamp(rect.left + rect.width / 2 - left, 0, menuWidth);

    setFloatingStyle({
      position: "fixed",
      left,
      top,
      "--available-height": `${Math.max(0, viewportHeight - top - VIEWPORT_PADDING)}px`,
      "--anchor-width": `${rect.width}px`,
      "--anchor-height": `${rect.height}px`,
      "--transform-origin": `${transformOriginX}px -${MENU_GAP}px`,
    } as CSSProperties);
  }, [anchorRef]);

  // Runs synchronously before first paint to avoid position flash
  useIsomorphicLayoutEffect(() => {
    updatePosition();
  }, [updatePosition]);

  // Resize/scroll listeners + Escape handler only (no duplicate updatePosition call)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, updatePosition]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="chat-root fixed inset-0 z-[70] pointer-events-none">
      <div role="presentation" style={overlayStyle} onMouseDown={onClose} />
      <div
        data-open=""
        data-side="bottom"
        role="presentation"
        className="z-10 pointer-events-auto"
        style={floatingStyle}
      >
        <div
          ref={menuRef}
          data-side="bottom"
          data-open=""
          tabIndex={-1}
          id="header-more-menu"
          role="menu"
          aria-labelledby={labelledBy}
          aria-orientation="vertical"
          className="flex flex-col gap-1 py-2 px-1 overflow-auto thin-scrollbar border border-secondary outline-0 rounded-xl box-border text-subtitle-md text-primary bg-surface-container backdrop-blur-glass shadow-xl motion-safe:transition-[transform,scale,opacity] motion-safe:data-[ending-style]:scale-90 motion-safe:data-[ending-style]:opacity-0 motion-safe:data-[starting-style]:scale-90 motion-safe:data-[starting-style]:opacity-0 max-w-[calc(100vw-16px)] max-h-[var(--available-height)]"
        >
          <HeaderMoreItem
            id="header-more-docs"
            index={1}
            icon={<DocsIcon size={20} />}
            href="/docs"
            onSelect={onClose}
            className="md:hidden"
          >
            Docs
          </HeaderMoreItem>
          <HeaderMoreItem
            id="header-more-discord"
            index={2}
            icon={<DiscordIcon size={20} />}
            href="https://discord.com"
            external
            onSelect={onClose}
            className="md:hidden"
          >
            Discord
          </HeaderMoreItem>
          <HeaderMoreItem
            id="header-more-x"
            index={3}
            icon={<XIcon size={20} />}
            href="https://x.com"
            external
            onSelect={onClose}
            className="md:hidden"
          >
            X
          </HeaderMoreItem>
          <HeaderMoreItem
            id="header-more-faq"
            index={4}
            icon={<FAQsIcon size={20} />}
            onSelect={() => { onFaqClick?.(); onClose(); }}
          >
            Câu hỏi thường gặp
          </HeaderMoreItem>
          <HeaderMoreItem
            id="header-more-forum"
            index={5}
            icon={<ForumIcon size={20} />}
            href="/chat?header_more=forum"
            onSelect={onClose}
          >
            Diễn đàn
          </HeaderMoreItem>
          <HeaderMoreItem
            id="header-more-prompt-guide"
            index={6}
            icon={<DocsIcon size={20} />}
            href="/chat?header_more=prompt-guide"
            onSelect={onClose}
          >
            Hướng dẫn về câu lệnh
          </HeaderMoreItem>
          <HeaderMoreItem
            id="header-more-feedback"
            index={7}
            icon={<FlySendIcon size={20} />}
            onSelect={() => { onFeedbackClick?.(); onClose(); }}
          >
            Gửi phản hồi
          </HeaderMoreItem>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function HeaderActions({
  userName,
  userAvatarUrl,
  onAccountClick,
  onFaqClick,
  onFeedbackClick,
}: HeaderActionsProps) {
  const newFeaturesButtonRef = useRef<HTMLButtonElement>(null);
  const moreButtonRef = useRef<HTMLButtonElement>(null);
  const [isNewFeaturesOpen, setIsNewFeaturesOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const userInitials = userName?.trim().slice(0, 2).toUpperCase() || "U";

  const toggleNewFeatures = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setIsMoreOpen(false);
    setIsNewFeaturesOpen((open) => !open);
  };

  const toggleMore = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setIsNewFeaturesOpen(false);
    setIsMoreOpen((open) => !open);
  };

  return (
    <div className="flex gap-1 md:gap-2 items-center shrink-0">
      <button type="button" className="no-underline hidden md:flex border-0 bg-transparent p-0" aria-label="Docs">
        <span className="cursor-pointer p-2 rounded-full select-none transition-colors flex items-center gap-1.5 text-[rgb(var(--textColor-primary))] hover:bg-[rgb(var(--backgroundColor-state-hover))] focus-ring">
          <span className="text-inherit" aria-hidden="true">
            <DocsIcon />
          </span>
          <span className="font-medium text-[13px] leading-[150%] text-[rgb(var(--textColor-primary))]">
            Docs
          </span>
        </span>
      </button>

      <a
        href="https://discord.com"
        target="_blank"
        rel="noopener noreferrer"
        className="no-underline hidden md:flex"
        aria-label="Discord"
      >
        <span className={headerActionButtonClass}>
          <span className="text-inherit" aria-hidden="true">
            <DiscordIcon />
          </span>
        </span>
      </a>

      <a
        href="https://x.com"
        target="_blank"
        rel="noopener noreferrer"
        className="no-underline hidden md:flex"
        aria-label="X"
      >
        <span className={headerActionButtonClass}>
          <span className="text-inherit" aria-hidden="true">
            <XIcon />
          </span>
        </span>
      </a>

      <HeaderIconButton
        label="Tính năng mới"
        title="Có gì mới?"
        buttonRef={newFeaturesButtonRef}
        controls="new-features-panel"
        expanded={isNewFeaturesOpen}
        hasPopup="dialog"
        onClick={toggleNewFeatures}
      >
        <GiftIcon />
      </HeaderIconButton>

      <button
        ref={moreButtonRef}
        id="header-more-trigger"
        type="button"
        aria-label="Mở thêm tùy chọn"
        title="Thêm tùy chọn"
        aria-haspopup="menu"
        aria-expanded={isMoreOpen}
        aria-controls="header-more-menu"
        className={`${headerActionButtonClass}${isMoreOpen ? " bg-[rgb(var(--backgroundColor-state-pressed))]" : ""}`}
        data-popup-open={isMoreOpen ? "" : undefined}
        onClick={toggleMore}
      >
        <span aria-hidden="true">
          <MoreDotsIcon size={20} />
        </span>
      </button>

      <div className="relative flex">
        <button
          type="button"
          aria-label="Trình đơn tài khoản"
          className="rounded-full focus-ring"
          onClick={onAccountClick}
        >
          <div className="flex items-center justify-center rounded-full text-lg font-medium select-none p-0 font-sans text-white bg-[rgb(var(--backgroundColor-secondary)/.5)] border border-[rgb(var(--borderColor-wash)/.2)] h-8 w-8 min-w-[2rem]">
            {userAvatarUrl ? (
              <img
                alt={userName ? `${userName} avatar` : "Profile image"}
                className="rounded-full h-8 w-8 min-w-[2rem] object-cover"
                referrerPolicy="no-referrer"
                src={userAvatarUrl}
              />
            ) : (
              <span className="text-[12px] font-semibold text-primary">{userInitials}</span>
            )}
          </div>
        </button>
      </div>

      {isMoreOpen && (
        <HeaderMoreMenu
          anchorRef={moreButtonRef}
          labelledBy="header-more-trigger"
          onClose={() => setIsMoreOpen(false)}
          onFaqClick={onFaqClick}
          onFeedbackClick={onFeedbackClick}
        />
      )}

      {isNewFeaturesOpen && (
        <NewFeaturesPanel
          anchorRef={newFeaturesButtonRef}
          labelledBy="new-features-title"
          onClose={() => setIsNewFeaturesOpen(false)}
        />
      )}
    </div>
  );
}
