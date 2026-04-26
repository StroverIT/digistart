import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ServiceDetailWebsite } from "@/components/services/service-detail-website";
import { getServiceByIdFromDb } from "@/lib/server/services";

export const metadata: Metadata = {
  title: "Професионален Фирмен Уебсайт",
  description:
    "Представи бизнеса си онлайн с модерен сайт, без да чакаш с месеци и без излишни срещи.",
};

export default async function WebsitePage() {
  const service = await getServiceByIdFromDb("websites");
  if (!service) notFound();
  return <ServiceDetailWebsite serviceData={service} />;
}
