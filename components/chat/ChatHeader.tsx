"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
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
          <Link href="/" className="select-none cursor-pointer no-underline focus-ring rounded-md">
            <Image
              alt="Ten san pham, Stello (beta)"
              width={129}
              height={24}
              unoptimized
              className="block h-6 dark:invert dark:opacity-90"
              src="/assets/home/stello_beta.svg"
            />
          </Link>
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
