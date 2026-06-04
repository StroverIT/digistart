import dynamic from "next/dynamic";
import { Check } from "lucide-react";
import { LandingSection } from "./shared";
import { LANDING_GLASS_CLASS, LANDING_GLASS_ACCENT_CLASS } from "./landing-animation-classes";
import GoogleReviewsSection from "./GoogleReviewsSection";

const HeroVideo = dynamic(() => import("./HeroVideo"), {
  loading: () => (
    <article className="w-full flex-1">
      <div
        className="overflow-hidden rounded-2xl border border-border/80 bg-muted/40 p-2 shadow-xl shadow-primary/5 sm:p-3"
        aria-hidden
      >
        <div className="aspect-video w-full rounded-xl bg-muted/60" />
      </div>
    </article>
  ),
});

const HeroSection = () => {
  return (
    <LandingSection className="border-b-0 bg-linear-to-b from-white to-primary md:pt-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-10 lg:items-center lg:gap-16">
        <div className="flex w-full flex-col items-center text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Адаптивен онлайн магазин
          </p>
          <h1 className="font-heading mt-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-[3.25rem] lg:leading-[1.1]">
            Пусни. Продавай. Адаптирай.
          </h1>
          <p className="mt-4 max-w-lg text-2xl text-muted-foreground">
            Вземи всичко необходимо за изграждане на онлайн продажби
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 lg:items-start">
            <a
              href="#buy-section"
              className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-8 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-colors hover:bg-primary/90"
            >
              Започни безплатно
            </a>
            <p className="text-sm text-muted-foreground">Пробният период е 14 дни.</p>
          </div>
          <ul className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-3 lg:justify-start">
            {["Онлайн плащания", "Лесно за настройсване", "Оптимизиран за мобилни устройства"].map(
              (item) => (
                <li
                  key={item}
                  className={`flex items-center gap-2.5 rounded-full px-4 py-2 text-sm font-medium text-foreground ${LANDING_GLASS_CLASS}`}
                >
                  <span
                    className={`flex size-6 shrink-0 items-center justify-center rounded-full text-foreground ${LANDING_GLASS_ACCENT_CLASS}`}
                  >
                    <Check className="size-3.5" strokeWidth={3} />
                  </span>
                  {item}
                </li>
              ),
            )}
          </ul>
        </div>

        <HeroVideo videoId="mMNGqvyngLE" title="YouTube video player" />
      </div>
      <GoogleReviewsSection />
    </LandingSection>
  );
};

export default HeroSection;
