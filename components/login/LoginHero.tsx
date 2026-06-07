"use client";

import AuthCard from "./LoginCard";
import { FC } from "react";
import { m, type Variants } from "framer-motion";

interface AuthHeroProps {
  onSendOtp?: (email: string) => void | Promise<void>;
  onVerifyOtp?: (email: string, otp: string) => void | Promise<void>;
  error?: string | null;
  isSendingOtp?: boolean;
  isVerifyingOtp?: boolean;
  otpExpiresAt?: string | null;
}

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const lineVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.32, 0.72, 0, 1] },
  },
};

const AuthHero: FC<AuthHeroProps> = ({
  onSendOtp,
  onVerifyOtp,
  error,
  isSendingOtp,
  isVerifyingOtp,
  otpExpiresAt,
}) => {
  return (
    <main className="relative h-screen flex items-center justify-center lg:items-start lg:justify-start overflow-hidden bg-[oklch(0.06_0.008_260)]">
      {/* Background video */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          aria-label="Background video"
          className="w-full h-full object-cover object-center opacity-80"
        >
          <source src="/images/bg-hero.mp4" type="video/mp4" />
        </video>
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
      </div>

      {/* Content */}
      <m.div
        className="relative z-10 w-full max-w-[700px] px-10 pt-28 pb-10 lg:pt-36 lg:pb-16 text-center lg:text-center"
        variants={containerVariants}
        initial={false}
        animate="visible"
      >
        <h1 className="text-[clamp(2.2rem,4vw,3rem)] font-display leading-[0.92] tracking-tight text-white mb-4">
          <m.span variants={lineVariants} className="block sm:whitespace-nowrap">
            Nhanh,
          </m.span>
          <m.span variants={lineVariants} className="block sm:whitespace-nowrap">
            an toàn hơn
          </m.span>
        </h1>

        <m.p variants={lineVariants} className="text-base text-white/70 mb-8">
          Bắt đầu cuộc trò chuyện của bạn ngay hôm nay
        </m.p>

        {/* AuthCard has its own entrance animation */}
        <m.div variants={lineVariants}>
          <AuthCard
            onSendOtp={onSendOtp}
            onVerifyOtp={onVerifyOtp}
            error={error}
            isSendingOtp={isSendingOtp}
            isVerifyingOtp={isVerifyingOtp}
            otpExpiresAt={otpExpiresAt}
          />
        </m.div>
      </m.div>
    </main>
  );
};

export default AuthHero;
