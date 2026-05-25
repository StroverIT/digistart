import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ServiceDetailGoogleBusiness } from "@/components/services/service-detail-google-business";
import { getServiceById } from "@/lib/data/services";
import { getServiceSlotAvailability } from "@/lib/server/service-slots";

export const metadata: Metadata = {
  title: "Google Business · локална видимост",
  description:
    "Настройка на Google Business профил за продавачи в Instagram, Facebook и OLX - €49 еднократно, Maps, отзиви, локално SEO.",
};

export default async function GoogleBusinessPage() {
  const service = getServiceById("google-business");
  if (!service) {
    notFound();
  }

  const availability = await getServiceSlotAvailability("google-business");
  return <ServiceDetailGoogleBusiness service={service} availability={availability} />;
}
