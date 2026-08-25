import type { Metadata } from "next";
import { NOINDEX_ROBOTS } from "@/lib/seo/metadata";

export const metadata: Metadata = {
  title: "Вход в клиентския профил",
  description:
    "Влез в профила си в DigiStart, за да следиш поръчки, услуги и статуса на онлайн магазина или маркетинговите кампании от едно място.",
  robots: NOINDEX_ROBOTS,
};

export default function SignInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
