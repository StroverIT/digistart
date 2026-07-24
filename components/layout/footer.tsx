"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { TrackedCtaLink } from "@/components/analytics/tracked-cta-link";
import Image from "next/image";
import {
  ArrowRight,
  Mail,
  MapPin,
  Phone,
  Facebook,
  Instagram,
  Linkedin,
} from "lucide-react";
import { siteContact } from "@/lib/site-contact";
import {
  SITE_LOGO_HEIGHT,
  SITE_LOGO_SIZES,
  SITE_LOGO_SRC,
  SITE_LOGO_WIDTH,
} from "@/lib/site-brand";
import { isServiceFunnelPath } from "@/lib/service-funnels/path";
import { cn } from "@/lib/utils";

const services = [
  { href: "/services/online-store", label: "Онлайн магазин" },
  { href: "/services/google-business", label: "Google Business" },
  { href: "/services/social-media", label: "Социални мрежи" },
  { href: "/services/ads", label: "Реклами" },
];

const quickLinks = [
  { href: "/", label: "Начало" },
  { href: "/business-consultation", label: "Безплатна консултация" },
  { href: "/#paths", label: "Как работим" },
  { href: "/about", label: "За нас" },
  { href: "/templates", label: "Шаблони" },
  { href: "/blog", label: "Блог" },
];

const legalLinks = [
  { href: "/privacy-policy", label: "Поверителност", ctaId: "footer_privacy_policy" },
  { href: "/terms-and-conditions", label: "Условия", ctaId: "footer_terms_conditions" },
  { href: "/cookies-policy", label: "Бисквитки", ctaId: "footer_cookies_policy" },
] as const;

const socialLinks = [
  { href: siteContact.facebook, label: "Facebook", icon: Facebook },
  { href: siteContact.instagram, label: "Instagram", icon: Instagram },
  { href: siteContact.linkedin, label: "LinkedIn", icon: Linkedin },
] as const;

function FooterColumnHeading({ children }: { children: string }) {
  return (
    <h3 className="mb-4 font-heading text-xs font-bold uppercase tracking-[0.2em] text-accent">
      {children}
    </h3>
  );
}

function FooterNavLink({
  href,
  ctaId,
  children,
}: {
  href: string;
  ctaId: string;
  children: string;
}) {
  return (
    <TrackedCtaLink
      href={href}
      ctaId={ctaId}
      className="group inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      <span className="relative">
        {children}
        <span className="absolute -bottom-px left-0 h-px w-0 bg-primary transition-all duration-300 group-hover:w-full" />
      </span>
      <ArrowRight className="h-3.5 w-3.5 shrink-0 opacity-0 -translate-x-1 transition-all duration-300 group-hover:opacity-60 group-hover:translate-x-0" />
    </TrackedCtaLink>
  );
}

export function Footer() {
  const pathname = usePathname();
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (isServiceFunnelPath(pathname)) return;

    const root = footerRef.current;
    if (!root) return;

    let cancelled = false;
    let revert: (() => void) | undefined;

    void (async () => {
      const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);

      if (cancelled || !footerRef.current) return;

      gsap.registerPlugin(ScrollTrigger);

      const ctx = gsap.context(() => {
        const cols = root.querySelectorAll<HTMLElement>("[data-footer-column]");
        if (!cols.length) return;

        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (reducedMotion) {
          gsap.set(cols, { opacity: 1, y: 0 });
          return;
        }

        gsap.set(cols, { opacity: 0, y: 32 });
        gsap.to(cols, {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.08,
          ease: "power3.out",
          scrollTrigger: {
            trigger: root,
            start: "top 92%",
            toggleActions: "play none none none",
          },
        });
      }, root);

      revert = () => ctx.revert();
    })();

    return () => {
      cancelled = true;
      revert?.();
    };
  }, [pathname]);

  if (isServiceFunnelPath(pathname)) {
    return null;
  }

  return (
    <footer ref={footerRef} className="relative border-t border-border/80">
      {/* Main footer */}
      <div className="relative overflow-hidden bg-card">
        <div
          className="pointer-events-none absolute inset-0 -z-0 opacity-60"
          style={{ background: "var(--gradient-soft)" }}
        />
        <div className="pointer-events-none absolute -right-24 top-0 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />

        <div className="container relative mx-auto px-4 py-10 md:px-8 md:py-14">
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-12 lg:gap-x-8">
            {/* Brand */}
            <div
              data-footer-column
              className="col-span-2 opacity-0 translate-y-8 lg:col-span-4"
            >
              <TrackedCtaLink
                href="/"
                ctaId="footer_logo_home"
                className="group mb-4 inline-flex items-center gap-2.5"
              >
                <Image
                  src={SITE_LOGO_SRC}
                  alt="DigiStart logo"
                  width={SITE_LOGO_WIDTH}
                  height={SITE_LOGO_HEIGHT}
                  sizes={SITE_LOGO_SIZES}
                  className="h-8 w-auto transition-transform group-hover:scale-105"
                />
                <span className="flex flex-col leading-tight">
                  <span className="text-xl font-bold tracking-tight">
                    <span className="text-accent">Digi</span>
                    <span className="text-accent">Start</span>
                  </span>
                  <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                    Easy Start
                  </span>
                </span>
              </TrackedCtaLink>

              <p className="mb-6 max-w-sm text-sm leading-relaxed text-muted-foreground">
                Помагаме на малки бизнеси и странични проекти да стартират онлайн бързо,
                ясно и без излишен риск.
              </p>

              <div className="flex items-center gap-2.5">
                {socialLinks.map(({ href, label, icon: Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/80 text-muted-foreground",
                      "transition-all duration-200 hover:border-primary/30 hover:bg-primary/10 hover:text-accent hover:shadow-[0_0_20px_-6px] hover:shadow-primary/40"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Services */}
            <div data-footer-column className="opacity-0 translate-y-8 lg:col-span-2">
              <FooterColumnHeading>Услуги</FooterColumnHeading>
              <ul className="space-y-2.5">
                {services.map((service) => (
                  <li key={service.href}>
                    <FooterNavLink
                      href={service.href}
                      ctaId={`footer_service_${service.href.replaceAll("/", "_")}`}
                    >
                      {service.label}
                    </FooterNavLink>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick Links */}
            <div data-footer-column className="opacity-0 translate-y-8 lg:col-span-3">
              <FooterColumnHeading>Бързи връзки</FooterColumnHeading>
              <ul className="space-y-2.5">
                {quickLinks.map((link) => (
                  <li key={link.label}>
                    <FooterNavLink
                      href={link.href}
                      ctaId={`footer_quick_${link.href.replaceAll("/", "_").replaceAll("#", "")}`}
                    >
                      {link.label}
                    </FooterNavLink>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div data-footer-column className="col-span-2 opacity-0 translate-y-8 lg:col-span-3">
              <FooterColumnHeading>Контакти</FooterColumnHeading>
              <ul className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-1">
                <li>
                  <div className="flex items-start gap-3 rounded-xl border border-border/80 bg-background/70 p-3.5">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-accent">
                      <MapPin className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 pt-0.5">
                      <span className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Адрес
                      </span>
                      <span className="mt-0.5 block text-sm leading-relaxed text-foreground">
                        {siteContact.addressLines.map((line) => (
                          <span key={line} className="block">
                            {line}
                          </span>
                        ))}
                      </span>
                    </span>
                  </div>
                </li>
                <li>
                  <a
                    href={`mailto:${siteContact.email}`}
                    className="group flex items-start gap-3 rounded-xl border border-border/80 bg-background/70 p-3.5 transition-colors hover:border-primary/25 hover:bg-background"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-accent">
                      <Mail className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 pt-0.5">
                      <span className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Имейл
                      </span>
                      <span className="mt-0.5 block truncate text-sm text-foreground transition-colors group-hover:text-accent">
                        {siteContact.email}
                      </span>
                    </span>
                  </a>
                </li>
                <li>
                  <a
                    href={siteContact.phoneHref}
                    className="group flex items-start gap-3 rounded-xl border border-border/80 bg-background/70 p-3.5 transition-colors hover:border-primary/25 hover:bg-background"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-accent">
                      <Phone className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 pt-0.5">
                      <span className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Телефон
                      </span>
                      <span className="mt-0.5 block text-sm text-foreground transition-colors group-hover:text-accent">
                        {siteContact.phoneLabel}
                      </span>
                    </span>
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div
            data-footer-column
            className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border/80 pt-6 opacity-0 translate-y-8 md:flex-row md:pt-8"
          >
            <p className="text-center text-sm text-muted-foreground md:text-left">
              &copy; {new Date().getFullYear()} DigiStart. Всички права запазени.
            </p>
            <nav
              aria-label="Правни документи"
              className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2"
            >
              {legalLinks.map((link) => (
                <TrackedCtaLink
                  key={link.href}
                  href={link.href}
                  ctaId={link.ctaId}
                  className="text-sm text-muted-foreground transition-colors hover:text-accent"
                >
                  {link.label}
                </TrackedCtaLink>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}
