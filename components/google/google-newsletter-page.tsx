"use client";

import { useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ArrowUpRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { LANDING_REVEAL_CLASS } from "@/components/services/service-detail-ready-store-v2/landing-animation-classes";
import { useSectionScrollAnimations } from "@/components/services/service-pas-landing/use-section-scroll-animations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trackMetaLead } from "@/lib/analytics/meta-pixel";
import { cn } from "@/lib/utils";

const inputClassName =
  "h-12 rounded-lg border border-border bg-white px-4 text-base shadow-none focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/20";

export function GoogleNewsletterPage() {
  const sectionRef = useRef<HTMLElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  useSectionScrollAnimations(sectionRef, {
    staggerReveal: 0.12,
    animateOnMount: true,
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    const trimmedName = firstName.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      toast.error("Моля, въведете име.");
      return;
    }
    if (!trimmedEmail) {
      toast.error("Моля, въведете имейл.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/newsletter/google-newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName: trimmedName, email: trimmedEmail }),
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
        content_name: "DigiStart - Google бюлетин",
        page_path: pathname && pathname.length > 0 ? pathname : "/google/newsletter",
        lead_source: "google_newsletter",
        user: { email: trimmedEmail, firstName: trimmedName },
      });

      router.push("/google/newsletter/thank-you");
    } catch {
      toast.error("Мрежова грешка. Опитайте отново.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section
      ref={sectionRef}
      className="mx-auto flex w-full max-w-[1200px] flex-col gap-10 md:flex-row md:items-center md:gap-12 lg:gap-16"
    >
      <div className="flex w-full flex-col gap-4 md:w-1/2 md:gap-6">
        <h1
          data-animate-reveal
          className={cn(
            "font-heading text-balance text-3xl font-bold leading-tight text-foreground sm:text-4xl md:text-4xl lg:text-5xl",
            LANDING_REVEAL_CLASS,
          )}
        >
          Бюлетинът за разрастване на вашия бизнес.
        </h1>
        <p
          data-animate-reveal
          className={cn(
            "text-base leading-relaxed text-muted-foreground sm:text-lg",
            LANDING_REVEAL_CLASS,
          )}
        >
          Прости маркетингови тактики, които наистина работят за локални бизнеси.
        </p>
        <p
          data-animate-reveal
          className={cn(
            "text-base leading-relaxed text-muted-foreground sm:text-lg",
            LANDING_REVEAL_CLASS,
          )}
        >
          Без излишни приказки и теория - само доказани стратегии, които можете да използвате още
          тази седмица, за да привлечете повече клиенти.
        </p>
      </div>

      <form
        id="newsletter-form"
        data-animate-reveal
        onSubmit={onSubmit}
        className={cn(
          "flex w-full flex-col gap-4 md:w-1/2 md:max-w-md md:ml-auto",
          LANDING_REVEAL_CLASS,
        )}
      >
        <Input
          type="text"
          name="firstName"
          required
          autoComplete="given-name"
          placeholder="Име *"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          disabled={loading}
          className={inputClassName}
          aria-label="Име"
        />
        <Input
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="Работен имейл *"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          className={inputClassName}
          aria-label="Работен имейл"
        />
        <Button
          type="submit"
          size="xl"
          disabled={loading}
          className="h-[50px] w-full rounded-lg bg-accent px-5 text-base font-semibold text-accent-foreground hover:opacity-90"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Изпращане...
            </>
          ) : (
            <>
              Изпратете стойност в пощата ми
              <ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden />
            </>
          )}
        </Button>
      </form>
    </section>
  );
}
