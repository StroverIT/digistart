import type { Metadata } from "next";
import dynamic from "next/dynamic";
import HeroSection from "@/components/services/service-detail-ready-store-v2/HeroSection";
import {
  ONLINE_STORE_CONSULTATION,
  ONLINE_STORE_LANDING,
} from "@/config/service-landing/online-store";
import { formatEuroPrice, READY_STORE_PRICING } from "@/lib/data/ready-store-pricing";
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
  description:
    `Мобилен онлайн магазин за продавачи в Instagram, Facebook и OLX - абонамент от ${formatEuroPrice(READY_STORE_PRICING.baseMonthly)}/мес., опционално карти и куриер в количката, старт до 48 часа, 14-дневна гаранция.`,
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

      <PasFaqSection {...ONLINE_STORE_LANDING.faq} />
      <ServiceBuyConsultationFormSection consultation={ONLINE_STORE_CONSULTATION} />
    </section>
  );
}
