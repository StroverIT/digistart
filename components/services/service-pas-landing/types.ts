import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import type { FaqItem } from "@/components/ui/faq";
import type { SocialProofSectionType } from "@/components/home/social-proof-section";

export type ServicePasPainPoint = {
  title: string;
  text: string;
};

export type ServicePasBenefit = {
  title: string;
  text: string;
};

export type ServicePasStep = {
  title: string;
  body: string;
  icon: LucideIcon;
};

export type ServicePasAuthorityStat = {
  value: string;
  label: string;
};

export type ServicePasLandingContent = {
  pagePath: string;
  primaryCtaLabel: string;
  ctaIdPrefix: string;
  hero: {
    badgeText: string;
    title: ReactNode;
    description: ReactNode;
    socialProof?: string;
  };
  benefits?: {
    eyebrow: string;
    title: string;
    items: readonly ServicePasBenefit[];
  };
  problem: {
    eyebrow: string;
    title: string;
    intro?: ReactNode;
    items: readonly ServicePasPainPoint[];
  };
  qualification: {
    eyebrow: string;
    title: string;
    statements: readonly string[];
  };
  urgency: {
    eyebrow: string;
    title: string;
    paragraphs: readonly string[];
    bullets?: readonly string[];
  };
  solution: {
    eyebrow: string;
    title: string;
    items: readonly string[];
  };
  authority: {
    eyebrow: string;
    title: string;
    stats: readonly ServicePasAuthorityStat[];
  };
  steps: {
    eyebrow: string;
    title: string;
    description?: string;
    items: readonly ServicePasStep[];
  };
  valueProp?: {
    paragraphs: readonly string[];
    highlights?: readonly string[];
  };
  socialProofType: SocialProofSectionType;
  faq: {
    eyebrow: string;
    title: string;
    description: string;
    items: readonly FaqItem[];
  };
};

export function buildPasSectionBuyCta(
  content: Pick<ServicePasLandingContent, "pagePath" | "primaryCtaLabel" | "ctaIdPrefix">,
  section: string,
) {
  return {
    pagePath: content.pagePath,
    label: content.primaryCtaLabel,
    ctaId: `${content.ctaIdPrefix}_section_${section}_scroll_buy`,
  };
}
