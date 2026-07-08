import { cn } from "@/lib/utils";

export type RankedStatItem = {
  id: string;
  label: string;
  count: number;
  subtitle?: string;
  badge?: string;
};

type RankedStatsListProps = {
  items: RankedStatItem[];
  emptyMessage: string;
  countLabel?: string;
  showRank?: boolean;
  showBar?: boolean;
  className?: string;
};

export function RankedStatsList({
  items,
  emptyMessage,
  countLabel = "пъти",
  showRank = true,
  showBar = true,
  className,
}: RankedStatsListProps) {
  if (items.length === 0) {
    return <p className="text-muted-foreground text-sm">{emptyMessage}</p>;
  }

  const maxCount = Math.max(...items.map((item) => item.count), 1);

  return (
    <div className={cn("space-y-2", className)}>
      {items.map((item, index) => {
        const barWidth = Math.round((item.count / maxCount) * 100);

        return (
          <div
            key={item.id}
            className="rounded-md border border-border p-3 space-y-2"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2 min-w-0">
                {showRank ? (
                  <span
                    className={cn(
                      "shrink-0 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold tabular-nums",
                      index === 0
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {index + 1}
                  </span>
                ) : null}
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    {item.badge ? (
                      <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                        {item.badge}
                      </span>
                    ) : null}
                    <p className="font-medium text-sm">{item.label}</p>
                  </div>
                  {item.subtitle ? (
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{item.subtitle}</p>
                  ) : null}
                </div>
              </div>
              <p className="text-primary font-semibold tabular-nums shrink-0">
                {item.count} {countLabel}
              </p>
            </div>
            {showBar ? (
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary/80 transition-all"
                  style={{ width: `${barWidth}%` }}
                />
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
