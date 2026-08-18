"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { TrackedCtaLink } from "@/components/analytics/tracked-cta-link";
import Image from "next/image";
import {
  ArrowRight,
  Clock,
  Facebook,
  Globe,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  type LucideIcon,
} from "lucide-react";
import { GoogleMapsEmbed } from "@/components/seo/google-maps-embed";
import { OPENING_HOURS_DAYS, getSofiaOpeningStatus, siteContact } from "@/lib/site-contact";
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
  { href: "/#services", label: "Услуги" },
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

function FooterColumnHeading({
  as: Tag = "h3",
  children,
}: {
  as?: "h2" | "h3";
  children: string;
}) {
  return (
    <Tag className="mb-3 font-heading text-xs font-bold uppercase tracking-[0.2em] text-accent">
      {children}
    </Tag>
  );
}

function FooterContactRow({
  icon: Icon,
  label,
  href,
  external,
  children,
}: {
  icon: LucideIcon;
  label: string;
  href?: string;
  external?: boolean;
  children: ReactNode;
}) {
  const content = (
    <>
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border/80 bg-background/70 text-accent">
        <Icon className="h-3.5 w-3.5" />
      </span>
      <span className="min-w-0">
        <span className="sr-only">{label}</span>
        <span className="block text-sm leading-snug text-foreground">{children}</span>
      </span>
    </>
  );

  const className = cn(
    "flex items-center gap-2.5 rounded-lg py-0.5 transition-colors",
    href && "hover:text-accent",
  );

  if (!href) {
    return <div className={className}>{content}</div>;
  }

  return (
    <a
      href={href}
      className={className}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {content}
    </a>
  );
}

function OpeningHoursCard() {
  const [status, setStatus] = useState<{
    weekday: string;
    isOpen: boolean;
    nextHint: string;
  } | null>(null);

  useEffect(() => {
    const sync = () => setStatus(getSofiaOpeningStatus());
    sync();

    const intervalId = window.setInterval(sync, 60_000);
    return () => window.clearInterval(intervalId);
  }, []);

  const isOpen = status?.isOpen ?? false;

  return (
    <div className="space-y-2">
      <div className="flex items-start gap-2.5 py-0.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border/80 bg-background/70 text-accent">
          <Clock className="h-3.5 w-3.5" />
        </span>
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-sm leading-snug font-medium text-foreground">
            <span className="relative flex h-2 w-2">
              {isOpen ? (
                <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-60 motion-safe:animate-ping" />
              ) : null}
              <span
                className={cn(
                  "relative inline-flex h-2 w-2 rounded-full",
                  isOpen ? "bg-primary" : "bg-muted-foreground/70",
                )}
              />
            </span>
            {status
              ? isOpen
                ? "Офисът е отворен"
                : "Офисът е затворен"
              : siteContact.openingHours.label}
          </p>
          <p className="text-xs leading-snug text-muted-foreground">
            {siteContact.openingHours.note}
            {status && !status.isOpen ? ` · ${status.nextHint}` : null}
          </p>
          <ul className="sr-only">
            {OPENING_HOURS_DAYS.map((day) => (
              <li key={day.dayOfWeek}>
                {day.label}:{" "}
                <time dateTime={siteContact.openingHours.opens}>
                  {siteContact.openingHours.opens}
                </time>
                {" – "}
                <time dateTime={siteContact.openingHours.closes}>
                  {siteContact.openingHours.closes}
                </time>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="flex items-start gap-2.5 py-0.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border/80 bg-background/70 text-accent">
          <Globe className="h-3.5 w-3.5" />
        </span>
        <div className="min-w-0">
          <p className="text-sm leading-snug font-medium text-foreground">
            {siteContact.onlineOperatingHours.label}
          </p>
          <p className="text-xs leading-snug text-muted-foreground">
            {siteContact.onlineOperatingHours.note}
          </p>
        </div>
      </div>
    </div>
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

        <div className="container relative mx-auto px-4 py-8 md:px-8 md:py-10">
          <div className="grid grid-cols-2 items-start gap-x-6 gap-y-8 lg:grid-cols-12 lg:gap-x-8">
            {/* Brand */}
            <div
              data-footer-column
              className="col-span-2 opacity-0 translate-y-8 lg:col-span-3"
            >
              <TrackedCtaLink
                href="/"
                ctaId="footer_logo_home"
                className="group mb-3 inline-flex items-center gap-2.5"
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

              <p className="mb-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
                Рекламна агенция в София - онлайн магазини, Google Ads, Meta, SEO и
                Google Business за малки бизнеси, ясно и без излишен риск.
              </p>

              <div className="flex items-center gap-2">
                {socialLinks.map(({ href, label, icon: Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background/80 text-muted-foreground",
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
              <ul className="space-y-2">
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
            <div data-footer-column className="opacity-0 translate-y-8 lg:col-span-2">
              <FooterColumnHeading>Бързи връзки</FooterColumnHeading>
              <ul className="space-y-2">
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

            {/* Contacts + map (single NAP block) */}
            <div
              id="location"
              data-footer-column
              className="col-span-2 opacity-0 translate-y-8 lg:col-span-5"
            >
              <FooterColumnHeading as="h2">Рекламна агенция в София</FooterColumnHeading>

              <div className="grid gap-4 sm:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] sm:items-stretch">
                <div className="space-y-2.5">
                  <FooterContactRow
                    icon={MapPin}
                    label="Адрес"
                    href={siteContact.googleMapsUrl}
                    external
                  >
                    {siteContact.addressSingleLine}
                  </FooterContactRow>
                  <FooterContactRow
                    icon={Phone}
                    label="Телефон"
                    href={siteContact.phoneHref}
                  >
                    {siteContact.phoneLabel}
                  </FooterContactRow>
                  <FooterContactRow
                    icon={Mail}
                    label="Имейл"
                    href={`mailto:${siteContact.email}`}
                  >
                    {siteContact.email}
                  </FooterContactRow>
                  <div className="border-t border-border/70 pt-2.5">
                    <OpeningHoursCard />
                  </div>
                </div>
                <GoogleMapsEmbed compact fill hideCaption className="min-h-44" />
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div
            data-footer-column
            className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-border/80 pt-5 opacity-0 translate-y-8 md:flex-row"
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
