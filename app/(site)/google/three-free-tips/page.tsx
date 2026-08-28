import type { Metadata } from "next";
import { ThreeFreeTipsCtaSection } from "@/components/google/three-free-tips-cta-section";
import { ThreeFreeTipsHeroSection } from "@/components/google/three-free-tips-hero-section";

export const metadata: Metadata = {
  title: "3 безплатни съвета за Google",
  description:
    "Гледай краткото видео и вземи 3 безплатни съвета, които можеш да приложиш още днес, за да се класираш по-високо в Google.",
};

export default function ThreeFreeTipsPage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-white via-background to-primary/30">
      <main className="mx-auto w-full max-w-[1200px] px-4 pb-16 pt-24 sm:px-6 md:px-12 md:pb-24 md:pt-28">
        <section className="mb-10 max-w-3xl space-y-4">
          <p className="text-sm font-medium tracking-wide uppercase text-primary">
            Безплатни съвети
          </p>
          <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
            В краткото видео показваме три конкретни стъпки за локални бизнеси -
            без общи приказки и без нужда от технически екип. Подходящо е, ако имаш
            магазин, услуга или обект, който разчита на клиенти от Google Maps и
            локално търсене.
          </p>
          <p className="text-base leading-relaxed text-muted-foreground">
            След като гледаш видеото, можеш да оставиш имейл и да получиш съветите
            накуц - за да ги имаш под ръка, когато настройваш профила си, отговаряш
            на отзиви или планираш следващите промени в Google Business.
          </p>
        </section>
        <ThreeFreeTipsHeroSection />
        <ThreeFreeTipsCtaSection variant="analysis" />
      </main>
    </div>
  );
}
