import type { Metadata } from "next";
import { BookingForm } from "@/components/home/booking-form";

export const metadata: Metadata = {
  title: "Безплатна бизнес консултация | DigiStart",
  description:
    "Запази безплатен 30-минутен опознавателен разговор с DigiStart за постигане на резултати.",
};

export default function BusinessConsultationPage() {
  return (
    <BookingForm
      sourcePage="Бизнес консултация (/business-consultation)"
      pagePath="/business-consultation"
      analyticsPath="/business-consultation"
      analyticsCtaId="business_consultation_booking_submit"
      showBadge={false}
      className="flex min-h-screen items-center py-8 md:h-screen md:py-0"
    />
  );
}
