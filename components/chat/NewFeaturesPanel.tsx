"use client";

import { createPortal } from "react-dom";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties, RefObject } from "react";

import { CloseIcon } from "@/components/ui/icons";

const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

const PANEL_WIDTH = 300;
const PANEL_GAP = 8;
const VIEWPORT_PADDING = 8;

const overlayStyle = {
  position: "fixed",
  inset: "0px",
  userSelect: "none",
  pointerEvents: "auto",
} satisfies CSSProperties;

interface FeatureUpdate {
  id: string;
  title: string;
  date: string;
  datetime: string;
  description: string;
  highlighted?: boolean;
}

const FEATURE_UPDATES: FeatureUpdate[] = [
  {
    id: "message-reactions",
    title: "Emoji & chỉnh sửa tin nhắn",
    date: "21 MAY",
    datetime: "2026-05-21",
    description: "Thả emoji, chỉnh sửa và xem dấu đã sửa trong hội thoại",
    highlighted: true,
  },
  {
    id: "threaded-replies",
    title: "Trả lời theo luồng",
    date: "14 MAY",
    datetime: "2026-05-14",
    description: "Phản hồi từng tin nhắn để giữ mạch trò chuyện rõ ràng",
  },
  {
    id: "file-sharing",
    title: "Gửi tệp & hình ảnh",
    date: "30 APR",
    datetime: "2026-04-30",
    description: "Chia sẻ ảnh, tài liệu và xem trước nội dung trước khi gửi",
  },
  {
    id: "group-chat",
    title: "Nhóm chat & thành viên",
    date: "18 APR",
    datetime: "2026-04-18",
    description: "Quản lý thành viên, vai trò và lời mời trong từng phòng chat",
  },
  {
    id: "smart-notifications",
    title: "Thông báo thông minh",
    date: "5 APR",
    datetime: "2026-04-05",
    description: "Tắt tiếng cuộc trò chuyện, ghim tin quan trọng và lọc tin chưa đọc",
  },
];

interface NewFeaturesPanelProps {
  id?: string;
  anchorRef: RefObject<HTMLElement | null>;
  labelledBy: string;
  onClose: () => void;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export default function NewFeaturesPanel({
  id = "new-features-panel",
  anchorRef,
  labelledBy,
  onClose,
}: NewFeaturesPanelProps) {
  const panelRef = useRef<HTMLDialogElement>(null);
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
    const panelWidth = Math.min(PANEL_WIDTH, viewportWidth - VIEWPORT_PADDING * 2);

    const left = clamp(
      rect.right - panelWidth,
      VIEWPORT_PADDING,
      viewportWidth - panelWidth - VIEWPORT_PADDING,
    );

    const top = clamp(rect.bottom + PANEL_GAP, VIEWPORT_PADDING, viewportHeight - VIEWPORT_PADDING);

    const transformOriginX = clamp(rect.left + rect.width / 2 - left, 0, panelWidth);

    setFloatingStyle({
      position: "fixed",
      left,
      top,
      width: panelWidth,
      "--available-height": `${Math.max(0, viewportHeight - top - VIEWPORT_PADDING)}px`,
      "--transform-origin": `${transformOriginX}px -${PANEL_GAP}px`,
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
      <div role="presentation" style={overlayStyle} onMouseDown={onClose} />
      <dialog
        open
        ref={panelRef}
        id={id}
        aria-modal="false"
        aria-labelledby={labelledBy}
        className="pointer-events-auto m-0 flex max-h-[var(--available-height)] flex-col overflow-hidden rounded-xl border border-secondary bg-[rgb(var(--backgroundColor-surface-container)/.96)] p-0 text-primary shadow-xl backdrop-blur-glass motion-safe:transition-[transform,scale,opacity]"
        style={{ ...floatingStyle, transformOrigin: "var(--transform-origin)" }}
      >
        <div className="flex shrink-0 items-center justify-between px-3.5 pb-1.5 pt-3.5">
          <h2 id={labelledBy} className="m-0 text-[14px] font-semibold leading-[1.2] tracking-normal">
            Tính năng mới
          </h2>
          <button
            type="button"
            aria-label="Đóng tính năng mới"
            className="flex size-6 items-center justify-center rounded-full text-secondary transition-colors hover:bg-[rgb(var(--backgroundColor-state-hover)/.45)] focus-ring"
            onClick={onClose}
          >
            <CloseIcon size={15} />
          </button>
        </div>

        <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain px-2.5 pb-2.5">
          <div className="flex flex-col gap-1">
            {FEATURE_UPDATES.map((item, index) => (
              <article
                key={item.id}
                className={`grid grid-cols-[minmax(0,1fr)_auto] gap-x-2.5 rounded-[7px] px-2.5 py-2.5 transition-colors motion-safe:animate-m3-menu-item-enter ${item.highlighted
                  ? "bg-[rgb(var(--backgroundColor-state-enabled)/.58)]"
                  : "hover:bg-[rgb(var(--backgroundColor-state-hover)/.35)]"
                  }`}
                style={{ "--stagger-index": index + 1 } as CSSProperties}
              >
                <h3 className="m-0 text-[14px] font-semibold leading-[1.25] tracking-normal text-primary">
                  {item.title}
                </h3>
                <time
                  dateTime={item.datetime}
                  className="pt-[1px] text-[11px] font-semibold leading-[1.25] tracking-normal text-disabled"
                >
                  {item.date}
                </time>
                <p className="col-start-1 m-0 mt-1 text-[12px] font-semibold leading-[1.35] tracking-normal text-secondary">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </dialog>
    </div>,
    document.body,
  );
}
