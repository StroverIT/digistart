import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ServiceDetailReadyStore } from "@/components/services/service-detail-ready-store";
import { getServiceByIdFromDb } from "@/lib/server/services";

export const metadata: Metadata = {
  title: "Онлайн Магазин",
  description:
    "Стартирай онлайн продажби с готов магазин, нисък месечен разход и добавки за плащания и куриери.",
};

export default async function OnlineStorePage() {
  const service = await getServiceByIdFromDb("ready-store");
  if (!service) notFound();
  return <ServiceDetailReadyStore serviceData={service} />;
}
