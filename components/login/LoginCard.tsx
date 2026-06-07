"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AnimatePresence, m } from "framer-motion";
import type { Variants } from "framer-motion";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

interface AuthCardProps {
  onSendOtp?: (email: string) => void | Promise<void>;
  onVerifyOtp?: (email: string, otp: string) => void | Promise<void>;
  error?: string | null;
  isSendingOtp?: boolean;
  isVerifyingOtp?: boolean;
  otpExpiresAt?: string | null;
}

const fadeSlideVariants: Variants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 40 : -40,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.35, ease: [0.32, 0.72, 0, 1] },
  },
  exit: (dir: number) => ({
    x: dir > 0 ? -40 : 40,
    opacity: 0,
    transition: { duration: 0.25, ease: [0.32, 0.72, 0, 1] },
  }),
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.3, ease: "easeOut" },
  }),
};

function formatOtpExpiry(otpExpiresAt?: string | null) {
  if (!otpExpiresAt) return null;

  const expiresAt = Date.parse(otpExpiresAt);
  if (!Number.isFinite(expiresAt)) return null;

  const seconds = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

export default function AuthCard({
  onSendOtp,
  onVerifyOtp,
  error,
  isSendingOtp = false,
  isVerifyingOtp = false,
  otpExpiresAt,
}: AuthCardProps) {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [direction, setDirection] = useState(1);

  const normalizedEmail = email.trim().toLowerCase();
  const otpExpiryLabel = formatOtpExpiry(otpExpiresAt);
  const isEmailSubmitDisabled = isSendingOtp || !normalizedEmail || !onSendOtp;
  const isOtpSubmitDisabled = isVerifyingOtp || otp.length !== 6 || !onVerifyOtp;

  const goToOtp = async (event?: FormEvent) => {
    event?.preventDefault();
    if (isEmailSubmitDisabled) return;

    try {
      await onSendOtp?.(normalizedEmail);
      setOtp("");
      setDirection(1);
      setStep("otp");
    } catch {
      // Store-level error is rendered below.
    }
  };

  const goBack = () => {
    setDirection(-1);
    setStep("email");
  };

  const handleOtpSubmit = async (event?: FormEvent) => {
    event?.preventDefault();
    if (isOtpSubmitDisabled) return;

    try {
      await onVerifyOtp?.(normalizedEmail, otp);
    } catch {
      // Store-level error is rendered below.
    }
  };

  const handleResendOtp = async () => {
    if (!normalizedEmail || isSendingOtp || !onSendOtp) return;

    try {
      await onSendOtp(normalizedEmail);
      setOtp("");
    } catch {
      // Store-level error is rendered below.
    }
  };

  return (
    <m.div
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
      className="relative w-full max-w-[320px] mx-auto overflow-hidden rounded-[1.9rem] border border-border/40 bg-card/40 backdrop-blur-2xl shadow-2xl"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.15),transparent_50%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.05),transparent_40%)] z-0" />

      <div className="relative z-10 p-6">
        <AnimatePresence mode="wait" custom={direction}>
          {step === "email" ? (
            <m.div
              key="email-step"
              custom={direction}
              variants={fadeSlideVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              <form onSubmit={goToOtp} className="space-y-4">
                <m.div custom={0} variants={itemVariants} initial="hidden" animate="visible">
                  <button
                    type="button"
                    disabled
                    aria-disabled={true}
                    className="w-full inline-flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl border border-border/50 bg-secondary/30 text-foreground opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-all"
                  >
                    <Image src="/google.svg" alt="" width={20} height={20} unoptimized className="size-5" />
                    Tiếp tục với Google
                  </button>
                </m.div>

                <m.div
                  custom={1}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  className="text-center text-xs text-muted-foreground"
                >
                  HOẶC
                </m.div>

                <m.label custom={2} variants={itemVariants} initial="hidden" animate="visible" className="block">
                  <span className="sr-only">Email</span>
                  <input
                    type="email"
                    aria-label="Email"
                    placeholder="Nhập email của bạn"
                    required
                    autoComplete="email"
                    spellCheck={false}
                    value={email}
                    disabled={isSendingOtp}
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full rounded-xl border border-white/20 bg-black/20 px-3 py-2.5 text-foreground placeholder:text-foreground/60 shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-all hover:bg-black/40 hover:border-white/30 disabled:opacity-60"
                  />
                </m.label>

                {error ? (
                  <m.p
                    custom={3}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    className="text-xs text-red-200 text-center"
                    role="alert"
                  >
                    {error}
                  </m.p>
                ) : null}

                <m.div custom={4} variants={itemVariants} initial="hidden" animate="visible">
                  <button
                    type="submit"
                    className="w-full px-4 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium disabled:opacity-60 disabled:cursor-not-allowed hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-all"
                    disabled={isEmailSubmitDisabled}
                    aria-disabled={isEmailSubmitDisabled}
                  >
                    {isSendingOtp ? "Đang gửi mã…" : "Tiếp tục với email"}
                  </button>
                </m.div>

                <m.p
                  custom={5}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  className="text-xs text-muted-foreground text-center"
                >
                  Bằng việc tiếp tục, bạn đồng ý với{" "}
                  <Link
                    href="#"
                    className="underline hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background rounded-sm transition-colors"
                  >
                    Chính sách Bảo mật
                  </Link>
                  .
                </m.p>
              </form>
            </m.div>
          ) : (
            <m.div
              key="otp-step"
              custom={direction}
              variants={fadeSlideVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              <form onSubmit={handleOtpSubmit} className="flex flex-col gap-y-5">
                <m.div
                  custom={0}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  className="flex items-center gap-1"
                >
                  <button
                    type="button"
                    onClick={goBack}
                    className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-full hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring -ml-1.5"
                    aria-label="Go back"
                  >
                    <ArrowLeft className="size-5" />
                  </button>
                  <h2 className="text-lg font-medium text-foreground">Nhập mã xác nhận</h2>
                </m.div>

                <m.p
                  custom={1}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  className="text-sm text-muted-foreground leading-snug"
                >
                  Chúng tôi đã gửi mã 6 chữ số đến{" "}
                  <span className="text-foreground font-medium break-all">{normalizedEmail}</span>
                  {otpExpiryLabel ? <span>. Hết hạn sau {otpExpiryLabel}</span> : null}
                </m.p>

                <m.div
                  custom={2}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  className="flex justify-center"
                >
                  <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                    <InputOTPGroup className="gap-1.5">
                      {[0, 1, 2, 3, 4, 5].map((i) => (
                        <InputOTPSlot
                          key={i}
                          index={i}
                          className="w-9 h-11 rounded-md border border-white/20 bg-black/20 text-foreground shadow-inner"
                        />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                </m.div>

                {error ? (
                  <m.p
                    custom={3}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    className="text-xs text-red-200 text-center"
                    role="alert"
                  >
                    {error}
                  </m.p>
                ) : null}

                <m.div custom={4} variants={itemVariants} initial="hidden" animate="visible">
                  <button
                    type="submit"
                    className="w-full px-4 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium disabled:opacity-60 disabled:cursor-not-allowed hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-all"
                    disabled={isOtpSubmitDisabled}
                    aria-disabled={isOtpSubmitDisabled}
                  >
                    {isVerifyingOtp ? (
                      <span className="inline-flex items-center gap-2">
                        <m.span
                          className="block size-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground"
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 0.7, ease: "linear" }}
                        />
                        Đang xác thực…
                      </span>
                    ) : (
                      "Xác nhận mã"
                    )}
                  </button>
                </m.div>

                <m.p
                  custom={5}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  className="text-xs text-muted-foreground text-center"
                >
                  Chưa nhận được mã?{" "}
                  <button
                    type="button"
                    disabled={isSendingOtp}
                    onClick={handleResendOtp}
                    className="text-foreground underline hover:no-underline focus-visible:outline-none rounded-sm focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
                  >
                    {isSendingOtp ? "Đang gửi…" : "Gửi lại"}
                  </button>
                </m.p>
              </form>
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </m.div>
  );
}
