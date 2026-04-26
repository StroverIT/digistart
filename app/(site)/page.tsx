import { HeroSection } from "@/components/home/hero-section";
import { ServicesSection } from "@/components/home/services-section";
import { ProcessSection } from "@/components/home/process-section";
import { StatsSection } from "@/components/home/stats-section";
import { CTASection } from "@/components/home/cta-section";
import { Inter, Montserrat } from "next/font/google";

const montserratBlack = Montserrat({
  subsets: ["latin", "cyrillic"],
  weight: "900",
});
const inter = Inter({
  subsets: ["latin", "cyrillic"],
});

export default function HomePage() {
  return (
    <div className={`${inter.className} ${montserratBlack.className}`}>
      <HeroSection />
      <ServicesSection />
      <StatsSection />
      <ProcessSection />
      <CTASection />
    </div>
  );
}
