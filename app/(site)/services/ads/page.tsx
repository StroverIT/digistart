import type { Metadata } from "next";
import dynamic from "next/dynamic";
import HeroSection from "@/components/services/service-detail-ads-v2/HeroSection";
import { ADS_LANDING } from "@/config/service-landing/ads";
import { getServiceSlotAvailability } from "@/lib/server/service-slots";

const InnerNavigation = dynamic(
  () => import("@/components/services/service-detail-ads-v2/InnerNavigation"),
);

const PasFaqSection = dynamic(() =>
  import("@/components/services/service-pas-landing/faq-section").then((mod) => ({
    default: mod.PasFaqSection,
  })),
);

const Creatives = dynamic(() => import("@/components/services/service-detail-ads-v2/Creatives"));

const Benefits = dynamic(() => import("@/components/services/service-detail-ads-v2/Benefits"));

const BuiltInChat = dynamic(() => import("@/components/services/service-detail-ads-v2/BuiltInChat"));

const MarketingTools = dynamic(
  () => import("@/components/services/service-detail-ads-v2/MarketingTools"),
);

const ReportsPanel = dynamic(
  () => import("@/components/services/service-detail-ads-v2/ReportsPanel"),
);

const CaseStudy = dynamic(() => import("@/components/services/service-detail-ads-v2/CaseStudy"));

const BuySection = dynamic(() => import("@/components/services/service-detail-ads-v2/BuySection"));

export const metadata: Metadata = {
  title: "Реклами · Google Ads и Meta",
  description:
    "Google за търсене. Meta за откриване. Управление от €150/мес на канал, мин. €50/мес бюджет към платформата.",
};

export default async function AdsPage() {
  const availability = await getServiceSlotAvailability("ads");

  return (
    <section className="pt-28 md:pt-32">
      <HeroSection />
      <div className="bg-white pt-10 md:rounded-t-4xl md:-mt-10">
        <InnerNavigation />
        <Creatives />
        <Benefits />
        <BuiltInChat />
        <MarketingTools />
        <ReportsPanel />
        <CaseStudy />
      </div>

      <BuySection availability={availability} />
      <PasFaqSection {...ADS_LANDING.faq} />
    </section>
  );
}
