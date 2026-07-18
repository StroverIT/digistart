import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { BookingForm } from "@/components/home/booking-form";
import HeroSection from "@/components/services/service-detail-google-business-v2/HeroSection";
import { AdvantageSection } from "@/components/services/service-detail-google-business-v2/AdvantageSection";
import { BeforeAfterSection } from "@/components/services/service-detail-google-business-v2/BeforeAfterSection";
import { HowItWorksSection } from "@/components/services/service-detail-google-business-v2/HowItWorksSection";
import { StrategyCtaSection } from "@/components/services/service-detail-google-business-v2/StrategyCtaSection";
import { GOOGLE_BUSINESS_LANDING } from "@/config/service-landing/google-business";
import { gbLabelClass } from "@/components/services/service-detail-google-business-v2/shared";
import { ogImageMetadata } from "@/lib/seo/open-graph";

const PasFaqSection = dynamic(() =>
  import("@/components/services/service-pas-landing/faq-section").then((mod) => ({
    default: mod.PasFaqSection,
  })),
);

export const metadata: Metadata = {
  title: "Google Business · локална видимост",
  description:
    "Стани видим в Google Maps и локалното търсене. Верификация, локално SEO и дигитална витрина – €49 еднократно.",
  ...ogImageMetadata("googleBusiness", "DigiStart – Google Business"),
};

export default function GoogleBusinessPage() {
  return (
    <section className="[&_.container]:mx-auto [&_.container]:w-full [&_.container]:max-w-[1200px] [&_.container]:px-4 sm:[&_.container]:px-6 md:[&_.container]:px-12">
      <HeroSection />
      <BookingForm
        sourcePage="Google Business (/services/google-business)"
        analyticsPath="/services/google-business"
        analyticsCtaId="google_business_booking_submit"
        animateReveals
        className="py-12 md:py-28"
      />
      <AdvantageSection />
      <BeforeAfterSection />
      <HowItWorksSection />
      <PasFaqSection
        {...GOOGLE_BUSINESS_LANDING.faq}
        description={undefined}
        eyebrow="FAQs"
        eyebrowClassName={`${gbLabelClass} mb-0 border-0`}
        title={
          <>
            Често задавани{" "}
            <span className="font-bold">въпроси</span>
          </>
        }
        titleClassName="mb-3 mt-5 font-normal text-2xl sm:text-3xl md:text-4xl"
        answerClassName="text-black"
        className="bg-transparent py-12 md:py-28"
      />
      <StrategyCtaSection />
    </section>
  );
}
