"use client";

import { CheckCircle2 } from "lucide-react";

export function GoogleNewsletterThankYou() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col items-center text-center">
      <div className="relative mb-8 sm:mb-10">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-green-500/20 sm:h-28 sm:w-28">
          <CheckCircle2 className="h-12 w-12 text-green-500 sm:h-14 sm:w-14" aria-hidden />
        </div>
        <div className="absolute inset-0 mx-auto h-24 w-24 animate-ping rounded-full bg-green-500/10 sm:h-28 sm:w-28" />
      </div>

      <h1 className="font-heading mb-5 text-4xl font-bold leading-tight text-foreground sm:mb-6 sm:text-5xl md:text-6xl">
        Благодарим ви!
      </h1>

      <p className="mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl md:text-2xl">
        Успешно се записахте за нашия бюлетин. Проверете пощата си — очаквайте между 3 и 5 имейла
        всяка седмица с важна информация за SEO.
      </p>
    </div>
  );
}
