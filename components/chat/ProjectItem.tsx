"use client";

import React from "react";
import { DesktopIcon, MobileIcon, UsersIcon } from "./icons";

interface ConversationItem {
  name: string;
  date: string;

}


interface ProjectItemProps {
  name: string;
  date: string;
  thumbnailUrl?: string;
  thumbnailBgColor?: string;
  deviceType?: "desktop" | "mobile";
  shared?: boolean;
}

export default function ProjectItem({
  name,
  date,
  thumbnailUrl,
  thumbnailBgColor,
  deviceType = "desktop",
  shared = false,
}: ProjectItemProps) {
  const DeviceIconComponent = deviceType === "mobile" ? MobileIcon : DesktopIcon;

  return (
    <li
      role="button"
      tabIndex={0}
      className="
        flex items-center justify-between gap-3 p-2 rounded-lg
        transition-colors duration-200 ease-out
        text-sm font-normal leading-[150%]
        border border-transparent opacity-100 scale-[0.985]
        hover:bg-[rgb(var(--backgroundColor-state-hover))]
      "
    >
      {/* Thumbnail */}
      <div
        className={`
          shrink-0 w-10 h-10 min-w-[2.5rem] rounded-lg
          bg-cover bg-center bg-no-repeat
          flex items-center justify-center overflow-hidden
          ${thumbnailUrl ? "shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.1)]" : ""}
        `}
        style={{
          backgroundImage: thumbnailUrl ? `image-set(url(${thumbnailUrl}) 1x)` : "none",
          backgroundColor: thumbnailBgColor || "rgb(31 41 55)",
        }}
      />

      {/* Info */}
      <div className="flex flex-1 flex-col justify-center min-w-0">
        <p className="font-semibold text-[rgb(var(--textColor-primary))] line-clamp-2">
          {name}
        </p>
        <div className="text-[13px] font-normal leading-[150%] text-[rgb(var(--textColor-secondary))] flex justify-between items-center line-clamp-1">
          <div className="flex items-center gap-1 text-[10px]">
            <span className="text-inherit">
              <DeviceIconComponent size={12} />
            </span>
            <span>{date}</span>
            {shared && (
              <span className="flex items-center gap-2 ml-2 text-[rgb(var(--textColor-secondary))]">
                <span>
                  <UsersIcon size={16} />
                </span>
                Đã chia sẻ
              </span>
            )}
          </div>
        </div>
      </div>
    </li>
  );
}
