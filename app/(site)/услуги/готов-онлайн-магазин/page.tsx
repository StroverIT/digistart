import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
import { ServiceDetailReadyStore } from "@/components/services/service-detail-ready-store";

const montserratBlack = Montserrat({
  subsets: ["latin", "cyrillic"],
  weight: "900",
});

const inter = Inter({
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: "Готов Онлайн Магазин",
  description:
    "Продавай веднага с професионален магазин, настроен специално за твоя бизнес. Без скрити такси.",
};

export default function ReadyOnlineStorePage() {
  return (
    <div className={inter.className}>
      <ServiceDetailReadyStore headingFontClass={montserratBlack.className} />
    </div>
  );
}
