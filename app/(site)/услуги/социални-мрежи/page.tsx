import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Inter, Montserrat } from "next/font/google";
import { ServiceDetailWithConfigurator } from "@/components/services/service-detail-with-configurator";
import { getServiceById } from "@/lib/data/services";

const service = getServiceById("social-media");
const montserratBlack = Montserrat({
  subsets: ["latin", "cyrillic"],
  weight: "900",
});
const inter = Inter({
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: service?.name ?? "Социални мрежи",
  description: service?.shortDescription ?? "Услуга не е намерена.",
};

export default function SocialMediaPage() {
  if (!service) {
    notFound();
  }

  return (
    <div className={`${inter.className} ${montserratBlack.className}`}>
      <ServiceDetailWithConfigurator service={service} />
    </div>
  );
}
