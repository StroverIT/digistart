import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Analysis3TipsFormSection } from "@/components/google/analysis-3-tips-form-section";
import { Analysis3TipsHeroSection } from "@/components/google/analysis-3-tips-hero-section";
import { gbLabelClass } from "@/components/services/service-detail-google-business-v2/shared";
import { googleFreeAnalysisContent } from "@/lib/data/google-free-analysis-content";
import { ogImageMetadata } from "@/lib/seo/open-graph";

const PasFaqSection = dynamic(() =>
  import("@/components/services/service-pas-landing/faq-section").then((mod) => ({
    default: mod.PasFaqSection,
  })),
);

export const metadata: Metadata = {
  title: "Анализ: 3 съвета за Google",
  description:
    "Безплатен одит на Google Business профила ти — 3 конкретни неща, които да промениш, за да се класираш по-високо в Google.",
  ...ogImageMetadata("googleBusiness", "DigiStart – Анализ 3 съвета"),
};

export default function GoogleAnalysis3TipsPage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-white via-background to-primary/30 [&_.container]:mx-auto [&_.container]:w-full [&_.container]:max-w-[1200px] [&_.container]:px-4 sm:[&_.container]:px-6 md:[&_.container]:px-12">
      <main className="mx-auto w-full max-w-[1200px] px-4 pb-16 pt-24 sm:px-6 md:px-12 md:pb-24 md:pt-28">
        <Analysis3TipsHeroSection />
        <Analysis3TipsFormSection />
      </main>

      <PasFaqSection
        items={googleFreeAnalysisContent.faq.items}
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
    </div>
  );
}
