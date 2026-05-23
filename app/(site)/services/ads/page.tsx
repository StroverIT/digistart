import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ServiceDetailAds } from "@/components/services/service-detail-ads";
import { getServiceByIdFromDb } from "@/lib/server/services";

export const metadata: Metadata = {
  title: "Реклами",
  description:
    "Управление на Facebook и Instagram реклами за малки бизнеси — настройка, таргетиране и месечна оптимизация.",
};

export default async function AdsPage() {
  const service = await getServiceByIdFromDb("ads");
  if (!service) {
    notFound();
  }

  return <ServiceDetailAds service={service} />;
}
