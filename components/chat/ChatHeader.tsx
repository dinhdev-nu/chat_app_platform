"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import HeaderActions from "./HeaderActions";
import ShareProjectModal from "./ShareProjectModal";

export default function ChatHeader() {
  const router = useRouter();
  const [isShareOpen, setIsShareOpen] = useState(false);

  const handleLogout = () => {
    setIsShareOpen(false);
    router.push("/login");
  };

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
              alt="Tên sản phẩm, Stitch (beta)"
              className="block dark:invert dark:opacity-90"
              src="/assets/home/ICA8c3ZnIH.svg"
            />
          </a>
        </div>

        <HeaderActions onAccountClick={() => setIsShareOpen(true)} />
      </header>
      <ShareProjectModal open={isShareOpen} onOpenChange={setIsShareOpen} onLogout={handleLogout} />
    </>
  );
}
