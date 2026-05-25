"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  MONTHLY_ORDER_VOLUME_OPTIONS,
  SALES_CHANNEL_OPTIONS,
  SERVICE_SURVEY_OPTIONS,
} from "@/lib/visitor-preferences/constants";
import { getServicePath } from "@/lib/visitor-preferences/paths";
import { savePreferences, getPreferences } from "@/lib/visitor-preferences/storage";
import { trackSurveyAnswer } from "@/lib/visitor-preferences/analytics";
import type {
  MonthlyOrderVolume,
  SalesChannel,
  VisitorServiceId,
} from "@/lib/visitor-preferences/types";
import { useTransitionRouter } from "@/components/transitions/useTransitionRouter";

type SurveyStep = "channels" | "orders" | "services";

const STEP_TITLES: Record<SurveyStep, string> = {
  channels: "Къде продаваш в момента?",
  orders: "Грубо колко поръчки правиш на месец?",
  services: "От кои услуги се интересуваш?",
};

const STEP_HINTS: Record<SurveyStep, string> = {
  channels: "Можеш да избереш повече от един отговор.",
  orders: "Избери един отговор.",
  services: "Избери услугата, с която искаш да започнеш.",
};

type VisitorSurveyProps = {
  isEditMode?: boolean;
};

export function VisitorSurvey({ isEditMode = false }: VisitorSurveyProps) {
  const { push } = useTransitionRouter();
  const stepPanelRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState<SurveyStep>("channels");
  const [selectedChannels, setSelectedChannels] = useState<SalesChannel[]>([]);
  const [otherLabel, setOtherLabel] = useState("");
  const [monthlyOrders, setMonthlyOrders] = useState<MonthlyOrderVolume | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (!isEditMode) return;
    const prefs = getPreferences();
    if (!prefs) return;
    setSelectedChannels([...prefs.salesChannels]);
    setOtherLabel(prefs.otherChannelLabel ?? "");
    setMonthlyOrders(prefs.monthlyOrders);
  }, [isEditMode]);

  const surveyPage = isEditMode ? "/?edit=1" : "/";

  const animateToStep = useCallback(
    (next: SurveyStep, direction: "forward" | "back" = "forward") => {
      const panel = stepPanelRef.current;
      if (!panel || isAnimating) {
        setStep(next);
        return;
      }

      setIsAnimating(true);
      const xOut = direction === "forward" ? -48 : 48;
      const xIn = direction === "forward" ? 48 : -48;

      gsap.to(panel, {
        x: xOut,
        opacity: 0,
        duration: 0.28,
        ease: "power2.in",
        onComplete: () => {
          setStep(next);
          gsap.set(panel, { x: xIn, opacity: 0 });
          gsap.to(panel, {
            x: 0,
            opacity: 1,
            duration: 0.36,
            ease: "power2.out",
            onComplete: () => setIsAnimating(false),
          });
        },
      });
    },
    [isAnimating],
  );

  const channelsAreValid = useCallback(
    (channels: SalesChannel[], label: string) => {
      if (channels.length === 0) return false;
      if (channels.includes("other") && !label.trim()) return false;
      return true;
    },
    [],
  );

  const goToOrders = useCallback(
    (channels = selectedChannels, label = otherLabel) => {
      if (!channelsAreValid(channels, label)) return;
      animateToStep("orders", "forward");
    },
    [selectedChannels, otherLabel, channelsAreValid, animateToStep],
  );

  const toggleChannel = (channel: SalesChannel) => {
    setSelectedChannels((prev) => {
      const has = prev.includes(channel);
      const next = has ? prev.filter((c) => c !== channel) : [...prev, channel];

      if (!has) {
        trackSurveyAnswer({
          question: "sales_channels",
          answer: channel,
          page: surveyPage,
          otherLabel: channel === "other" ? otherLabel.trim() : undefined,
        });
      }

      return next;
    });
  };

  const handleOtherLabelBlur = () => {
    if (!selectedChannels.includes("other") || !otherLabel.trim()) return;
    trackSurveyAnswer({
      question: "sales_channels",
      answer: "other",
      page: surveyPage,
      otherLabel: otherLabel.trim(),
    });
  };

  const handleOrderVolumeSelect = (volume: MonthlyOrderVolume) => {
    if (!channelsAreValid(selectedChannels, otherLabel)) return;

    setMonthlyOrders(volume);
    trackSurveyAnswer({
      question: "monthly_orders",
      answer: volume,
      page: surveyPage,
    });
    animateToStep("services", "forward");
  };

  const handleServiceSelect = (serviceId: VisitorServiceId) => {
    if (!channelsAreValid(selectedChannels, otherLabel)) return;
    if (!monthlyOrders) return;

    trackSurveyAnswer({
      question: "service_interest",
      answer: serviceId,
      page: surveyPage,
    });

    savePreferences({
      salesChannels: selectedChannels,
      otherChannelLabel: selectedChannels.includes("other") ? otherLabel.trim() : undefined,
      monthlyOrders,
      primaryService: serviceId,
    });

    push(getServicePath(serviceId));
  };

  const showContinue =
    step === "channels" &&
    selectedChannels.length > 0 &&
    (!selectedChannels.includes("other") || otherLabel.trim().length > 0);

  const otherSelected = selectedChannels.includes("other");

  const backTarget: SurveyStep | null =
    step === "orders" ? "channels" : step === "services" ? "orders" : null;

  return (
    <section className="relative min-h-[calc(100vh-12rem)] flex items-center justify-center px-4 py-16 md:py-24">
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <p className="text-sm font-medium text-primary uppercase tracking-wider mb-2">
            DigiStart
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            {STEP_TITLES[step]}
          </h1>
          <p className="mt-3 text-muted-foreground text-base md:text-lg">
            {STEP_HINTS[step]}
          </p>
        </div>

        <div ref={stepPanelRef} className="will-change-transform">
          {step === "channels" ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SALES_CHANNEL_OPTIONS.map((option) => {
                  const active = selectedChannels.includes(option.id);
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => toggleChannel(option.id)}
                      className={cn(
                        "rounded-xl border-2 px-5 py-4 text-left text-lg font-semibold transition-colors",
                        active
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-border bg-card hover:border-primary/50",
                      )}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>

              {otherSelected ? (
                <div className="pt-2">
                  <label htmlFor="other-channel" className="text-sm text-muted-foreground mb-2 block">
                    Къде още продавате?
                  </label>
                  <Input
                    id="other-channel"
                    value={otherLabel}
                    onChange={(e) => setOtherLabel(e.target.value)}
                    onBlur={handleOtherLabelBlur}
                    placeholder="напр. TikTok, собствен сайт"
                    className="text-base"
                  />
                </div>
              ) : null}

              {showContinue ? (
                <div className="pt-6 flex justify-center">
                  <Button size="lg" onClick={() => goToOrders()} className="min-w-[200px]">
                    Продължи
                  </Button>
                </div>
              ) : null}
            </div>
          ) : step === "orders" ? (
            <div className="space-y-3">
              {backTarget ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mb-2 -ml-2"
                  onClick={() => animateToStep(backTarget, "back")}
                >
                  ← Назад
                </Button>
              ) : null}
              <div className="grid grid-cols-2 gap-3">
                {MONTHLY_ORDER_VOLUME_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleOrderVolumeSelect(option.id)}
                    className={cn(
                      "rounded-xl border-2 px-5 py-4 text-center text-lg font-semibold transition-colors",
                      monthlyOrders === option.id
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border bg-card hover:border-primary/50",
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {backTarget ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mb-2 -ml-2"
                  onClick={() => animateToStep(backTarget, "back")}
                >
                  ← Назад
                </Button>
              ) : null}
              <div className="grid grid-cols-1 gap-3">
                {SERVICE_SURVEY_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleServiceSelect(option.id)}
                    className="rounded-xl border-2 border-border bg-card hover:border-primary px-5 py-4 text-left transition-colors"
                  >
                    <span className="block text-lg font-semibold">{option.label}</span>
                    <span className="block text-sm text-muted-foreground mt-1">
                      {option.description}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
