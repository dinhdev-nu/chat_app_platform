"use client";

import { useEffect, useState, type CSSProperties } from "react";

const words = ["trò chuyện", "làm việc", "chia sẻ", "gắn kết"];
const gradientColors = ["#eca8d6", "#a78bfa", "#67e8f9", "#fbbf24", "#eca8d6"];

function BlurWord({ word, trigger }: { word: string; trigger: number }) {
  const letters = word.split("");

  return (
    <>
      {letters.map((char, i) => {
        const colorIndex = (i / Math.max(letters.length - 1, 1)) * (gradientColors.length - 1);
        const lower = Math.floor(colorIndex);
        const upper = Math.min(lower + 1, gradientColors.length - 1);
        const t = colorIndex - lower;

        // lerp hex colours
        const hex2rgb = (hex: string) => {
          const r = parseInt(hex.slice(1, 3), 16);
          const g = parseInt(hex.slice(3, 5), 16);
          const b = parseInt(hex.slice(5, 7), 16);
          return [r, g, b];
        };
        const [r1, g1, b1] = hex2rgb(gradientColors[lower]);
        const [r2, g2, b2] = hex2rgb(gradientColors[upper]);
        const r = Math.round(r1 + (r2 - r1) * t);
        const g = Math.round(g1 + (g2 - g1) * t);
        const b = Math.round(b1 + (b2 - b1) * t);

        return (
          <span
            key={`${trigger}-${i}-${char}`}
            className="blur-word-char"
            style={{
              "--blur-word-color": `rgb(${r},${g},${b})`,
              animationDelay: `${i * 45}ms`,
              animationDuration: "700ms",
            } as CSSProperties}
          >
            {char === " " ? "\u00A0" : char}
          </span>
        );
      })}
    </>
  );
}

export function HeroSection() {
  const isVisible = true;
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % words.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col justify-center items-start overflow-hidden bg-[oklch(0.06_0.008_260)]">
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
        {/* Subtle overlay to ensure text readability on the left */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
      </div>

      {/* Subtle grid lines */}
      <div className="absolute inset-0 z-[2] overflow-hidden pointer-events-none opacity-20">
        {[...Array(8)].map((_, i) => (
          <div
            key={`h-${i}`}
            className="absolute h-px bg-white/10"
            style={{
              top: `${12.5 * (i + 1)}%`,
              left: 0,
              right: 0,
            }}
          />
        ))}
        {[...Array(12)].map((_, i) => (
          <div
            key={`v-${i}`}
            className="absolute w-px bg-white/10"
            style={{
              left: `${8.33 * (i + 1)}%`,
              top: 0,
              bottom: 0,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 lg:px-12 py-32 lg:py-40">
        <div className="lg:max-w-[55%]">
          {/* Eyebrow */}
          <div
            className={`mb-8 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
          >
            <span className="inline-flex max-w-full items-start gap-3 whitespace-normal text-sm font-mono text-white/60">
              <span className="mt-[0.7em] h-px w-8 shrink-0 bg-white/30" />
              <span className="min-w-0 max-w-[28ch] leading-relaxed sm:max-w-none">
                Nền tảng giao tiếp hiện đại dành cho mọi người
              </span>
            </span>
          </div>

          {/* Main headline */}
          <div className="mb-12">
            <h1
              className={`text-left text-[clamp(1.75rem,5vw,5.5rem)] font-display leading-[1.1] tracking-tight text-white transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
            >
              <span className="block sm:whitespace-nowrap">Kết nối mọi người,</span>
              <span className="block sm:whitespace-nowrap">
                để cùng nhau{" "}
                <span className="relative inline-block">
                  <BlurWord word={words[wordIndex]} trigger={wordIndex} />
                </span>
              </span>
            </h1>
          </div>
        </div>
      </div>

      {/* Stats — 3 metrics static, no auto-scroll */}
      <div
        className={`absolute bottom-8 left-0 right-0 px-6 sm:bottom-12 lg:px-12 transition-all duration-700 delay-500 ${isVisible ? "opacity-100" : "opacity-0"
          }`}
      >
        <div className="mx-0 grid max-w-[18rem] grid-cols-1 items-start gap-2 sm:mx-auto sm:max-w-[1400px] sm:flex sm:gap-10 lg:gap-20">
          {[
            { value: "10M+", label: "người dùng tích cực" },
            { value: "99.9%", label: "thời gian hoạt động" },
            { value: "<10ms", label: "độ trễ tin nhắn" },
          ].map((stat) => (
            <div key={stat.label} className="grid min-w-0 grid-cols-[4.5rem_minmax(0,1fr)] items-baseline gap-x-3 sm:flex sm:flex-col sm:gap-2">
              <span className="block max-w-full whitespace-nowrap text-2xl sm:text-3xl lg:text-4xl font-display text-white">{stat.value}</span>
              <span className="block w-full max-w-full break-words text-[11px] sm:text-xs text-white/50 leading-tight">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}

    </section>
  );
}
