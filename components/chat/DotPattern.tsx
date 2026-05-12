"use client";

import React, { useRef, useEffect, useState } from "react";

export default function DotPattern() {
  const dotRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(null);
  const [isDark, setIsDark] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  /* ── Sync dark state từ <html> class ── */
  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains("dark"));
    check();

    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  /* ── Detect touch/coarse pointer devices ── */
  useEffect(() => {
    const mediaQuery = window.matchMedia("(hover: none), (pointer: coarse)");

    const updateTouchState = () => setIsTouchDevice(mediaQuery.matches);
    updateTouchState();

    mediaQuery.addEventListener("change", updateTouchState);
    return () => mediaQuery.removeEventListener("change", updateTouchState);
  }, []);

  /* ── Track vị trí chuột ── */
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dotRef.current) return;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        if (!dotRef.current) return;
        dotRef.current.style.setProperty("--mouse-x", `${e.clientX}px`);
        dotRef.current.style.setProperty("--mouse-y", `${e.clientY}px`);
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const baseDotColor = isDark
    ? isTouchDevice
      ? "rgba(255, 255, 255, 0.10)"
      : "rgba(255, 255, 255, 0.30)"
    : isTouchDevice
      ? "rgba(0, 0, 0, 0.08)"
      : "rgba(0, 0, 0, 0.20)";

  const spotDotColor = isDark
    ? "rgba(255, 255, 255, 0.75)"
    : "rgba(0, 0, 0, 0.60)";

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
      {/* Base layer: dots mờ tĩnh */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `radial-gradient(circle, ${baseDotColor} 0.5px, transparent 0.5px)`,
          backgroundSize: "10px 10px",
          backgroundPosition: "5px 5px",
          pointerEvents: "none",
        }}
      />

      {!isTouchDevice && (
        <div
          ref={dotRef}
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `radial-gradient(circle, ${spotDotColor} 0.5px, transparent 0.5px)`,
            backgroundSize: "10px 10px",
            backgroundPosition: "5px 5px",
            pointerEvents: "none",
            maskImage: "radial-gradient(circle 150px at var(--mouse-x, -9999px) var(--mouse-y, -9999px), black, transparent)",
            WebkitMaskImage: "radial-gradient(circle 150px at var(--mouse-x, -9999px) var(--mouse-y, -9999px), black, transparent)",
          }}
        />
      )}
    </div>
  );
}