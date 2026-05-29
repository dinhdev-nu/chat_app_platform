"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Shield, Lock, Eye, FileCheck } from "lucide-react";

const securityFeatures = [
  {
    icon: Shield,
    title: "Mã hóa đầu cuối",
    description: "Mọi cuộc trò chuyện đều được mã hóa an toàn.",
    image: "/images/isolated.jpg",
  },
  {
    icon: Lock,
    title: "Bảo vệ dữ liệu",
    description: "Dữ liệu được mã hóa khi lưu trữ và truyền đi.",
    image: "/images/encrypted.jpg",
  },
  {
    icon: Eye,
    title: "Quản lý truy cập",
    description: "Kiểm soát thiết bị đăng nhập dễ dàng.",
    image: "/images/audit.jpg",
  },
  {
    icon: FileCheck,
    title: "Phân quyền chi tiết",
    description: "Quản lý quyền hạn chặt chẽ cho từng thành viên.",
    image: "/images/permissions.jpg",
  },
];

const certifications = ["SOC 2", "ISO 27001", "HIPAA", "GDPR"];

export function SecuritySection() {
  const isVisible = true;
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % securityFeatures.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="security" className="relative py-32 lg:py-40 overflow-hidden">
      {/* Background accent removed */}

      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="mb-20">
          <span className={`inline-flex items-center gap-4 text-sm font-mono text-muted-foreground mb-8 transition-all duration-700 ${isVisible ? "opacity-100" : "opacity-0"
            }`}>
            <span className="w-12 h-px bg-foreground/20" />
            Bảo mật
          </span>

          {/* Title — full width */}
          <h2 className={`text-6xl md:text-7xl lg:text-[128px] font-display tracking-tight leading-[0.9] mb-12 transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}>
            Bảo mật tuyệt đối,
            <br />
            <span className="text-muted-foreground">an toàn tối đa.</span>
          </h2>

          {/* Description — below title */}
          <div className={`transition-all duration-1000 delay-100 ${isVisible ? "opacity-100" : "opacity-0"
            }`}>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
              Nền tảng nhắn tin an toàn với chuẩn bảo mật doanh nghiệp, đảm bảo dữ liệu của bạn luôn được bảo vệ tốt nhất.
            </p>
          </div>
        </div>

        {/* Main content */}
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Large visual card */}
          <div className={`lg:col-span-7 relative p-8 lg:p-12 border border-foreground/10 min-h-[400px] overflow-hidden transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}>
            {/* Dynamic feature image with cross-fade — desktop only */}
            <div className="absolute inset-0 pointer-events-none items-center justify-end hidden lg:flex">
              {securityFeatures.map((feature, index) => (
                <Image
                  key={feature.image}
                  src={feature.image}
                  alt={feature.title}
                  width={840}
                  height={840}
                  sizes="(min-width: 1024px) 44vw, 100vw"
                  className="absolute h-3/4 w-3/4 object-contain object-right transition-opacity duration-500"
                  style={{ opacity: activeFeature === index ? 0.85 : 0 }}
                />
              ))}
            </div>

            <div className="relative z-10">
              <span className="font-mono text-sm text-muted-foreground">Bảo vệ chủ động</span>
              <div className="mt-8">
                <span className="text-7xl lg:text-8xl font-display">0</span>
                <span className="block text-muted-foreground mt-2">Sự cố bảo mật trong năm nay</span>
              </div>
            </div>

            {/* Certification badges */}
            <div className="absolute bottom-8 left-8 right-8 flex flex-wrap gap-2">
              {certifications.map((cert, index) => (
                <span
                  key={cert}
                  className={`px-3 py-1 border border-foreground/10 text-xs font-mono text-muted-foreground transition-all duration-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                    }`}
                  style={{ transitionDelay: `${index * 100 + 300}ms` }}
                >
                  {cert}
                </span>
              ))}
            </div>
          </div>

          {/* Feature cards stack */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {securityFeatures.map((feature, index) => (
              <button
                type="button"
                key={feature.title}
                className={`w-full text-left p-6 border transition-all duration-500 cursor-default ${activeFeature === index
                  ? "border-foreground/30 bg-foreground/[0.04]"
                  : "border-foreground/10"
                  } ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}
                style={{ transitionDelay: `${index * 80}ms` }}
                onClick={() => setActiveFeature(index)}
                onMouseEnter={() => setActiveFeature(index)}
              >
                <div className="flex items-start gap-4">
                  <div className={`shrink-0 size-10 flex items-center justify-center border transition-colors ${activeFeature === index
                    ? "border-foreground bg-foreground text-background"
                    : "border-foreground/20"
                    }`}>
                    <feature.icon className="size-5" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
