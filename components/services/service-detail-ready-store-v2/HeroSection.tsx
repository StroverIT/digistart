"use client";

// import dynamic from "next/dynamic";
import { ArrowRight, CreditCard, Settings2, Smartphone, type LucideIcon } from "lucide-react";
import type { ReadyStoreV2HeroConfig } from "@/config/service-funnels/types";
import { useCompetitorPlatformSelection } from "@/components/services/funnel/use-competitor-platform-selection";
import { getCompetitorPlatformPas } from "@/lib/funnel/competitor-platform-pas";
import { personalizeCompetitorCopy } from "@/lib/funnel/competitor-platform-personalization";
import { cn } from "@/lib/utils";
import { LandingSection } from "./shared";
import { LANDING_BODY_CLASS } from "./landing-animation-classes";
import GoogleReviewsSection from "./GoogleReviewsSection";

const defaultHeroFeatures = [
  {
    icon: CreditCard,
    label: "Онлайн плащания",
    hint: "Карти и наложен платеж",
  },
  {
    icon: Settings2,
    label: "Лесно за настройсване",
    hint: "Без технически познания",
  },
  {
    icon: Smartphone,
    label: "Мобилна версия",
    hint: "Продавай от телефона",
  },
] as const;

const defaultHeroConfig: ReadyStoreV2HeroConfig = {
  eyebrow: "Не платформа. Персонализиран онлайн магазин",
  title: "Пусни. Продавай. Адаптирай.",
  subtitle: "Вземи всичко необходимо за изграждане на онлайн продажби",
  includedLabel: "Включено още от старта",
  includedItems: defaultHeroFeatures.map(({ label, hint }) => ({ title: label, hint })),
  ctaLabel: "Започни безплатно",
  ctaHint: "Пробният период е 14 дни.",
};

type HeroSectionProps = {
  hero?: ReadyStoreV2HeroConfig;
  contentClassName?: string;
  funnelId?: string;
};

// const HeroVideo = dynamic(() => import("./HeroVideo"), {
//   loading: () => (
//     <article className="w-full flex-1">
//       <div
//         className="overflow-hidden rounded-2xl border border-border/80 bg-muted/40 p-2 shadow-xl shadow-primary/5 sm:p-3"
//         aria-hidden
//       >
//         <div className="aspect-video w-full rounded-xl bg-muted/60" />
//       </div>
//     </article>
//   ),
// });

const HeroSection = ({
  hero,
  contentClassName = "pt-site-header",
  funnelId,
}: HeroSectionProps) => {
  const config = hero ?? defaultHeroConfig;
  const { answer } = useCompetitorPlatformSelection(funnelId);
  const useDefaultIcons = !hero;
  const includedItems = useDefaultIcons ? defaultHeroFeatures : config.includedItems;
  const gridCols =
    includedItems.length >= 4
      ? "sm:grid-cols-2"
      : includedItems.length === 3
        ? "sm:grid-cols-3"
        : "sm:grid-cols-2";

  return (
    <LandingSection
      className="border-b-0 bg-linear-to-b from-white to-primary/50 pt-0 pb-14 md:pb-20 lg:pb-24"
      contentClassName={contentClassName}
    >
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-10 lg:items-center lg:gap-16">
        <div className="flex w-full flex-col items-center text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-accent">
            {config.eyebrow}
          </p>
          <h1 className="font-heading mt-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-[3.25rem] lg:leading-[1.1]">
            {config.title}
          </h1>
          <p className={cn("mt-4 max-w-lg", LANDING_BODY_CLASS)}>{config.subtitle}</p>

          <div className="mt-8 w-full max-w-3xl overflow-hidden rounded-2xl border border-primary/20 bg-card shadow-[var(--shadow-soft)]">
            <div className="border-b border-primary/10 bg-primary/5 px-4 py-3 sm:px-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-accent">
                {config.includedLabel}
              </p>
            </div>

            <ul className={cn("grid divide-y divide-primary/10 sm:divide-x sm:divide-y-0", gridCols)}>
              {includedItems.map((item, index) => {
                const icon = useDefaultIcons
                  ? (defaultHeroFeatures[index]?.icon as LucideIcon | undefined)
                  : undefined;
                const Icon = icon;
                const title = "label" in item ? item.label : item.title;
                let hint = item.hint
                  ? answer
                    ? personalizeCompetitorCopy(item.hint, answer)
                    : item.hint
                  : undefined;

                if (
                  funnelId &&
                  answer &&
                  answer.platform !== "other" &&
                  title === "Безплатна миграция"
                ) {
                  const pas = getCompetitorPlatformPas(answer.platform);
                  if (pas?.migrationHooks[0]) {
                    hint = pas.migrationHooks[0];
                  }
                }

                return (
                  <li
                    key={title}
                    className="flex flex-col items-center gap-2 px-4 py-5 text-center sm:px-3"
                  >
                    {Icon ? (
                      <span className="flex size-10 items-center justify-center rounded-xl bg-primary/15 text-accent ring-1 ring-primary/20">
                        <Icon className="size-5" strokeWidth={2.25} aria-hidden />
                      </span>
                    ) : null}
                    <span className="font-heading text-sm font-bold leading-snug text-foreground">
                      {title}
                    </span>
                    {hint ? (
                      <span className="max-w-[15rem] text-xs leading-relaxed text-muted-foreground sm:max-w-xs">
                        {hint}
                      </span>
                    ) : null}
                  </li>
                );
              })}
            </ul>

            <div className="flex flex-col items-center gap-3 border-t border-primary/10 bg-linear-to-b from-transparent to-primary/5 px-4 py-6 sm:px-6">
              <a
                href="#buy-section"
                className="group inline-flex h-12 w-full max-w-sm items-center justify-center gap-2 rounded-full bg-primary px-8 text-base font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition-transform hover:scale-[1.02] motion-reduce:hover:scale-100 sm:w-auto"
              >
                {config.ctaLabel}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </a>
              <p className="text-sm text-muted-foreground">{config.ctaHint}</p>
            </div>
          </div>
        </div>

        {/* <HeroVideo videoId="mMNGqvyngLE" title="YouTube video player" /> */}
      </div>
      <GoogleReviewsSection />
    </LandingSection>
  );
};

export default HeroSection;
