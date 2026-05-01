"use client";

import React, { useRef, useEffect } from "react";

export default function DotPattern() {
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dotRef.current) return;
      const { clientX: x, clientY: y } = e;
      dotRef.current.style.setProperty("--mouse-x", `${x}px`);
      dotRef.current.style.setProperty("--mouse-y", `${y}px`);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
      {/* Base layer: dots màu xám nhạt */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "radial-gradient(circle, rgb(204, 204, 204) 0.5px, transparent 0.5px)",
          backgroundSize: "10px 10px",
          backgroundPosition: "5px 5px",
          pointerEvents: "none",
        }}
      />

      {/* Spotlight layer: dots màu tối hiện ra theo chuột */}
      <div
        ref={dotRef}
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "radial-gradient(circle, rgb(0, 0, 0) 0.5px, transparent 0.5px)",
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