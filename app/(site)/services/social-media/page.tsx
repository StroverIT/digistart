import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ServiceDetailSocialMedia } from "@/components/services/service-detail-social-media";
import { getServiceByIdFromDb } from "@/lib/server/services";

export const metadata: Metadata = {
  title: "Социални мрежи · съдържание и стратегия",
  description:
    "Професионални публикации за продавачи в Instagram и Facebook — от €200/месец, 2 поста седмично, желязна гаранция за 1 месец.",
};

export default async function SocialMediaPage() {
  const service = await getServiceByIdFromDb("social-media");
  if (!service) {
    notFound();
  }

  return <ServiceDetailSocialMedia service={service} />;
}
