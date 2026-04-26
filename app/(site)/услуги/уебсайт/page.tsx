import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
import { ServiceDetailWebsite } from "@/components/services/service-detail-website";

const montserratBlack = Montserrat({
  subsets: ["latin", "cyrillic"],
  weight: "900",
});

const inter = Inter({
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: "Професионален Фирмен Уебсайт",
  description:
    "Представи бизнеса си онлайн с модерен сайт, без да чакаш с месеци и без излишни срещи.",
};

export default function WebsitePage() {
  return (
    <ServiceDetailWebsite
      bodyFontClass={inter.className}
      headingFontClass={montserratBlack.className}
    />
  );
}
