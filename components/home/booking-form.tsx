import { CheckCircle2 } from "lucide-react";
import ConsultationBookingForm from "@/components/consultation/consultation-booking-form";

export function BookingForm() {
  return (
    <section id="booking" className="container mx-auto px-4 py-20 md:px-8 md:py-28">
      <div className="grid gap-10 rounded-[2.5rem] border border-border bg-card p-6 md:p-12 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-card px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-accent">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            Безплатна консултация
          </span>
          <h2 className="mt-5 font-heading text-3xl font-bold tracking-tight text-foreground md:text-5xl">
            Запази своя час
          </h2>
          <p className="mt-4 text-muted-foreground md:text-lg">
            Попълни формата и нека обсъдим следващата стъпка за твоя бизнес.
          </p>

          <ul className="mt-8 space-y-3 text-sm text-foreground">
            {[
              "30 минути разговор – без ангажимент",
              "Получаваш прозрачна оферта в рамките на 48 часа",
              "Реален човек на телефона, не бот",
            ].map((t) => (
              <li key={t} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>

        <ConsultationBookingForm
          source="public"
          variant="embedded"
          className="rounded-3xl border border-border bg-background p-6 md:p-8"
          showCompanyField={false}
          showNotesField={false}
          submitLabel="Потвърди консултацията"
          analyticsPath="/"
          analyticsCtaId="home_booking_submit"
        />
      </div>
    </section>
  );
}
