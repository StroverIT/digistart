import type { ShortLinkPlatform } from "@/config/short-links";
import { SHORT_LINK_DEFINITIONS, SHORT_LINK_PLATFORM_LABELS } from "@/config/short-links";
import type { Prisma } from "@prisma/client";
import type { ShortLinkTrafficAggregate } from "@/lib/analytics/types";

type UtmLandingRow = {
  createdAt: Date;
  utmPayload: Prisma.JsonValue;
};

function readUtmContent(payload: Prisma.JsonValue): string | null {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return null;
  const content = (payload as Record<string, unknown>).utm_content;
  return typeof content === "string" && content.trim().length > 0 ? content.trim() : null;
}

export function buildEmptyShortLinkTraffic(): ShortLinkTrafficAggregate {
  return {
    totalViews: 0,
    byPlatform: { instagram: 0, facebook: 0, other: 0 },
    links: SHORT_LINK_DEFINITIONS.map((definition) => ({
      path: definition.path,
      label: definition.label,
      platform: definition.platform,
      destinationPath: definition.destinationPath,
      views: 0,
      dailyViews: [],
    })),
    dailyByLink: [],
  };
}

export function buildShortLinkTrafficStats(rows: UtmLandingRow[]): ShortLinkTrafficAggregate {
  const viewsByContent = new Map<string, number>();
  const dailyByContent = new Map<string, Map<string, number>>();

  for (const row of rows) {
    const content = readUtmContent(row.utmPayload);
    if (!content) continue;

    viewsByContent.set(content, (viewsByContent.get(content) ?? 0) + 1);

    const date = row.createdAt.toISOString().split("T")[0];
    const dailyMap = dailyByContent.get(content) ?? new Map<string, number>();
    dailyMap.set(date, (dailyMap.get(date) ?? 0) + 1);
    dailyByContent.set(content, dailyMap);
  }

  const links = SHORT_LINK_DEFINITIONS.map((definition) => {
    const content = definition.utm.utm_content;
    const views = viewsByContent.get(content) ?? 0;
    const dailyMap = dailyByContent.get(content);
    const dailyViews = dailyMap
      ? Array.from(dailyMap.entries())
          .map(([date, dayViews]) => ({ date, views: dayViews }))
          .sort((a, b) => a.date.localeCompare(b.date))
      : [];

    return {
      path: definition.path,
      label: definition.label,
      platform: definition.platform,
      destinationPath: definition.destinationPath,
      views,
      dailyViews,
    };
  });

  const sumPlatform = (platform: ShortLinkPlatform) =>
    links.filter((link) => link.platform === platform).reduce((sum, link) => sum + link.views, 0);

  const dailyByLink = links.flatMap((link) =>
    link.dailyViews.map((entry) => ({
      date: entry.date,
      path: link.path,
      label: `${SHORT_LINK_PLATFORM_LABELS[link.platform]} · ${link.label}`,
      views: entry.views,
    })),
  );

  return {
    totalViews: links.reduce((sum, link) => sum + link.views, 0),
    byPlatform: {
      instagram: sumPlatform("instagram"),
      facebook: sumPlatform("facebook"),
      other: sumPlatform("other"),
    },
    links,
    dailyByLink,
  };
}
