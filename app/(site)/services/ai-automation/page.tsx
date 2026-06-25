import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BookingForm } from "@/components/home/booking-form";
import { ServiceDetailAiAutomation } from "@/components/services/service-detail-ai-automation";
import { getServiceById } from "@/lib/data/services";

export const metadata: Metadata = {
  title: "AI Automation · Instagram продажби на автопилот",
  description:
    "AI Automation за Instagram продавачи - DM отговори, comment-to-DM, реактивация на изоставени чатове и квалификация на лийдове. €28/мес., старт до 24 часа.",
};

export default async function AiAutomationPage() {
  const service = getServiceById("ai-automation");
  if (!service) notFound();
  return (
    <>
      <ServiceDetailAiAutomation serviceData={service} />
      <BookingForm
        sourcePage="AI Automation (/services/ai-automation)"
        sectionId="buy-now"
        analyticsPath="/services/ai-automation"
        analyticsCtaId="ai_automation_booking_submit"
      />
    </>
  );
}
