"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SHORT_LINK_PLATFORM_LABELS } from "@/config/short-links";
import type { ShortLinkTrafficAggregate } from "@/lib/analytics/types";
import { RankedStatsList, type RankedStatItem } from "@/components/admin/ranked-stats-list";
import { SocialShortLinksDailyChart } from "@/components/admin/social-short-links-daily-chart";

type SocialShortLinksPanelProps = {
  stats: ShortLinkTrafficAggregate;
};

function buildLinkItems(stats: ShortLinkTrafficAggregate): RankedStatItem[] {
  return stats.links.map((link) => ({
    id: link.path,
    label: `${SHORT_LINK_PLATFORM_LABELS[link.platform]} · ${link.label}`,
    count: link.views,
    subtitle: `${link.path} → ${link.destinationPath}`,
    badge: link.views > 0 && link.platform !== "other" ? SHORT_LINK_PLATFORM_LABELS[link.platform] : undefined,
  }));
}

export function SocialShortLinksPanel({ stats }: SocialShortLinksPanelProps) {
  const linkItems = useMemo(() => buildLinkItems(stats), [stats]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card data-admin-animate className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Общо кликове</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold tabular-nums">{stats.totalViews}</p>
          </CardContent>
        </Card>

        <Card data-admin-animate className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Instagram</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold tabular-nums">{stats.byPlatform.instagram}</p>
          </CardContent>
        </Card>

        <Card data-admin-animate className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Facebook</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold tabular-nums">{stats.byPlatform.facebook}</p>
          </CardContent>
        </Card>
      </div>

      <Card data-admin-animate className="bg-card border-border lg:col-span-2">
        <CardHeader>
          <CardTitle>Линкове от социални мрежи</CardTitle>
          <p className="text-sm text-muted-foreground font-normal">
            Кратки линкове от bio профилите — кой линк колко пъти е отворен
          </p>
        </CardHeader>
        <CardContent>
          <RankedStatsList
            items={linkItems}
            emptyMessage="Все още няма кликове от социални линкове."
            countLabel="клика"
            showRank={false}
          />
        </CardContent>
      </Card>

      <Card data-admin-animate className="bg-card border-border lg:col-span-2">
        <CardHeader>
          <CardTitle>Кликове по дни</CardTitle>
        </CardHeader>
        <CardContent>
          <SocialShortLinksDailyChart data={stats.dailyByLink} />
        </CardContent>
      </Card>
    </div>
  );
}
