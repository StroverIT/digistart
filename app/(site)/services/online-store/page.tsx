import type { Metadata } from "next";
import HeroSection from "@/components/services/service-detail-ready-store-v2/HeroSection";
import GoogleReviewsSection from "@/components/services/service-detail-ready-store-v2/GoogleReviewsSection";
import Templates from "@/components/services/service-detail-ready-store-v2/Templates";
import InnerNavigation from "@/components/services/service-detail-ready-store-v2/InnerNavigation";
import Benefits from "@/components/services/service-detail-ready-store-v2/Benefits";

export const metadata: Metadata = {
  title: "Онлайн магазин · готов за продажби",
  description:
    "Мобилен онлайн магазин за продавачи в Instagram, Facebook и OLX - абонамент от €20/мес., опционално карти и куриер в количката, старт до 48 часа, 14-дневна гаранция.",
};

export default async function OnlineStorePage() {
  // const service = getServiceById("ready-store");
  // if (!service) notFound();
  // const availability = await getServiceSlotAvailability("ready-store");
  return (
    <main className="container mx-auto space-y-10 px-4 pt-40">
      <HeroSection />
      <GoogleReviewsSection />
      <InnerNavigation />
      <Templates />
      <Benefits />
      {/* Вграден чат за да сме винаги до тях */}
      {/* Маркетинг инструменти */}
      {/* Админ панел */}
      {/* Как реално изглежда готов магазин. Ристайлд който прави по 3 поръчки на ДЕН / 90 поръчки на МЕСЕЦ */}
      {/* От тука може да си поръчат. Вземи както е при сайта - ВСИЧКИ ПЛАНОВЕ ВКЛЮЧВАТ */}
      {/* FAQ */}
    </main>
  );
}
