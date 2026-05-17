import Image from "next/image";
import { Check } from "lucide-react";
import {
  COMING_SOON_MAX_SPOTS,
  getComingSoonSpotsRemaining,
} from "@/lib/server/newsletter";
import { NewsletterSignupForm } from "@/components/newsletter/newsletter-signup-form";
import TransitionLink from "@/components/transitions/TransitionLink";

const offerBullets = [
  "Едно от 20-те места за ранен старт (преди да обявим публично).",
  "10% отстъпка за първия ти цялостен пакет при нас.",
  "Спокойствието, че най-после някой друг движи дигиталните неща вместо теб.",
] as const;

export async function ComingSoonPage() {
  const spotsRemaining = await getComingSoonSpotsRemaining();

  return (
    <main className="relative min-h-dvh overflow-hidden bg-background text-foreground">
      <div className="absolute inset-0 bg-linear-to-br from-background via-background to-primary/5" />

      <div className="home-blobs" aria-hidden>
        <div className="home-blobs__blob home-blobs__blob--1" />
        <div className="home-blobs__blob home-blobs__blob--2" />
        <div className="home-blobs__blob home-blobs__blob--3" />
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
        <div className="mx-auto w-full max-w-4xl">
          <div className="text-center">
            <div className="mb-8 flex justify-center">
              <Image
                src="/logo.png"
                alt="DigiStart logo"
                width={40}
                height={40}
                className="h-10 w-10 transition-transform group-hover:scale-110"
                priority
              />
              <span className="text-3xl font-bold tracking-tight ml-2">
                Digi<span className="text-primary">Start</span>
              </span>
            </div>

            <h1 className="mb-6 text-balance text-4xl sm:text-5xl md:text-6xl lg:text-7xl sm:leading-17">
              За малки бизнеси, идеи и странични проекти
              <br />
              {spotsRemaining > 0 ? (
                <span className="gradient-text">
                  Остават само {spotsRemaining} места
                </span>
              ) : (
                <span className="gradient-text">Всички {COMING_SOON_MAX_SPOTS} места са заети</span>
              )}
            </h1>

            <p className="mx-auto mb-10 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground sm:text-xl">
              Забрави за дългите срещи, неразбираемите IT термини и координирането на 3 различни
              фирми. Ние настройваме онлайн магазин, Google профил и маркетинг, за да тестваш
              идеята си бързо и да приемаш поръчки без хаос.
            </p>
          </div>

          <div className="rounded-3xl border border-border bg-card/60 p-6 shadow-sm backdrop-blur sm:p-8">
            <h2 className="text-xl font-bold leading-snug sm:text-2xl">
              <span aria-hidden>🔥 </span>Защо стартираме само с 20 клиента?
            </h2>
            <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
              Защото не правим сайтове на конвейер. Искаме да работим лично с всеки от първите ни
              20 клиента, за да изградим правилния минимален старт според продукта, бюджета и
              реалните цели.
            </p>

            <p className="mt-6 font-semibold text-foreground">Запиши се в списъка на чакащите днес и си гарантирай:</p>
            <ul className="mt-4 space-y-3">
              {offerBullets.map((line) => (
                <li key={line} className="flex gap-3 text-muted-foreground">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                    <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden />
                  </span>
                  <span className="leading-relaxed">{line}</span>
                </li>
              ))}
            </ul>
          </div>

          <NewsletterSignupForm spotsRemaining={spotsRemaining} totalSpots={COMING_SOON_MAX_SPOTS} />
        </div>
      </section>
    </main>
  );
}
