import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ServiceDetailGoogleBusiness } from "@/components/services/service-detail-google-business";
import { getServiceByIdFromDb } from "@/lib/server/services";

export const metadata: Metadata = {
  title: "Google Business",
  description: "Услуга за Google Business профил.",
};

export default async function GoogleBusinessPage() {
  const service = await getServiceByIdFromDb("google-business");
  if (!service) {
    notFound();
  }

  return <ServiceDetailGoogleBusiness service={service} />;
}
