"use client";

import React, { useState } from "react";
import { GridIcon, UsersIcon, SearchIcon } from "./icons";
import ProjectItem from "./ProjectItem";

const PROJECT_GROUPS = [
  {
    label: "30 ngày qua",
    projects: [
      {
        name: "Adaline UI Clone",
        date: "Apr 10, 2026",
        thumbnailUrl: "/assets/home/iVBORw0KGg_4.png",
        deviceType: "desktop" as const,
      },
    ],
  },
  {
    label: "Năm nay",
    projects: [
      {
        name: "Lumina POS Dashboard",
        date: "Mar 22, 2026",
        thumbnailUrl: "/assets/home/iVBORw0KGg_5.png",
        deviceType: "desktop" as const,
      },
    ],
  },
  {
    label: "Năm ngoái",
    projects: [
      {
        name: "Màn hình Đăng nhập/Đăng ký",
        date: "Nov 23, 2025",
        thumbnailBgColor: "rgb(201 213 217)",
        deviceType: "desktop" as const,
      },
    ],
  },
  {
    label: "Ví dụ",
    projects: [
      {
        name: "Main Dashboard",
        date: "Mar 14, 2026",
        thumbnailUrl: "/assets/home/iVBORw0KGg_6.png",
        deviceType: "mobile" as const,
        shared: true,
      },
      {
        name: "Home Lookbook",
        date: "Mar 14, 2026",
        thumbnailUrl: "/assets/home/iVBORw0KGg_7.png",
        deviceType: "mobile" as const,
        shared: true,
      },
      {
        name: "Vertical Feed",
        date: "Mar 14, 2026",
        thumbnailUrl: "/assets/home/iVBORw0KGg_8.png",
        deviceType: "mobile" as const,
        shared: true,
      },
      {
        name: "Dashboard",
        date: "Mar 14, 2026",
        thumbnailUrl: "/assets/home/iVBORw0KGg_9.png",
        deviceType: "mobile" as const,
        shared: true,
      },
      {
        name: "Fleet Admin Dashboard",
        date: "Mar 14, 2026",
        thumbnailUrl: "/assets/home/iVBORw0KGg_10.png",
        deviceType: "desktop" as const,
        shared: true,
      },
    ],
  },
];

export default function ProjectSidebar() {
  const [activeTab, setActiveTab] = useState<"mine" | "shared">("mine");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <section
      id="recent-projects-panel"
      className="
        flex flex-col gap-2 fixed inset-x-0 bottom-0 z-20 p-4
        translate-y-full overflow-y-auto rounded-t-2xl
        transition-transform duration-300 ease-in-out
        backdrop-blur-[40px]
        md:static md:translate-y-0 md:z-auto md:p-3 md:gap-4
        md:overflow-visible md:rounded-none md:border-t-0 md:shrink-0
        [height:calc(100vh-80px)] md:h-full
      "
    >
      {/* Desktop-only sidebar content */}
      <div
        className="
          hidden md:flex flex-col flex-1 min-h-0
          rounded-2xl p-3 overflow-y-auto hide-scrollbar
          bg-[rgb(var(--backgroundColor-surface-container)/.5)]
          backdrop-blur-[40px]
          border border-[rgb(var(--borderColor-secondary)/.15)]
          w-[375px]
        "
      >
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
              className="
                relative flex-1 px-2 py-2 rounded-[32px]
                text-sm font-medium cursor-pointer transition-colors z-10 text-center
              "
              style={{
                color: activeTab === "mine"
                  ? "rgb(var(--textColor-primary))"
                  : "rgb(var(--textColor-secondary))",
              }}
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
                Dự án của tôi
              </span>
            </button>

            {/* Shared Tab */}
            <button
              type="button"
              role="radio"
              aria-checked={activeTab === "shared"}
              className="
                relative flex-1 px-2 py-2 rounded-[32px]
                text-sm font-medium cursor-pointer transition-colors z-10 text-center
              "
              style={{
                color: activeTab === "shared"
                  ? "rgb(var(--textColor-primary))"
                  : "rgb(var(--textColor-secondary))",
              }}
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
                Được chia sẻ với tôi
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
                placeholder="Tìm kiếm dự án"
                className="w-full bg-transparent text-sm outline-none text-[rgb(var(--textColor-primary))]"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="h-3" />
          </div>

          {/* Project Groups */}
          {PROJECT_GROUPS.map((group) => (
            <ul key={group.label}>
              <div className="py-4 md:py-2 text-base font-semibold leading-[150%] text-[rgb(var(--textColor-secondary))] bg-transparent">
                {group.label}
              </div>
              {group.projects.map((project) => (
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
          ))}
        </div>
      </div>

      {/* Mobile toggle placeholder */}
      <div className="md:hidden" />
    </section>
  );
}