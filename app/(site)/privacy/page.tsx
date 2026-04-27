import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Политика за поверителност",
  description: "Как обработваме личните ви данни.",
};

export default function PrivacyPage() {
  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-3xl font-bold mb-6">Политика за поверителност</h1>
        <p className="text-muted-foreground">
          Тази страница ще бъде допълнена с пълния текст на политиката за поверителност.
          При въпроси се свържете с нас чрез контактите в сайта.
        </p>
      </div>
    </div>
  );
}
