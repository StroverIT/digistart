import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ServiceDetailReadyStore } from "@/components/services/service-detail-ready-store";
import { getServiceById } from "@/lib/data/services";
import { getServiceSlotAvailability } from "@/lib/server/service-slots";
import HeroSection from "@/components/services/service-detail-ready-store-v2/HeroSection";
import GoogleReviewsSection from "@/components/services/service-detail-ready-store-v2/GoogleReviewsSection";
import Templates from "@/components/services/service-detail-ready-store-v2/Templates";
import InnerNavigation from "@/components/services/service-detail-ready-store-v2/InnerNavigation";

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
    </main>
  );
}
