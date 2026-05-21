"use client";

import { motion } from "framer-motion";
import { Info } from "lucide-react";

import type { ChatMessage } from "./chat-message-types";
import { formatTime, msgVariants } from "./chat-message-utils";

interface ChatSystemMessageProps {
  msg: ChatMessage;
  reduceMotion?: boolean;
}

export default function ChatSystemMessage({ msg, reduceMotion }: ChatSystemMessageProps) {
  return (
    <motion.div
      variants={msgVariants as any}
      initial={reduceMotion ? false : "hidden"}
      animate="visible"
      className="my-3 flex justify-center px-3"
    >
      <div
        className="inline-flex max-w-[86%] items-center gap-2 rounded-2xl px-3 py-1.5 text-[12px] leading-[1.45]"
        style={{
          background: "rgb(var(--backgroundColor-surface-container) / 0.36)",
          border: "1px solid rgb(var(--borderColor-secondary) / 0.12)",
          color: "rgb(var(--textColor-secondary))",
        }}
      >
        <Info size={14} strokeWidth={1.5} aria-hidden="true" className="shrink-0" />
        <span className="min-w-0 text-center">{msg.text}</span>
        <span className="hidden shrink-0 opacity-60 sm:inline">{formatTime(msg.timestamp)}</span>
      </div>
    </motion.div>
  );
}
