"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";

function subscribeToTheme(onStoreChange: () => void) {
  const observer = new MutationObserver(onStoreChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => observer.disconnect();
}

function getThemeSnapshot() {
  return document.documentElement.classList.contains("dark");
}

function subscribeToTouch(onStoreChange: () => void) {
  const mediaQuery = window.matchMedia("(hover: none) and (pointer: coarse)");
  mediaQuery.addEventListener("change", onStoreChange);
  return () => mediaQuery.removeEventListener("change", onStoreChange);
}

function getTouchSnapshot() {
  return window.matchMedia("(hover: none) and (pointer: coarse)").matches;
}

export default function DotPattern() {
  const dotRef = useRef<HTMLDivElement>(null);
  const isDark = useSyncExternalStore(subscribeToTheme, getThemeSnapshot, () => false);
  const isTouchDevice = useSyncExternalStore(subscribeToTouch, getTouchSnapshot, () => false);

  useEffect(() => {
    if (isTouchDevice) return;
    let frameId: number | null = null;

    const handleMouseMove = (e: MouseEvent) => {
      if (!dotRef.current) return;
      if (frameId !== null) cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => {
        if (!dotRef.current) return;
        const mask = `radial-gradient(circle 150px at ${e.clientX}px ${e.clientY}px, black, transparent)`;
        dotRef.current.style.maskImage = mask;
        dotRef.current.style.webkitMaskImage = mask;
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (frameId !== null) cancelAnimationFrame(frameId);
    };
  }, [isTouchDevice]);

  const baseDotColor = isDark
    ? isTouchDevice
      ? "rgba(255, 255, 255, 0.25)"
      : "rgba(255, 255, 255, 0.30)"
    : isTouchDevice
      ? "rgba(0, 0, 0, 0.18)"
      : "rgba(0, 0, 0, 0.20)";

  const spotDotColor = isDark
    ? "rgba(255, 255, 255, 0.75)"
    : "rgba(0, 0, 0, 0.60)";

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Base layer: dots tĩnh */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, ${baseDotColor} 0.5px, transparent 0.5px)`,
          backgroundSize: "10px 10px",
          backgroundPosition: "5px 5px",
        }}
      />

      {/* Mobile: gradient tĩnh tạo chiều sâu */}
      {isTouchDevice && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: isDark
              ? "radial-gradient(ellipse 80% 60% at 50% 30%, rgba(255,255,255,0.12) 0%, transparent 70%)"
              : "radial-gradient(ellipse 80% 60% at 50% 30%, rgba(0,0,0,0.08) 0%, transparent 70%)",
          }}
        />
      )}

      {/* Desktop: spotlight theo chuột */}
      {!isTouchDevice && (
        <div
          ref={dotRef}
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle, ${spotDotColor} 0.5px, transparent 0.5px)`,
            backgroundSize: "10px 10px",
            backgroundPosition: "5px 5px",
            maskImage:
              "radial-gradient(circle 150px at -9999px -9999px, black, transparent)",
            WebkitMaskImage:
              "radial-gradient(circle 150px at -9999px -9999px, black, transparent)",
          }}
        />
      )}
    </div>
  );
}