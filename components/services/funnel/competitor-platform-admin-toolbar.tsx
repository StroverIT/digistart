"use client";

import { RefreshCw } from "lucide-react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { useCompetitorPlatformSelection } from "@/components/services/funnel/use-competitor-platform-selection";
import { getCompetitorPlatformDisplayLabel } from "@/lib/funnel/competitor-platform-personalization";
import { requestCompetitorPlatformPickerReopen } from "@/lib/funnel/competitor-platform";

type CompetitorPlatformAdminToolbarProps = {
  funnelId: string;
};

export function CompetitorPlatformAdminToolbar({ funnelId }: CompetitorPlatformAdminToolbarProps) {
  const { data: session } = useSession();
  const { answer, hydrated } = useCompetitorPlatformSelection(funnelId);

  const isAdmin = session?.user?.role === "admin";
  if (!isAdmin || !hydrated) return null;

  const currentLabel = answer ? getCompetitorPlatformDisplayLabel(answer) : null;

  return (
    <div className="fixed bottom-4 left-1/2 z-60 flex -translate-x-1/2 items-center gap-2 rounded-full border border-border bg-background/95 px-3 py-2 shadow-lg backdrop-blur-sm">
      <span className="hidden text-xs font-medium text-muted-foreground sm:inline">Admin преглед</span>
      <span className="rounded-full bg-accent/15 px-2.5 py-1 text-xs font-semibold text-accent ring-1 ring-accent/25">
        {currentLabel ?? "Няма избрана платформа"}
      </span>
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="h-8 rounded-full px-3 text-xs"
        onClick={() => requestCompetitorPlatformPickerReopen(funnelId)}
      >
        <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
        Смени платформата
      </Button>
    </div>
  );
}
