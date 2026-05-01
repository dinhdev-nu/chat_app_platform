"use client";

import React from "react";
import { DesktopIcon, MobileIcon, UsersIcon } from "./icons";

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
      className="chat-project-item"
    >
      {/* Thumbnail */}
      <div
        className={`chat-project-item-thumbnail${thumbnailUrl ? " chat-project-item-thumbnail--with-image" : ""}`}
        style={{
          backgroundImage: thumbnailUrl ? `image-set(url(${thumbnailUrl}) 1x)` : "none",
          backgroundColor: thumbnailBgColor || "rgb(31 41 55)",
        }}
      />

      {/* Info */}
      <div className="flex flex-1 flex-col justify-center">
        <p className="chat-project-item-name">
          {name}
        </p>
        <div className="chat-project-item-meta">
          <div className="chat-project-item-date">
            <span className="text-inherit">
              <DeviceIconComponent size={12} />
            </span>
            <span>{date}</span>
            {shared && (
              <span className="chat-project-item-shared">
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
