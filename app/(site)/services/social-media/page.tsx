import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ServiceDetailSocialMedia } from "@/components/services/service-detail-social-media";
import { getServiceByIdFromDb } from "@/lib/server/services";

export const metadata: Metadata = {
  title: "Социални мрежи",
  description:
    "Съдържание, реклами и автоматизация за малки бизнеси, които искат заявки и продажби от социалните мрежи.",
};

export default async function SocialMediaPage() {
  const service = await getServiceByIdFromDb("social-media");
  if (!service) {
    notFound();
  }

  return <ServiceDetailSocialMedia service={service} />;
}
