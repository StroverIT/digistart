import type { Metadata } from "next";
import { BookingForm } from "@/components/home/booking-form";
import { fitMetaDescription } from "@/lib/seo/metadata";

export const metadata: Metadata = {
  title: "Безплатна бизнес среща",
  description: fitMetaDescription(
    "Запази безплатен 30-минутен опознавателен разговор с DigiStart. Ще уточним целите ти, ще открием къде губиш клиенти и ще ти дадем ясен план за повече продажби.",
  ),
};

export default function BusinessMeetingPage() {
  return (
    <BookingForm
      sourcePage="Бизнес среща (/business-meeting)"
      pagePath="/business-meeting"
      analyticsPath="/business-meeting"
      analyticsCtaId="business_meeting_booking_submit"
      title="Безплатна 30-минутна бизнес консултация"
      description="Ще говорим за целите ти, къде губиш клиенти и какъв е следващият ясен ход - без обвързване и без общи приказки."
      titleAs="h1"
      showBadge={false}
      nameEmailOnly
      showPhoneField={false}
      className="flex min-h-screen items-center py-8 md:h-screen md:py-0"
    />
  );
}
