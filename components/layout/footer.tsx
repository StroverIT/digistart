"use client";

import { useEffect, useRef, useState } from "react";
import { TrackedCtaLink } from "@/components/analytics/tracked-cta-link";
import Image from "next/image";
import { Mail, Phone, MapPin, Facebook, Instagram, Linkedin } from "lucide-react";
import { siteContact } from "@/lib/site-contact";
import { getHomeNavigationPath } from "@/lib/visitor-preferences/navigation";

const services = [
  { href: "/services/ai-automation", label: "AI Automation" },
  { href: "/services/online-store", label: "Онлайн магазин" },
  { href: "/services/google-business", label: "Google Business" },
  { href: "/services/social-media", label: "Социални мрежи" },
  { href: "/services/ads", label: "Реклами" },
];

const quickLinks = [
  { href: "home", label: "Начало" },
  { href: "/consultation", label: "Безплатна консултация" },
  { href: "/#services", label: "Услуги" },
  { href: "/#process", label: "Как работим" },
  { href: "/#contacts", label: "Контакти" },
];

export function Footer() {
  const footerRef = useRef<HTMLElement>(null);
  const [homeHref, setHomeHref] = useState("/");

  useEffect(() => {
    const syncHomeHref = () => setHomeHref(getHomeNavigationPath());
    syncHomeHref();
    window.addEventListener("visitor-preferences-updated", syncHomeHref);
    window.addEventListener("storage", syncHomeHref);
    return () => {
      window.removeEventListener("visitor-preferences-updated", syncHomeHref);
      window.removeEventListener("storage", syncHomeHref);
    };
  }, []);

  useEffect(() => {
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
        gsap.set(cols, { opacity: 0, y: 40 });
        gsap.to(cols, {
          opacity: 1,
          y: 0,
          duration: 0.55,
          stagger: 0.12,
          ease: "back.out(1.4)",
          scrollTrigger: {
            trigger: root,
            start: "top 90%",
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
  }, []);

  return (
    <footer ref={footerRef} className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div data-footer-column className="lg:col-span-1 opacity-0 translate-y-10">
            <TrackedCtaLink href={homeHref} ctaId="footer_logo_home" className="flex items-center gap-2 mb-4">
              <Image
                src="/logo.webp"
                alt="DigiStart logo"
                width={58}
                height={64}
                sizes="29px"
                className="h-8 w-auto"
              />
              <span className="text-xl font-bold">
                Digi<span className="text-primary">Start</span>
              </span>
            </TrackedCtaLink>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              Помагаме на малки бизнеси и странични проекти да стартират онлайн бързо, ясно и без
              излишен риск.
            </p>
            <div className="flex items-center gap-3">
              <a
                href={siteContact.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href={siteContact.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href={siteContact.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Services */}
          <div data-footer-column className="opacity-0 translate-y-10">
            <h3 className="font-semibold text-foreground mb-4">Услуги</h3>
            <ul className="space-y-3">
              {services.map((service) => (
                <li key={service.href}>
                  <TrackedCtaLink
                    href={service.href}
                    ctaId={`footer_service_${service.href.replaceAll("/", "_")}`}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {service.label}
                  </TrackedCtaLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div data-footer-column className="opacity-0 translate-y-10">
            <h3 className="font-semibold text-foreground mb-4">Бързи връзки</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => {
                const href = link.href === "home" ? homeHref : link.href;
                return (
                <li key={link.label}>
                  <TrackedCtaLink
                    href={href}
                    ctaId={`footer_quick_${href.replaceAll("/", "_").replaceAll("#", "")}`}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </TrackedCtaLink>
                </li>
              );
              })}
            </ul>
          </div>

          {/* Contact */}
          <div data-footer-column className="opacity-0 translate-y-10">
            <h3 className="font-semibold text-foreground mb-4">Контакти</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <a
                  href={`mailto:${siteContact.email}`}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {siteContact.email}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <a
                  href={siteContact.phoneHref}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {siteContact.phoneLabel}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm text-muted-foreground">София, България</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          data-footer-column
          className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4 opacity-0 translate-y-10"
        >
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} DigiStart. Всички права запазени.
          </p>
          <div className="flex items-center gap-6">
            <TrackedCtaLink
              href="/privacy-policy"
              ctaId="footer_privacy_policy"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Поверителност
            </TrackedCtaLink>
            <TrackedCtaLink
              href="/terms-and-conditions"
              ctaId="footer_terms_conditions"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Условия за ползване
            </TrackedCtaLink>
            <TrackedCtaLink
              href="/cookies-policy"
              ctaId="footer_cookies_policy"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Бисквитки
            </TrackedCtaLink>
          </div>
        </div>
      </div>
    </footer>
  );
}
