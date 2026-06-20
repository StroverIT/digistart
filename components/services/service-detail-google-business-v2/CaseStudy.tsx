"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SitePreviewViewer } from "@/components/preview/site-preview-viewer";
import { RESTYLED_CASE } from "@/components/services/service-detail-ready-store/constants";
import { LandingSection } from "@/components/services/service-detail-ready-store-v2/shared";
import {
  LANDING_CARD_CLASS,
  LANDING_HEADING_CLASS,
  LANDING_REVEAL_CLASS,
  LANDING_SECTION_TITLE_CENTER_CLASS,
} from "@/components/services/service-detail-ready-store-v2/landing-animation-classes";
import { useLandingScrollAnimations } from "@/components/services/service-detail-ready-store-v2/use-landing-scroll-animations";

const stars = Array.from({ length: 5 });

const CaseStudy = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  useLandingScrollAnimations(sectionRef, { staggerReveal: 0.12, staggerCard: 0.16 });

  return (
    <LandingSection ref={sectionRef} id="case-study" className="bg-muted/30">
      <h1
        data-animate-reveal
        className={`${LANDING_HEADING_CLASS} ${LANDING_SECTION_TITLE_CENTER_CLASS} ${LANDING_REVEAL_CLASS}`}
      >
        Как изглежда профил, който вдъхва доверие
      </h1>

      <div className="mt-12 grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div
          data-animate-card
          className={`relative order-2 flex min-h-80 w-full items-center justify-center overflow-hidden rounded-2xl border border-border/80 bg-card p-6 sm:min-h-96 lg:min-h-[32rem] xl:min-h-[36rem] lg:order-1 ${LANDING_CARD_CLASS}`}
        >
          <Image
            src="/stickers/my-business.png"
            alt="Google Business профил – примерна визуализация"
            width={480}
            height={480}
            className="h-auto w-full max-w-sm object-contain"
            loading="lazy"
          />
        </div>

        <div className="order-1 space-y-6 lg:order-2">
          <div data-animate-reveal className={`space-y-2 ${LANDING_REVEAL_CLASS}`}>
            <h2 className="font-heading text-2xl font-bold sm:text-3xl">Restyled</h2>
            <div className="flex items-center gap-1" role="img" aria-label="5 от 5 звезди">
              {stars.map((_, index) => (
                <Star key={index} className="size-5 text-amber-400" fill="currentColor" />
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              className="mt-4"
              onClick={() => setPreviewOpen(true)}
            >
              Виж сайта
            </Button>
          </div>
          <p
            data-animate-reveal
            className={`text-base leading-relaxed sm:text-lg ${LANDING_REVEAL_CLASS}`}
          >
            <span className="font-bold">Преди:</span> Клиентите намират магазина в Instagram, но
            при проверка в Google виждат празен или объркан профил. Липса на работно време, снимки
            и ясен начин за контакт.
          </p>
          <p
            data-animate-reveal
            className={`border-t border-gray-200 pt-4 text-base leading-relaxed text-foreground sm:text-lg ${LANDING_REVEAL_CLASS}`}
          >
            <span className="font-bold">След:</span> Подреден Google Business профил с категории,
            описание, снимки и линк към онлайн магазина. Хората проверяват, доверяват се и
            поръчват по-бързо.
          </p>
        </div>
      </div>

      <SitePreviewViewer
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        src={RESTYLED_CASE.website}
        title="Restyled"
      />
    </LandingSection>
  );
};

export default CaseStudy;
