import type { Metadata } from "next";
import HeroSection from "@/components/services/service-detail-ready-store-v2/HeroSection";
import GoogleReviewsSection from "@/components/services/service-detail-ready-store-v2/GoogleReviewsSection";
import Templates from "@/components/services/service-detail-ready-store-v2/Templates";
import InnerNavigation from "@/components/services/service-detail-ready-store-v2/InnerNavigation";
import Benefits from "@/components/services/service-detail-ready-store-v2/Benefits";
import BuiltInChat from "@/components/services/service-detail-ready-store-v2/BuiltInChat";
import MarketingTools from "@/components/services/service-detail-ready-store-v2/MarketingTools";
import AdminPanel from "@/components/services/service-detail-ready-store-v2/AdminPanel";
import RealShop from "@/components/services/service-detail-ready-store-v2/RealShop";
import BuySection from "@/components/services/service-detail-ready-store-v2/BuySection";
import { PasFaqSection } from "@/components/services/service-pas-landing/faq-section";
import { ONLINE_STORE_LANDING } from "@/config/service-landing/online-store";
import { getServiceSlotAvailability } from "@/lib/server/service-slots";
import { landingContainerClass } from "@/components/services/service-detail-ready-store-v2/shared";

export const metadata: Metadata = {
  title: "Онлайн магазин · готов за продажби",
  description:
    "Мобилен онлайн магазин за продавачи в Instagram, Facebook и OLX - абонамент от €20/мес., опционално карти и куриер в количката, старт до 48 часа, 14-дневна гаранция.",
};

export default async function OnlineStorePage() {
  const availability = await getServiceSlotAvailability("ready-store");
  return (
    <main className="pt-28 md:pt-32">
      <HeroSection />
      <GoogleReviewsSection />
      <InnerNavigation />
      <Templates />
      <Benefits />
      <BuiltInChat />
      <MarketingTools />
      <AdminPanel />
      <RealShop />
      <BuySection availability={availability} />
      <div className={`${landingContainerClass} py-14 md:py-20`}>
        <PasFaqSection {...ONLINE_STORE_LANDING.faq} />
      </div>
    </main>
  );
}
