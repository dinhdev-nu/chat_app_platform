"use client";

import React, { useState } from "react";
import HeaderActions from "./HeaderActions";
import ProfileModal from "./ProfileModal";
import { useAuthStore } from "@/stores/authStore";

export default function ChatHeader() {
  const [isShareOpen, setIsShareOpen] = useState(false);
  const user = useAuthStore((state) => state.user);

  return (
    <>
      <header
        className="
        sticky top-0 z-30 flex w-full shrink-0 box-border
        justify-between items-center gap-3 md:gap-8
        pl-4 pr-2 md:px-6
        h-14 bg-transparent border-b border-transparent
      "
      >
        <div className="flex w-full flex-row gap-5 items-center">
          <a href="/" className="select-none cursor-pointer no-underline focus-ring rounded-md">
            <img
              alt="Tên sản phẩm, Stello (beta)"
              className="block dark:invert dark:opacity-90 h-6"
              src="/assets/home/stello_beta.svg"
            />
          </a>
        </div>

        <HeaderActions
          userName={user?.name ?? user?.email}
          userAvatarUrl={user?.avatarUrl}
          onAccountClick={() => setIsShareOpen(true)}
        />
      </header>
      <ProfileModal open={isShareOpen} onOpenChange={setIsShareOpen} />
    </>
  );
}
