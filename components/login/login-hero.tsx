"use client";

import AuthCard from "./login-card";
import { FC } from "react";

interface AuthHeroProps {
  onSubmit?: (email: string) => void;
  loading?: boolean;
}

const AuthHero: FC<AuthHeroProps> = ({ onSubmit, loading }) => {
  return (
    <main className="relative h-screen flex items-center justify-center lg:items-start lg:justify-start overflow-hidden bg-hero-pattern bg-black">
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
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
      </div>

      <div className="relative z-10 w-full max-w-[700px] px-10 py-10 lg:py-15 text-center lg:text-center">
        <h1 className="text-[clamp(2.5rem,4.5vw,3.4rem)] font-display leading-[0.92] tracking-tight transition-all duration-1000 text-white mb-4">
          <span className="block whitespace-nowrap">Think fast,</span>
          <span className="block whitespace-nowrap">build faster</span>
        </h1>
        <p className="text-base text-white/70 mb-5">Brainstorm in Claude, build in Cowork</p>

        <AuthCard onSubmit={onSubmit} loading={loading} />
      </div>
    </main>
  );
};

export default AuthHero;