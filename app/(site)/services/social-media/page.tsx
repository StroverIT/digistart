import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { BookingForm } from "@/components/home/booking-form";
import HeroSection from "@/components/services/service-detail-social-media-v2/HeroSection";
import { SOCIAL_MEDIA_LANDING } from "@/config/service-landing/social-media";
import { ogImageMetadata } from "@/lib/seo/open-graph";

const InnerNavigation = dynamic(
  () => import("@/components/services/service-detail-social-media-v2/InnerNavigation"),
);

const PasFaqSection = dynamic(() =>
  import("@/components/services/service-pas-landing/faq-section").then((mod) => ({
    default: mod.PasFaqSection,
  })),
);

const PasSection = dynamic(
  () => import("@/components/services/service-detail-social-media-v2/PasSection"),
);

const Benefits = dynamic(
  () => import("@/components/services/service-detail-social-media-v2/Benefits"),
);

const BuiltInChat = dynamic(
  () => import("@/components/services/service-detail-ready-store-v2/BuiltInChat"),
);

const ContentIncludes = dynamic(
  () => import("@/components/services/service-detail-social-media-v2/ContentIncludes"),
);

const CaseStudy = dynamic(
  () => import("@/components/services/service-detail-social-media-v2/CaseStudy"),
);

// const BuySection = dynamic(
//   () => import("@/components/services/service-detail-social-media-v2/BuySection"),
// );

export const metadata: Metadata = {
  title: "Социални мрежи · съдържание и стратегия",
  description:
    "Професионална витрина във Facebook и Instagram: текстове, визии и редовни публикации. Ти обслужваш поръчките - ние поемаме профила.",
  ...ogImageMetadata("socialMedia", "DigiStart – Социални мрежи"),
};

export default function SocialMediaPage() {
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

      <BookingForm
        sourcePage="Социални мрежи (/services/social-media)"
        analyticsPath="/services/social-media"
        analyticsCtaId="social_media_booking_submit"
      />
      {/* <BuySection availability={availability} /> */}
      <PasFaqSection {...SOCIAL_MEDIA_LANDING.faq} />
    </section>
  );
}
