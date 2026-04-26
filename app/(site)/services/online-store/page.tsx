import type { Metadata } from "next";
import { ServiceDetailReadyStore } from "@/components/services/service-detail-ready-store";

export const metadata: Metadata = {
  title: "Онлайн Магазин",
  description:
    "Продавай веднага с професионален магазин, настроен специално за твоя бизнес. Без скрити такси.",
};

export default function OnlineStorePage() {
  return <ServiceDetailReadyStore />;
}
