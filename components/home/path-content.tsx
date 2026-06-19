import {
  AlertTriangle,
  Check,
  Clock,
  Flame,
  Lightbulb,
  Sparkles,
  Target,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { PathContent as PathContentType } from "@/lib/data/home-paths";
import { cn } from "@/lib/utils";

function splitSentences(text: string) {
  return text.match(/[^.!?]+[.!?]+(?:\s|$)|[^.!?]+$/g)?.map((sentence) => sentence.trim()) ?? [text];
}

const blocks = [
  {
    key: "problem",
    title: "Проблемът",
    icon: AlertTriangle,
    tone: "accent" as const,
  },
  {
    key: "agitate",
    title: "Защо това е сериозно",
    icon: Flame,
    tone: "muted" as const,
  },
  {
    key: "solution",
    title: "Нашето решение",
    icon: Lightbulb,
    tone: "highlight" as const,
  },
] as const;

const FIT_ICONS: LucideIcon[] = [Target, Clock, Users, Sparkles];

function splitFitTitle(fitTitle: string) {
  const question = fitTitle.match(/Това ти ли си\?/)?.[0];
  const lead = fitTitle.replace(/\s*Това ти ли си\?\s*$/, "").replace(/\.$/, "").trim();

  return {
    lead: lead || fitTitle,
    question: question ?? fitTitle,
  };
}

export function PathContent({ path }: { path: PathContentType }) {
  const { lead: fitLead, question: fitQuestion } = splitFitTitle(path.fitTitle);
  return (
    <div className="space-y-12">
      <div className="relative overflow-hidden rounded-[2rem] bg-card shadow-[var(--shadow-soft)] ring-1 ring-foreground/[0.04] md:rounded-[2.5rem]">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-accent/10 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-primary/25 blur-3xl"
        />

        <div className="relative grid divide-y divide-border/50 lg:grid-cols-3 lg:divide-x lg:divide-y-0">
          {blocks.map((block, idx) => {
            const text = path[block.key as "problem" | "agitate" | "solution"];
            const isHighlight = block.tone === "highlight";
            const isAccent = block.tone === "accent";
            const Icon = block.icon;

            return (
              <article
                key={block.key}
                className={cn(
                  "relative p-8 md:p-10",
                  isHighlight &&
                    "bg-gradient-to-br from-primary/20 via-primary/10 to-accent/[0.08] lg:shadow-[-12px_0_32px_-20px_oklch(0.32_0.16_320_/_0.18)]",
                )}
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute right-5 top-4 select-none font-heading text-7xl font-bold leading-none text-foreground/[0.04] md:right-8 md:top-6 md:text-8xl"
                >
                  0{idx + 1}
                </span>

                <div className="relative z-10">
                  <div
                    className={cn(
                      "inline-flex h-12 w-12 items-center justify-center rounded-2xl shadow-md ring-4 ring-card",
                      isHighlight || isAccent
                        ? "bg-accent text-accent-foreground"
                        : "bg-accent/10 text-accent",
                    )}
                  >
                    <Icon className="h-5 w-5" strokeWidth={2.2} />
                  </div>

                  <h3
                    className={cn(
                      "mt-6 text-xl font-bold md:text-2xl",
                      isAccent
                        ? "font-accent text-accent"
                        : "font-heading text-foreground",
                    )}
                  >
                    {block.title}
                  </h3>

                  <div className="mt-5 space-y-3 text-sm leading-relaxed text-muted-foreground">
                    {splitSentences(text).map((sentence, sentenceIdx) => (
                      <p key={sentenceIdx}>{sentence}</p>
                    ))}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      <div className="relative px-1 pt-4 md:px-4 md:pt-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-card px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-accent">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            {fitLead}
          </span>
          <h3 className="mt-5 font-heading text-2xl font-bold text-foreground md:text-3xl">
            {fitQuestion}
          </h3>
        </div>

        <div className="relative mt-8 grid gap-4 sm:grid-cols-2">
          {path.fits.map((fit, index) => {
            const Icon = FIT_ICONS[index % FIT_ICONS.length];

            return (
              <article
                key={fit.title}
                className="group relative overflow-hidden rounded-2xl bg-card p-6 shadow-[var(--shadow-soft)] ring-1 ring-foreground/[0.04] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-glow)] md:p-7"
              >
                <div
                  aria-hidden
                  className="absolute inset-y-0 left-0 w-1 bg-accent"
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-primary/15 blur-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                />

                <div className="relative flex gap-4 pl-2">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-accent/15 to-primary/25 text-accent shadow-sm ring-4 ring-card transition-transform duration-300 group-hover:scale-105">
                    <Icon className="h-5 w-5" strokeWidth={2.2} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-accent">
                        Критерий 0{index + 1}
                      </span>
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/10 text-accent opacity-0 transition-all duration-300 group-hover:opacity-100">
                        <Check className="h-3.5 w-3.5" strokeWidth={3} />
                      </div>
                    </div>
                    <h4 className="mt-1 font-heading text-base font-bold leading-snug text-foreground md:text-lg">
                      {fit.title}
                    </h4>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {fit.description}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
