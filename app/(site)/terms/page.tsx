import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Условия за ползване",
  description: "Общи условия за използване на услугите на DigiStart.",
};

export default function TermsPage() {
  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-3xl font-bold mb-6">Условия за ползване</h1>
        <p className="text-muted-foreground">
          Тази страница ще бъде допълнена с пълните общи условия. При въпроси се свържете
          с нас чрез контактите в сайта.
        </p>
      </div>
    </div>
  );
}
