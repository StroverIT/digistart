import ConsultationBookingForm from "@/components/consultation/consultation-booking-form";
import { ProcessStepsContent } from "@/components/home/process-steps";

export function BookingForm() {
  return (
    <section id="booking" className="container mx-auto px-4 py-20 md:px-8 md:py-28">
      <div className="relative overflow-hidden rounded-[2.5rem] bg-card shadow-[var(--shadow-glow)] ring-1 ring-foreground/[0.04]">
        <div className="relative grid gap-10 p-6 md:p-10 lg:grid-cols-[1fr_1.15fr] lg:items-start lg:p-12">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-card px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-accent">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              Безплатна консултация
            </span>
            <h2 className="mt-5 font-heading text-3xl font-bold tracking-tight text-foreground md:text-5xl">
              Запази своя час
            </h2>
            <p className="mt-4 max-w-md text-muted-foreground md:text-lg">
              Попълни формата и нека обсъдим следващата стъпка за твоя бизнес.
            </p>

            <div className="mt-10 border-t border-border/60 pt-10">
              <ProcessStepsContent variant="embedded" />
            </div>
          </div>

          <div className="p-2 md:p-4 lg:p-2">
            <ConsultationBookingForm
              source="public"
              variant="embedded"
              showCompanyField={false}
              showNotesField={false}
              showOnSiteOption
              submitLabel="Потвърди консултацията"
              analyticsPath="/"
              analyticsCtaId="home_booking_submit"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
