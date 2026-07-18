"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { Building2 } from "lucide-react";
import { LANDING_REVEAL_CLASS } from "@/components/services/service-detail-ready-store-v2/landing-animation-classes";
import { useSectionScrollAnimations } from "@/components/services/service-pas-landing/use-section-scroll-animations";
import { cn } from "@/lib/utils";
import { gbContainerClass, gbLabelClass } from "./shared";

type ViewMode = "before" | "after";

const METRICS = [
  {
    label: "Среден ранк",
    before: "86",
    after: "3",
  },
  {
    label: "Пазарен дял",
    before: "1%",
    after: "28%",
  },
  {
    label: "Кликове на месец",
    before: "5",
    after: "420",
  },
  {
    label: "Клиенти на месец",
    before: "1–2",
    after: "18–25",
  },
] as const;

const BEFORE_ROWS: number[][] = [
  [20, 20, 20, 20, 20],
  [20, 20, 20, 20, 20, 20],
  [20, 20, 20, 20, 20, 20, 20],
  [20, 20, 20, 20, 20, 20, 20, 20],
  [20, 20, 20, 20, 20, 20, 20],
  [20, 20, 20, 20, 20, 20],
  [20, 20, 11, 3, 19],
];

const AFTER_ROWS: number[][] = [
  [1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1],
];

const RANK_TONES = {
  good: "#B8FF3C",
  midGood: "#D4FF6A",
  warn: "#FFC107",
  bad: "#FF2D2D",
} as const;

function rankToneColor(rank: number) {
  if (rank <= 3) return RANK_TONES.good;
  if (rank <= 10) return RANK_TONES.midGood;
  if (rank <= 15) return RANK_TONES.warn;
  return RANK_TONES.bad;
}

function RankMap({ mode }: { mode: ViewMode }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const cellsRef = useRef<(HTMLSpanElement | null)[]>([]);
  const hasAnimatedRef = useRef(false);

  useLayoutEffect(() => {
    const cells = cellsRef.current.filter(Boolean) as HTMLSpanElement[];
    if (!cells.length) return;

    const rows = mode === "before" ? BEFORE_ROWS : AFTER_ROWS;
    const ranks = rows.flat();
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    cells.forEach((cell, index) => {
      const rank = ranks[index];
      if (rank == null) return;
      cell.textContent = String(rank);
      cell.style.backgroundColor = rankToneColor(rank);
    });

    gsap.killTweensOf(cells);

    if (!hasAnimatedRef.current || reducedMotion) {
      hasAnimatedRef.current = true;
      gsap.set(cells, { opacity: 1, scale: 1 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        cells,
        { opacity: 0.35, scale: 0.55 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.45,
          stagger: {
            each: 0.012,
            from: mode === "after" ? "center" : "edges",
          },
          ease: "back.out(1.6)",
          overwrite: true,
        },
      );
    }, mapRef);

    return () => ctx.revert();
  }, [mode]);

  let cellIndex = 0;

  return (
    <div
      ref={mapRef}
      className={cn(
        "relative min-h-0 min-w-0 overflow-hidden rounded-2xl bg-muted/60 aspect-4/3 transition-shadow duration-500",
        mode === "after" ? "ring-2 ring-primary/50 shadow-[0_0_0_1px_rgba(161,244,190,0.25)]" : "ring-1 ring-border/40",
      )}
    >
      <Image
        src="/services/google-business/sofia-rank-map.png"
        alt="Карта на София с локални позиции в Google"
        fill
        className="object-cover"
        sizes="(max-width: 1024px) 100vw, 50vw"
        priority={false}
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-linear-to-t from-background/20 via-transparent to-background/5"
      />
      <div className="absolute inset-[4%] flex flex-col justify-center gap-[1.5%]">
        {BEFORE_ROWS.map((row, rowIndex) => (
          <div
            key={`row-${rowIndex}`}
            className={cn(
              "flex min-h-0 flex-1 items-center justify-center gap-[1.5%]",
              rowIndex % 2 === 1 ? "pl-[6%]" : "pr-[6%]",
            )}
          >
            {row.map((_, colIndex) => {
              const index = cellIndex++;
              return (
                <span
                  key={`cell-${rowIndex}-${colIndex}`}
                  ref={(el) => {
                    cellsRef.current[index] = el;
                  }}
                  className="box-border flex aspect-square h-[88%] w-auto shrink-0 items-center justify-center self-center rounded-full border border-black text-[clamp(7px,1.4vw,11px)] font-bold leading-none tabular-nums text-black will-change-transform"
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function ModeToggle({
  mode,
  onChange,
}: {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const beforeRef = useRef<HTMLButtonElement>(null);
  const afterRef = useRef<HTMLButtonElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);

  const pillReadyRef = useRef(false);

  useLayoutEffect(() => {
    const track = trackRef.current;
    const pill = pillRef.current;
    const active = mode === "before" ? beforeRef.current : afterRef.current;
    if (!track || !pill || !active) return;

    const trackRect = track.getBoundingClientRect();
    const activeRect = active.getBoundingClientRect();
    const x = activeRect.left - trackRect.left;
    const width = activeRect.width;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    gsap.killTweensOf(pill);

    if (!pillReadyRef.current || reducedMotion) {
      pillReadyRef.current = true;
      gsap.set(pill, { x, width, opacity: 1 });
      return;
    }

    gsap.to(pill, {
      x,
      width,
      duration: 0.35,
      ease: "power3.out",
      overwrite: true,
    });
  }, [mode]);

  return (
    <div
      ref={trackRef}
      role="tablist"
      aria-label="Преди или след"
      className="relative inline-grid w-fit grid-cols-2 rounded-full bg-muted p-1"
    >
      <span
        ref={pillRef}
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-y-1 left-0 rounded-full shadow-sm transition-colors duration-300",
          mode === "before" ? "bg-destructive" : "bg-primary",
        )}
      />
      {(["before", "after"] as const).map((value) => {
        const selected = mode === value;
        return (
          <button
            key={value}
            ref={value === "before" ? beforeRef : afterRef}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-controls="before-after-panel"
            id={`before-after-tab-${value}`}
            onClick={() => onChange(value)}
            className={cn(
              "relative z-10 rounded-full px-5 py-2 text-sm font-semibold transition-colors duration-300",
              selected
                ? value === "after"
                  ? "text-primary-foreground"
                  : "text-destructive-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {value === "before" ? "Преди" : "След"}
          </button>
        );
      })}
    </div>
  );
}

export function BeforeAfterSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const metricsRef = useRef<HTMLUListElement>(null);
  const hasAnimatedMetricsRef = useRef(false);
  const [mode, setMode] = useState<ViewMode>("before");

  useSectionScrollAnimations(sectionRef, {
    staggerReveal: 0.1,
    itemStart: "top 88%",
  });

  useLayoutEffect(() => {
    const list = metricsRef.current;
    if (!list) return;

    const values = list.querySelectorAll<HTMLElement>("[data-metric-value]");
    const rows = list.querySelectorAll<HTMLElement>("[data-metric-row]");
    if (!values.length) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    gsap.killTweensOf([...values, ...rows]);

    if (!hasAnimatedMetricsRef.current || reducedMotion) {
      hasAnimatedMetricsRef.current = true;
      gsap.set(values, { opacity: 1, y: 0, scale: 1 });
      gsap.set(rows, { opacity: 1, x: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

      tl.fromTo(
        values,
        { opacity: 0, y: 8, scale: 0.92 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.35,
          stagger: 0.06,
        },
        0,
      ).fromTo(
        rows,
        { opacity: 0.55, x: mode === "after" ? -6 : 6 },
        {
          opacity: 1,
          x: 0,
          duration: 0.4,
          stagger: 0.05,
        },
        0,
      );
    }, list);

    return () => ctx.revert();
  }, [mode]);

  return (
    <section
      ref={sectionRef}
      id="before-after"
      className="relative overflow-x-clip py-12 md:py-28"
    >
      <div className={gbContainerClass}>
        <div className="mx-auto max-w-2xl text-center">
          <span
            data-animate-reveal
            className={cn(gbLabelClass, LANDING_REVEAL_CLASS)}
          >
            Преди / След
          </span>
          <h2
            data-animate-reveal
            className={cn(
              "mt-5 font-heading text-2xl font-bold tracking-tight text-foreground md:text-4xl",
              LANDING_REVEAL_CLASS,
            )}
          >
            Разликата
          </h2>
        </div>

        <div
          data-animate-reveal
          className={cn(
            "mx-auto mt-8 overflow-hidden rounded-4xl border border-border/60 bg-card p-5 shadow-(--shadow-soft) transition-[border-color,box-shadow] duration-500 sm:p-8 md:mt-12 md:rounded-[2.5rem]",
            mode === "after" && "border-primary/40 shadow-[0_12px_40px_-16px_oklch(0.9_0.11_155/0.35)]",
            LANDING_REVEAL_CLASS,
          )}
        >
          <div className="grid min-w-0 gap-8 lg:grid-cols-2 lg:items-stretch lg:gap-10">
            <div className="flex min-w-0 flex-col gap-5">
              <div className="flex flex-wrap items-center gap-3">
                <ModeToggle mode={mode} onChange={setMode} />
                <p
                  aria-live="polite"
                  className={cn(
                    "text-xs font-semibold uppercase tracking-wider transition-colors duration-300",
                    mode === "before" ? "text-destructive" : "text-accent",
                  )}
                >
                  {mode === "before" ? "Без оптимизация" : "С DigiStart"}
                </p>
              </div>

              <div className="flex items-start gap-3 rounded-2xl bg-muted/70 px-4 py-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/20 text-accent">
                  <Building2 className="size-5" strokeWidth={2.2} />
                </span>
                <div className="min-w-0">
                  <p className="font-heading text-base font-bold text-foreground">Твоят бизнес</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    ул. Примерна 12, София
                  </p>
                </div>
              </div>

              <ul
                ref={metricsRef}
                id="before-after-panel"
                role="tabpanel"
                aria-labelledby={`before-after-tab-${mode}`}
                className="flex flex-1 flex-col justify-center gap-3"
              >
                {METRICS.map((metric) => (
                  <li
                    key={metric.label}
                    data-metric-row
                    className="flex items-center justify-between gap-4 rounded-2xl border border-border/50 bg-background/80 px-4 py-3"
                  >
                    <span className="min-w-0 text-sm font-medium text-muted-foreground sm:text-base">
                      {metric.label}
                    </span>
                    <span
                      data-metric-value
                      className={cn(
                        "shrink-0 rounded-xl px-3 py-1.5 text-center font-heading text-base font-bold tabular-nums will-change-transform",
                        mode === "before"
                          ? "bg-destructive text-destructive-foreground"
                          : "bg-primary text-primary-foreground",
                      )}
                    >
                      {mode === "before" ? metric.before : metric.after}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="min-w-0">
              <RankMap mode={mode} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
