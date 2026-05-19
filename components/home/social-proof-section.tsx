"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  Facebook,
  Instagram,
  Paintbrush,
  Shirt,
  Smartphone,
  TrendingUp,
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

const highlights = [
  { label: "Ниша", value: "Fashion", icon: Shirt },
  { label: "Фокус", value: "Mobile-first", icon: Smartphone },
  { label: "Резултат", value: "Онлайн продажби и по-силна аудитория", icon: TrendingUp },
  { label: "Уникален дизайн", value: "Дизайнът е направен от екипа ни, а не е темлейт", icon: Paintbrush },
] as const;

export function SocialProofSection() {
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
      id="social-proof"
      className="flex min-h-screen w-full flex-col justify-center py-16 md:py-20 lg:py-24"
    >
      <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-16">
        <h2
          ref={titleRef}
          className="text-center text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-12 md:mb-14 text-balance opacity-0 translate-y-10"
        >
          Бизнеси, които вече <span className="gradient-text">растат с нас</span>
        </h2>

        <div ref={cardRef} className="w-full opacity-0 translate-y-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 lg:items-center">
            <div className="relative aspect-4/3 lg:sticky lg:top-24 lg:z-10 lg:flex lg:aspect-auto lg:min-h-[480px] lg:w-full lg:items-center lg:justify-center xl:min-h-[560px]">
              <Image
                src="/what-we-offer/restyled-mock-up.png"
                alt="Restyled - mock-up на онлайн магазин"
                fill
                className="object-contain p-4 sm:p-6 lg:p-2 xl:p-0"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>

            <div className="flex flex-col gap-6 p-6 sm:p-8 lg:p-10">
              <div>
                <p className="text-xs lg:text-sm font-semibold uppercase tracking-wider text-primary mb-2">
                  Онлайн магазин · Fashion
                </p>
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">Restyled</h3>
                <p className="text-muted-foreground leading-relaxed lg:text-lg">
                  Restyled е моден бранд, който продаваше основно на живо и в съобщения. С готов онлайн
                  магазин (mobile-first) преминаха към поръчки 24/7 - без да изглеждат „любителски“

                  онлайн.
                  <div className="mt-2" />
                  Днес клиентите разглеждат колекциите сами, поръчват с няколко клика и брандът
                  расте с по-организирано присъствие в социалните мрежи, вместо да губи часове в
                  отговори на едни и същи въпроси.
                </p>
              </div>

              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4" role="list">
                {highlights.map((item) => {
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
                  href={restyledSocial.website}
                  ctaId="home_social_proof_restyled_store"
                  className="inline-flex items-center gap-2 text-primary font-medium lg:text-lg group"
                  _blank={true}
                >
                  Виж онлайн магазина
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
