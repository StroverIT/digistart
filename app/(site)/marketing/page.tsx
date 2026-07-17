import type { Metadata } from "next";
import { BookingForm } from "@/components/home/booking-form";
import { CaseStudy } from "@/components/home/case-study";
import { HomeHero } from "@/components/home/hero";
import { PrioritiesSection } from "@/components/home/priorities-section";
import { TargetAudiencesTeaser } from "@/components/home/target-audiences-teaser";
import { HOME_PATHS, parsePathKey } from "@/lib/data/home-paths";
import { HOME_PATH_OG_COVER, OG_COVER } from "@/lib/seo/open-graph";

const MARKETING_METADATA = {
  title: "DigiStart – Дигитална екосистема за твоя бизнес",
  description:
    "От онлайн магазин до реклами и съдържание, което продава. Реални хора, не AI ботове. Запиши безплатна консултация.",
  openGraphTitle: "DigiStart – Дигитална екосистема за твоя бизнес",
  openGraphDescription:
    "Превръщаме чатовете в автоматизирани поръчки. Сайт, реклами и съдържание – всичко на едно място.",
} as const;

type MarketingPageProps = {
  searchParams: Promise<{ path?: string }>;
};

export async function generateMetadata({
  searchParams,
}: MarketingPageProps): Promise<Metadata> {
  const { path } = await searchParams;
  const pathKey = parsePathKey(path);
  const cover = pathKey ? HOME_PATH_OG_COVER[pathKey] : OG_COVER.generic;
  const pathLabel = pathKey
    ? HOME_PATHS.find((entry) => entry.key === pathKey)?.label
    : null;
  const alt = pathLabel
    ? `DigiStart – ${pathLabel}`
    : "DigiStart – Дигитална екосистема за твоя бизнес";

  return {
    title: MARKETING_METADATA.title,
    description: MARKETING_METADATA.description,
    openGraph: {
      title: MARKETING_METADATA.openGraphTitle,
      description: MARKETING_METADATA.openGraphDescription,
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
      title: MARKETING_METADATA.openGraphTitle,
      description: MARKETING_METADATA.openGraphDescription,
      images: [cover],
    },
  };
}

export default function MarketingPage() {
  return (
    <>
      <HomeHero />
      <BookingForm showProcessSteps={false} showBadge={false} />
      <PrioritiesSection />
      <CaseStudy />
      <TargetAudiencesTeaser />
    </>
  );
}
