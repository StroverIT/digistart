import type { Metadata } from "next";
import { Suspense } from "react";
import { ThreeFreeTipsCtaSection } from "@/components/google/three-free-tips-cta-section";
import { ThreeFreeTipsHeroSection } from "@/components/google/three-free-tips-hero-section";
import { ThreeFreeTipsVideoClickTracker } from "@/components/google/three-free-tips-video-click-tracker";

export const metadata: Metadata = {
  title: "3 безплатни съвета за Google",
  description:
    "Гледай краткото видео и вземи 3 безплатни съвета, които можеш да приложиш още днес, за да се класираш по-високо в Google.",
};

export default function ThreeFreeTipsPage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-white via-background to-primary/30">
      <Suspense fallback={null}>
        <ThreeFreeTipsVideoClickTracker />
      </Suspense>
      <main className="mx-auto w-full max-w-[1200px] px-4 pb-16 pt-24 sm:px-6 md:px-12 md:pb-24 md:pt-28">
        <ThreeFreeTipsHeroSection />
        <ThreeFreeTipsCtaSection variant="analysis" />
      </main>
    </div>
  );
}
