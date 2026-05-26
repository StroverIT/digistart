import type { Metadata } from "next";
import { HomePageClient } from "@/components/visitor-survey/home-page-client";

export const metadata: Metadata = {
  title: "DigiStart - кажи ни какво търсиш",
  description:
    "Кратък въпросник: къде продаваш и коя услуга те интересува - за персонализирано изживяване в DigiStart.",
};

export default function HomePage() {
  return <HomePageClient />;
}
