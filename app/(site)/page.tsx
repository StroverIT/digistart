import { HeroSection } from "@/components/home/hero-section";
import { PlansSection } from "@/components/plans/plans-section";
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
      <PlansSection
        className="bg-card/30"
        title="Пакети за старт без голям бюджет"
        subtitle="Започни с готов онлайн магазин, Google профил или социални мрежи и добавяй плащания, куриер и реклама само когато наистина ти трябват."
      />
      <ServicesSection />
      {/* <StatsSection /> */}
      <CTASection />
    </>
  );
}
