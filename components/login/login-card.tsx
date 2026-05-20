"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

interface AuthCardProps {
  onSubmit?: (email: string) => void;
  loading?: boolean;
}

// Shared animation variants
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

export default function AuthCard({ onSubmit, loading = false }: AuthCardProps) {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
  // 1 = forward (email → otp), -1 = backward (otp → email)
  const [direction, setDirection] = useState(1);

  const goToOtp = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!email) return;
    setDirection(1);
    setStep("otp");
  };

  const goBack = () => {
    setDirection(-1);
    setStep("email");
  };

  const handleOtpSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (otp.length !== 6) return;
    onSubmit?.(email);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
      className="relative w-full max-w-[320px] mx-auto overflow-hidden rounded-[1.9rem] border border-border/40 bg-card/40 backdrop-blur-2xl shadow-2xl"
    >
      {/* Glassmorphism glare */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.15),transparent_50%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.05),transparent_40%)] z-0" />

      {/* Fixed-height content area — AnimatePresence handles step transitions */}
      <div className="relative z-10 p-6">
        <AnimatePresence mode="wait" custom={direction}>
          {step === "email" ? (
            <motion.div
              key="email-step"
              custom={direction}
              variants={fadeSlideVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              {/* ── STEP 1: EMAIL ── */}
              <form onSubmit={goToOtp} className="space-y-4">
                <motion.div custom={0} variants={itemVariants} initial="hidden" animate="visible">
                  <button
                    type="button"
                    className="w-full inline-flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl border border-border/50 bg-secondary/30 text-foreground hover:bg-secondary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-all"
                  >
                    <img src="/google.svg" alt="" width={20} height={20} className="w-5 h-5" />
                    Continue with Google
                  </button>
                </motion.div>

                <motion.div
                  custom={1}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  className="text-center text-xs text-muted-foreground"
                >
                  OR
                </motion.div>

                <motion.label custom={2} variants={itemVariants} initial="hidden" animate="visible" className="block">
                  <span className="sr-only">Email</span>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    required
                    autoComplete="email"
                    spellCheck={false}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-white/20 bg-black/20 px-3 py-2.5 text-foreground placeholder:text-foreground/60 shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-all hover:bg-black/40 hover:border-white/30"
                  />
                </motion.label>

                <motion.div custom={3} variants={itemVariants} initial="hidden" animate="visible">
                  <button
                    type="submit"
                    className="w-full px-4 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-all"
                  >
                    Continue with email
                  </button>
                </motion.div>

                <motion.p
                  custom={4}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  className="text-xs text-muted-foreground text-center"
                >
                  By continuing, you acknowledge Anthropic&apos;s{" "}
                  <Link
                    href="#"
                    className="underline hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background rounded-sm transition-colors"
                  >
                    Privacy Policy
                  </Link>
                  .
                </motion.p>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="otp-step"
              custom={direction}
              variants={fadeSlideVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              {/* ── STEP 2: OTP ── */}
              <form onSubmit={handleOtpSubmit} className="flex flex-col space-y-5">
                {/* Header row */}
                <motion.div
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
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <h2 className="text-lg font-medium text-foreground">Enter code</h2>
                </motion.div>

                <motion.p
                  custom={1}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  className="text-sm text-muted-foreground leading-snug"
                >
                  We sent a 6-digit code to{" "}
                  <span className="text-foreground font-medium break-all">{email}</span>
                </motion.p>

                {/* OTP slots — 6×w-9 (36px) + 5×gap-1.5 (6px) = 246px → fits 272px content area */}
                <motion.div
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
                </motion.div>

                <motion.div custom={3} variants={itemVariants} initial="hidden" animate="visible">
                  <button
                    type="submit"
                    className="w-full px-4 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium disabled:opacity-60 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-all"
                    disabled={loading || otp.length !== 6}
                    aria-disabled={loading || otp.length !== 6}
                  >
                    {loading ? (
                      <span className="inline-flex items-center gap-2">
                        <motion.span
                          className="block w-4 h-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground"
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 0.7, ease: "linear" }}
                        />
                        Verifying…
                      </span>
                    ) : (
                      "Verify code"
                    )}
                  </button>
                </motion.div>

                <motion.p
                  custom={4}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  className="text-xs text-muted-foreground text-center"
                >
                  Didn&apos;t receive it?{" "}
                  <button
                    type="button"
                    className="text-foreground underline hover:no-underline focus-visible:outline-none rounded-sm focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    Resend
                  </button>
                </motion.p>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}