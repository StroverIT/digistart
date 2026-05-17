import type { Metadata } from "next";
import { PlansSection } from "@/components/plans/plans-section";

export const metadata: Metadata = {
  title: "Абонаментни пакети",
  description:
    "Избери готов абонаментен пакет: онлайн магазин, социални мрежи и Google Business с отстъпки.",
};

export default function PlansPage() {
  return (
    <main className="pt-24 pb-16">
      <PlansSection
        title="Абонаментни пакети"
        subtitle="Три готови пакета с месечно плащане. Можеш и да конфигурираш всяка услуга поотделно от страниците ни."
      />
    </main>
  );
}
