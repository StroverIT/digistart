import type { Metadata } from "next";
import type { OgCoverKey } from "@/lib/seo/open-graph";
import type { CartItemUpsell } from "@/lib/types";

export type ServiceFunnelFaqItem = {
  question: string;
  answer: string;
};

export type ServiceFunnelLayout = "pas" | "ready-store-v2";

export type ReadyStoreV2HeroConfig = {
  eyebrow: string;
  title: string;
  subtitle: string;
  includedLabel: string;
  includedItems: Array<{ title: string; hint?: string }>;
  ctaLabel: string;
  ctaHint: string;
};

export type ServiceFunnelWhoIsItFor = {
  title: string;
  subtitle: string;
  items: Array<{
    title: string;
    description: string;
    badge?: string;
    image?: string;
    imageFirst?: boolean;
  }>;
};

type ServiceFunnelSharedFields = {
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
    robots?: NonNullable<Metadata["robots"]>;
  };
  metaLead: {
    contentName: string;
    leadSource: string;
  };
  metaPageView: {
    contentName: string;
    viewSource: string;
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
    /** Renders homepage Restyled results block after who-is-it-for (default: false). */
    showResultsSection?: boolean;
    /** Renders process steps as a standalone section before the offer (default: false). */
    showProcessStepsSection?: boolean;
    /** Renders process steps inside the booking card (default: true). */
    showProcessStepsInBooking?: boolean;
    /** Renders hero.description below subtitle (default: false). */
    showHeroDescription?: boolean;
  };
};

export type ServiceFunnelPasDefinition = ServiceFunnelSharedFields & {
  layout?: "pas";
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
  whoIsItFor: ServiceFunnelWhoIsItFor;
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
};

export type ReadyStoreV2CompetitorPickerConfig = {
  enabled: boolean;
  title: string;
  subtitle?: string;
};

export type ServiceFunnelReadyStoreV2Definition = ServiceFunnelSharedFields & {
  layout: "ready-store-v2";
  defaultSlotCapacity?: number;
  readyStoreV2: {
    hero: ReadyStoreV2HeroConfig;
    whoIsItFor: ServiceFunnelWhoIsItFor;
    competitorPicker?: ReadyStoreV2CompetitorPickerConfig;
  };
};

export type ServiceFunnelDefinition =
  | ServiceFunnelPasDefinition
  | ServiceFunnelReadyStoreV2Definition;

export type ServiceFunnelPasConfig = ServiceFunnelPasDefinition & {
  serviceSlug: string;
  pagePath: string;
};

export type ServiceFunnelReadyStoreV2Config = ServiceFunnelReadyStoreV2Definition & {
  serviceSlug: string;
  pagePath: string;
};

export type ServiceFunnelConfig = ServiceFunnelPasConfig | ServiceFunnelReadyStoreV2Config;

export function isReadyStoreV2Funnel(
  funnel: ServiceFunnelConfig,
): funnel is ServiceFunnelReadyStoreV2Config {
  return funnel.layout === "ready-store-v2";
}

export function isPasFunnel(funnel: ServiceFunnelConfig): funnel is ServiceFunnelPasConfig {
  return funnel.layout !== "ready-store-v2";
}
