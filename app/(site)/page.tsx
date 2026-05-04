import { HeroSection } from "@/components/home/hero-section";
import { ServicesSection } from "@/components/home/services-section";
import { ProcessSection } from "@/components/home/process-section";
import { StatsSection } from "@/components/home/stats-section";
import { CTASection } from "@/components/home/cta-section";

export default function HomePage() {
  return (
    <div className="relative isolate">
      <div className="home-blobs" aria-hidden>
        <div className="home-blobs__blob home-blobs__blob--1" />
        <div className="home-blobs__blob home-blobs__blob--2" />
        <div className="home-blobs__blob home-blobs__blob--3" />
        <div className="home-blobs__blob home-blobs__blob--4" />
      </div>
      <div className="relative z-10">
        <HeroSection />
        <ServicesSection />
        <StatsSection />
        <ProcessSection />
        <CTASection />
      </div>
    </div>
  );
}
