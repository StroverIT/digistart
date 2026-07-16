import Image from "next/image";
import { Clock3 } from "lucide-react";
import ConsultationBookingForm from "@/components/consultation/consultation-booking-form";
import { ProcessStepsContent } from "@/components/home/process-steps";
import { Price } from "@/components/ui/price";
import { LANDING_REVEAL_CLASS } from "@/components/services/service-detail-ready-store-v2/landing-animation-classes";
import {
  SITE_LOGO_HEIGHT,
  SITE_LOGO_SIZES,
  SITE_LOGO_SRC,
  SITE_LOGO_WIDTH,
} from "@/lib/site-brand";
import { cn } from "@/lib/utils";

type BookingFormProps = {
  sourcePage?: string;
  pagePath?: string;
  sectionId?: string;
  analyticsPath?: string;
  analyticsCtaId?: string;
  introTitle?: string;
  title?: string;
  description?: string;
  showProcessSteps?: boolean;
  className?: string;
  metaLead?: {
    contentName: string;
    leadSource?: string;
  };
  showSocialProfileToggle?: boolean;
  notesLabel?: string;
  notesPlaceholder?: string;
  showOnSiteOption?: boolean;
  showBadge?: boolean;
  pricing?: {
    originalPrice: number;
    priceLabel: string;
  };
  /** Stagger title, pricing, description, and form when parent section scrolls into view. */
  animateReveals?: boolean;
};

export function BookingForm({
  sourcePage,
  pagePath,
  sectionId = "booking",
  analyticsPath = "/",
  analyticsCtaId = "home_booking_submit",
  introTitle,
  title = "DigiStart опознавателен разговор за постигане на резултати",
  description = "",
  showProcessSteps = true,
  metaLead,
  showSocialProfileToggle,
  notesLabel,
  notesPlaceholder,
  showOnSiteOption = false,
  showBadge = true,
  pricing,
  className,
  animateReveals = false,
}: BookingFormProps = {}) {
  const showNotesField = Boolean(notesLabel);
  const revealClass = animateReveals ? LANDING_REVEAL_CLASS : undefined;

  return (
    <section
      id={sectionId}
      className={cn("container mx-auto px-4 py-20 md:px-8 md:py-28", className)}
    >
      {introTitle ? (
        <h2 className="mx-auto mb-8 max-w-3xl text-center font-heading text-3xl font-bold tracking-tight text-foreground md:mb-10 md:text-4xl">
          {introTitle}
        </h2>
      ) : null}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-card shadow-[var(--shadow-glow)] ring-1 ring-foreground/[0.04]">
        <div className="relative grid gap-10 p-6 md:p-10 lg:grid-cols-[1fr_1.15fr] lg:items-stretch lg:p-12">
          <div className="flex min-h-full flex-col">
            <div className="flex flex-1 flex-col px-5 py-2 md:px-6 lg:px-8">
              <div className="flex flex-col items-center">
                <div
                  data-animate-reveal={animateReveals ? "" : undefined}
                  className={cn(
                    "flex h-20 w-20 items-center justify-center rounded-2xl bg-card shadow-lg ring-1 ring-border/60",
                    revealClass,
                  )}
                >
                  <Image
                    src={SITE_LOGO_SRC}
                    alt="DigiStart logo"
                    width={SITE_LOGO_WIDTH}
                    height={SITE_LOGO_HEIGHT}
                    sizes={SITE_LOGO_SIZES}
                    className="h-14 w-auto"
                  />
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-5">
                <p
                  data-animate-reveal={animateReveals ? "" : undefined}
                  className={cn(
                    "text-base font-semibold tracking-tight text-foreground md:text-lg",
                    revealClass,
                  )}
                >
                  Емил Златинов
                </p>
                {showBadge ? (
                  <span
                    data-animate-reveal={animateReveals ? "" : undefined}
                    className={cn(
                      "inline-flex w-fit items-center gap-2 rounded-full border border-accent/20 bg-card px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-accent",
                      revealClass,
                    )}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                    Безплатна консултация
                  </span>
                ) : null}
                <h2
                  data-animate-reveal={animateReveals ? "" : undefined}
                  className={cn(
                    "font-heading text-xl font-bold leading-snug tracking-tight text-foreground md:text-2xl",
                    revealClass,
                  )}
                >
                  {title}
                </h2>
                <p
                  data-animate-reveal={animateReveals ? "" : undefined}
                  className={cn(
                    "inline-flex items-center gap-2 text-base font-semibold text-foreground/85 md:text-lg",
                    revealClass,
                  )}
                >
                  <Clock3 className="h-5 w-5 text-accent" />
                  30 минути
                </p>
                {pricing ? (
                  <div
                    data-animate-reveal={animateReveals ? "" : undefined}
                    className={cn("flex flex-wrap items-center gap-3", revealClass)}
                  >
                    <Price
                      value={pricing.originalPrice}
                      className="text-2xl text-destructive line-through decoration-destructive decoration-2 md:text-3xl"
                    />
                    <span className="font-heading text-2xl font-bold text-accent md:text-3xl">
                      {pricing.priceLabel}
                    </span>
                  </div>
                ) : null}
                {description ? (
                  <p
                    data-animate-reveal={animateReveals ? "" : undefined}
                    className={cn("text-muted-foreground md:text-lg", revealClass)}
                  >
                    {description}
                  </p>
                ) : null}
              </div>
            </div>

            {showProcessSteps ? (
              <div className="mt-10 border-t border-border/60 px-5 pt-10 md:px-6 lg:px-8">
                <ProcessStepsContent variant="embedded" />
              </div>
            ) : null}
          </div>

          <div
            data-animate-reveal={animateReveals ? "" : undefined}
            className={cn(
              "relative min-h-full p-2 md:p-4 lg:border-l lg:border-border/80 lg:pl-10 lg:pr-2",
              revealClass,
            )}
          >
            <ConsultationBookingForm
              source="public"
              sourcePage={sourcePage}
              pagePath={pagePath}
              variant="embedded"
              showCompanyField={false}
              showNotesField={showNotesField}
              showSocialProfileToggle={showSocialProfileToggle}
              notesLabel={notesLabel}
              notesPlaceholder={notesPlaceholder}
              showOnSiteOption={showOnSiteOption}
              submitLabel="Потвърдете консултацията"
              analyticsPath={analyticsPath}
              analyticsCtaId={analyticsCtaId}
              metaLead={metaLead}
              embeddedShowSlotsFirst={sectionId == "booking"}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
