import type { Metadata } from "next";
import { ServiceDetailWebsite } from "@/components/services/service-detail-website";

export const metadata: Metadata = {
  title: "Професионален Фирмен Уебсайт",
  description:
    "Представи бизнеса си онлайн с модерен сайт, без да чакаш с месеци и без излишни срещи.",
};

export default function WebsitePage() {
  return <ServiceDetailWebsite />;
}
