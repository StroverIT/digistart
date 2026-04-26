import Link from "next/link";
import { Zap, Mail, Phone, MapPin, Facebook, Instagram, Linkedin } from "lucide-react";
import { siteContact } from "@/lib/site-contact";

const services = [
  { href: "/услуги/websites", label: "Уеб сайтове" },
  { href: "/услуги/онлайн-магазини", label: "Онлайн магазини" },
  { href: "/услуги/google-business", label: "Google Business" },
  { href: "/услуги/социални-мрежи", label: "Социални мрежи" },
];

const quickLinks = [
  { href: "/", label: "Начало" },
  { href: "/#услуги", label: "Услуги" },
  { href: "/#процес", label: "Как работим" },
  { href: "/#контакти", label: "Контакти" },
];

export function Footer() {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Zap className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">
                Digi<span className="text-primary">Start</span>
              </span>
            </Link>
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
                  <Link
                    href={service.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {service.label}
                  </Link>
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
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
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
            <Link
              href="/поверителност"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Поверителност
            </Link>
            <Link
              href="/условия"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Условия за ползване
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
