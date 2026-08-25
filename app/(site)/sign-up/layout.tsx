import type { Metadata } from "next";
import { NOINDEX_ROBOTS } from "@/lib/seo/metadata";

export const metadata: Metadata = {
  title: "Регистрация на клиентски профил",
  description:
    "Създай профил в DigiStart, за да поръчваш услуги, да следиш проекти и да управляваш онлайн магазина си спокойно от едно място.",
  robots: NOINDEX_ROBOTS,
};

export default function SignUpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
