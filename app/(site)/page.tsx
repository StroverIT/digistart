import { HeroSection } from "@/components/home/hero-section";
import { PlansSection } from "@/components/plans/plans-section";
import { ServicesSection } from "@/components/home/services-section";
import { ProcessSection } from "@/components/home/process-section";
import { StatsSection } from "@/components/home/stats-section";
import { CTASection } from "@/components/home/cta-section";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ProcessSection />
      <PlansSection
        className="bg-card/30"
        title="Пакети за старт без излишен риск"
        subtitle="Започнете с готов онлайн канал за продажби и добавяйте плащания, куриер, Google Business и социални мрежи според темпото на магазина."
      />
      <ServicesSection />
      {/* <StatsSection /> */}
      <CTASection />
    </>
  );
}
