"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const containerVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

const fadeUpVariants = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

const fadeVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.6 },
  },
};

export default function IntegrationsSection() {
  // Chỉ trigger animate sau khi client đã hydrate xong
  // Tránh flash: SSR render visible → JS set opacity:0 → animate
  const [isReady, setIsReady] = useState(false);
  useEffect(() => { setIsReady(true); }, []);

  return (
    <section
      id="integrations"
      aria-labelledby="integrations-heading"
      className="relative w-full h-full flex flex-col overflow-hidden"
    >
      <motion.div
        variants={containerVariants}
        initial="initial"
        animate={isReady ? "animate" : "initial"}
        className="flex flex-col items-center my-auto py-8 px-4 w-full"
      >
        <div className="relative z-10 text-center">
          {/* Eyebrow label */}
          <motion.span
            variants={fadeVariants}
            className="inline-flex items-center gap-4 text-xs font-mono text-secondary mb-4 justify-center"
          >
            <span className="w-8 h-px bg-chat-secondary" aria-hidden="true" />
            Bắt đầu trò chuyện
            <span className="w-8 h-px bg-chat-secondary" aria-hidden="true" />
          </motion.span>

          {/* Heading */}
          <motion.h2
            id="integrations-heading"
            variants={fadeUpVariants as any}
            className="text-4xl md:text-5xl lg:text-6xl font-display tracking-tight leading-[1.1] text-primary"
          >
            Kết nối
            <br />
            <span className="text-secondary">mọi người.</span>
          </motion.h2>

          {/* Description */}
          <motion.p
            variants={fadeVariants}
            className="mt-4 text-base md:text-lg text-secondary leading-relaxed max-w-md mx-auto"
          >
            Trải nghiệm nhắn tin mượt mà và an toàn. Giữ liên lạc với bạn bè, đồng nghiệp và những người thân yêu mọi lúc, mọi nơi trên mọi thiết bị.
          </motion.p>
        </div>

        {/* Decorative image */}
        <motion.div
          variants={fadeVariants}
          className="relative w-[150%] sm:w-[120%] max-w-4xl flex justify-center shrink-0 -mt-4 pointer-events-none"
        >
          <Image
            src="/images/alpha_1.png"
            alt=""
            aria-hidden="true"
            width={896}
            height={280}
            sizes="(max-width: 640px) 150vw, (max-width: 1024px) 120vw, 800px"
            className="w-full h-auto"
            priority={false}
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
