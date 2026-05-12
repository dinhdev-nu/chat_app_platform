"use client";

import React, { useState } from "react";
import { GridIcon, UsersIcon, SearchIcon, CloseIcon, ListBulletIcon } from "./icons";
import ProjectItem from "./ProjectItem";



interface SidebarProject {
  name: string;
  date: string;
  thumbnailUrl?: string;
  thumbnailBgColor?: string;
  deviceType: "desktop" | "mobile";
  shared?: boolean;
  pinned?: boolean;
}

const PROJECT_GROUPS: SidebarProject[] = [
  {
    name: "Adaline UI Clone",
    date: "Apr 10, 2026",
    thumbnailUrl: "/assets/home/iVBORw0KGg_4.png",
    deviceType: "desktop",
  },
  {
    name: "Lumina POS Dashboard",
    date: "Mar 22, 2026",
    thumbnailUrl: "/assets/home/iVBORw0KGg_5.png",
    deviceType: "desktop",
  },
  {
    name: "Màn hình Đăng nhập/Đăng ký",
    date: "Nov 23, 2025",
    thumbnailBgColor: "rgb(201 213 217)",
    deviceType: "desktop",
  },
  {
    name: "Main Dashboard",
    date: "Mar 14, 2026",
    thumbnailUrl: "/assets/home/iVBORw0KGg_6.png",
    deviceType: "mobile",
    shared: true,
  },
  {
    name: "Home Lookbook",
    date: "Mar 14, 2026",
    thumbnailUrl: "/assets/home/iVBORw0KGg_7.png",
    deviceType: "mobile",
    shared: true,
  },
  {
    name: "Vertical Feed",
    date: "Mar 14, 2026",
    thumbnailUrl: "/assets/home/iVBORw0KGg_8.png",
    deviceType: "mobile",
    shared: true,
  },
  {
    name: "Dashboard",
    date: "Mar 14, 2026",
    thumbnailUrl: "/assets/home/iVBORw0KGg_9.png",
    deviceType: "mobile",
    shared: true,
  },
  {
    name: "Fleet Admin Dashboard",
    date: "Mar 14, 2026",
    thumbnailUrl: "/assets/home/iVBORw0KGg_10.png",
    deviceType: "desktop",
    shared: true,
  },
];

interface ProjectSidebarProps {
  isMobileOpen?: boolean;
  onClose?: () => void;
}

export default function ProjectSidebar({
  isMobileOpen = false,
  onClose,
}: ProjectSidebarProps) {
  const [activeTab, setActiveTab] = useState<"mine" | "shared">("mine");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <section
      id="recent-projects-panel"
      className={`
        flex flex-col gap-2 fixed inset-x-0 bottom-0 z-20 p-4
        overflow-y-auto rounded-t-2xl
        transition-transform duration-300 ease-in-out
        md:pointer-events-auto md:static md:translate-y-0 md:z-auto md:p-3 md:gap-4
        md:overflow-visible md:rounded-none md:border-t-0 md:shrink-0
        [height:calc(100vh-80px)] md:h-full
        ${isMobileOpen ? "pointer-events-auto translate-y-0" : "pointer-events-none translate-y-full"}
      `}
    >
      <div
        className="
          flex flex-col flex-1 min-h-0
          rounded-2xl p-3 overflow-y-auto hide-scrollbar
          bg-[rgb(var(--backgroundColor-surface-container)/.5)]
          backdrop-blur-[40px]
          border border-[rgb(var(--borderColor-secondary)/.15)]
          w-full md:w-[375px]
        "
      >
        <div className="md:hidden flex items-center justify-between gap-3 pb-3">
          <div className="flex items-center gap-2 text-sm font-medium text-[rgb(var(--textColor-primary))]">
            <span className="text-[rgb(var(--textColor-primary))]">
              <ListBulletIcon />
            </span>
            Dự án gần đây
          </div>
          <button
            type="button"
            aria-label="Đóng menu"
            className="flex h-8 w-8 items-center justify-center rounded-full text-[rgb(var(--textColor-primary))] transition-colors hover:bg-[rgb(var(--backgroundColor-state-hover))]"
            onClick={onClose}
          >
            <CloseIcon />
          </button>
        </div>

        <div className="hide-scrollbar flex w-full flex-1 flex-col gap-1 overflow-y-scroll pb-4">

          {/* Tab Toggle */}
          <div
            role="radiogroup"
            className="
              relative flex gap-1 p-0.5 rounded-[32px] mb-2
              bg-[rgb(var(--backgroundColor-surface-container)/.5)]
              backdrop-blur-[40px]
            "
          >
            {/* My Projects Tab */}
            <button
              type="button"
              role="radio"
              aria-checked={activeTab === "mine"}
              className={`
                relative flex-1 px-2 py-2 rounded-[32px]
                text-sm font-medium cursor-pointer transition-colors z-10 text-center
                ${activeTab === "mine" ? "text-[rgb(var(--textColor-primary))]" : "text-[rgb(var(--textColor-secondary))]"}
              `}
              tabIndex={0}
              onClick={() => setActiveTab("mine")}
            >
              {activeTab === "mine" && (
                <div className="absolute inset-0 z-0 rounded-[32px] bg-[rgb(var(--backgroundColor-state-active))]" />
              )}
              <span className="relative z-10 flex items-center justify-center gap-1.5">
                <span className="text-[rgb(var(--textColor-primary))]">
                  <GridIcon />
                </span>
                Đoạn chat của tôi
              </span>
            </button>

            {/* Shared Tab */}
            <button
              type="button"
              role="radio"
              aria-checked={activeTab === "shared"}
              className={`
                relative flex-1 px-2 py-2 rounded-[32px]
                text-sm font-medium cursor-pointer transition-colors z-10 text-center
                ${activeTab === "shared" ? "text-[rgb(var(--textColor-primary))]" : "text-[rgb(var(--textColor-secondary))]"}
              `}
              tabIndex={0}
              onClick={() => setActiveTab("shared")}
            >
              {activeTab === "shared" && (
                <div className="absolute inset-0 z-0 rounded-[32px] bg-[rgb(var(--backgroundColor-state-active))]" />
              )}
              <span className="relative z-10 flex items-center justify-center gap-1.5">
                <span className="text-[#757575]">
                  <UsersIcon />
                </span>
                Ban bè của tôi
              </span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="sticky top-0 z-10">
            <div
              className="
                search-box flex items-center p-2.5 rounded-full
                transition-colors duration-200
                bg-[rgb(var(--backgroundColor-state-enabled)/.575)]
                backdrop-blur-[12px]
              "
            >
              <span className="pl-1 pr-2 text-[rgb(var(--textColor-secondary))]">
                <SearchIcon />
              </span>
              <input
                placeholder={activeTab === "mine" ? "Tìm kiếm đoạn chat" : "Tìm kiếm bạn bè"}
                className="w-full bg-transparent text-sm outline-none text-[rgb(var(--textColor-primary))]"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="h-3" />
          </div>

          {/* Project List */}
          <ul>
            {PROJECT_GROUPS.map((project) => (
              <ProjectItem
                key={project.name}
                name={project.name}
                date={project.date}
                thumbnailUrl={project.thumbnailUrl}
                thumbnailBgColor={project.thumbnailBgColor}
                deviceType={project.deviceType}
                shared={project.shared}
              />
            ))}
          </ul>
        </div>
      </div>

    </section>
  );
}