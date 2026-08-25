import type { Metadata } from "next";
import { BookingForm } from "@/components/home/booking-form";
import { CaseStudy } from "@/components/home/case-study";
import { HomeHero } from "@/components/home/hero";
import { LocalServicesSection } from "@/components/home/local-services-section";
import { PrioritiesSection } from "@/components/home/priorities-section";
import { TargetAudiencesTeaser } from "@/components/home/target-audiences-teaser";
// import { PathTabs } from "@/components/home/path-tabs";
import { HOME_PATHS, parsePathKey } from "@/lib/data/home-paths";
import { HOME_PATH_OG_COVER, OG_COVER } from "@/lib/seo/open-graph";

const HOME_METADATA = {
  title: {
    absolute: "Рекламна агенция София | DigiStart",
  },
  description:
    "Рекламна агенция в София: Google Ads, Meta Ads, SEO, Google Business и онлайн магазини. Стратегия и изпълнение от един екип. Безплатна консултация.",
  openGraphTitle: "Рекламна агенция София | DigiStart",
  openGraphDescription:
    "Google Ads, Meta, SEO, Google Business и онлайн магазини за бизнеси в София. Запиши безплатна консултация.",
} as const;

type HomePageProps = {
  searchParams: Promise<{ path?: string }>;
};

export async function generateMetadata({
  searchParams,
}: HomePageProps): Promise<Metadata> {
  const { path } = await searchParams;
  const pathKey = parsePathKey(path);
  const cover = pathKey ? HOME_PATH_OG_COVER[pathKey] : OG_COVER.generic;
  const pathLabel = pathKey
    ? HOME_PATHS.find((entry) => entry.key === pathKey)?.label
    : null;
  const alt = pathLabel
    ? `DigiStart – ${pathLabel}`
    : "Рекламна агенция София | DigiStart";

  return {
    title: HOME_METADATA.title,
    description: HOME_METADATA.description,
    openGraph: {
      title: HOME_METADATA.openGraphTitle,
      description: HOME_METADATA.openGraphDescription,
      images: [
        {
          url: cover,
          width: 2400,
          height: 1260,
          alt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: HOME_METADATA.openGraphTitle,
      description: HOME_METADATA.openGraphDescription,
      images: [cover],
    },
  };
}

export default function HomePage() {
  return (
    <>
      <HomeHero />
      <BookingForm showBadge={false} />
      <PrioritiesSection />
      <LocalServicesSection />
      {/* <PathTabs /> */}
      <CaseStudy />
      <TargetAudiencesTeaser />
    </>
  );
}
