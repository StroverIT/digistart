import type { Metadata } from "next";
import dynamic from "next/dynamic";
import HeroSection from "@/components/services/service-detail-google-business-v2/HeroSection";
import { GOOGLE_BUSINESS_LANDING } from "@/config/service-landing/google-business";
import { getServiceSlotAvailability } from "@/lib/server/service-slots";

const InnerNavigation = dynamic(
  () => import("@/components/services/service-detail-google-business-v2/InnerNavigation"),
);

const PasFaqSection = dynamic(() =>
  import("@/components/services/service-pas-landing/faq-section").then((mod) => ({
    default: mod.PasFaqSection,
  })),
);

const PasSection = dynamic(
  () => import("@/components/services/service-detail-google-business-v2/PasSection"),
);

const Benefits = dynamic(
  () => import("@/components/services/service-detail-google-business-v2/Benefits"),
);

const BuiltInChat = dynamic(
  () => import("@/components/services/service-detail-ready-store-v2/BuiltInChat"),
);

const ContentIncludes = dynamic(
  () => import("@/components/services/service-detail-google-business-v2/ContentIncludes"),
);

const CaseStudy = dynamic(
  () => import("@/components/services/service-detail-google-business-v2/CaseStudy"),
);

const BuySection = dynamic(
  () => import("@/components/services/service-detail-google-business-v2/BuySection"),
);

export const metadata: Metadata = {
  title: "Google Business · локална видимост",
  description:
    "Стани видим в Google Maps и локалното търсене. Верификация, локално SEO и дигитална витрина – €49 еднократно.",
};

export default async function GoogleBusinessPage() {
  const availability = await getServiceSlotAvailability("google-business");

  return (
    <section>
      <HeroSection />
      <div className="bg-white pt-10 md:rounded-t-4xl md:-mt-10">
        <InnerNavigation />
        <PasSection />
        <Benefits />
        <BuiltInChat />
        <ContentIncludes />
        <CaseStudy />
      </div>

      <BuySection availability={availability} />
      <PasFaqSection {...GOOGLE_BUSINESS_LANDING.faq} />
    </section>
  );
}
