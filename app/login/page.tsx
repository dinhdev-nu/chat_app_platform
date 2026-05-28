"use client";

import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthHero from "../../components/login/login-hero";
import { Navigation } from "@/components/landing/navigation";
import { useAuthStore } from "@/stores/authStore";

export default function LoginPage() {
  const router = useRouter();
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
      router.replace("/chat");
    },
    [router, verifyOtp],
  );

  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <Navigation hideLinks />
      <AuthHero
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
