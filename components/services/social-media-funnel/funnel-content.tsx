import { Check } from "lucide-react";
import dynamic from "next/dynamic";
import { FunnelBookingCard } from "@/components/services/social-media-funnel/funnel-booking-card";
import { SectionWave } from "@/components/services/social-media-funnel/section-wave";
import { SOCIAL_MEDIA_FUNNEL } from "@/config/service-landing/social-media-funnel";

const CaseStudy = dynamic(
  () => import("@/components/services/service-detail-social-media-v2/CaseStudy"),
);

const PasFaqSection = dynamic(() =>
  import("@/components/services/service-pas-landing/faq-section").then((mod) => ({
    default: mod.PasFaqSection,
  })),
);

const { doneForYou } = SOCIAL_MEDIA_FUNNEL;

export function FunnelContentSections() {
  return (
    <>
      <section className="bg-[#F8F7FF] pb-8 md:pb-10">
        <div className="container mx-auto px-4 md:px-8 pb-16">
          <div className="mx-auto max-w-3xl">
            <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              {doneForYou.title}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
              {doneForYou.description}
            </p>
            <ul className="mt-8 space-y-3">
              {doneForYou.items.map((item) => (
                <li key={item} className="flex gap-3 text-sm md:text-base">
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-[#A8E6CF] text-[#2D5C4A]">
                    <Check className="size-3.5" strokeWidth={3} />
                  </span>
                  <span className="text-foreground/85">{item}</span>
                </li>
              ))}
            </ul>

            <a
              href="#booking"
              className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-[#A8E6CF] px-8 text-base font-bold text-foreground shadow-md transition-transform hover:scale-[1.02] motion-reduce:hover:scale-100"
            >
              Запази безплатна консултация
            </a>
          </div>
        </div>
        <SectionWave
          fillClassName="text-[color-mix(in_oklch,var(--muted)_30%,var(--background))]"
          className="-mb-10"
        />

      </section>


      <CaseStudy compact />

      <SectionWave fillClassName="text-white" />

      <FunnelBookingCard />


      <PasFaqSection {...SOCIAL_MEDIA_FUNNEL.faq} />
    </>
  );
}
