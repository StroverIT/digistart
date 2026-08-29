import type { Metadata } from "next";
import dynamic from "next/dynamic";
import HeroSection from "@/components/services/service-detail-ready-store-v2/HeroSection";
import {
  ONLINE_STORE_CONSULTATION,
  ONLINE_STORE_LANDING,
} from "@/config/service-landing/online-store";
import { formatEuroPrice, READY_STORE_PRICING } from "@/lib/data/ready-store-pricing";
import { fitMetaDescription } from "@/lib/seo/metadata";
import { ogImageMetadata } from "@/lib/seo/open-graph";

const InnerNavigation = dynamic(
  () => import("@/components/services/service-detail-ready-store-v2/InnerNavigation"),
);

const PasFaqSection = dynamic(() =>
  import("@/components/services/service-pas-landing/faq-section").then((mod) => ({
    default: mod.PasFaqSection,
  })),
);

const Templates = dynamic(
  () => import("@/components/services/service-detail-ready-store-v2/Templates"),
);

const Benefits = dynamic(
  () => import("@/components/services/service-detail-ready-store-v2/Benefits"),
);
const BuiltInChat = dynamic(
  () => import("@/components/services/service-detail-ready-store-v2/BuiltInChat"),
);
const MarketingTools = dynamic(
  () => import("@/components/services/service-detail-ready-store-v2/MarketingTools"),
);
const AdminPanel = dynamic(
  () => import("@/components/services/service-detail-ready-store-v2/AdminPanel"),
);
const RealShop = dynamic(
  () => import("@/components/services/service-detail-ready-store-v2/RealShop"),
);
const ServiceBuyConsultationFormSection = dynamic(() =>
  import("@/components/services/service-buy-consultation-section").then((mod) => ({
    default: mod.ServiceBuyConsultationFormSection,
  })),
);

export const metadata: Metadata = {
  title: "Онлайн магазин · готов за продажби",
  description: fitMetaDescription(
    `Мобилен онлайн магазин за Instagram, Facebook и OLX. Абонамент от ${formatEuroPrice(READY_STORE_PRICING.baseMonthly)}/мес., карти и куриер в количката, старт до 48 часа.`,
  ),
  ...ogImageMetadata("onlineStore", "DigiStart – Онлайн магазин"),
};

export default function OnlineStorePage() {
  return (
    <section>
      <HeroSection ctaHref="#consultation" />
      <div className="bg-white pt-10 md:rounded-t-4xl md:-mt-10">
        <InnerNavigation />
        <Templates />
        <Benefits />
        <BuiltInChat />
        <MarketingTools />
        <AdminPanel ctaHref="#consultation" />
        <RealShop />
      </div>

      <ServiceBuyConsultationFormSection consultation={ONLINE_STORE_CONSULTATION} />
      <PasFaqSection {...ONLINE_STORE_LANDING.faq} />
    </section>
  );
}
