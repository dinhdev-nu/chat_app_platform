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
      className="flex items-center justify-between gap-3 rounded-lg p-2 transition-colors"
      style={{
        fontSize: "14px",
        fontWeight: 400,
        lineHeight: "150%",
        borderColor: "rgb(var(--borderColor-invisible) / 0)",
        borderWidth: "1px",
        opacity: 1,
        transform: "scale(0.985)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.backgroundColor = "rgb(var(--backgroundColor-state-hover))";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
      }}
    >
      {/* Thumbnail */}
      <div>
        <div
          className="flex justify-center rounded-lg group relative opacity-100"
          style={{
            backgroundColor: "rgb(31 41 55)",
            boxShadow: thumbnailUrl
              ? "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)"
              : "none",
          }}
        >
          <div
            className="flex justify-center rounded-md bg-no-repeat overflow-hidden"
            style={{
              width: "2.5rem",
              height: "2.5rem",
              minWidth: "2.5rem",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundImage: thumbnailUrl
                ? `image-set(url(${thumbnailUrl}) 1x)`
                : "none",
              backgroundColor: thumbnailBgColor || "rgb(31 41 55)",
            }}
          />
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col justify-center">
        <p
          className="font-semibold"
          style={{
            color: "rgb(var(--textColor-primary))",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {name}
        </p>
        <div
          className="flex justify-between items-center"
          style={{
            fontSize: "13px",
            fontWeight: 400,
            lineHeight: "150%",
            color: "rgb(var(--textColor-secondary))",
            display: "-webkit-box",
            WebkitLineClamp: 1,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          <div className="flex items-center gap-1" style={{ fontSize: "10px" }}>
            <span className="text-inherit">
              <DeviceIconComponent size={12} />
            </span>
            <span>{date}</span>
            {shared && (
              <span className="flex items-center gap-1 ml-2">
                <span style={{ color: "rgb(var(--textColor-secondary))" }}>
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
