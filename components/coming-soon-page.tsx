import Image from "next/image";
import {
  ArrowRight,
  CheckCircle2,
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  Sparkles,
} from "lucide-react";
import { siteContact } from "@/lib/site-contact";
import { NewsletterSignupForm } from "@/components/newsletter/newsletter-signup-form";

const launchHighlights = [
  "Професионални уеб сайтове",
  "Онлайн магазини, готови за продажби",
  "Google Business и социални мрежи",
];

const socialLinks = [
  { href: siteContact.facebook, label: "Facebook", Icon: Facebook },
  { href: siteContact.instagram, label: "Instagram", Icon: Instagram },
  { href: siteContact.linkedin, label: "LinkedIn", Icon: Linkedin },
];

export function ComingSoonPage() {
  return (
    <main className="relative min-h-dvh overflow-hidden bg-background text-foreground">
      <div className="absolute inset-0 bg-linear-to-br from-background via-background to-primary/5" />

      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full bg-primary/15 blur-3xl sm:h-120 sm:w-120" />
        <div className="absolute -left-24 top-1/4 h-80 w-80 rounded-full bg-primary/10 blur-3xl animate-pulse" />
        <div className="absolute -right-24 bottom-1/4 h-96 w-96 rounded-full bg-[oklch(0.75_0.18_280/0.14)] blur-3xl animate-pulse delay-1000" />
      </div>

      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(oklch(0.13 0.005 260 / 0.16) 1px, transparent 1px), linear-gradient(90deg, oklch(0.13 0.005 260 / 0.16) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
        aria-hidden="true"
      />

      <section className="container relative z-10 mx-auto flex min-h-dvh items-center px-4 py-10 sm:py-14">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="text-center lg:text-left">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary shadow-sm">
              <Sparkles className="h-4 w-4" />
              Очаквайте скоро
            </div>

            <a href="/" className="mx-auto mb-8 flex w-fit items-center gap-3 rounded-2xl lg:mx-0">
              <Image
                src="/logo.png"
                alt="DigiStart logo"
                width={44}
                height={44}
                className="h-11 w-11"
                priority
              />
              <span className="text-2xl font-bold tracking-tight">
                Digi<span className="text-primary">Start</span>
              </span>
            </a>

            <h1 className="mx-auto mb-6 max-w-4xl text-balance text-4xl leading-tight sm:text-5xl md:text-6xl lg:mx-0 lg:text-7xl">
              Подготвяме <span className="gradient-text">дигитален старт</span>, който работи за вашия бизнес
            </h1>

            <p className="mx-auto mb-8 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground sm:text-xl lg:mx-0">
              Скоро стартираме с професионални уеб решения, онлайн магазини и маркетинг услуги,
              създадени да превръщат добрите идеи в реални резултати.
            </p>

            <div className="mb-5 flex flex-wrap items-center justify-center gap-4 sm:gap-6 lg:justify-start">
              {launchHighlights.map((highlight) => (
                <div key={highlight} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>{highlight}</span>
                </div>
              ))}
            </div>

            <div className="flex w-full flex-col items-center lg:items-start">
              <NewsletterSignupForm />
            </div>

            <div className="mt-8 flex flex-col items-center gap-3 lg:items-start">
              <p className="text-sm font-semibold text-muted-foreground">Последвайте ни</p>
              <div className="flex items-center gap-3">
                {socialLinks.map(({ href, label, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:bg-primary hover:text-primary-foreground hover:shadow-lg hover:shadow-primary/20"
                    aria-label={label}
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl">
            <div className="absolute -inset-6 rounded-4xl bg-primary/10 blur-3xl" aria-hidden="true" />
            <div className="relative overflow-hidden rounded-4xl border border-border bg-card/90 p-6 shadow-2xl shadow-primary/10 backdrop-blur md:p-8">
              <div className="mb-8 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-primary">DigiStart Launch</p>
                  <h2 className="mt-1 text-2xl">Създаваме нещо специално</h2>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Sparkles className="h-6 w-6" />
                </div>
              </div>

              <div className="space-y-4">
                {[
                  ["01", "Стратегия", "Изясняваме посоката и целите."],
                  ["02", "Дизайн", "Създаваме модерно и ясно преживяване."],
                  ["03", "Растеж", "Подготвяме основа за продажби и видимост."],
                ].map(([step, title, text]) => (
                  <div key={step} className="rounded-2xl border border-border bg-background/70 p-4">
                    <div className="flex items-start gap-4">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                        {step}
                      </span>
                      <div>
                        <h3 className="text-base">{title}</h3>
                        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{text}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 rounded-2xl bg-zinc-900 p-5 text-zinc-50">
                <p className="mb-3 text-sm font-semibold text-zinc-300">Искате да започнем преди официалния старт?</p>
                <a
                  href={`mailto:${siteContact.email}`}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
                >
                  <Mail className="h-4 w-4" />
                  {siteContact.email}
                </a>
                <div className="mt-5 flex items-center gap-3">
                  {socialLinks.map(({ href, label, Icon }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 text-zinc-300 transition-colors hover:bg-primary hover:text-primary-foreground"
                      aria-label={label}
                    >
                      <Icon className="h-5 w-5" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
