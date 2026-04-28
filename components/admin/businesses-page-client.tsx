"use client";

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

export function BusinessesPageClient() {
  return <LeadTrackerMap />;
}
