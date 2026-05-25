import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ServiceDetailAds } from "@/components/services/service-detail-ads";
import { getServiceByIdFromDb } from "@/lib/server/services";

export const metadata: Metadata = {
  title: "Реклами · Facebook и Instagram Ads",
  description:
    "Управление на Meta реклами за малки бизнеси — от €150/мес на канал, ясно таргетиране, месечни отчети. Бюджетът към Meta е отделно (мин. €50/мес).",
};

export default async function AdsPage() {
  const service = await getServiceByIdFromDb("ads");
  if (!service) {
    notFound();
  }

  return <ServiceDetailAds service={service} />;
}
