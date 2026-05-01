"use client";

import { useState } from "react";
import Link from "next/link";

interface AuthCardProps {
  onSubmit?: (email: string) => void;
  loading?: boolean;
}

const CART_STYLE = {
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  background: "rgba(245,244,240,0.30)",
  boxShadow: "0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.06)",
} as const;

export default function AuthCard({ onSubmit, loading = false }: AuthCardProps) {
  const [email, setEmail] = useState("");

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    onSubmit?.(email);
  };


  return (
    <div
      style={CART_STYLE}
      className="relative w-full max-w-sm mx-auto overflow-hidden rounded-[1.9rem] border border-white/20 p-6"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.25),transparent_50%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.1),transparent_40%)]" />
      <form onSubmit={handleSubmit} className="relative space-y-4">
        <div>
          <button
            type="button"
            className="w-full  border-black/[0.06] inline-flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl border bg-white/20 text-white hover:bg-white/6"
          >
            <img src="/google.svg" alt="" className="w-5 h-5" />
            Continue with Google
          </button>
        </div>

        <div className="text-center text-xs text-white/60">OR</div>

        <label className="block">
          <span className="sr-only">Email</span>
          <input
            type="email"
            placeholder="Enter your email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full bg-white/10 rounded-xl border border-white/10 bg-transparent px-3 py-2.5 placeholder:text-white/50"
          />
        </label>

        <div>
          <button
            type="submit"
            className="w-full px-4 py-2.5 bg-white text-black rounded-xl font-medium disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Processing..." : "Continue with email"}
          </button>
        </div>

        <p className="text-xs text-white/60 text-center">
          By continuing, you acknowledge Anthropic&apos;s{" "}
          <Link href="#" className="underline">
            Privacy Policy
          </Link>
          .
        </p>
      </form>
    </div>
  );
}