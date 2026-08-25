import type { Metadata } from "next";
import { NOINDEX_ROBOTS } from "@/lib/seo/metadata";

export const metadata: Metadata = {
  title: "Кошница",
  description:
    "Прегледай избраните DigiStart услуги преди поръчка: онлайн магазин, реклами, Google Business и социални мрежи на едно място.",
  robots: NOINDEX_ROBOTS,
};

export default function CartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
