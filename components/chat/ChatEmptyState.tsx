"use client";

import React from "react";
import { motion } from "framer-motion";
import { ForumIcon, UsersIcon, PlusIcon, SparkleIcon } from "./icons";

interface ChatEmptyStateProps {
  onNewDM?: () => void;
  onNewGroup?: () => void;
}

const QUICK_ACTIONS = [
  { icon: <ForumIcon size={14} />, label: "Nhắn tin mới" },
  { icon: <UsersIcon size={14} />, label: "Tạo nhóm" },
  { icon: <PlusIcon size={14} />, label: "Thêm bạn bè" },
];

// ease tuple typed as const to satisfy framer-motion v12 Easing type
const EASE_SPRING = [0.16, 1, 0.3, 1] as [number, number, number, number];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: EASE_SPRING },
  },
};

export default function ChatEmptyState({ onNewDM, onNewGroup }: ChatEmptyStateProps) {
  return (
    <div className="relative flex flex-1 flex-col items-center justify-center w-full h-full overflow-hidden bg-transparent select-none">
      {/* Background orbs — very subtle, direct animate props (no variants needed) */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 280,
          height: 280,
          top: "20%",
          left: "50%",
          transform: "translateX(-50%)",
          background:
            "radial-gradient(circle, rgb(var(--textColor-accent) / 0.06) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
        animate={{ y: [0, -12, 0], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 180,
          height: 180,
          bottom: "28%",
          right: "18%",
          background:
            "radial-gradient(circle, rgb(var(--colors-violet-400) / 0.05) 0%, transparent 70%)",
          filter: "blur(32px)",
        }}
        animate={{ y: [0, -12, 0], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
      />

      {/* Main content */}
      <motion.div
        className="relative z-10 flex flex-col items-center gap-8 px-6 max-w-sm text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Icon cluster */}
        <motion.div variants={itemVariants} className="relative flex items-center justify-center">
          {/* Outer ring */}
          <div
            className="absolute rounded-full"
            style={{
              width: 96,
              height: 96,
              border: "1px solid rgb(var(--borderColor-secondary) / 0.12)",
              background: "rgb(var(--backgroundColor-surface-container) / 0.3)",
            }}
          />
          {/* Icon wrapper */}
          <motion.div
            className="relative z-10 flex items-center justify-center rounded-full"
            style={{
              width: 64,
              height: 64,
              background: "rgb(var(--backgroundColor-surface-container) / 0.5)",
              border: "1px solid rgb(var(--borderColor-secondary) / 0.15)",
              backdropFilter: "blur(40px)",
              WebkitBackdropFilter: "blur(40px)",
              boxShadow:
                "0 4px 24px -4px rgb(0 0 0 / 0.10), 0 1px 6px -1px rgb(0 0 0 / 0.06)",
            }}
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            <ForumIcon size={28} className="text-[rgb(var(--textColor-secondary))]" />
          </motion.div>

          {/* Satellite sparkle */}
          <motion.div
            className="absolute"
            style={{ top: 2, right: 4 }}
            animate={{ scale: [1, 1.25, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          >
            <SparkleIcon size={14} className="text-[rgb(var(--textColor-accent))]" />
          </motion.div>
        </motion.div>

        {/* Text */}
        <motion.div variants={itemVariants} className="flex flex-col gap-2">
          <h2
            className="font-sans font-semibold leading-tight"
            style={{
              fontSize: "clamp(1.15rem, 3vw, 1.35rem)",
              color: "rgb(var(--textColor-primary))",
            }}
          >
            Chưa có cuộc trò chuyện nào
          </h2>
          <p
            className="text-body-sm leading-relaxed"
            style={{ color: "rgb(var(--textColor-secondary))" }}
          >
            Chọn một cuộc trò chuyện từ danh sách hoặc bắt đầu nhắn tin với bạn bè.
          </p>
        </motion.div>

        {/* Quick action pills */}
        <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-2">
          {QUICK_ACTIONS.map((action, i) => (
            <motion.button
              key={i}
              type="button"
              className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-full text-[13px] font-medium leading-[150%] transition-all duration-150 ease-out focus-ring"
              style={{
                background: "rgb(var(--backgroundColor-state-enabled) / 0.575)",
                backdropFilter: "blur(40px)",
                WebkitBackdropFilter: "blur(40px)",
                border: "1px solid rgb(var(--borderColor-secondary) / 0.15)",
                boxShadow: "0 1px 2px 0 rgba(0,0,0,0.05)",
                color: "rgb(var(--textColor-primary))",
              }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={i === 0 ? onNewDM : i === 1 ? onNewGroup : undefined}
            >
              <span style={{ color: "rgb(var(--textColor-secondary))" }}>{action.icon}</span>
              {action.label}
            </motion.button>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
