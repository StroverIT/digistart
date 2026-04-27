import dynamic from "next/dynamic";

const LeadTrackerMap = dynamic(
  () => import("@/components/admin/lead-tracker-map").then((mod) => mod.LeadTrackerMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-[70vh] min-h-[560px] rounded-xl border border-border bg-card animate-pulse" />
    ),
  }
);

export default function BusinessesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Бизнеси</h1>
        <p className="text-muted-foreground">
          Карта за проучени локални обекти и проследяване на outreach процеса.
        </p>
      </div>

      <LeadTrackerMap />
    </div>
  );
}
