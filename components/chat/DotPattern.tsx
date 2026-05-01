"use client";

import React, { useRef, useEffect, useState } from "react";

export default function DotPattern() {
  const dotRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(null);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check initial dark mode
    setIsDark(document.documentElement.classList.contains("dark"));

    // Listen for theme changes
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });

    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dotRef.current) return;

      // Cancel previous frame
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      // Schedule update on next frame
      rafRef.current = requestAnimationFrame(() => {
        if (!dotRef.current) return;
        const { clientX: x, clientY: y } = e;
        dotRef.current.style.setProperty("--mouse-x", `${x}px`);
        dotRef.current.style.setProperty("--mouse-y", `${y}px`);
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
      {/* Base layer: dots màu xám nhạt */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `radial-gradient(circle, rgb(${isDark ? "80, 80, 80" : "204, 204, 204"}) 0.5px, transparent 0.5px)`,
          backgroundSize: "10px 10px",
          backgroundPosition: "5px 5px",
          pointerEvents: "none",
        }}
      />

      {/* Spotlight layer: dots màu tối/sáng hiện ra theo chuột */}
      <div
        ref={dotRef}
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `radial-gradient(circle, rgb(${isDark ? "200, 200, 200" : "0, 0, 0"}) 0.5px, transparent 0.5px)`,
          backgroundSize: "10px 10px",
          backgroundPosition: "5px 5px",
          pointerEvents: "none",
          maskImage: "radial-gradient(circle 150px at var(--mouse-x, -9999px) var(--mouse-y, -9999px), black, transparent)",
          WebkitMaskImage: "radial-gradient(circle 150px at var(--mouse-x, -9999px) var(--mouse-y, -9999px), black, transparent)",
        }}
      />
    </div>
  );
}