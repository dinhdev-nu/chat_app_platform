import type { Metadata } from "next";
import LoginPageClient from "./LoginPageClient";

export const metadata: Metadata = {
  title: "Stello - Dang nhap",
  description: "Dang nhap Stello bang ma OTP qua email.",
};

export default function LoginPage() {
  return <LoginPageClient />;
}
