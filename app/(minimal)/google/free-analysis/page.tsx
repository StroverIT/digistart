import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import { FreeAnalysisForm } from "@/components/google/free-analysis-form";
import { gbLabelClass } from "@/components/services/service-detail-google-business-v2/shared";
import { googleFreeAnalysisContent } from "@/lib/data/google-free-analysis-content";
import { ogImageMetadata } from "@/lib/seo/open-graph";

const PasFaqSection = dynamic(() =>
  import("@/components/services/service-pas-landing/faq-section").then((mod) => ({
    default: mod.PasFaqSection,
  })),
);

export const metadata: Metadata = {
  title: "Безплатен Google анализ | DigiStart",
  description:
    "Попълни формата и ще запишем персонализиран анализ с точните стъпки, за да се класираш в топ 3 в Google Maps.",
  ...ogImageMetadata("googleBusiness", "DigiStart – Безплатен Google анализ"),
};

export default function GoogleFreeAnalysisPage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-white via-background to-primary/30 [&_.container]:mx-auto [&_.container]:w-full [&_.container]:max-w-[1200px] [&_.container]:px-4 sm:[&_.container]:px-6 md:[&_.container]:px-12">
      <main className="mx-auto w-full max-w-[1200px] px-4 pb-16 pt-8 sm:px-6 md:px-12 md:pb-24 md:pt-12">
        <section className="mx-auto flex w-full max-w-[1200px] flex-col items-center gap-8 md:flex-row md:items-start md:gap-10 lg:gap-14">
          <div className="flex w-full flex-col gap-4 text-center md:w-1/2 md:gap-6 md:text-left">
            <span
              className={`${gbLabelClass} mx-auto mb-0 w-fit border-0 !bg-white px-4 py-2 text-sm shadow-sm md:mx-0`}
            >
              {googleFreeAnalysisContent.formPage.badge}
            </span>
            <h1 className="font-heading text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-5xl lg:text-6xl xl:text-7xl lg:leading-[1.05]">
              {googleFreeAnalysisContent.formPage.title}
            </h1>
            <p className="text-lg leading-relaxed text-muted-foreground sm:text-xl md:text-xl lg:text-2xl">
              {googleFreeAnalysisContent.formPage.description}
            </p>
            <p className="text-lg font-medium text-foreground sm:text-xl md:text-xl lg:text-2xl">
              {googleFreeAnalysisContent.formPage.disclaimer}
            </p>
          </div>

          <div className="@container w-full rounded-3xl border border-border/70 bg-white/95 p-6 shadow-xl shadow-primary/10 md:w-1/2 md:p-10">
            <Suspense fallback={<div className="h-96 rounded-xl border border-border bg-card" />}>
              <FreeAnalysisForm />
            </Suspense>
          </div>
        </section>
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
