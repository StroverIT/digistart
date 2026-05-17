"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Facebook, Instagram, Smartphone, TrendingUp } from "lucide-react";
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
  { label: "Ниша", value: "Fashion" },
  { label: "Фокус", value: "Mobile-first", icon: Smartphone },
  { label: "Резултат", value: "Онлайн продажби и по-силна аудитория", icon: TrendingUp },
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
    <section ref={containerRef} id="social-proof" className="py-20 md:py-28 bg-card/30">
      <div className="container mx-auto px-4">
        <h2
          ref={titleRef}
          className="text-center text-3xl sm:text-4xl md:text-5xl font-bold mb-12 md:mb-14 text-balance opacity-0 translate-y-10"
        >
          Бизнеси, които вече <span className="gradient-text">растат с нас</span>
        </h2>

        <div
          ref={cardRef}
          className="mx-auto max-w-5xl overflow-hidden rounded-2xl border border-border bg-card shadow-sm opacity-0 translate-y-10"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="relative aspect-4/3 bg-muted/30 lg:aspect-auto lg:min-h-[320px]">
              <Image
                src="/what-we-offer/restyled-mock-up.png"
                alt="Restyled - mock-up на онлайн магазин"
                fill
                className="object-contain p-4 sm:p-6"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>

            <div className="flex flex-col gap-6 p-6 sm:p-8 lg:p-10">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">
                  Онлайн магазин · Fashion
                </p>
                <h3 className="text-2xl sm:text-3xl font-bold mb-4">Restyled</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Restyled е моден бранд, който продаваше основно на живо и в съобщения. С готов онлайн
                  магазин (mobile-first) преминаха към поръчки 24/7 - без да изглеждат „любителски“
                  онлайн. Днес клиентите разглеждат колекциите сами, поръчват с няколко клика и брандът
                  расте с по-организирано присъствие в социалните мрежи, вместо да губи часове в
                  отговори на едни и същи въпроси.
                </p>
              </div>

              <ul className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {highlights.map((item) => (
                  <li
                    key={item.label}
                    className="rounded-xl border border-border/80 bg-muted/20 px-4 py-3"
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                      {item.label}
                    </p>
                    <p className="text-sm font-semibold leading-snug flex items-start gap-2">
                      {"icon" in item && item.icon ? (
                        <item.icon className="h-4 w-4 shrink-0 text-primary mt-0.5" aria-hidden />
                      ) : null}
                      <span>{item.value}</span>
                    </p>
                  </li>
                ))}
              </ul>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2 border-t border-border/60">
                <TrackedCtaLink
                  href={restyledSocial.website}
                  ctaId="home_social_proof_restyled_store"
                  className="inline-flex items-center gap-2 text-primary font-medium group"
                >
                  Виж онлайн магазина
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
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
