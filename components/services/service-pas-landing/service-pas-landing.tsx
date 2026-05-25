"use client";

import type { ReactNode, RefObject } from "react";
import { SocialProofSection } from "@/components/home/social-proof-section";
import { ServiceDetailHero } from "@/components/services/service-detail-hero";
import { ServicePageBackground } from "@/components/services/service-page-background";
import { PasAuthoritySection } from "./authority-section";
import { PasBenefitsSection } from "./benefits-section";
import { PasFaqSection } from "./faq-section";
import { PasProblemSection } from "./problem-section";
import { PasQualificationSection } from "./qualification-section";
import { PasSolutionSection } from "./solution-section";
import { PasStepsSection } from "./steps-section";
import { PasUrgencySection } from "./urgency-section";
import { PasValuePropSection } from "./value-prop-section";
import { buildPasSectionBuyCta, type ServicePasLandingContent } from "./types";

interface ServicePasLandingProps {
  content: ServicePasLandingContent;
  pageRootRef: RefObject<HTMLDivElement | null>;
  badgeIcon: ReactNode;
  onHeroPrimaryClick: () => void;
  headingFontClass?: string;
  className?: string;
  withPageBackground?: boolean;
  children?: ReactNode;
  beforeFaq?: ReactNode;
}

export function ServicePasLanding({
  content,
  pageRootRef,
  badgeIcon,
  onHeroPrimaryClick,
  headingFontClass,
  className,
  withPageBackground = false,
  children,
  beforeFaq,
}: ServicePasLandingProps) {
  const buy = (section: string) => buildPasSectionBuyCta(content, section);

  return (
    <div
      ref={pageRootRef}
      className={className ?? "relative isolate pb-12 md:pb-16"}
    >
      {withPageBackground ? <ServicePageBackground /> : null}
      <div className={withPageBackground ? "relative z-10" : undefined}>
        <div className="relative isolate">
          <ServiceDetailHero
            badgeIcon={badgeIcon}
            badgeText={content.hero.badgeText}
            title={content.hero.title}
            description={content.hero.description}
            socialProof={content.hero.socialProof}
            headingFontClass={headingFontClass}
            primaryLabel={content.primaryCtaLabel}
            onPrimaryClick={onHeroPrimaryClick}
          />
        </div>

        <PasProblemSection
          {...content.problem}
          headingFontClass={headingFontClass}
          buyCta={buy("pain")}
        />

        {content.benefits ? (
          <PasBenefitsSection
            {...content.benefits}
            headingFontClass={headingFontClass}
            buyCta={buy("benefits")}
          />
        ) : null}

        <PasQualificationSection
          {...content.qualification}
          headingFontClass={headingFontClass}
          buyCta={buy("qualification")}
        />

        <PasUrgencySection
          {...content.urgency}
          headingFontClass={headingFontClass}
          buyCta={buy("urgency")}
        />

        <PasSolutionSection
          {...content.solution}
          headingFontClass={headingFontClass}
          buyCta={buy("solution")}
        />

        <PasAuthoritySection
          {...content.authority}
          headingFontClass={headingFontClass}
          buyCta={buy("authority")}
        />

        <PasStepsSection
          {...content.steps}
          headingFontClass={headingFontClass}
          buyCta={buy("steps")}
        />

        <SocialProofSection
          type={content.socialProofType}
          headingFontClass={headingFontClass}
        />

        {beforeFaq}

        <PasFaqSection
          {...content.faq}
          headingFontClass={headingFontClass}
          buyCta={buy("faq")}
        />

        {children}
      </div>
    </div>
  );
}
