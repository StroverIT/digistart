import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FunnelContentSections } from "@/components/services/service-funnel/funnel-content";
import { FunnelHero } from "@/components/services/service-funnel/funnel-hero";
import { getFunnelBySlugs, SERVICE_FUNNELS } from "@/config/service-funnels";
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
    robots: { index: false, follow: true },
    ...ogImageMetadata(funnel.meta.ogCoverKey, funnel.meta.ogAlt),
  };
}

export default async function ServiceFunnelPage({ params }: ServiceFunnelPageProps) {
  const { serviceSlug, funnelSlug } = await params;
  const funnel = getFunnelBySlugs(serviceSlug, funnelSlug);

  if (!funnel) {
    notFound();
  }

  return (
    <section>
      <FunnelHero config={funnel} />
      <FunnelContentSections config={funnel} />
    </section>
  );
}
