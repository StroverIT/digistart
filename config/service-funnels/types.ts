import type { OgCoverKey } from "@/lib/seo/open-graph";
import type { CartItemUpsell } from "@/lib/types";

export type ServiceFunnelFaqItem = {
  question: string;
  answer: string;
};

export type ServiceFunnelDefinition = {
  id: string;
  serviceId: string;
  funnelSlug: string;
  adminLabel: string;
  sourcePage: string;
  analyticsCtaId: string;
  meta: {
    title: string;
    description: string;
    ogCoverKey: OgCoverKey;
    ogAlt: string;
  };
  metaLead: {
    contentName: string;
    leadSource: string;
  };
  hero: {
    title: string;
    subtitle: string;
    description?: string;
    ctaLabel: string;
    video?:
      | {
          provider: "youtube";
          youtubeId: string;
          title: string;
          format?: "short" | "standard";
        }
      | {
          provider: "google-drive";
          fileId: string;
          title: string;
          thumbnailSrc?: string;
          format?: "short" | "standard";
        };
  };
  whoIsItFor: {
    title: string;
    subtitle: string;
    items: Array<{
      title: string;
      description: string;
    }>;
  };
  doneForYou: {
    title: string;
    description: string;
    items: string[];
    priceHighlight?: string;
  };
  processSteps: {
    title: string;
    subtitle: string;
    steps: Array<{
      title: string;
      description: string;
    }>;
  };
  faq: {
    title: string;
    description: string;
    items: ServiceFunnelFaqItem[];
  };
  checkout?: {
    items: Array<{
      serviceId: string;
      optionId: string;
      upsells?: CartItemUpsell[];
    }>;
    header: string;
    basePackageLabel?: string;
    pricing: {
      total: number;
      breakdownNote: string;
      frequencyLabel?: string | null;
    };
    planFeatures: string[];
    timeline?: string;
    ctaLabel?: string;
  };
  booking?: {
    showSocialProfileToggle?: boolean;
    notesLabel?: string;
    notesPlaceholder?: string;
    showOnSiteOption?: boolean;
  };
  consultation?: {
    promptTitle: string;
    promptCtaLabel: string;
    formTitle: string;
    description?: string;
    analyticsCtaId: string;
    metaLead?: {
      contentName: string;
      leadSource: string;
    };
    booking?: {
      showSocialProfileToggle?: boolean;
      notesLabel?: string;
      notesPlaceholder?: string;
      showOnSiteOption?: boolean;
    };
  };
  features?: {
    /** Renders Google/social case study block (default: true). */
    showCaseStudy?: boolean;
    /** Renders process steps as a standalone section before the offer (default: false). */
    showProcessStepsSection?: boolean;
    /** Renders process steps inside the booking card (default: true). */
    showProcessStepsInBooking?: boolean;
    /** Renders hero.description below subtitle (default: false). */
    showHeroDescription?: boolean;
  };
};

export type ServiceFunnelConfig = ServiceFunnelDefinition & {
  serviceSlug: string;
  pagePath: string;
};
