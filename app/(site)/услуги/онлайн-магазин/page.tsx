import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ServiceDetailReadyStore } from "@/components/services/service-detail-ready-store";
import { getServiceByIdFromDb } from "@/lib/server/services";

export const metadata: Metadata = {
  title: "Онлайн Магазин",
  description:
    "Продавай веднага с професионален магазин, настроен специално за твоя бизнес. Без скрити такси.",
};

export default async function OnlineStorePage() {
  const service = await getServiceByIdFromDb("ready-store");
  if (!service) notFound();
  return <ServiceDetailReadyStore serviceData={service} />;
}
