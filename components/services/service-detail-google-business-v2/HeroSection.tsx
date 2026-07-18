"use client";

import { useRef } from "react";
import { LandingSection } from "@/components/services/service-detail-ready-store-v2/shared";
import HeroVideo from "@/components/services/service-detail-ready-store-v2/HeroVideo";
import { LANDING_REVEAL_CLASS } from "@/components/services/service-detail-ready-store-v2/landing-animation-classes";
import { useSectionScrollAnimations } from "@/components/services/service-pas-landing/use-section-scroll-animations";
import { cn } from "@/lib/utils";
import { gbContainerClass } from "./shared";

const HeroSection = () => {
  const sectionRef = useRef<HTMLElement>(null);

  useSectionScrollAnimations(sectionRef, {
    staggerReveal: 0.14,
    animateOnMount: true,
  });

  return (
    <LandingSection
      ref={sectionRef}
      className="border-b-0 bg-linear-to-b from-white to-primary/50 pt-0 pb-8 md:pb-20 lg:pb-24"
      contentClassName={`${gbContainerClass} pt-site-header`}
    >
      <div className="mx-auto flex w-full flex-col items-center justify-center gap-4 text-center sm:min-h-[50vh] sm:gap-8 md:gap-10">
        <h1
          data-animate-reveal
          className={cn(
            "font-heading w-full text-balance text-4xl font-medium leading-[1.15] tracking-tight text-foreground sm:leading-[1.2]",
            LANDING_REVEAL_CLASS,
          )}
        >
          <span className="font-extrabold">Единствените две неща</span>
          , които трябва да знаете за маркетинга
        </h1>
        <div data-animate-reveal className={cn("w-full", LANDING_REVEAL_CLASS)}>
          <HeroVideo
            videoId="Hqp6eMmTq-Y"
            title="Единствените две неща, които трябва да знаете за маркетинга"
            thumbnailSrc="/video-thumbnail.png"
            muteOnPlay
          />
        </div>
      </div>
    </LandingSection>
  );
};

export default HeroSection;
