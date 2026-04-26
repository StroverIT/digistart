import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ServiceDetailWithConfigurator } from "@/components/services/service-detail-with-configurator";
import { getServiceById } from "@/lib/data/services";

const service = getServiceById("google-business");

export const metadata: Metadata = {
  title: service?.name ?? "Google Business",
  description: service?.shortDescription ?? "Услуга не е намерена.",
};

export default function GoogleBusinessPage() {
  if (!service) {
    notFound();
  }

  return <ServiceDetailWithConfigurator service={service} />;
}
