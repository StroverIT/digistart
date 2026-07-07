import dynamic from "next/dynamic";
import HeroSection from "@/components/services/service-detail-ready-store-v2/HeroSection";
import { CompetitorPlatformPicker } from "@/components/services/funnel/competitor-platform-picker";
import { CompetitorPlatformAdminToolbar } from "@/components/services/funnel/competitor-platform-admin-toolbar";
import { FunnelWhoIsItForSection } from "@/components/services/service-funnel/funnel-who-is-it-for-section";
import type { ServiceFunnelReadyStoreV2Config } from "@/config/service-funnels/types";
import type { ServiceBuyConsultationConfig } from "@/components/services/service-buy-consultation-section";

const InnerNavigation = dynamic(
  () => import("@/components/services/service-detail-ready-store-v2/InnerNavigation"),
);

const PasFaqSection = dynamic(() =>
  import("@/components/services/service-pas-landing/faq-section").then((mod) => ({
    default: mod.PasFaqSection,
  })),
);

const Benefits = dynamic(
  () => import("@/components/services/service-detail-ready-store-v2/Benefits"),
);
const BuiltInChat = dynamic(
  () => import("@/components/services/service-detail-ready-store-v2/BuiltInChat"),
);
const MarketingTools = dynamic(
  () => import("@/components/services/service-detail-ready-store-v2/MarketingTools"),
);
const AdminPanel = dynamic(
  () => import("@/components/services/service-detail-ready-store-v2/AdminPanel"),
);
const RealShop = dynamic(
  () => import("@/components/services/service-detail-ready-store-v2/RealShop"),
);
const BuySection = dynamic(
  () => import("@/components/services/service-detail-ready-store-v2/BuySection"),
);

const ServiceBuyConsultationFormSection = dynamic(() =>
  import("@/components/services/service-buy-consultation-section").then((mod) => ({
    default: mod.ServiceBuyConsultationFormSection,
  })),
);

type ReadyStoreV2FunnelLayoutProps = {
  config: ServiceFunnelReadyStoreV2Config;
};

function buildConsultationConfig(config: ServiceFunnelReadyStoreV2Config): ServiceBuyConsultationConfig {
  const consultation = config.consultation;
  if (!consultation) {
    throw new Error(`Funnel ${config.id} is missing consultation config.`);
  }

  return {
    promptTitle: consultation.promptTitle,
    promptCtaLabel: consultation.promptCtaLabel,
    formTitle: consultation.formTitle,
    description: consultation.description,
    analyticsCtaId: consultation.analyticsCtaId,
    sourcePage: config.sourcePage,
    analyticsPath: config.pagePath,
    metaLead: consultation.metaLead,
    booking: consultation.booking,
  };
}

export function ReadyStoreV2FunnelLayout({ config }: ReadyStoreV2FunnelLayoutProps) {
  const { hero, whoIsItFor, competitorPicker } = config.readyStoreV2;
  if (!hero || !whoIsItFor) {
    throw new Error(`Funnel ${config.id} is missing readyStoreV2.hero or readyStoreV2.whoIsItFor config.`);
  }

  const consultation = buildConsultationConfig(config);

  return (
    <section>
      {competitorPicker?.enabled ? (
        <>
          <CompetitorPlatformPicker
            funnelId={config.id}
            pagePath={config.pagePath}
            title={competitorPicker.title}
            subtitle={competitorPicker.subtitle}
          />
          <CompetitorPlatformAdminToolbar funnelId={config.id} />
        </>
      ) : null}
      <HeroSection
        hero={hero}
        contentClassName="pt-funnel-top"
        funnelId={competitorPicker?.enabled ? config.id : undefined}
      />
      <div className="bg-white pt-10 md:rounded-t-4xl md:-mt-10">
        <InnerNavigation funnelLayout />
        <FunnelWhoIsItForSection
          whoIsItFor={whoIsItFor}
          serviceId={config.serviceId}
          className="bg-white"
          funnelId={competitorPicker?.enabled ? config.id : undefined}
          endCta={
            competitorPicker?.enabled
              ? {
                  title: "Готов си за промяна?",
                  pagePath: config.pagePath,
                  ctaId: `${config.analyticsCtaId}_who_is_it_for_scroll_buy`,
                  label: hero.ctaLabel,
                }
              : undefined
          }
        />
        <Benefits />
        <BuiltInChat />
        <MarketingTools />
        <AdminPanel />
        <RealShop />
      </div>

      <BuySection
        funnelId={config.id}
        pagePath={config.pagePath}
        ctaId={config.analyticsCtaId}
        consultation={consultation}
      />
      <PasFaqSection
        {...config.faq}
        funnelId={competitorPicker?.enabled ? config.id : undefined}
      />
      <ServiceBuyConsultationFormSection consultation={consultation} />
    </section>
  );
}
