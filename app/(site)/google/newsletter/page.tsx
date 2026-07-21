import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { GoogleNewsletterPage } from "@/components/google/google-newsletter-page";
import { gbLabelClass } from "@/components/services/service-detail-google-business-v2/shared";
import { googleNewsletterContent } from "@/lib/data/google-newsletter-content";

const PasFaqSection = dynamic(() =>
  import("@/components/services/service-pas-landing/faq-section").then((mod) => ({
    default: mod.PasFaqSection,
  })),
);

export const metadata: Metadata = {
  title: "Бюлетин",
  description:
    "Прости маркетингови тактики, които наистина работят за локални бизнеси. Запишете се за бюлетина на DigiStart.",
};

export default function GoogleNewsletterRoutePage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-white via-background to-primary/30 [&_.container]:mx-auto [&_.container]:w-full [&_.container]:max-w-[1200px] [&_.container]:px-4 sm:[&_.container]:px-6 md:[&_.container]:px-12">
      <main className="mx-auto w-full max-w-[1200px] px-4 pb-16 pt-24 sm:px-6 md:px-12 md:pb-24 md:pt-28">
        <GoogleNewsletterPage />
      </main>

      <PasFaqSection
        items={googleNewsletterContent.faq.items}
        description={undefined}
        eyebrow={googleNewsletterContent.faq.eyebrow}
        eyebrowClassName={`${gbLabelClass} mb-0 border-0`}
        title={
          <>
            Често задавани{" "}
            <span className="font-bold">въпроси</span>
          </>
        }
        titleClassName="mb-3 mt-5 font-normal text-2xl sm:text-3xl md:text-4xl"
        answerClassName="text-foreground"
        className="bg-transparent py-12 md:py-28"
      />
    </div>
  );
}
