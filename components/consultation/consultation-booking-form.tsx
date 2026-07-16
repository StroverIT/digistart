"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { useTransitionRouter } from "@/components/transitions/useTransitionRouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { flushAnalyticsEventsAsync, trackAnalyticsEvent } from "@/lib/analytics/tracker";
import { trackMetaLead } from "@/lib/analytics/meta-pixel";
import { toast } from "sonner";
import { writeConsultationLeadSuccess } from "@/lib/consultation/lead-success";
import { ConsultationSlotCalendar } from "@/components/consultation/consultation-slot-calendar";
import { useIsMobile } from "@/hooks/use-mobile";

type HomeBookingStep = "calendar" | "times" | "slots" | "contact";

type SlotDay = {
  date: string;
  availableTimes: string[];
};

type BookedPayload = {
  id: string;
  date: string;
  time: string;
  source: "public" | "checkout";
  status: "scheduled";
  orderId?: string;
  timezone?: string;
  meetUrl?: string;
  calendarUrl?: string;
  meetingType?: "online" | "in_person";
};

type Props = {
  source: "public" | "checkout";
  sourcePage?: string;
  pagePath?: string;
  variant?: "card" | "embedded";
  className?: string;
  title?: string;
  description?: string;
  submitLabel?: string;
  showCompanyField?: boolean;
  showNotesField?: boolean;
  showSocialProfileToggle?: boolean;
  socialProfileToggleLabel?: string;
  showOnSiteOption?: boolean;
  analyticsPath?: string;
  analyticsCtaId?: string;
  notesLabel?: string;
  notesPlaceholder?: string;
  metaLead?: {
    contentName: string;
    leadSource?: string;
  };
  initialValues?: {
    name?: string;
    email?: string;
    phone?: string;
    company?: string;
    notes?: string;
  };
  orderId?: string;
  onBooked?: (booking: BookedPayload) => void;
  successRedirectPath?: string;
  embeddedShowSlotsFirst?: boolean;
};

function formatDisplayDate(value: string, variant: "card" | "embedded") {
  const options: Intl.DateTimeFormatOptions =
    variant === "embedded"
      ? { weekday: "long", day: "numeric", month: "long" }
      : { weekday: "short", day: "numeric", month: "short" };

  return new Date(`${value}T00:00:00`).toLocaleDateString("bg-BG", options);
}

export default function ConsultationBookingForm({
  source,
  sourcePage,
  pagePath,
  variant = "card",
  className,
  title = "Запазете безплатна консултация",
  description = "Изберете удобен ден и час, попълнете контактни данни и ще потвърдим срещата веднага.",
  submitLabel = "Запази консултация",
  showCompanyField = true,
  showNotesField = true,
  showSocialProfileToggle = false,
  socialProfileToggleLabel = "Имаш ли социални мрежи?",
  showOnSiteOption = false,
  analyticsPath = "/consultation",
  analyticsCtaId,
  notesLabel = "Допълнителни бележки (по избор)",
  notesPlaceholder = "Допълнителни бележки (по избор)",
  metaLead,
  initialValues,
  orderId,
  onBooked,
  successRedirectPath = source === "public" ? "/thank-you-lead" : undefined,
  embeddedShowSlotsFirst = false,
}: Props) {
  const { router, startLoadingOverlay, cancelLoadingOverlay } = useTransitionRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const stepViewportRef = useRef<HTMLDivElement>(null);
  const calendarStepRef = useRef<HTMLDivElement>(null);
  const timesStepRef = useRef<HTMLDivElement>(null);
  const slotsStepRef = useRef<HTMLDivElement>(null);
  const contactStepRef = useRef<HTMLDivElement>(null);
  const stepTweenRef = useRef<gsap.core.Timeline | null>(null);
  const isStepAnimatingRef = useRef(false);
  const animatedSectionsRef = useRef(new Set<string>());
  const isEmbedded = variant === "embedded";
  const isMobile = useIsMobile();
  const isHomeSlotsFlow = embeddedShowSlotsFirst && isEmbedded;
  const [days, setDays] = useState<SlotDay[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [isLoadingSlots, setIsLoadingSlots] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [locallyDisabledSlots, setLocallyDisabledSlots] = useState<Record<string, Set<string>>>({});

  const [formData, setFormData] = useState({
    name: initialValues?.name ?? "",
    email: initialValues?.email ?? "",
    phone: initialValues?.phone ?? "",
    company: initialValues?.company ?? "",
    notes: initialValues?.notes ?? "",
    address: "",
  });
  const [meetingType, setMeetingType] = useState<"online" | "in_person">("online");
  const [hasSocialProfiles, setHasSocialProfiles] = useState(false);
  const [bookingStep, setBookingStep] = useState<HomeBookingStep>("slots");

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      name: initialValues?.name ?? prev.name,
      email: initialValues?.email ?? prev.email,
      phone: initialValues?.phone ?? prev.phone,
      company: initialValues?.company ?? prev.company,
      notes: initialValues?.notes ?? prev.notes,
    }));
  }, [initialValues]);

  useEffect(() => {
    const loadSlots = async () => {
      setIsLoadingSlots(true);
      setError("");
      try {
        const res = await fetch("/api/consultation/slots", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load slots");
        const data = await res.json();
        const loadedDays = (data.days ?? []) as SlotDay[];
        setDays(loadedDays);

        if (!isEmbedded) {
          const firstWithAvailability = loadedDays.find((day) => day.availableTimes.length > 0);
          if (firstWithAvailability) {
            setSelectedDate(firstWithAvailability.date);
            setSelectedTime(firstWithAvailability.availableTimes[0] ?? "");
          }
        }
      } catch {
        setError("Не успяхме да заредим часовете. Моля опитайте отново.");
      } finally {
        setIsLoadingSlots(false);
      }
    };

    void loadSlots();
  }, [isEmbedded]);

  const availableTimes = useMemo(() => {
    return days.find((day) => day.date === selectedDate)?.availableTimes ?? [];
  }, [days, selectedDate]);

  const isContactComplete = useMemo(() => {
    const name = formData.name.trim();
    const phone = formData.phone.trim();
    const email = formData.email.trim();
    return name.length > 0 && phone.length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }, [formData.name, formData.phone, formData.email]);

  const showDayPicker = embeddedShowSlotsFirst ? true : isContactComplete;
  const showMeetingTypePicker = isContactComplete && showOnSiteOption;
  const showAddressField = showMeetingTypePicker && meetingType === "in_person";
  const showTimePickerInDesktopSlots =
    isHomeSlotsFlow && !isMobile && Boolean(selectedDate);
  const showTimePicker =
    embeddedShowSlotsFirst && isHomeSlotsFlow && isMobile
      ? false
      : embeddedShowSlotsFirst
        ? Boolean(selectedDate)
        : isContactComplete && Boolean(selectedDate);
  const showContactAfterSlotSelection = embeddedShowSlotsFirst ? Boolean(selectedTime) : true;
  const isAddressValid =
    meetingType !== "in_person" || formData.address.trim().length >= 5;

  const showSocialProfileLinkField =
    isEmbedded &&
    ((showSocialProfileToggle && hasSocialProfiles) ||
      (showNotesField && !showSocialProfileToggle));

  useEffect(() => {
    if (!isHomeSlotsFlow || isLoadingSlots) return;
    const step: HomeBookingStep = isMobile ? "calendar" : "slots";
    resetHomeStepView(step);
    setBookingStep(step);
  }, [isHomeSlotsFlow, isLoadingSlots, isMobile]);

  useEffect(() => {
    if (!isHomeSlotsFlow || selectedTime || isStepAnimatingRef.current) return;

    const step: HomeBookingStep = isMobile ? (selectedDate ? "times" : "calendar") : "slots";
    resetHomeStepView(step);
    setBookingStep(step);
  }, [isHomeSlotsFlow, isMobile, selectedDate, selectedTime]);

  useEffect(() => {
    if (!isHomeSlotsFlow || !isMobile || !selectedDate || bookingStep !== "calendar") return;
    if (isStepAnimatingRef.current) return;

    const fromEl = calendarStepRef.current;
    const toEl = timesStepRef.current;
    if (!fromEl || !toEl) {
      setBookingStep("times");
      return;
    }

    animateHomePanels("forward", fromEl, toEl, () => {
      setBookingStep("times");
      stepViewportRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [bookingStep, isHomeSlotsFlow, isMobile, selectedDate]);

  useEffect(() => {
    if (!isHomeSlotsFlow || !selectedTime || isStepAnimatingRef.current) return;

    if (isMobile && bookingStep === "times") {
      const fromEl = timesStepRef.current;
      const toEl = contactStepRef.current;
      if (!fromEl || !toEl) {
        setBookingStep("contact");
        return;
      }

      animateHomePanels("forward", fromEl, toEl, () => {
        setBookingStep("contact");
        stepViewportRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      return;
    }

    if (!isMobile && bookingStep === "slots") {
      const fromEl = slotsStepRef.current;
      const toEl = contactStepRef.current;
      if (!fromEl || !toEl) {
        setBookingStep("contact");
        return;
      }

      animateHomePanels("forward", fromEl, toEl, () => {
        setBookingStep("contact");
      });
    }
  }, [bookingStep, isHomeSlotsFlow, isMobile, selectedTime]);

  useEffect(() => {
    if (embeddedShowSlotsFirst) return;
    if (!isContactComplete) {
      setSelectedDate("");
      setSelectedTime("");
    }
  }, [embeddedShowSlotsFirst, isContactComplete]);

  const isTimeLocallyDisabled = (date: string, time: string) =>
    locallyDisabledSlots[date]?.has(time) ?? false;

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
  };

  const handleTimeSelect = (time: string) => {
    if (isTimeLocallyDisabled(selectedDate, time)) return;
    setSelectedTime(time);
  };

  const handleBackToCalendar = () => {
    if (!isHomeSlotsFlow || !isMobile || bookingStep !== "times") return;

    const fromEl = timesStepRef.current;
    const toEl = calendarStepRef.current;
    if (!fromEl || !toEl) {
      setSelectedDate("");
      setSelectedTime("");
      setBookingStep("calendar");
      return;
    }

    animateHomePanels("back", fromEl, toEl, () => {
      animatedSectionsRef.current.delete("day-picker");
      setSelectedDate("");
      setSelectedTime("");
      setBookingStep("calendar");
    });
  };

  const handleBackToSlots = () => {
    if (!isHomeSlotsFlow) return;

    if (isMobile && bookingStep === "contact" && selectedTime) {
      const fromEl = contactStepRef.current;
      const toEl = timesStepRef.current;
      if (!fromEl || !toEl) {
        setSelectedTime("");
        setBookingStep("times");
        return;
      }

      animateHomePanels("back", fromEl, toEl, () => {
        setSelectedTime("");
        setBookingStep("times");
      });
      return;
    }

    if (!isMobile && bookingStep === "contact" && selectedTime) {
      const fromEl = contactStepRef.current;
      const toEl = slotsStepRef.current;
      if (!fromEl || !toEl) {
        setSelectedTime("");
        setBookingStep("slots");
        return;
      }

      animateHomePanels("back", fromEl, toEl, () => {
        animatedSectionsRef.current.delete("time-picker");
        setSelectedTime("");
        setBookingStep("slots");
      });
      return;
    }

    setSelectedTime("");
    setBookingStep(isMobile ? "times" : "slots");
  };

  function resetHomeStepView(step: HomeBookingStep) {
    const calendarEl = calendarStepRef.current;
    const timesEl = timesStepRef.current;
    const slotsEl = slotsStepRef.current;
    const contactEl = contactStepRef.current;

    stepTweenRef.current?.kill();
    isStepAnimatingRef.current = false;

    const hide = (el: HTMLElement | null) => {
      if (!el) return;
      gsap.set(el, {
        display: "none",
        x: 0,
        xPercent: 0,
        opacity: 1,
        clearProps: "transform,top,left,right",
      });
    };

    const show = (el: HTMLElement | null) => {
      if (!el) return;
      gsap.set(el, {
        display: "grid",
        position: "relative",
        x: 0,
        xPercent: 0,
        opacity: 1,
        clearProps: "transform,top,left,right",
      });
    };

    hide(calendarEl);
    hide(timesEl);
    hide(slotsEl);
    hide(contactEl);

    if (isMobile) {
      if (step === "calendar") show(calendarEl);
      if (step === "times") show(timesEl);
      if (step === "contact") show(contactEl);
      return;
    }

    if (step === "slots") show(slotsEl);
    if (step === "contact") show(contactEl);
  }

  function animateHomePanels(
    direction: "forward" | "back",
    fromEl: HTMLElement,
    toEl: HTMLElement,
    onComplete?: () => void,
  ) {
    stepTweenRef.current?.kill();
    isStepAnimatingRef.current = true;

    const duration = 0.42;
    const ease = "power2.inOut";

    if (stepViewportRef.current) {
      stepViewportRef.current.style.overflowX = "hidden";
    }

    if (direction === "forward") {
      gsap.set(fromEl, { display: "grid", position: "relative", xPercent: 0, opacity: 1 });
      gsap.set(toEl, {
        display: "grid",
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        xPercent: 100,
        opacity: 1,
      });

      const tl = gsap.timeline({
        onComplete: () => {
          gsap.set(fromEl, { display: "none", clearProps: "transform,opacity" });
          gsap.set(toEl, {
            position: "relative",
            clearProps: "transform,top,left,right,opacity",
          });
          if (stepViewportRef.current) {
            stepViewportRef.current.style.overflowX = "";
          }
          isStepAnimatingRef.current = false;
          onComplete?.();
        },
      });

      tl.to(fromEl, { xPercent: -100, opacity: 0.45, duration, ease }, 0).to(
        toEl,
        { xPercent: 0, duration, ease },
        0,
      );

      stepTweenRef.current = tl;
      return;
    }

    gsap.set(fromEl, { display: "grid", position: "relative", xPercent: 0, opacity: 1 });
    gsap.set(toEl, {
      display: "grid",
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      xPercent: -100,
      opacity: 0.45,
    });

    const tl = gsap.timeline({
      onComplete: () => {
        gsap.set(fromEl, { display: "none", clearProps: "transform,opacity" });
        gsap.set(toEl, {
          position: "relative",
          opacity: 1,
          clearProps: "transform,top,left,right",
        });
        if (stepViewportRef.current) {
          stepViewportRef.current.style.overflowX = "";
        }
        isStepAnimatingRef.current = false;
        onComplete?.();
      },
    });

    tl.to(fromEl, { xPercent: 100, opacity: 0.45, duration, ease }, 0).to(
      toEl,
      { xPercent: 0, opacity: 1, duration, ease },
      0,
    );

    stepTweenRef.current = tl;
  }

  useEffect(() => {
    if (meetingType === "online") {
      setFormData((prev) => ({ ...prev, address: "" }));
    }
  }, [meetingType]);

  useEffect(() => {
    if (!selectedDate) {
      setSelectedTime("");
    }
  }, [selectedDate]);

  useEffect(() => {
    if (!selectedDate) return;

    const timeIsValid =
      selectedTime &&
      availableTimes.includes(selectedTime) &&
      !isTimeLocallyDisabled(selectedDate, selectedTime);

    if (timeIsValid) return;

    if (isEmbedded) {
      setSelectedTime("");
      return;
    }

    const firstEnabledTime = availableTimes.find((time) => !isTimeLocallyDisabled(selectedDate, time));
    setSelectedTime(firstEnabledTime ?? "");
  }, [availableTimes, selectedDate, selectedTime, locallyDisabledSlots, isEmbedded]);

  useEffect(() => {
    if (!isContactComplete) {
      animatedSectionsRef.current.delete("meeting-type");
      animatedSectionsRef.current.delete("address");
      animatedSectionsRef.current.delete("day-picker");
      animatedSectionsRef.current.delete("time-picker");
      animatedSectionsRef.current.delete("submit");
    }
  }, [isContactComplete]);

  useEffect(() => {
    if (!showTimePicker) {
      animatedSectionsRef.current.delete("time-picker");
      animatedSectionsRef.current.delete("submit");
    }
  }, [showTimePicker]);

  useEffect(() => {
    if (!showAddressField) {
      animatedSectionsRef.current.delete("address");
    }
  }, [showAddressField]);

  useEffect(() => {
    if (!showSocialProfileToggle || hasSocialProfiles) return;
    animatedSectionsRef.current.delete("notes");
    setFormData((prev) => ({ ...prev, notes: "" }));
  }, [hasSocialProfiles, showSocialProfileToggle]);

  useEffect(() => {
    if (isLoadingSlots) return;
    const root = rootRef.current;
    if (!root) return;

    const els = Array.from(
      root.querySelectorAll<HTMLElement>("[data-consult-animate-key]"),
    ).filter((el) => {
      const key = el.dataset.consultAnimateKey;
      return key && !animatedSectionsRef.current.has(key);
    });

    if (!els.length) return;

    els.forEach((el) => {
      const key = el.dataset.consultAnimateKey;
      if (key) animatedSectionsRef.current.add(key);
    });

    gsap.set(els, { opacity: 0, y: 28 });
    const tween = gsap.to(els, {
      opacity: 1,
      y: 0,
      duration: 0.48,
      stagger: 0.09,
      ease: "back.out(1.3)",
    });

    return () => {
      tween.kill();
    };
  }, [
    isLoadingSlots,
    isContactComplete,
    showMeetingTypePicker,
    showAddressField,
    showTimePicker,
    showDayPicker,
    showContactAfterSlotSelection,
    embeddedShowSlotsFirst,
    bookingStep,
    hasSocialProfiles,
    showSocialProfileToggle,
  ]);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    const willRedirect = Boolean(successRedirectPath);
    if (willRedirect) {
      startLoadingOverlay();
    }

    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/consultation/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          company: formData.company.trim() || undefined,
          notes: formData.notes.trim() || undefined,
          date: selectedDate,
          time: selectedTime,
          source,
          sourcePage,
          pagePath,
          orderId,
          meetingType: showOnSiteOption ? meetingType : "online",
          address: showOnSiteOption && meetingType === "in_person" ? formData.address.trim() : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Booking failed");
      }

      const booking = data.booking as BookedPayload;
      trackAnalyticsEvent("cta_click", analyticsPath, {
        cta_id:
          analyticsCtaId ??
          (source === "checkout" ? "checkout_consultation_submit" : "consultation_submit"),
      });

      if (metaLead) {
        const nameParts = formData.name.trim().split(/\s+/);
        trackMetaLead({
          content_name: metaLead.contentName,
          page_path: analyticsPath,
          lead_source: metaLead.leadSource,
          user: {
            email: formData.email,
            phone: formData.phone,
            firstName: nameParts[0],
            lastName: nameParts.length > 1 ? nameParts.slice(1).join(" ") : undefined,
          },
        });
      }

      await flushAnalyticsEventsAsync();
      onBooked?.(booking);

      if (successRedirectPath) {
        writeConsultationLeadSuccess({
          id: booking.id,
          date: booking.date,
          time: booking.time,
          timezone: booking.timezone ?? "Europe/Sofia",
          calendarUrl: booking.calendarUrl,
          meetUrl: booking.meetUrl,
          meetingType: booking.meetingType,
        });
        router.push(successRedirectPath);
        return;
      }

      toast.success("Консултацията е запазена успешно.");
      setLocallyDisabledSlots((prev) => {
        const next = { ...prev };
        const dateSlots = new Set(next[booking.date] ?? []);
        dateSlots.add(booking.time);
        next[booking.date] = dateSlots;
        return next;
      });
      setFormData({
        name: "",
        email: "",
        phone: "",
        company: "",
        notes: "",
        address: "",
      });
      setMeetingType("online");
    } catch (err) {
      if (willRedirect) {
        cancelLoadingOverlay();
      }
      const message = err instanceof Error ? err.message : "Неуспешно запазване.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const meetingTypeButtonClass = (type: "online" | "in_person") =>
    cn(
      "text-sm font-semibold transition-all",
      isEmbedded ? "h-11 rounded-xl px-3" : "rounded-md border px-3 py-2",
      isEmbedded
        ? meetingType === type
          ? "bg-accent text-accent-foreground shadow-md"
          : "bg-background/80 text-foreground hover:bg-background"
        : meetingType === type
          ? "border-primary bg-primary/10 text-primary"
          : "border-border hover:border-primary/40",
      !isEmbedded && "border",
    );

  const dayButtonClass = (day: SlotDay) =>
    cn(
      "text-sm font-semibold transition-all",
      isEmbedded ? "h-11 rounded-xl px-3" : "rounded-md border px-3 py-2",
      isEmbedded
        ? selectedDate === day.date
          ? "bg-accent text-accent-foreground shadow-md"
          : "bg-background/80 text-foreground hover:bg-background"
        : selectedDate === day.date
          ? "border-primary bg-primary/10 text-primary"
          : "border-border hover:border-primary/40",
      !isEmbedded && "border",
      day.availableTimes.length === 0 && "cursor-not-allowed opacity-50",
    );

  const timeButtonClass = (time: string) =>
    cn(
      "text-sm font-semibold transition-all",
      isEmbedded ? "h-11 rounded-xl px-3" : "rounded-md px-3 py-1.5",
      isEmbedded
        ? selectedTime === time
          ? "bg-accent text-accent-foreground shadow-md"
          : "bg-background/80 text-foreground hover:bg-background"
        : selectedTime === time
          ? "border-primary bg-primary/10 text-primary"
          : "border-border hover:border-primary/40",
      !isEmbedded && "border",
      isTimeLocallyDisabled(selectedDate, time) &&
      "cursor-not-allowed opacity-50 line-through hover:border-border",
    );

  const embeddedInputClass =
    "h-12 border-0 bg-background shadow-sm ring-1 ring-foreground/[0.06] focus-visible:ring-accent/30";
  const embeddedTextareaClass =
    "min-h-28 resize-none border-0 bg-background shadow-sm ring-1 ring-foreground/[0.06] focus-visible:ring-accent/30";

  const dayPickerSection = showDayPicker ? (
    <div
      data-consult-animate-key="day-picker"
      className={cn(
        "opacity-0 translate-y-10",
        isEmbedded ? undefined : "space-y-2",
      )}
    >
      {isEmbedded ? (
        <ConsultationSlotCalendar
          days={days}
          selectedDate={selectedDate}
          onSelectDate={handleDateSelect}
        />
      ) : (
        <>
          <p className="text-sm font-medium">Изберете ден</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {days.map((day) => (
              <button
                key={day.date}
                type="button"
                onClick={() => setSelectedDate(day.date)}
                className={dayButtonClass(day)}
                disabled={day.availableTimes.length === 0}
              >
                {formatDisplayDate(day.date, variant)}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  ) : null;

  const timeSlotsContent = (
    <div className={cn(isEmbedded ? "grid grid-cols-3 gap-2 md:grid-cols-4" : "flex flex-wrap gap-2")}>
      {availableTimes.map((time) => (
        <button
          key={time}
          type="button"
          onClick={() => handleTimeSelect(time)}
          className={timeButtonClass(time)}
          disabled={isTimeLocallyDisabled(selectedDate, time)}
        >
          {time}
        </button>
      ))}
      {availableTimes.length === 0 && (
        <p className="text-sm text-muted-foreground">Няма свободни часове за избрания ден.</p>
      )}
    </div>
  );

  const timePickerSection = showTimePicker ? (
    <div data-consult-animate-key="time-picker" className="space-y-2 opacity-0 translate-y-10">
      {isEmbedded ? (
        <Label>Свободни часове</Label>
      ) : (
        <p className="text-sm font-medium">Изберете час</p>
      )}
      {timeSlotsContent}
    </div>
  ) : null;

  const mobileTimesSection = (
    <div className="grid gap-5">
      <div className="space-y-3">
        <h3 className="font-heading text-2xl font-bold tracking-tight text-foreground">
          Изберете час
        </h3>
        {selectedDate ? (
          <p className="text-sm text-muted-foreground">
            {formatDisplayDate(selectedDate, variant)}
          </p>
        ) : null}
        <button
          type="button"
          onClick={handleBackToCalendar}
          className="text-sm font-medium text-accent transition-colors hover:text-accent/80"
        >
          ← Промени ден
        </button>
      </div>
      <div data-consult-animate-key="time-picker" className="space-y-2">
        <Label>Свободни часове</Label>
        {timeSlotsContent}
      </div>
    </div>
  );

  const submitSection =
    showTimePicker && showContactAfterSlotSelection ? (
      <div data-consult-animate-key="submit" className="opacity-0 translate-y-10">
        <Button
          type="button"
          onClick={() => void handleSubmit()}
          disabled={
            isSubmitting ||
            !selectedDate ||
            !selectedTime ||
            !isContactComplete ||
            !isAddressValid ||
            availableTimes.length === 0 ||
            isTimeLocallyDisabled(selectedDate, selectedTime)
          }
          className={cn(
            "w-full",
            isEmbedded &&
            "h-14 rounded-full bg-primary text-base font-semibold text-primary-foreground hover:bg-primary/90",
          )}
        >
          {isSubmitting ? "Запазване..." : submitLabel}
        </Button>
      </div>
    ) : null;

  const homeContactSection = (
    <div className="grid gap-5">
      <div className="space-y-3">
        <h3 className="font-heading text-2xl font-bold tracking-tight text-foreground">
          Попълни данните си
        </h3>
        {selectedDate && selectedTime ? (
          <p className="text-sm text-muted-foreground">
            {formatDisplayDate(selectedDate, variant)}, {selectedTime} ч.
          </p>
        ) : null}
        <button
          type="button"
          onClick={handleBackToSlots}
          className="text-sm font-medium text-accent transition-colors hover:text-accent/80"
        >
          ← Промени час
        </button>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="consult-name">Две имена</Label>
        <Input
          id="consult-name"
          name="name"
          value={formData.name}
          onChange={onInputChange}
          placeholder="Иван Иванов"
          className={cn(embeddedInputClass, "h-12")}
          required
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="consult-email">Имейл</Label>
        <Input
          id="consult-email"
          name="email"
          type="email"
          value={formData.email}
          onChange={onInputChange}
          placeholder="ivan@example.com"
          className={cn(embeddedInputClass, "h-12")}
          required
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="consult-company">Уебсайт / Онлайн магазин</Label>
        <Input
          id="consult-company"
          name="company"
          value={formData.company}
          onChange={onInputChange}
          placeholder="https://example.com"
          className={cn(embeddedInputClass, "h-12")}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="consult-notes">
          Какво се опитваш да постигнеш / как можем да ти помогнем?
        </Label>
        <Textarea
          id="consult-notes"
          name="notes"
          value={formData.notes}
          onChange={onInputChange}
          placeholder="Разкажи накратко за целта си и какво искаш да постигнеш."
          rows={4}
          className={embeddedTextareaClass}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="consult-phone">Телефонен номер</Label>
        <Input
          id="consult-phone"
          name="phone"
          value={formData.phone}
          onChange={onInputChange}
          placeholder="0888 123 456"
          className={cn(embeddedInputClass, "h-12")}
          required
        />
      </div>
    </div>
  );

  const contactSection = (
    <>
      <div
        data-consult-animate-key="contact"
        className={cn(
          "opacity-0 translate-y-10",
          isEmbedded ? "grid gap-5" : "grid grid-cols-1 gap-4 sm:grid-cols-2",
        )}
      >
        {showContactAfterSlotSelection && isEmbedded && !isHomeSlotsFlow ? (
          <div className="grid gap-2">
            <Label htmlFor="consult-name">Име и фамилия</Label>
            <Input
              id="consult-name"
              name="name"
              value={formData.name}
              onChange={onInputChange}
              placeholder="Иван Иванов"
              className={cn(isEmbedded ? embeddedInputClass : undefined, "h-12")}
              required
            />
          </div>
        ) : showContactAfterSlotSelection ? (
          <Input
            name="name"
            value={formData.name}
            onChange={onInputChange}
            placeholder="Име и фамилия"
            required
          />
        ) : null}

        {showContactAfterSlotSelection && isEmbedded && !isHomeSlotsFlow ? (
          <div className="grid gap-5 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="consult-phone">Телефон</Label>
              <Input
                id="consult-phone"
                name="phone"
                value={formData.phone}
                onChange={onInputChange}
                placeholder="0888 123 456"
                className={cn(isEmbedded ? embeddedInputClass : undefined, "h-12")}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="consult-email">Имейл</Label>
              <Input
                id="consult-email"
                name="email"
                type="email"
                value={formData.email}
                onChange={onInputChange}
                placeholder="ivan@example.com"
                className={cn(isEmbedded ? embeddedInputClass : undefined, "h-12")}
                required
              />
            </div>
          </div>
        ) : showContactAfterSlotSelection ? (
          <>
            <Input
              name="phone"
              value={formData.phone}
              onChange={onInputChange}
              placeholder="Телефон"
              required
            />
            <Input
              name="email"
              type="email"
              value={formData.email}
              onChange={onInputChange}
              placeholder="Имейл"
              required
            />
            {showCompanyField ? (
              <Input
                name="company"
                value={formData.company}
                onChange={onInputChange}
                placeholder="Фирма (по избор)"
              />
            ) : null}
          </>
        ) : null}
      </div>

      {showContactAfterSlotSelection && isEmbedded && showSocialProfileToggle ? (
        <div
          data-consult-animate-key="social-toggle"
          className="flex items-center gap-3 opacity-0 translate-y-10"
        >
          <Checkbox
            id="consult-has-social"
            checked={hasSocialProfiles}
            onCheckedChange={(checked) => setHasSocialProfiles(checked === true)}
          />
          <Label htmlFor="consult-has-social" className="cursor-pointer font-normal">
            {socialProfileToggleLabel}
          </Label>
        </div>
      ) : null}

      {showContactAfterSlotSelection && showSocialProfileLinkField ? (
        <div data-consult-animate-key="notes" className="grid gap-2 opacity-0 translate-y-10">
          <Label htmlFor="consult-notes">{notesLabel}</Label>
          <Input
            id="consult-notes"
            name="notes"
            value={formData.notes}
            onChange={onInputChange}
            placeholder={notesPlaceholder}
            className={cn(embeddedInputClass, "h-12")}
          />
        </div>
      ) : null}

      {showContactAfterSlotSelection && showMeetingTypePicker ? (
        <div data-consult-animate-key="meeting-type" className="space-y-2 opacity-0 translate-y-10">
          <Label>Формат на срещата</Label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setMeetingType("online")}
              className={meetingTypeButtonClass("online")}
            >
              Онлайн
            </button>
            <button
              type="button"
              onClick={() => setMeetingType("in_person")}
              className={meetingTypeButtonClass("in_person")}
            >
              На място в София
            </button>
          </div>
        </div>
      ) : null}

      {showContactAfterSlotSelection && showAddressField ? (
        <div data-consult-animate-key="address" className="grid gap-2 opacity-0 translate-y-10">
          <Label htmlFor="consult-address">Адрес в София</Label>
          <Input
            id="consult-address"
            name="address"
            value={formData.address}
            onChange={onInputChange}
            placeholder="ул. Примерна 1"
            className={cn(isEmbedded ? embeddedInputClass : undefined, "h-12")}
            required
          />
        </div>
      ) : null}

      {showContactAfterSlotSelection && !isEmbedded && showNotesField ? (
        <div data-consult-animate-key="notes" className="opacity-0 translate-y-10">
          <Textarea
            name="notes"
            value={formData.notes}
            onChange={onInputChange}
            placeholder={notesPlaceholder}
            rows={3}
          />
        </div>
      ) : null}
    </>
  );

  const formContent = isLoadingSlots ? (
    <div className="flex items-center justify-center py-10">
      <div className="h-7 w-7 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  ) : isHomeSlotsFlow ? (
    <div ref={stepViewportRef} className="relative w-full overflow-x-hidden">
      {isMobile ? (
        <>
          <div ref={calendarStepRef} className="grid w-full gap-5">
            {dayPickerSection}
          </div>

          <div ref={timesStepRef} className="hidden w-full gap-5">
            {mobileTimesSection}
          </div>
        </>
      ) : (
        <div ref={slotsStepRef} className="grid w-full gap-5">
          {dayPickerSection}
          {showTimePickerInDesktopSlots ? timePickerSection : null}
        </div>
      )}

      <div ref={contactStepRef} className="hidden w-full gap-5">
        {homeContactSection}
        {error ? <p className="text-sm text-red-500">{error}</p> : null}
        {selectedTime ? (
          <Button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={
              isSubmitting ||
              !selectedDate ||
              !selectedTime ||
              !isContactComplete ||
              !isAddressValid ||
              availableTimes.length === 0 ||
              isTimeLocallyDisabled(selectedDate, selectedTime)
            }
            className="h-14 w-full rounded-full bg-primary text-base font-semibold text-primary-foreground hover:bg-primary/90"
          >
            {isSubmitting ? "Запазване..." : submitLabel}
          </Button>
        ) : null}
      </div>
    </div>
  ) : (
    <div className={cn(isEmbedded ? "grid gap-5" : "space-y-6")}>
      {embeddedShowSlotsFirst ? (
        <>
          {dayPickerSection}
          {timePickerSection}
          {contactSection}
        </>
      ) : (
        <>
          {contactSection}
          {dayPickerSection}
          {timePickerSection}
        </>
      )}

      {error ? <p className="text-sm text-red-500">{error}</p> : null}
      {submitSection}
    </div>
  );

  if (isEmbedded) {
    return (
      <div ref={rootRef} className={className}>
        {formContent}
      </div>
    );
  }

  return (
    <Card ref={rootRef} className={cn("border-border bg-card", className)}>
      <CardHeader>
        <CardTitle className="text-xl">{title}</CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent>{formContent}</CardContent>
    </Card>
  );
}
