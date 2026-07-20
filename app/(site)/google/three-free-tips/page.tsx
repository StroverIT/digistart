import type { Metadata } from "next";
import HeroVideo from "@/components/services/service-detail-ready-store-v2/HeroVideo";
import { ThreeFreeTipsCtaSection } from "@/components/google/three-free-tips-cta-section";

export const metadata: Metadata = {
  title: "3 безплатни съвета за Google | DigiStart",
  description:
    "Гледай краткото видео и вземи 3 безплатни съвета, които можеш да приложиш още днес, за да се класираш по-високо в Google.",
};

export default function ThreeFreeTipsPage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-white via-background to-primary/30">
      <main className="mx-auto w-full max-w-[1200px] px-4 pb-16 pt-24 sm:px-6 md:px-12 md:pb-24 md:pt-28">
        <section className="mx-auto flex w-full max-w-[1200px] flex-col items-center gap-8 text-center md:flex-row md:items-center md:gap-10 md:text-left lg:gap-14">
          <div className="flex w-full flex-col gap-4 md:w-1/2 md:gap-6">
            <h1 className="font-heading text-balance text-3xl font-bold leading-tight text-foreground sm:text-4xl md:text-4xl lg:text-5xl">
              Бизнесът ти невидим ли е в Google?
            </h1>
            <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
              Гледай това кратко видео, за да разбереш защо не се класираш в топ 3.
            </p>
            <p className="text-base font-bold leading-relaxed text-foreground sm:text-lg">
              Запиши се по-долу, за да получиш три БЕЗПЛАТНИ съвета, които можеш да приложиш още
              днес и да започнеш да се изкачваш нагоре. ⬇️
            </p>
            <form className="mx-auto flex w-full max-w-md flex-col gap-2 sm:flex-row md:mx-0">
              <input
                type="email"
                name="email"
                required
                placeholder="name@email.com"
                autoComplete="off"
                className="h-[50px] w-full rounded-lg border border-border bg-white px-4 text-base text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
              />
              <button
                type="submit"
                className="h-[50px] shrink-0 rounded-lg bg-accent px-5 text-base font-semibold text-accent-foreground transition hover:opacity-90 sm:px-6"
              >
                Абонирай се
              </button>
            </form>
          </div>
          <div className="w-full md:w-1/2">
            <HeroVideo
              videoId="9giP4v2PfxE"
              title="3 безплатни съвета за по-високо класиране в Google"
              thumbnailSrc="/video-thumbnail.png"
              muteOnPlay
            />
          </div>
        </section>

        <ThreeFreeTipsCtaSection />
      </main>
    </div>
  );
}
