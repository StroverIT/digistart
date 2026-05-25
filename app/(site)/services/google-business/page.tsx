import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ServiceDetailGoogleBusiness } from "@/components/services/service-detail-google-business";
import { getServiceByIdFromDb } from "@/lib/server/services";

export const metadata: Metadata = {
  title: "Google Business · локална видимост",
  description:
    "Настройка на Google Business профил за продавачи в Instagram, Facebook и OLX — €49 еднократно, Maps, отзиви, локално SEO.",
};

export default async function GoogleBusinessPage() {
  const service = await getServiceByIdFromDb("google-business");
  if (!service) {
    notFound();
  }

  return <ServiceDetailGoogleBusiness service={service} />;
}
