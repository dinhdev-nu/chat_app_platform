"use client";

import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const footerLinks = {
  "Sản phẩm": [
    { name: "Tính năng", href: "#features" },
    { name: "Quy trình", href: "#how-it-works" },
    { name: "Bảng giá", href: "#pricing" },
    { name: "Tích hợp", href: "#integrations" },
  ],
  "Phát triển": [
    { name: "Tài liệu", href: "#developers" },
    { name: "Mã nguồn", href: "https://github.com" },
    { name: "API", href: "#developers" },
    { name: "Trạng thái", href: "#infra" },
  ],
  "Công ty": [
    { name: "Về chúng tôi", href: "#features" },
    { name: "Blog", href: "#developers" },
    { name: "Tuyển dụng", href: "#developers", badge: "Đang tuyển" },
    { name: "Liên hệ", href: "mailto:hello@stello.app" },
  ],
  "Pháp lý": [
    { name: "Quyền riêng tư", href: "#security" },
    { name: "Điều khoản", href: "#pricing" },
    { name: "Bảo mật", href: "#security" },
  ],
};

const socialLinks = [
  { name: "Twitter", href: "https://x.com" },
  { name: "GitHub", href: "https://github.com" },
  { name: "LinkedIn", href: "https://www.linkedin.com" },
];

export function FooterSection() {
  return (
    <footer className="relative bg-[oklch(0.06_0.008_260)]">
      {/* Panoramic banner image */}
      <div className="relative w-full h-[340px] md:h-[420px] overflow-hidden">
        <Image
          src="/images/upscaled_2.png"
          alt="Bioluminescent landscape"
          fill
          sizes="100vw"
          className="w-full h-full object-cover object-center"
        />
        {/* Gradient fade to black at bottom */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black" />
        {/* Subtle dark vignette on sides */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />
      </div>

      {/* Footer content — black background, white text */}
      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Main Footer */}
        <div className="py-16 lg:py-20">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-12 lg:gap-8">
            {/* Brand Column */}
            <div className="col-span-2">
              <Link href="/" className="inline-flex items-center gap-2 mb-6">
                <Image
                  src="/assets/home/stello_beta.svg"
                  alt="Stello Logo"
                  width={129}
                  height={24}
                  unoptimized
                  className="h-7 invert brightness-0"
                />
              </Link>

              <p className="text-white/50 leading-relaxed mb-8 max-w-xs text-sm">
                Nền tảng giao tiếp hiện đại dành cho đội nhóm. Kết nối và chia sẻ thông tin dễ dàng mọi lúc mọi nơi.
              </p>

              {/* Social Links */}
              <div className="flex gap-6">
                {socialLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    className="text-sm text-white/40 hover:text-white transition-colors flex items-center gap-1 group"
                  >
                    {link.name}
                    <ArrowUpRight className="size-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </a>
                ))}
              </div>
            </div>

            {/* Link Columns */}
            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title}>
                <h3 className="text-sm font-medium text-white mb-6">{title}</h3>
                <ul className="space-y-4">
                  {links.map((link) => (
                    <li key={link.name}>
                      <a
                        href={link.href}
                        className="text-sm text-white/40 hover:text-white transition-colors inline-flex items-center gap-2"
                      >
                        {link.name}
                        {"badge" in link && link.badge && (
                          <span className="text-xs px-2 py-0.5 bg-white text-black rounded-full">
                            {link.badge}
                          </span>
                        )}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/30">
            &copy; 2025 Stello. All rights reserved.
          </p>

          <div className="flex items-center gap-4 text-sm text-white/30">
            <span className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-[#eca8d6]" />
              Hệ thống hoạt động tốt
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
