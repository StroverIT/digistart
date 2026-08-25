import type { Metadata } from "next";
import { NOINDEX_ROBOTS } from "@/lib/seo/metadata";

export const metadata: Metadata = {
  title: "Поръчка",
  description:
    "Завърши поръчката на избраните DigiStart услуги. Тази страница е само за клиенти с активна кошница.",
  robots: NOINDEX_ROBOTS,
};

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
