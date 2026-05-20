"use client";

import AuthCard from "./login-card";
import { FC } from "react";
import { motion, Variants } from "framer-motion";

interface AuthHeroProps {
  onSubmit?: (email: string) => void;
  loading?: boolean;
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

const AuthHero: FC<AuthHeroProps> = ({ onSubmit, loading }) => {
  return (
    <main className="relative h-screen flex items-center justify-center lg:items-start lg:justify-start overflow-hidden bg-black">
      {/* Background video */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
          className="w-full h-full object-cover object-center opacity-80"
        >
          <source src="/images/bg-hero.mp4" type="video/mp4" />
        </video>
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
      </div>

      {/* Content */}
      <motion.div
        className="relative z-10 w-full max-w-[700px] px-10 pt-28 pb-10 lg:pt-36 lg:pb-16 text-center lg:text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <h1 className="text-[clamp(2.2rem,4vw,3rem)] font-display leading-[0.92] tracking-tight text-white mb-4">
          <motion.span variants={lineVariants} className="block whitespace-nowrap">
            Think fast,
          </motion.span>
          <motion.span variants={lineVariants} className="block whitespace-nowrap">
            build faster
          </motion.span>
        </h1>

        <motion.p variants={lineVariants} className="text-base text-white/70 mb-8">
          Brainstorm in Claude, build in Cowork
        </motion.p>

        {/* AuthCard has its own entrance animation */}
        <motion.div variants={lineVariants}>
          <AuthCard onSubmit={onSubmit} loading={loading} />
        </motion.div>
      </motion.div>
    </main>
  );
};

export default AuthHero;