import ConsultationBookingForm from "@/components/consultation/consultation-booking-form";
import { ProcessStepsContent } from "@/components/home/process-steps";
import { Price } from "@/components/ui/price";
import { cn } from "@/lib/utils";

type BookingFormProps = {
  sourcePage?: string;
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
};

export function BookingForm({
  sourcePage,
  sectionId = "booking",
  analyticsPath = "/",
  analyticsCtaId = "home_booking_submit",
  introTitle,
  title = "Запази своя час",
  description = "Попълни формата и нека обсъдим следващата стъпка за твоя бизнес.",
  showProcessSteps = true,
  metaLead,
  showSocialProfileToggle,
  notesLabel,
  notesPlaceholder,
  showOnSiteOption = true,
  showBadge = true,
  pricing,
  className,
}: BookingFormProps = {}) {
  const showNotesField = Boolean(notesLabel);

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
        <div className="relative grid gap-10 p-6 md:p-10 lg:grid-cols-[1fr_1.15fr] lg:items-start lg:p-12">
          <div>
            {showBadge ? (
              <span className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-card px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-accent">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                Безплатна консултация
              </span>
            ) : null}
            <h2
              className={cn(
                "font-heading text-3xl font-bold tracking-tight text-foreground md:text-5xl",
                showBadge ? "mt-5" : undefined,
              )}
            >
              {title}
            </h2>
            {pricing ? (
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Price
                  value={pricing.originalPrice}
                  className="text-2xl text-destructive line-through decoration-destructive decoration-2 md:text-3xl"
                />
                <span className="font-heading text-2xl font-bold text-accent md:text-3xl">
                  {pricing.priceLabel}
                </span>
              </div>
            ) : null}
            <p className="mt-4 max-w-md text-muted-foreground md:text-lg">{description}</p>

            {showProcessSteps ? (
              <div className="mt-10 border-t border-border/60 pt-10">
                <ProcessStepsContent variant="embedded" />
              </div>
            ) : null}
          </div>

          <div className="p-2 md:p-4 lg:p-2">
            <ConsultationBookingForm
              source="public"
              sourcePage={sourcePage}
              variant="embedded"
              showCompanyField={false}
              showNotesField={showNotesField}
              showSocialProfileToggle={showSocialProfileToggle}
              notesLabel={notesLabel}
              notesPlaceholder={notesPlaceholder}
              showOnSiteOption={showOnSiteOption}
              submitLabel="Потвърди консултацията"
              analyticsPath={analyticsPath}
              analyticsCtaId={analyticsCtaId}
              metaLead={metaLead}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
