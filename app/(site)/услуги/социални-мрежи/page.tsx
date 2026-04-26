import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ServiceDetailWithConfigurator } from "@/components/services/service-detail-with-configurator";
import { getServiceById } from "@/lib/data/services";

const service = getServiceById("social-media");

export const metadata: Metadata = {
  title: service?.name ?? "Социални мрежи",
  description: service?.shortDescription ?? "Услуга не е намерена.",
};

export default function SocialMediaPage() {
  if (!service) {
    notFound();
  }

  return <ServiceDetailWithConfigurator service={service} />;
}
