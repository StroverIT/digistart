import { TrackedCtaLink } from "@/components/analytics/tracked-cta-link";
import Image from "next/image";
import { Mail, Phone, MapPin, Facebook, Instagram, Linkedin } from "lucide-react";
import { siteContact } from "@/lib/site-contact";

const services = [
  { href: "/services/website", label: "Уеб сайтове" },
  { href: "/services/online-store", label: "Онлайн магазин" },
  { href: "/services/google-business", label: "Google Business" },
  { href: "/services/social-media", label: "Социални мрежи" },
];

const quickLinks = [
  { href: "/", label: "Начало" },
  { href: "/consultation", label: "Безплатна консултация" },
  { href: "/#services", label: "Услуги" },
  { href: "/#process", label: "Как работим" },
  { href: "/#contacts", label: "Контакти" },
];

export function Footer() {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <TrackedCtaLink href="/" ctaId="footer_logo_home" className="flex items-center gap-2 mb-4">
              <Image
                src="/logo.png"
                alt="DigiStart logo"
                width={32}
                height={32}
                className="h-8 w-8"
              />
              <span className="text-xl font-bold">
                Digi<span className="text-primary">Start</span>
              </span>
            </TrackedCtaLink>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              Изграждаме дигиталното бъдеще на вашия бизнес. Професионални уеб решения, които работят за вас.
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
          <div>
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
          <div>
            <h3 className="font-semibold text-foreground mb-4">Бързи връзки</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <TrackedCtaLink
                    href={link.href}
                    ctaId={`footer_quick_${link.href.replaceAll("/", "_").replaceAll("#", "")}`}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </TrackedCtaLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
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
                <span className="text-sm text-muted-foreground">
                  София, България
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
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
