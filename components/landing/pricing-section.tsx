"use client";

import Image from "next/image";
import { ArrowRight, Check, Zap } from "lucide-react";

const plans = [
  {
    name: "Cơ bản",
    description: "Dành cho cá nhân và trải nghiệm",
    price: { monthly: 0, annual: 0 },
    features: [
      "Tối đa 10 thành viên",
      "Lưu trữ 1GB tài liệu",
      "Hỗ trợ cộng đồng",
      "Gọi video nhóm 3 người",
      "Kết nối thiết bị cơ bản",
    ],
    cta: "Bắt đầu miễn phí",
    highlight: false,
  },
  {
    name: "Doanh nghiệp",
    description: "Dành cho đội ngũ phát triển và làm việc",
    price: { monthly: 79, annual: 65 },
    features: [
      "Không giới hạn thành viên",
      "Lịch sử tin nhắn vĩnh viễn",
      "Hỗ trợ ưu tiên 24/7",
      "Bảo vệ dữ liệu nâng cao",
      "Tích hợp ứng dụng bên thứ ba",
      "Phân quyền nhóm chi tiết",
    ],
    cta: "Dùng thử ngay",
    highlight: true,
  },
  {
    name: "Tùy chỉnh",
    description: "Dành cho tập đoàn và tổ chức lớn",
    price: { monthly: null, annual: null },
    features: [
      "Lưu trữ không giới hạn",
      "Quản trị viên chuyên dụng",
      "Tùy chỉnh mã hóa riêng",
      "Bảo mật chuẩn cấp cao nhất",
      "Triển khai máy chủ riêng",
      "Hỗ trợ tính năng đặc thù",
    ],
    cta: "Liên hệ với chúng tôi",
    highlight: false,
  },
];

export function PricingSection() {
  const isAnnual = true;
  const isVisible = true;

  return (
    <section id="pricing" className="relative py-32 lg:py-40">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Header - Dramatic offset */}
        <div className="grid lg:grid-cols-12 gap-8 mb-20">
          <div className="lg:col-span-7">
            <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-8">
              <span className="w-12 h-px bg-foreground/30" />
              Bảng giá
            </span>
            <h2 className={`text-6xl md:text-7xl lg:text-[128px] font-display tracking-tight leading-[0.9] transition-all duration-1000 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}>
              Giá cả
              <br />
              <span className="text-stroke">hợp lý.</span>
            </h2>
          </div>
          
          <div className="lg:col-span-5 relative p-0 h-96 lg:h-auto">
            {/* Whale image */}
            <div className={`absolute inset-0 pointer-events-none transition-all duration-1000 delay-100 ${
              isVisible ? "opacity-100" : "opacity-0"
            }`}>
              <Image
                src="/images/whale.png"
                alt="Organic whale"
                fill
                sizes="(min-width: 1024px) 42vw, 100vw"
                className="w-full h-full object-contain object-center"
              />
            </div>

          </div>
        </div>

        {/* Pricing cards - Horizontal layout with overlap */}
        <div className="relative">
          <div className="grid lg:grid-cols-3 gap-4 lg:gap-0">
            {plans.map((plan, index) => (
              <div
                key={plan.name}
                className={`relative bg-background border transition-all duration-700 ${
                  plan.highlight 
                    ? "border-foreground lg:-mx-2 lg:z-10 lg:scale-105" 
                    : "border-foreground/10 lg:first:-mr-2 lg:last:-ml-2"
                } ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                {/* Popular badge */}
                {plan.highlight && (
                  <div className="absolute -top-4 left-8 right-8 flex justify-center">
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background text-xs font-mono uppercase tracking-widest">
                      <Zap className="size-3" />
                      Phổ biến nhất
                    </span>
                  </div>
                )}

                <div className="p-8 lg:p-10">
                  {/* Plan header */}
                  <div className="mb-8 pb-8 border-b border-foreground/10">
                    <span className="font-mono text-xs text-muted-foreground">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h3 className="text-2xl lg:text-3xl font-display mt-2">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
                  </div>

                  {/* Price */}
                  <div className="mb-8">
                    {plan.price.monthly !== null ? (
                      <div className="flex items-baseline gap-2">
                        <span className="text-5xl lg:text-6xl font-display">
                          ${isAnnual ? plan.price.annual : plan.price.monthly}
                        </span>
                        <span className="text-muted-foreground text-sm">/tháng</span>
                      </div>
                    ) : (
                      <span className="text-4xl font-display">Thỏa thuận</span>
                    )}
                    {plan.price.monthly !== null && plan.price.monthly > 0 && (
                      <p className="text-xs text-muted-foreground mt-2 font-mono">
                        {isAnnual ? "thanh toán hàng năm" : "thanh toán hàng tháng"}
                      </p>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-10">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <Check className="size-4 text-[#eca8d6] mt-0.5 shrink-0" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <button
                    type="button"
                    className={`w-full py-4 flex items-center justify-center gap-2 text-sm font-medium transition-all group ${
                      plan.highlight
                        ? "bg-foreground text-background hover:bg-foreground/90"
                        : "border border-foreground/20 text-foreground hover:border-foreground hover:bg-foreground/5"
                    }`}
                  >
                    {plan.cta}
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom note with icons */}
        <div className={`mt-20 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 pt-12 border-t border-foreground/10 transition-all duration-1000 delay-500 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}>
          <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <Check className="size-4 text-[#eca8d6]" />
              Mã hóa cuộc gọi
            </span>
            <span className="flex items-center gap-2">
              <Check className="size-4 text-[#eca8d6]" />
              Quản lý truy cập
            </span>
            <span className="flex items-center gap-2">
              <Check className="size-4 text-[#eca8d6]" />
              Đa thiết bị
            </span>
          </div>
          <a href="#pricing" className="text-sm underline underline-offset-4 hover:text-foreground transition-colors">
            Xem bảng giá chi tiết
          </a>
        </div>
      </div>

      <style>{`
        .text-stroke {
          -webkit-text-stroke: 1.5px currentColor;
          -webkit-text-fill-color: transparent;
        }
      `}</style>
    </section>
  );
}
