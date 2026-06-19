import type { Metadata } from "next";
import { BookingForm } from "@/components/home/booking-form";
import { CaseStudy } from "@/components/home/case-study";
import { HomeHero } from "@/components/home/hero";
import { MotivationBlock } from "@/components/home/motivation-block";
import { PathTabs } from "@/components/home/path-tabs";
import { ProcessSteps } from "@/components/home/process-steps";

export const metadata: Metadata = {
  title: "DigiStart – Дигитална екосистема за твоя бизнес",
  description:
    "От онлайн магазин до реклами и съдържание, което продава. Реални хора, не AI ботове. Запиши безплатна консултация.",
  openGraph: {
    title: "DigiStart – Дигитална екосистема за твоя бизнес",
    description:
      "Превръщаме чатовете в автоматизирани поръчки. Сайт, реклами и съдържание – всичко на едно място.",
  },
};

export default function HomePage() {
  return (
    <>
      <HomeHero />
      <PathTabs />
      <MotivationBlock />
      <CaseStudy />
      <ProcessSteps />
      <BookingForm />
    </>
  );
}
