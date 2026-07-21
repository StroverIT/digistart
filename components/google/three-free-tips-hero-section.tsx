"use client";

import { useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import HeroVideo from "@/components/services/service-detail-ready-store-v2/HeroVideo";
import { LANDING_REVEAL_CLASS } from "@/components/services/service-detail-ready-store-v2/landing-animation-classes";
import { useSectionScrollAnimations } from "@/components/services/service-pas-landing/use-section-scroll-animations";
import { trackMetaLead } from "@/lib/analytics/meta-pixel";
import { cn } from "@/lib/utils";

export function ThreeFreeTipsHeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const pathname = usePathname();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  useSectionScrollAnimations(sectionRef, {
    staggerReveal: 0.12,
    animateOnMount: true,
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    const trimmed = email.trim();
    if (!trimmed) {
      toast.error("Моля, въведете имейл.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/newsletter/three-free-tips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        alreadySubscribed?: boolean;
        emailSent?: boolean;
        error?: string;
      };

      if (!res.ok) {
        toast.error(data.error ?? "Неуспешно записване.");
        return;
      }

      trackMetaLead({
        content_name: "DigiStart - 3 безплатни съвета (Google)",
        page_path: pathname && pathname.length > 0 ? pathname : "/google/three-free-tips",
        lead_source: "three_free_tips",
        user: { email: trimmed },
      });

      if (data.emailSent === false) {
        toast.success(
          "Записахте се успешно! Имейлът с клипа може да закъснее - проверете и папка Спам.",
        );
      } else {
        toast.success("Готово! Проверете пощата си за клипа с 3-те съвета.");
      }
      setEmail("");
    } catch {
      toast.error("Мрежова грешка. Опитайте отново.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section
      ref={sectionRef}
      className="mx-auto flex w-full max-w-[1200px] flex-col items-center gap-8 text-center md:flex-row md:items-center md:gap-10 md:text-left lg:gap-14"
    >
      <div className="flex w-full flex-col gap-4 md:w-1/2 md:gap-6">
        <h1
          data-animate-reveal
          className={cn(
            "font-heading text-balance text-3xl font-bold leading-tight text-foreground sm:text-4xl md:text-4xl lg:text-5xl",
            LANDING_REVEAL_CLASS,
          )}
        >
          Бизнесът ти невидим ли е в Google?
        </h1>
        <p
          data-animate-reveal
          className={cn(
            "text-base leading-relaxed text-muted-foreground sm:text-lg",
            LANDING_REVEAL_CLASS,
          )}
        >
          Гледай това кратко видео, за да разбереш защо не се класираш в топ 3.
        </p>
        <p
          data-animate-reveal
          className={cn(
            "text-base font-bold leading-relaxed text-foreground sm:text-lg",
            LANDING_REVEAL_CLASS,
          )}
        >
          Запиши се по-долу, за да получиш три БЕЗПЛАТНИ съвета, които можеш да приложиш още днес и
          да започнеш да се изкачваш нагоре. ⬇️
        </p>
        <form
          data-animate-reveal
          onSubmit={onSubmit}
          className={cn(
            "mx-auto flex w-full max-w-md flex-col gap-2 sm:flex-row md:mx-0",
            LANDING_REVEAL_CLASS,
          )}
        >
          <input
            type="email"
            name="email"
            required
            placeholder="name@email.com"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            className="h-[50px] w-full rounded-lg border border-border bg-white px-4 text-base text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20 disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-[50px] shrink-0 items-center justify-center gap-2 rounded-lg bg-accent px-5 text-base font-semibold text-accent-foreground transition hover:opacity-90 disabled:opacity-60 sm:px-6"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Изпращане...
              </>
            ) : (
              "Абонирай се"
            )}
          </button>
        </form>
      </div>
      <div data-animate-reveal className={cn("w-full md:w-1/2", LANDING_REVEAL_CLASS)}>
        <HeroVideo
          videoId="GikSOo2qqeE"
          title="3 безплатни съвета за по-високо класиране в Google"
          thumbnailSrc="/video-thumbnail.png"
          muteOnPlay
        />
      </div>
    </section>
  );
}
