import type { Metadata } from "next";
import { BookingForm } from "@/components/home/booking-form";

export const metadata: Metadata = {
  title: "Безплатна бизнес консултация",
  description:
    "Запази безплатен 30-минутен опознавателен разговор с DigiStart. Ще уточним целите ти и ще ти дадем ясен план за повече клиенти и продажби.",
};

export default function BusinessConsultationPage() {
  return (
    <BookingForm
      sourcePage="Бизнес консултация (/business-consultation)"
      pagePath="/business-consultation"
      analyticsPath="/business-consultation"
      analyticsCtaId="business_consultation_booking_submit"
      title="Безплатна 30-минутна бизнес консултация"
      description="Ще говорим за целите ти, къде губиш клиенти и какъв е следващият ясен ход - без обвързване и без общи приказки."
      titleAs="h1"
      showBadge={false}
      className="flex min-h-screen items-center py-8 md:h-screen md:py-0"
    />
  );
}
