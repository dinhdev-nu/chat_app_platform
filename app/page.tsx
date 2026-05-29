import {
  CtaSection,
  DevelopersSection,
  FeaturesSection,
  FooterSection,
  HeroSection,
  HowItWorksSection,
  InfrastructureSection,
  IntegrationsSection,
  MetricsSection,
  Navigation,
  PricingSection,
  SecuritySection,
  TestimonialsSection,
} from "@/components/landing";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Stello - Ung dung nhan tin hien dai",
  description: "Nen tang giao tiep hien dai de nhan tin, lam viec va chia se cung doi nhom.",
};

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <Navigation />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <InfrastructureSection />
      <MetricsSection />
      <IntegrationsSection />
      <SecuritySection />
      <DevelopersSection />
      <TestimonialsSection />
      <PricingSection />
      <CtaSection />
      <FooterSection />
    </main>
  );
}
