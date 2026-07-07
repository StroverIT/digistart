"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { trackFunnelCompetitorSelection } from "@/lib/funnel/competitor-platform-analytics";
import {
  COMPETITOR_PLATFORM_OPTIONS,
  COMPETITOR_PLATFORM_REOPEN_EVENT,
  hasCompetitorPlatformAnswer,
  saveCompetitorPlatformAnswer,
  type CompetitorPlatform,
} from "@/lib/funnel/competitor-platform";

const MIN_OTHER_LABEL_LENGTH = 2;

type CompetitorPlatformPickerProps = {
  funnelId: string;
  pagePath: string;
  title: string;
  subtitle?: string;
};

export function CompetitorPlatformPicker({
  funnelId,
  pagePath,
  title,
  subtitle,
}: CompetitorPlatformPickerProps) {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";
  const [visible, setVisible] = useState(false);
  const [otherStep, setOtherStep] = useState(false);
  const [otherLabel, setOtherLabel] = useState("");
  const [isClosing, setIsClosing] = useState(false);

  const overlayRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const otherFormRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useRef(false);

  useEffect(() => {
    prefersReducedMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!hasCompetitorPlatformAnswer(funnelId)) {
      setVisible(true);
    }
  }, [funnelId]);

  const resetPickerState = useCallback(() => {
    setOtherStep(false);
    setOtherLabel("");
    setIsClosing(false);
  }, []);

  useEffect(() => {
    const onReopen = (event: Event) => {
      const detail = (event as CustomEvent<{ funnelId?: string }>).detail;
      if (detail?.funnelId !== funnelId) return;

      resetPickerState();
      setVisible(true);
    };

    window.addEventListener(COMPETITOR_PLATFORM_REOPEN_EVENT, onReopen);
    return () => window.removeEventListener(COMPETITOR_PLATFORM_REOPEN_EVENT, onReopen);
  }, [funnelId, resetPickerState]);

  const runEnterAnimation = useCallback(() => {
    if (prefersReducedMotion.current) return;

    const backdrop = backdropRef.current;
    const panel = panelRef.current;
    const cards = cardsRef.current?.querySelectorAll("[data-platform-card]");

    if (!backdrop || !panel) return;

    gsap.set(backdrop, { opacity: 0 });
    gsap.set(panel, { opacity: 0, scale: 0.94, y: 16 });
    if (cards?.length) {
      gsap.set(cards, { opacity: 0, y: 24, scale: 0.96 });
    }

    const tl = gsap.timeline();
    tl.to(backdrop, { opacity: 1, duration: 0.35, ease: "power2.out" })
      .to(panel, { opacity: 1, scale: 1, y: 0, duration: 0.45, ease: "power3.out" }, "-=0.2")
      .to(
        cards ?? [],
        { opacity: 1, y: 0, scale: 1, duration: 0.4, stagger: 0.06, ease: "power2.out" },
        "-=0.25",
      );
  }, []);

  useEffect(() => {
    if (!visible || isClosing) return;
    const frame = requestAnimationFrame(() => runEnterAnimation());
    return () => cancelAnimationFrame(frame);
  }, [visible, isClosing, runEnterAnimation]);

  const finishSelection = useCallback(
    (platform: CompetitorPlatform, label?: string) => {
      if (isClosing) return;
      setIsClosing(true);

      const trimmedOther = label?.trim();
      const answer =
        platform === "other" && trimmedOther
          ? { platform, otherLabel: trimmedOther }
          : { platform };

      if (!isAdmin) {
        trackFunnelCompetitorSelection({
          funnelId,
          platform,
          page: pagePath,
          otherLabel: trimmedOther,
        });
      }

      const complete = () => {
        saveCompetitorPlatformAnswer(funnelId, answer);
        setVisible(false);
      };

      if (prefersReducedMotion.current) {
        complete();
        return;
      }

      const backdrop = backdropRef.current;
      const panel = panelRef.current;
      const selectedCard = cardsRef.current?.querySelector(
        `[data-platform-id="${platform}"]`,
      ) as HTMLElement | null;
      const otherCards = cardsRef.current?.querySelectorAll(
        `[data-platform-card]:not([data-platform-id="${platform}"])`,
      );

      const tl = gsap.timeline({ onComplete: complete });

      if (selectedCard) {
        tl.to(selectedCard, {
          scale: 1.05,
          boxShadow: "0 0 0 2px rgba(99, 102, 241, 0.5), 0 12px 40px rgba(99, 102, 241, 0.25)",
          duration: 0.22,
          ease: "power2.out",
        });
      }

      if (otherCards?.length) {
        tl.to(
          otherCards,
          { opacity: 0, scale: 0.92, duration: 0.2, stagger: 0.03, ease: "power2.in" },
          "-=0.1",
        );
      }

      if (panel) {
        tl.to(panel, { opacity: 0, scale: 0.96, y: 8, duration: 0.28, ease: "power2.in" }, "-=0.05");
      }

      if (backdrop) {
        tl.to(backdrop, { opacity: 0, duration: 0.25, ease: "power2.in" }, "-=0.15");
      }
    },
    [funnelId, isAdmin, isClosing, pagePath],
  );

  const handlePlatformSelect = (platform: CompetitorPlatform) => {
    if (isClosing) return;
    if (platform === "other") {
      setOtherStep(true);
      if (!prefersReducedMotion.current && otherFormRef.current) {
        gsap.fromTo(
          otherFormRef.current,
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" },
        );
      }
      return;
    }
    finishSelection(platform);
  };

  const handleOtherConfirm = () => {
    const trimmed = otherLabel.trim();
    if (trimmed.length < MIN_OTHER_LABEL_LENGTH || isClosing) return;
    finishSelection("other", trimmed);
  };

  const trimmedOtherLabel = otherLabel.trim();
  const canConfirmOther = trimmedOtherLabel.length >= MIN_OTHER_LABEL_LENGTH;

  if (!visible) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-70 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="competitor-picker-title"
    >
      <div
        ref={backdropRef}
        className="absolute inset-0 bg-slate-950/55 backdrop-blur-md"
        aria-hidden="true"
      />

      <div
        ref={panelRef}
        className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-white/20 bg-white shadow-2xl shadow-indigo-500/10"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-linear-to-b from-indigo-50/80 to-transparent" />

        <div className="relative px-5 pb-6 pt-7 sm:px-8 sm:pb-8 sm:pt-9">
          <div className="text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">
              Еднократен въпрос
            </p>
            <h2
              id="competitor-picker-title"
              className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl"
            >
              {title}
            </h2>
            {subtitle ? (
              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-600 sm:text-base">
                {subtitle}
              </p>
            ) : null}
          </div>

          {!otherStep ? (
            <div
              ref={cardsRef}
              className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5"
            >
              {COMPETITOR_PLATFORM_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  data-platform-card
                  data-platform-id={option.id}
                  disabled={isClosing}
                  onClick={() => handlePlatformSelect(option.id)}
                  className={cn(
                    "group flex flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 text-center transition-[border-color,box-shadow,transform] duration-200",
                    "hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-500/10",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2",
                    "disabled:pointer-events-none disabled:opacity-60",
                    option.id === "other" && "sm:col-span-1",
                  )}
                >
                  <div className="flex h-16 w-full items-center justify-center transition-transform duration-200 group-hover:scale-105 sm:h-[4.5rem]">
                    {option.logoSrc ? (
                      <Image
                        src={option.logoSrc}
                        alt=""
                        width={72}
                        height={72}
                        className="h-14 w-auto max-w-[5.5rem] object-contain sm:h-16 sm:max-w-[6rem]"
                      />
                    ) : (
                      <MoreHorizontal className="h-10 w-10 text-slate-500" aria-hidden="true" />
                    )}
                  </div>
                  <span className="text-sm font-semibold text-slate-800">{option.label}</span>
                </button>
              ))}
            </div>
          ) : (
            <div ref={otherFormRef} className="mt-7 space-y-4">
              <button
                type="button"
                disabled={isClosing}
                onClick={() => setOtherStep(false)}
                className="text-sm font-medium text-indigo-600 transition hover:text-indigo-700 disabled:opacity-50"
              >
                ← Назад към избора
              </button>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 sm:p-6">
                <label htmlFor="competitor-other-label" className="block text-sm font-semibold text-slate-800">
                  Коя платформа използваш?
                </label>
                <p className="mt-1 text-sm text-slate-600">
                  Напиши името на платформата — полето е задължително.
                </p>
                <Input
                  id="competitor-other-label"
                  value={otherLabel}
                  disabled={isClosing}
                  onChange={(event) => setOtherLabel(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && canConfirmOther) {
                      event.preventDefault();
                      handleOtherConfirm();
                    }
                  }}
                  placeholder="Напр. Magento, PrestaShop..."
                  className="mt-4 h-11 bg-white"
                  autoFocus
                />
                <Button
                  type="button"
                  disabled={!canConfirmOther || isClosing}
                  onClick={handleOtherConfirm}
                  className="mt-4 w-full sm:w-auto"
                >
                  Потвърди
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
