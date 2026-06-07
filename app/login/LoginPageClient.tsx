"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "@/components/landing";
import { LoginHero } from "@/components/login";
import { useAuthStore } from "@/stores/authStore";

export default function LoginPageClient() {
  const { replace } = useRouter();
  const error = useAuthStore((state) => state.error);
  const isSendingOtp = useAuthStore((state) => state.isSendingOtp);
  const isVerifyingOtp = useAuthStore((state) => state.isVerifyingOtp);
  const otpExpiresAt = useAuthStore((state) => state.otpExpiresAt);
  const sendOtp = useAuthStore((state) => state.sendOtp);
  const verifyOtp = useAuthStore((state) => state.verifyOtp);

  const handleSendOtp = useCallback(
    async (email: string) => {
      await sendOtp(email);
    },
    [sendOtp],
  );

  const handleVerifyOtp = useCallback(
    async (email: string, otp: string) => {
      await verifyOtp(email, otp);
      replace("/chat");
    },
    [replace, verifyOtp],
  );

  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <Navigation hideLinks />
      <LoginHero
        onSendOtp={handleSendOtp}
        onVerifyOtp={handleVerifyOtp}
        error={error}
        isSendingOtp={isSendingOtp}
        isVerifyingOtp={isVerifyingOtp}
        otpExpiresAt={otpExpiresAt}
      />
    </main>
  );
}
