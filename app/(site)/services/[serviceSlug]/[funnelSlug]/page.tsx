import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ReadyStoreV2FunnelLayout } from "@/components/services/service-detail-ready-store-v2/ReadyStoreV2FunnelLayout";
import { FunnelContentSections } from "@/components/services/service-funnel/funnel-content";
import { FunnelHero } from "@/components/services/service-funnel/funnel-hero";
import { getFunnelBySlugs, isReadyStoreV2Funnel, SERVICE_FUNNELS } from "@/config/service-funnels";
import { ogImageMetadata } from "@/lib/seo/open-graph";

type ServiceFunnelPageProps = {
  params: Promise<{
    serviceSlug: string;
    funnelSlug: string;
  }>;
};

export function generateStaticParams() {
  return SERVICE_FUNNELS.map((funnel) => ({
    serviceSlug: funnel.serviceSlug,
    funnelSlug: funnel.funnelSlug,
  }));
}

export async function generateMetadata({ params }: ServiceFunnelPageProps): Promise<Metadata> {
  const { serviceSlug, funnelSlug } = await params;
  const funnel = getFunnelBySlugs(serviceSlug, funnelSlug);

  if (!funnel) {
    return {};
  }

  return {
    title: funnel.meta.title,
    description: funnel.meta.description,
    robots: funnel.meta.robots ?? { index: false, follow: true },
    ...ogImageMetadata(funnel.meta.ogCoverKey, funnel.meta.ogAlt),
  };
}

export default async function ServiceFunnelPage({ params }: ServiceFunnelPageProps) {
  const { serviceSlug, funnelSlug } = await params;
  const funnel = getFunnelBySlugs(serviceSlug, funnelSlug);

  if (!funnel) {
    notFound();
  }

  if (isReadyStoreV2Funnel(funnel)) {
    return <ReadyStoreV2FunnelLayout config={funnel} />;
  }

  return (
    <section>
      <FunnelHero config={funnel} />
      <FunnelContentSections config={funnel} />
    </section>
  );
}
