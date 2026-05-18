import { HeroSection } from "@/components/home/hero-section";
import { ServicesSection } from "@/components/home/services-section";
import { ProcessSection } from "@/components/home/process-section";
import { SocialProofSection } from "@/components/home/social-proof-section";
// import { StatsSection } from "@/components/home/stats-section";
import { CTASection } from "@/components/home/cta-section";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ProcessSection />
      <SocialProofSection />
      <ServicesSection />
      {/* <StatsSection /> */}
      <CTASection />
    </>
  );
}
