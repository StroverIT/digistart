import type { Metadata } from "next";
import dynamic from "next/dynamic";
import HeroSection from "@/components/services/service-detail-ready-store-v2/HeroSection";
import { ONLINE_STORE_LANDING } from "@/config/service-landing/online-store";

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
const BuySection = dynamic(
  () => import("@/components/services/service-detail-ready-store-v2/BuySection"),
);

export const metadata: Metadata = {
  title: "Онлайн магазин · готов за продажби",
  description:
    "Мобилен онлайн магазин за продавачи в Instagram, Facebook и OLX - абонамент от €20/мес., опционално карти и куриер в количката, старт до 48 часа, 14-дневна гаранция.",
};

export default function OnlineStorePage() {
  return (
    <section className="pt-28 md:pt-32">
      <HeroSection />
      <div className="bg-white pt-10 md:rounded-t-4xl md:-mt-10">
        <InnerNavigation />
        <Templates />
        <Benefits />
        <BuiltInChat />
        <MarketingTools />
        <AdminPanel />
        <RealShop />
      </div>

      <BuySection />
      <PasFaqSection {...ONLINE_STORE_LANDING.faq} />
    </section>
  );
}
