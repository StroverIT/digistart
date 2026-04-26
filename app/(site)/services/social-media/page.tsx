import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ServiceDetailSocialMedia } from "@/components/services/service-detail-social-media";
import { getServiceByIdFromDb } from "@/lib/server/services";

export const metadata: Metadata = {
  title: "Социални мрежи",
  description: "Услуга за управление на социални мрежи.",
};

export default async function SocialMediaPage() {
  const service = await getServiceByIdFromDb("social-media");
  if (!service) {
    notFound();
  }

  return <ServiceDetailSocialMedia service={service} />;
}
