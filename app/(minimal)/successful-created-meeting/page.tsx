"use client";

import { Suspense, useEffect, useMemo, useRef, useState, type FC } from "react";
import gsap from "gsap";
import { CalendarPlus, CheckCircle2, Home, Video } from "lucide-react";
import { TrackedCtaLink } from "@/components/analytics/tracked-cta-link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useConfetti } from "@/hooks/use-confetti";
import { buildConsultationGoogleCalendarUrl } from "@/lib/consultation/google-calendar-url";
import {
  formatConsultationDisplayDate,
  readConsultationLeadSuccess,
  type ConsultationLeadSuccess,
} from "@/lib/consultation/lead-success";
import { CONTENT } from "./consts";

const SuccessfulCreatedMeetingContent: FC = () => {
  const { ConfettiRenderer } = useConfetti();
  const rootRef = useRef<HTMLDivElement>(null);
  const [booking, setBooking] = useState<ConsultationLeadSuccess | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!mounted || !rootRef.current) return;

    const ctx = gsap.context(() => {
      const iconWrap = rootRef.current?.querySelector<HTMLElement>("[data-meeting-success-icon]");
      const title = rootRef.current?.querySelector<HTMLElement>("[data-meeting-success-title]");
      const desc = rootRef.current?.querySelector<HTMLElement>("[data-meeting-success-desc]");
      const card = rootRef.current?.querySelector<HTMLElement>("[data-meeting-success-card]");
      const actions = rootRef.current?.querySelector<HTMLElement>("[data-meeting-success-actions]");

      const toReveal = [iconWrap, title, desc, card, actions].filter(
        (el): el is HTMLElement => Boolean(el),
      );
      gsap.set(toReveal, { opacity: 0, y: 36 });

      const tl = gsap.timeline({ defaults: { ease: "back.out(1.5)" } });
      if (iconWrap) {
        gsap.set(iconWrap, { scale: 0.85 });
        tl.to(iconWrap, { opacity: 1, y: 0, scale: 1, duration: 0.55 }, 0.05);
      }
      if (title) tl.to(title, { opacity: 1, y: 0, duration: 0.5 }, "-=0.25");
      if (desc) tl.to(desc, { opacity: 1, y: 0, duration: 0.45 }, "-=0.2");
      if (card) tl.to(card, { opacity: 1, y: 0, duration: 0.5 }, "-=0.15");
      if (actions) tl.to(actions, { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" }, "-=0.2");
    }, rootRef);

    return () => ctx.revert();
  }, [mounted, booking?.id]);

  const calendarUrl = useMemo(() => {
    if (!booking) return null;
    if (booking.calendarUrl) return booking.calendarUrl;

    const meetingLine =
      booking.meetingType === "in_person"
        ? CONTENT.inPersonFormatLabel
        : `${CONTENT.onlineFormatLabel} (Google Meet)`;
    const meetLine = booking.meetUrl ? `\nGoogle Meet: ${booking.meetUrl}` : "";

    return buildConsultationGoogleCalendarUrl({
      title: CONTENT.calendarEventTitleLabel,
      date: booking.date,
      time: booking.time,
      timezone: booking.timezone,
      description: `Формат: ${meetingLine}${meetLine}`,
      location: booking.meetingType === "in_person" ? "София" : booking.meetUrl,
    });
  }, [booking]);

  useEffect(() => {
    setMounted(true);
    setBooking(readConsultationLeadSuccess());
  }, []);

  return (
    <div className="relative flex min-h-dvh items-center justify-center px-4 py-10">
      <ConfettiRenderer active={mounted} className="z-[5]" />

      {!mounted ? (
        <div className="relative z-10 flex min-h-[50vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : (
        <div ref={rootRef} className="relative z-10 mx-auto w-full max-w-2xl text-center">
          <div data-meeting-success-icon className="relative mb-8 translate-y-10 opacity-0">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-green-500/20">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
            </div>
            <div className="absolute inset-0 mx-auto h-24 w-24 animate-ping rounded-full bg-green-500/10" />
          </div>

          <h1
            data-meeting-success-title
            className="mb-4 translate-y-10 text-3xl font-bold opacity-0 sm:text-4xl"
          >
            {CONTENT.titleLabel}
          </h1>

          <p
            data-meeting-success-desc
            className="mx-auto mb-8 max-w-md translate-y-10 text-lg text-muted-foreground opacity-0"
          >
            {CONTENT.descriptionLabel}
          </p>

          {booking ? (
            <Card
              data-meeting-success-card
              className="mb-8 translate-y-10 border-border bg-card text-left opacity-0"
            >
              <CardContent className="space-y-4 p-6">
                <div>
                  <p className="text-sm text-muted-foreground">{CONTENT.dateTimeLabel}</p>
                  <p className="font-medium">
                    {formatConsultationDisplayDate(booking.date)} в {booking.time}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">{CONTENT.formatLabel}</p>
                  <p className="font-medium">
                    {booking.meetingType === "in_person"
                      ? CONTENT.inPersonFormatLabel
                      : CONTENT.onlineFormatLabel}
                  </p>
                </div>

                {booking.meetUrl ? (
                  <div>
                    <p className="text-sm text-muted-foreground">{CONTENT.meetLabel}</p>
                    <a
                      href={booking.meetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 font-medium text-accent hover:underline"
                    >
                      <Video className="h-4 w-4 shrink-0" />
                      {CONTENT.openMeetLinkLabel}
                    </a>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ) : (
            <Card
              data-meeting-success-card
              className="mb-8 translate-y-10 border-border bg-card text-left opacity-0"
            >
              <CardContent className="p-6 text-sm text-muted-foreground">
                {CONTENT.fallbackDetailsLabel}
              </CardContent>
            </Card>
          )}

          <div
            data-meeting-success-actions
            className="flex translate-y-10 flex-col items-center justify-center gap-4 opacity-0 sm:flex-row"
          >
            {calendarUrl ? (
              <Button asChild size="lg" className="glow-primary">
                <a
                  href={calendarUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={CONTENT.calendarAriaLabel}
                >
                  <CalendarPlus className="mr-2 h-5 w-5" />
                  {CONTENT.calendarButtonLabel}
                </a>
              </Button>
            ) : null}

            <TrackedCtaLink href="/" ctaId="successful_created_meeting_home">
              <Button size="lg" variant="secondary">
                <Home className="mr-2 h-5 w-5" />
                {CONTENT.homeButtonLabel}
              </Button>
            </TrackedCtaLink>
          </div>
        </div>
      )}
    </div>
  );
};

const SuccessfulCreatedMeetingPage: FC = () => {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      }
    >
      <SuccessfulCreatedMeetingContent />
    </Suspense>
  );
};

export default SuccessfulCreatedMeetingPage;
