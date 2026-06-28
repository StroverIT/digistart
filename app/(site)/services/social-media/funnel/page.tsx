import type { Metadata } from "next";
import { FunnelContentSections } from "@/components/services/social-media-funnel/funnel-content";
import { FunnelHero } from "@/components/services/social-media-funnel/funnel-hero";
import { ogImageMetadata } from "@/lib/seo/open-graph";

export const metadata: Metadata = {
  title: "Спрете да губите клиенти заради социални мрежи",
  description:
    "Запазете безплатна консултация. Ще прегледаме Instagram и Facebook профила ви и ще ви покажем как да изглеждате активни и надеждни пред конкурентите.",
  robots: { index: false, follow: true },
  ...ogImageMetadata("socialMedia", "DigiStart – Безплатна консултация за социални мрежи"),
};

export default function SocialMediaFunnelPage() {
  return (
    <section>
      <FunnelHero />
      <FunnelContentSections />
    </section>
  );
}
