import React from "react";
import {
  PaletteIcon,
  CloseIcon,
  PlusIcon,
  MoreDotsIcon,
  ChevronDownIcon
} from "./icons";

interface DesignListContentProps {
  onClose?: () => void;
  onSelectPreset?: (preset: string) => void;
}

export default function DesignListContent({ onClose, onSelectPreset }: DesignListContentProps) {
  const presets = [
    { name: "Alexandria", topColor: "#0f4a8a", bottomColor: "#fde047", btnColor: "#3b82f6" },
    { name: "Bauhaus", topColor: "#b91c1c", bottomColor: "#1d4ed8", btnColor: "#1f2937" },
    { name: "Glacier", topColor: "#7dd3fc", bottomColor: "#c4b5fd", btnColor: "#7dd3fc", btnText: "#000" },
    { name: "Carbon", topColor: "#1d4ed8", bottomColor: "#15803d", btnColor: "#2563eb" },
    { name: "Neon Tokyo", topColor: "#10b981", bottomColor: "#facc15", btnColor: "#f43f5e" },
    { name: "Terra", topColor: "#4ade80", bottomColor: "#a16207", btnColor: "#4ade80" },
  ];

  return (
    <div className="flex flex-1 flex-col min-h-0 text-primary">
      {/* Header */}
      <div className="flex items-center justify-between p-4 flex-shrink-0">
        <div className="flex items-center gap-2 font-medium">
          <PaletteIcon size={20} />
          <span>DESIGN.md</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-full hover:bg-state-hover text-secondary transition-colors"
        >
          <CloseIcon size={16} />
        </button>
      </div>

      <div className="flex flex-col gap-2 px-3 pb-2">
        <button className="flex items-center gap-3 p-2 font-medium hover:bg-state-hover rounded-xl transition-colors">
          <PlusIcon size={18} />
          Start with your design
        </button>
        <button className="flex items-center gap-3 p-2 font-medium hover:bg-state-hover rounded-xl transition-colors">
          <PlusIcon size={18} />
          Create new
        </button>
      </div>

      <div className="px-5 text-sm text-secondary font-medium mt-2 mb-1">
        Stitch Presets
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-3 pb-4 flex flex-col gap-1 hide-scrollbar">
        {presets.map((p, i) => (
          <button
            key={p.name}
            onClick={() => onSelectPreset?.(p.name)}
            className={`flex flex-col p-3 rounded-xl transition-colors ${
              i === 0 ? "bg-[rgb(var(--backgroundColor-state-hover))]" : "hover:bg-[rgb(var(--backgroundColor-state-hover))]"
            }`}
          >
            <span className="text-sm font-medium mb-2 text-left">{p.name}</span>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-4">
                <span className="font-serif text-[1.1rem]">Aa</span>
                <div 
                  className="w-6 h-6 rounded-full overflow-hidden" 
                  style={{ background: `linear-gradient(180deg, ${p.topColor} 50%, ${p.bottomColor} 50%)` }}
                />
                <div
                  className="px-3 py-1 rounded-md text-xs font-medium border border-black/5"
                  style={{ backgroundColor: p.btnColor, color: p.btnText || "white" }}
                >
                  Button
                </div>
              </div>
              <div className="flex items-center gap-2 text-secondary">
                <MoreDotsIcon size={20} />
                <span className="-rotate-90">
                  <ChevronDownIcon size={16} />
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
