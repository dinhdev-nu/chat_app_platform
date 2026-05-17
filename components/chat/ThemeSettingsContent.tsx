import React from "react";
import {
  BackIcon,
  ChevronDownIcon,
  ChevronDownSmIcon,
  EditIcon,
  FontIcon,
  MoonIcon,
  SunIcon,
} from "@/components/chat/icons";

interface ThemeSettingsContentProps {
  onBack?: () => void;
}

export default function ThemeSettingsContent({ onBack }: ThemeSettingsContentProps) {
  return (
    <div className="flex flex-1 flex-col gap-2 min-h-0">
      {/* ── Header: back + title input + edit ──────────────── */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Back button */}
        <div>
          <button
            onClick={onBack}
            className="flex items-center justify-center gap-2 bg-clip-border focus-visible:outline-2 focus-visible:outline-current focus-visible:-outline-offset-2 border-none bg-transparent text-primary enabled:hover:bg-state-hover enabled:active:bg-state-pressed text-subtitle-sm p-1.5 h-auto rounded-full"
            tabIndex={0}
            aria-label="Back to DESIGN.md list"
            style={{ transform: "none" }}
          >
            <span className="text-inherit">
              <BackIcon size={16} />
            </span>
          </button>
        </div>

        {/* Title input */}
        <input
          placeholder="Untitled Design System"
          className="flex-1 bg-transparent text-sm font-medium text-primary placeholder:text-secondary/60 outline-none border-b border-transparent focus:border-[rgb(var(--textColor-primary)/0.3)] transition-colors py-1"
          type="text"
          defaultValue="Hệ thống thiết kế của tôi"
        />

        {/* Edit button */}
        <div>
          <button
            className="flex items-center justify-center gap-2 bg-clip-border focus-visible:outline-2 focus-visible:outline-current focus-visible:-outline-offset-2 border-none bg-transparent text-primary enabled:hover:bg-state-hover enabled:active:bg-state-pressed text-subtitle-sm p-1.5 h-auto rounded-full"
            tabIndex={0}
            aria-label="Edit name"
            style={{ transform: "none" }}
          >
            <span className="text-inherit">
              <EditIcon size={16} />
            </span>
          </button>
        </div>
      </div>

      {/* ── Tabs: Theme / DESIGN.md ────────────────────────── */}
      <div className="flex items-center gap-6 flex-shrink-0 border-b border-divider">
        <div className="flex flex-1">
          <button
            type="button"
            className="relative flex-1 text-center px-1 pb-2.5 text-body-sm transition-colors -mb-px after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[3px] after:rounded-full after:transition-colors text-primary font-medium after:bg-current"
          >
            Theme
          </button>
        </div>
        <div className="flex flex-1">
          <button
            type="button"
            className="relative flex-1 text-center px-1 pb-2.5 text-body-sm transition-colors -mb-px after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[3px] after:rounded-full after:transition-colors text-secondary hover:text-primary after:bg-transparent"
          >
            DESIGN.md
          </button>
        </div>
      </div>

      {/* ── Scrollable content ─────────────────────────────── */}
      <div className="flex-1 grid min-h-0 -mr-4 pr-4">
        <div
          className="col-start-1 row-start-1 flex flex-col gap-3 min-h-0 overflow-y-auto hide-scrollbar h-full w-full"
          style={{ opacity: 1 }}
        >
          {/* Mode */}
          <div className="flex flex-col gap-3">
            <h3 className="text-caption text-primary">Mode</h3>
            <div
              role="radiogroup"
              className="relative flex gap-1 p-0.5 rounded-[32px] bg-surface-container backdrop-blur-[40px]"
            >
              {/* Light – active */}
              <button
                type="button"
                role="radio"
                aria-checked={true}
                className="relative flex-1 px-2 py-2 rounded-[32px] text-sm font-medium cursor-pointer transition-colors z-10 text-center text-primary"
                tabIndex={0}
                style={{ transform: "none" }}
              >
                <div
                  className="absolute inset-0 z-0 bg-state-active rounded-[32px]"
                  style={{ opacity: 1 }}
                />
                <span className="relative z-10">
                  <span className="flex items-center justify-center gap-2">
                    <span className="text-primary">
                      <SunIcon size={18} />
                    </span>
                    Light
                  </span>
                </span>
              </button>

              {/* Dark – inactive */}
              <button
                type="button"
                role="radio"
                aria-checked={false}
                className="relative flex-1 px-2 py-2 rounded-[32px] text-sm font-medium cursor-pointer transition-colors z-10 text-center text-secondary hover:text-primary hover:bg-state-hover"
                tabIndex={0}
                style={{ transform: "none" }}
              >
                <span className="relative z-10">
                  <span className="flex items-center justify-center gap-2">
                    <span className="text-primary">
                      <MoonIcon size={18} />
                    </span>
                    Dark
                  </span>
                </span>
              </button>
            </div>
          </div>

          {/* Seed Color */}
          <div className="flex flex-col gap-3">
            <h3 className="text-caption text-primary">Seed Color</h3>
            <div className="relative">
              <button className="flex w-full items-center justify-between p-2 hover:bg-state-menu-hover rounded-xl transition-colors">
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex-shrink-0"
                    style={{ backgroundColor: "rgb(25,120,229)" }}
                  />
                  <span className="text-body-md text-primary">#1978E5</span>
                </div>
                <span className="text-secondary pointer-events-none">
                  <ChevronDownIcon size={18} />
                </span>
              </button>
            </div>
          </div>

          {/* Color theme */}
          <div className="flex flex-col gap-3">
            <h3 className="text-caption text-primary">Color theme</h3>
            <div className="relative">
              <button
                className="flex w-full items-center justify-between p-2 hover:bg-state-menu-hover rounded-xl transition-colors"
                type="button"
              >
                <div className="flex items-center gap-3">
                  <svg width={32} height={32} viewBox="0 0 32 32">
                    <path d="M 0 16 A 16 16 0 0 1 32 16 L 16 16 Z" fill="#1275e2" />
                    <path d="M 16 16 L 0 16 A 16 16 0 0 0 16 32 Z" fill="#5f78a3" />
                    <path d="M 16 16 L 16 32 A 16 16 0 0 0 32 16 Z" fill="#c55b00" />
                  </svg>
                  <span className="text-body-md text-primary">Fidelity</span>
                </div>
                <span className="text-secondary pointer-events-none">
                  <ChevronDownIcon size={18} />
                </span>
              </button>
            </div>
          </div>

          {/* Color Palette */}
          <div className="flex flex-col gap-3">
            <h3 className="text-caption text-primary">Color Palette</h3>
            <div className="flex flex-col">
              {[
                { label: "Primary", color: "rgb(18,117,226)" },
                { label: "Secondary", color: "rgb(95,120,163)" },
                { label: "Tertiary", color: "rgb(197,91,0)" },
                { label: "Neutral", color: "rgb(116,119,127)" },
              ].map(({ label, color }) => (
                <div key={label} className="relative">
                  <button className="flex w-full items-center justify-between p-2 hover:bg-state-menu-hover rounded-xl transition-colors">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex-shrink-0"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-body-md text-primary">{label}</span>
                    </div>
                    <span className="text-secondary pointer-events-none">
                      <ChevronDownIcon size={18} />
                    </span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Phông chữ (Typography) */}
          <div className="flex flex-col gap-3">
            <h3 className="text-caption text-primary">Phông chữ</h3>
            <div className="flex flex-col">
              {[
                { role: "Headline" },
                { role: "Body" },
                { role: "Label" },
              ].map(({ role }) => (
                <div key={role} className="relative">
                  <button className="flex h-12 w-full items-center justify-between hover:bg-state-menu-hover rounded-xl transition-colors px-2">
                    <div className="flex items-center gap-3">
                      <span className="text-secondary">
                        <FontIcon size={18} />
                      </span>
                      <div className="flex flex-col items-start justify-center">
                        <span
                          className="h-5 flex items-center text-body-sm text-primary"
                          style={{ fontFamily: "Inter, sans-serif" }}
                        >
                          Inter
                        </span>
                        <span className="h-4 flex items-center text-caption text-secondary">
                          {role}
                        </span>
                      </div>
                    </div>
                    <span className="text-secondary">
                      <ChevronDownSmIcon size={16} />
                    </span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Bán kính góc (Corner radius) */}
          <div className="flex flex-col gap-3">
            <h3 className="text-caption text-primary">Bán kính góc</h3>
            <div className="flex gap-2">
              {/* None */}
              <button
                className="flex items-center justify-center gap-2 bg-clip-border focus-visible:outline-2 focus-visible:outline-current focus-visible:-outline-offset-2 border shadow-sm backdrop-blur-glass text-subtitle-md px-3 bg-state-enabled enabled:hover:bg-state-hover enabled:active:bg-state-pressed border-transparent text-secondary h-8 flex-1 rounded-xl"
                tabIndex={0}
              >
                <div className="border-l-2 border-t-2 rounded-tl-md border-secondary h-4 w-4" />
              </button>
              {/* Small – active */}
              <button
                className="flex items-center justify-center gap-2 bg-clip-border focus-visible:outline-2 focus-visible:outline-current focus-visible:-outline-offset-2 border shadow-sm backdrop-blur-glass text-subtitle-md px-3 enabled:hover:bg-state-hover enabled:active:bg-state-pressed border-primary bg-state-active text-primary h-8 flex-1 rounded-xl"
                tabIndex={0}
              >
                <div className="border-l-2 border-t-2 rounded-tl-lg border-primary h-4 w-4" />
              </button>
              {/* Medium */}
              <button
                className="flex items-center justify-center gap-2 bg-clip-border focus-visible:outline-2 focus-visible:outline-current focus-visible:-outline-offset-2 border shadow-sm backdrop-blur-glass text-subtitle-md px-3 bg-state-enabled enabled:hover:bg-state-hover enabled:active:bg-state-pressed border-transparent text-secondary h-8 flex-1 rounded-xl"
                tabIndex={0}
              >
                <div className="border-l-2 border-t-2 rounded-tl-xl border-secondary h-4 w-4" />
              </button>
              {/* Full */}
              <button
                className="flex items-center justify-center gap-2 bg-clip-border focus-visible:outline-2 focus-visible:outline-current focus-visible:-outline-offset-2 border shadow-sm backdrop-blur-glass text-subtitle-md px-3 bg-state-enabled enabled:hover:bg-state-hover enabled:active:bg-state-pressed border-transparent text-secondary h-8 flex-1 rounded-xl"
                tabIndex={0}
              >
                <div className="border-l-2 border-t-2 rounded-tl-full border-secondary h-4 w-4" />
              </button>
            </div>
          </div>

        </div>{/* end scrollable */}
      </div>

      {/* ── Footer: Save button ────────────────────────────── */}
      <div className="flex flex-shrink-0 pt-2 border-t border-divider">
        <div className="flex flex-1 flex-row flex-wrap gap-2">
          <button
            className="flex items-center justify-center gap-2 bg-clip-border focus-visible:outline-2 focus-visible:outline-current focus-visible:-outline-offset-2 border border-[rgb(var(--textColor-primary)/0.13)] shadow-sm enabled:hover:bg-state-hover enabled:active:bg-state-pressed backdrop-blur-glass text-subtitle-md px-3 h-8 flex-1 min-w-24 rounded-[20px] bg-state-enabled text-primary"
            tabIndex={0}
          >
            <span className="font-medium text-sm">Save</span>
          </button>
        </div>
      </div>
    </div>
  );
}
