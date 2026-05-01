import { BusinessesPageClient } from "@/components/admin/businesses-page-client";

export default function BusinessesPage() {
  return (
    <div className="space-y-6">
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both">
        <h1 className="text-3xl font-bold mb-2">Бизнеси</h1>
        <p className="text-muted-foreground">
          Карта за проучени локални обекти и проследяване на outreach процеса.
        </p>
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 fill-mode-both">
        <BusinessesPageClient />
      </div>
    </div>
  );
}
