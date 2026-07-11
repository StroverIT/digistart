"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

type CaseStudyProps = {
  className?: string;
};

export function CaseStudy({ className }: CaseStudyProps) {
  return (
    <section
      id="results"
      className={cn("container mx-auto px-4 py-20 md:px-8 md:py-28", className)}
    >
      <div className="mx-auto max-w-2xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-card px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-accent">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          Доказани резултати
        </span>
        <h2 className="mt-5 font-heading text-3xl font-bold tracking-tight text-foreground md:text-5xl">
          Успешният пример: Restyled
        </h2>
        <p className="mt-4 text-base text-muted-foreground md:text-lg">
          От хаос в чата до автоматизирана машина за поръчки.
        </p>
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-[1fr_1.1fr] lg:items-stretch">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <div className="rounded-3xl border border-destructive/20 bg-card p-7">
            <div className="text-xs font-bold uppercase tracking-widest text-destructive lg:text-sm">
              Преди
            </div>
            <ul className="mt-4 space-y-3 text-sm text-black lg:text-base lg:leading-relaxed">
              <li>• Хаос в чата, ръчна комуникация за всеки размер и адрес.</li>
              <li>• Трудно управление на 500+ продукта.</li>
              <li>• Собственикът – единствената движеща сила на бизенса.</li>
            </ul>
          </div>
          <div className="rounded-3xl border border-primary/30 bg-card p-7">
            <div className="inline-flex rounded-full bg-primary px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary-foreground lg:text-sm">
              След DigiStart
            </div>
            <ul className="mt-4 space-y-3 text-sm text-black lg:text-base lg:leading-relaxed">
              <li>• ~90 автоматизирани поръчки на месец.</li>
              <li>• Каталог с 10 000+ продукта.</li>
              <li>• Поддържаме социалните мрежи и рекламата – отговаряме вместо него.</li>
              <li>• Остава само качване на нови артикули и пакетиране.</li>
            </ul>
          </div>
        </div>

        <div className="relative aspect-[4/3] w-full">
          <Image
            src="/restyled-mockup.webp"
            alt="Restyled онлайн магазин"
            fill
            className="object-contain"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>
      </div>
    </section>
  );
}
