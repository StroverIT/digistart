import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ServiceDetailSocialMedia } from "@/components/services/service-detail-social-media";
import { getServiceById } from "@/lib/data/services";
import { getServiceSlotAvailability } from "@/lib/server/service-slots";

export const metadata: Metadata = {
  title: "Социални мрежи · съдържание и стратегия",
  description:
    "Професионални публикации за продавачи в Instagram и Facebook — от €200/месец, 2 поста седмично, желязна гаранция за 1 месец.",
};

export default async function SocialMediaPage() {
  const service = getServiceById("social-media");
  if (!service) {
    notFound();
  }

  const availability = await getServiceSlotAvailability("social-media");
  return <ServiceDetailSocialMedia service={service} availability={availability} />;
}
