import ConsultationBookingForm from "@/components/consultation/consultation-booking-form";

export default function ConsultationPage() {
  return (
    <div id="booking" className="pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8 text-center animate-in fade-in slide-in-from-bottom-6 duration-700 fill-mode-both">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">
            Безплатна консултация
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Резервирайте среща с екипа на DigiStart. Обсъждаме целите ви и
            получавате конкретни препоръки за следващите стъпки.
          </p>
        </div>

        <ConsultationBookingForm source="public" />
      </div>
    </div>
  );
}
