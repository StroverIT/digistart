import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { BookingForm } from "@/components/home/booking-form";
import HeroSection from "@/components/services/service-detail-ads-v2/HeroSection";
import { ADS_LANDING } from "@/config/service-landing/ads";
import { ADS_PRICING, formatEuroPrice } from "@/lib/data/ads-pricing";
import { ogImageMetadata } from "@/lib/seo/open-graph";

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

const BuiltInChat = dynamic(
  () => import("@/components/services/service-detail-ready-store-v2/BuiltInChat"),
);

const MarketingTools = dynamic(
  () => import("@/components/services/service-detail-ads-v2/MarketingTools"),
);

const ReportsPanel = dynamic(
  () => import("@/components/services/service-detail-ads-v2/ReportsPanel"),
);

const CaseStudy = dynamic(() => import("@/components/services/service-detail-ads-v2/CaseStudy"));

// const BuySection = dynamic(() => import("@/components/services/service-detail-ads-v2/BuySection"));

export const metadata: Metadata = {
  title: "Реклами за онлайн магазини · Google Ads и Meta",
  description:
    `Google и Meta реклами за e-commerce: повече хора към продуктите, повече колички и повече онлайн поръчки. Управление от ${formatEuroPrice(ADS_PRICING.channelManagementMonthly)}/мес на канал.`,
  ...ogImageMetadata("ads", "DigiStart – Google и Meta реклами"),
};

export default function AdsPage() {
  return (
    <section>
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

      <BookingForm
        sourcePage="Реклами (/services/ads)"
        sectionId="buy-now"
        analyticsPath="/services/ads"
        analyticsCtaId="ads_booking_submit"
      />
      {/* <BuySection availability={availability} /> */}
      <PasFaqSection {...ADS_LANDING.faq} />
    </section>
  );
}
