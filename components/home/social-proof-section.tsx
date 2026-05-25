"use client";

import { useEffect, useRef, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  Facebook,
  Instagram,
  MessageCircle,
  Paintbrush,
  MapPin,
  Share2,
  Shirt,
  ShoppingBag,
  Smartphone,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TrackedCtaLink } from "@/components/analytics/tracked-cta-link";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

const restyledSocial = {
  facebook: "https://www.facebook.com/profile.php?id=61582055477324",
  instagram: "https://www.instagram.com/restyled_bg/",
  website: "https://restyled.bg",
} as const;

export type SocialProofSectionType =
  | "home"
  | "online-store"
  | "social-media"
  | "google-business"
  | "ads";

type Highlight = {
  label: string;
  value: string;
  icon: LucideIcon;
};

type SocialProofContent = {
  title: ReactNode;
  eyebrow: string;
  description: ReactNode;
  highlights: Highlight[];
  primaryCta: { href: string; label: string; ctaId: string };
};

const CONTENT: Record<SocialProofSectionType, SocialProofContent> = {
  home: {
    title: (
      <>
        Бизнеси, които вече <span className="gradient-text">растат с нас</span>
      </>
    ),
    eyebrow: "Онлайн магазин · Fashion",
    description: (
      <>
        Restyled е моден бранд, който продаваше основно на живо и в съобщения. С готов онлайн
        магазин (mobile-first) преминаха към поръчки 24/7 - без да изглеждат „любителски“
        онлайн.
        <div className="mt-2" />
        Днес клиентите разглеждат колекциите сами, поръчват с няколко клика и брандът расте с
        по-организирано присъствие в социалните мрежи, вместо да губи часове в отговори на едни и
        същи въпроси.
      </>
    ),
    highlights: [
      { label: "Ниша", value: "Fashion", icon: Shirt },
      { label: "Фокус", value: "Mobile-first", icon: Smartphone },
      { label: "Резултат", value: "Онлайн продажби и по-силна аудитория", icon: TrendingUp },
    ],
    primaryCta: {
      href: restyledSocial.website,
      label: "Виж онлайн магазина",
      ctaId: "home_social_proof_restyled_store",
    },
  },
  "online-store": {
    title: (
      <>
        Restyled: от <span className="gradient-text">поръчки в съобщения</span> до подреден онлайн
        магазин
      </>
    ),
    eyebrow: "Казус · Fashion · Онлайн магазин",
    description: (
      <>
        <strong className="text-foreground">Преди:</strong> Restyled продаваше основно през директни
        разговори. Всеки продукт изискваше уточняване на размер, цена, адрес, куриер и ръчно следене
        на поръчката.
        <div className="mt-2" />
        <strong className="text-foreground">След:</strong> Онлайн магазин с каталог, брандирано
        преживяване и ясен път до поръчка. Клиентът избира артикул, попълва адрес и изпраща
        заявката без да чака разговор.
      </>
    ),
    highlights: [
      { label: "Каталог", value: "10 000+ артикула, подредени в собствен магазин", icon: ShoppingBag },
      { label: "Поръчка", value: "от чат към ясен път за покупка", icon: MessageCircle },
      { label: "Бранд", value: "от ръчни уточнения към собствено преживяване", icon: Smartphone },
    ],
    primaryCta: {
      href: restyledSocial.website,
      label: "Виж онлайн магазина",
      ctaId: "service_online_store_social_proof_restyled_store",
    },
  },
  "social-media": {
    title: (
      <>
        Restyled: от <span className="gradient-text">поръчки в съобщения</span> до подреден онлайн
        магазин
      </>
    ),
    eyebrow: "Казус · Социални мрежи · Fashion",
    description: (
      <>
        <strong className="text-foreground">Преди:</strong> Продуктите се продаваха, но брандът
        оставаше заключен в OLX — до десетки други обяви със същия формат и без собствена визия.
        <div className="mt-2" />
        <strong className="text-foreground">След:</strong> Подредено присъствие в социалните мрежи,
        съдържание в синхрон с магазина и по-ясна причина клиентът да запомни Restyled, а не само
        отделна OLX обява.
      </>
    ),
    highlights: [
      { label: "Ниша", value: "Fashion", icon: Shirt },
      { label: "Фокус", value: "Instagram, Facebook & OLX", icon: Share2 },
      { label: "Резултат", value: "По-силна аудитория · по-малко хаос в DM", icon: TrendingUp },
      {
        label: "Подход",
        value: "Съдържание + преход от OLX към разпознаваем бранд",
        icon: MessageCircle,
      },
    ],
    primaryCta: {
      href: restyledSocial.instagram,
      label: "Виж профила в Instagram",
      ctaId: "service_social_media_social_proof_restyled_instagram",
    },
  },
  "google-business": {
    title: (
      <>
        Restyled: продаваха в лични съобщения —{" "}
        <span className="gradient-text">но Google не убеждаваше клиентите им</span>
      </>
    ),
    eyebrow: "Казус · Google Business · Fashion",
    description: (
      <>
        <strong className="text-foreground">Преди:</strong> Когато клиент излезе извън OLX и потърси
        Restyled, нямаше достатъчно силна следа, която да потвърди бранда и да събере всичко на едно
        място.
        <div className="mt-2" />
        <strong className="text-foreground">След:</strong> Оптимизиран Google Business профил, връзка
        към магазина и социалните канали — по-кратък път от търсене до доверие и поръчка.
      </>
    ),
    highlights: [
      { label: "Ниша", value: "Fashion", icon: Shirt },
      { label: "Фокус", value: "Google + социални", icon: MapPin },
      { label: "Резултат", value: "Повече доверие преди поръчка", icon: TrendingUp },
      {
        label: "Подход",
        value: "Локално присъствие + линк към магазин",
        icon: Share2,
      },
    ],
    primaryCta: {
      href: restyledSocial.website,
      label: "Виж онлайн магазина",
      ctaId: "service_google_business_social_proof_restyled_store",
    },
  },
  ads: {
    title: (
      <>
        Restyled: имаха продукт и аудитория —{" "}
        <span className="gradient-text">рекламите не носеха система</span>
      </>
    ),
    eyebrow: "Казус · Реклами · Fashion",
    description: (
      <>
        <strong className="text-foreground">Преди:</strong> В OLX можеш да промотираш основно вътре
        в самия OLX. Това ограничава скалирането — няма собствена фуния, няма брандирана страница и
        няма удобен checkout, към който да водиш трафик.
        <div className="mt-2" />
        <strong className="text-foreground">След:</strong> Ясна връзка съдържание → магазин →
        реклама с проследяване. Рекламата вече води към собствена среда, където клиентът може да
        купи, а не само да изпрати съобщение.
      </>
    ),
    highlights: [
      { label: "Ниша", value: "Fashion", icon: Shirt },
      { label: "Фокус", value: "Meta Ads + магазин", icon: Share2 },
      { label: "Резултат", value: "По-ясно кои реклами носят поръчки", icon: TrendingUp },
      {
        label: "Подход",
        value: "От OLX промотиране към трафик към собствен магазин",
        icon: MessageCircle,
      },
    ],
    primaryCta: {
      href: restyledSocial.instagram,
      label: "Виж профила в Instagram",
      ctaId: "service_ads_social_proof_restyled_instagram",
    },
  },
};

interface SocialProofSectionProps {
  type?: SocialProofSectionType;
  headingFontClass?: string;
  className?: string;
}

export function SocialProofSection({
  type = "home",
  headingFontClass,
  className,
}: SocialProofSectionProps) {
  const content = CONTENT[type];
  const isHome = type === "home";

  const containerRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const ctx = gsap.context(() => {
      gsap.set([titleRef.current, cardRef.current], { opacity: 0, y: 40 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
          toggleActions: "play none none none",
        },
        defaults: { ease: "back.out(1.6)" },
      });

      tl.to(titleRef.current, { opacity: 1, y: 0, duration: 0.55 }, 0).to(
        cardRef.current,
        { opacity: 1, y: 0, duration: 0.6 },
        "-=0.25",
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      id={isHome ? "social-proof" : "case-study"}
      className={cn(
        isHome
          ? "flex min-h-screen w-full flex-col justify-center py-16 md:py-20 lg:py-24"
          : "py-8 md:py-20 border-y border-border/70 bg-card/30",
        className,
      )}
    >
      <div
        className={cn(
          isHome ? "w-full px-4 sm:px-6 lg:px-10 xl:px-16" : "container mx-auto px-4",
        )}
      >
        <h2
          ref={titleRef}
          className={cn(
            "text-center font-bold mb-12 md:mb-14 text-balance opacity-0 translate-y-10",
            isHome
              ? "text-3xl sm:text-4xl md:text-5xl lg:text-6xl"
              : "text-3xl sm:text-4xl md:text-5xl",
            headingFontClass,
          )}
        >
          {content.title}
        </h2>

        <div ref={cardRef} className="w-full opacity-0 translate-y-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 lg:items-center">
            <div
              className={cn(
                "relative aspect-4/3 overflow-hidden rounded-lg",
                isHome
                  ? "lg:sticky lg:top-24 lg:z-10 lg:flex lg:aspect-auto lg:min-h-[480px] lg:w-full lg:items-center lg:justify-center xl:min-h-[560px]"
                  : "lg:aspect-auto lg:min-h-[360px]",
              )}
            >
              <Image
                src="/what-we-offer/restyled-mock-up.png"
                alt="Restyled - mock-up на онлайн магазин"
                fill
                className={cn(
                  "object-contain",
                  isHome ? "p-4 sm:p-6 lg:p-2 xl:p-0" : "p-2 sm:p-4",
                )}
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>

            <div className="flex flex-col gap-6 p-6 sm:p-8 lg:p-10">
              <div>
                <p className="text-xs lg:text-sm font-semibold uppercase tracking-wider text-primary mb-2">
                  {content.eyebrow}
                </p>
                <h3
                  className={cn(
                    "text-2xl sm:text-3xl lg:text-4xl font-bold mb-4",
                    headingFontClass,
                  )}
                >
                  Restyled
                </h3>
                <p className="text-muted-foreground leading-relaxed lg:text-lg">
                  {content.description}
                </p>
              </div>

              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4" role="list">
                {content.highlights.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li
                      key={item.label}
                      className={cn(
                        "group flex flex-col items-start gap-3 rounded-xl border border-border/80 bg-muted/15 p-4",
                        "transition-[border-color,box-shadow,background-color] duration-200",
                        "hover:border-primary/20 hover:bg-muted/25 hover:shadow-sm",
                      )}
                    >
                      <div
                        className={cn(
                          "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                          "bg-primary/10 text-primary ring-1 ring-inset ring-primary/10",
                          "transition-[background-color,color,transform] duration-200",
                          "group-hover:bg-primary/15 group-hover:ring-primary/20",
                          "motion-safe:group-hover:scale-[1.02]",
                        )}
                        aria-hidden
                      >
                        <Icon className="h-4 w-4" strokeWidth={2} />
                      </div>
                      <div className="min-w-0 w-full space-y-1">
                        <p className="text-[11px] lg:text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          {item.label}
                        </p>
                        <p className="text-sm lg:text-base font-semibold leading-snug text-foreground text-pretty">
                          {item.value}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2 border-t border-border/60">
                <TrackedCtaLink
                  href={content.primaryCta.href}
                  ctaId={content.primaryCta.ctaId}
                  className="inline-flex items-center gap-2 text-primary font-medium lg:text-lg group"
                  _blank={true}
                >
                  {content.primaryCta.label}
                  <ArrowUpRight className="h-4 w-4 lg:h-5 lg:w-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </TrackedCtaLink>

                <div className="flex items-center gap-3">
                  <Link
                    href={restyledSocial.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "inline-flex h-10 w-10 items-center justify-center rounded-full",
                      "border border-border text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors",
                    )}
                    aria-label="Restyled във Facebook"
                  >
                    <Facebook className="h-4 w-4" />
                  </Link>
                  <Link
                    href={restyledSocial.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "inline-flex h-10 w-10 items-center justify-center rounded-full",
                      "border border-border text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors",
                    )}
                    aria-label="Restyled в Instagram"
                  >
                    <Instagram className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
