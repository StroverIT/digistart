import type { Redirect } from "next/dist/lib/load-custom-routes";

export type ShortLinkPlatform = "instagram" | "facebook" | "other";

export type ShortLinkUtm = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content: string;
};

export type ShortLinkDefinition = {
  path: string;
  label: string;
  platform: ShortLinkPlatform;
  destinationPath: string;
  permanent: boolean;
  utm: ShortLinkUtm;
};

export const SHORT_LINK_PLATFORM_LABELS: Record<ShortLinkPlatform, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  other: "Директен линк",
};

/**
 * Short links for bio / social profiles. Social entries append UTM params so
 * UtmTracker can attribute traffic in the admin analytics dashboard.
 */
export const SHORT_LINK_DEFINITIONS: ShortLinkDefinition[] = [
  {
    path: "/gnewsletter",
    label: "Newsletter",
    platform: "other",
    destinationPath: "/google/newsletter",
    permanent: true,
    utm: {
      utm_content: "gnewsletter",
    },
  },
  {
    path: "/gig-newsletter",
    label: "3 безплатни съвета",
    platform: "instagram",
    destinationPath: "/google/three-free-tips",
    permanent: false,
    utm: {
      utm_source: "instagram",
      utm_medium: "social",
      utm_campaign: "three_free_tips",
      utm_content: "gig-newsletter",
    },
  },
  {
    path: "/gfb-newsletter",
    label: "3 безплатни съвета",
    platform: "facebook",
    destinationPath: "/google/three-free-tips",
    permanent: false,
    utm: {
      utm_source: "facebook",
      utm_medium: "social",
      utm_campaign: "three_free_tips",
      utm_content: "gfb-newsletter",
    },
  },
];

function buildShortLinkDestination(definition: ShortLinkDefinition): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(definition.utm)) {
    if (value) params.set(key, value);
  }

  const query = params.toString();
  return query ? `${definition.destinationPath}?${query}` : definition.destinationPath;
}

export const SHORT_LINK_REDIRECTS: Redirect[] = SHORT_LINK_DEFINITIONS.map((definition) => ({
  source: definition.path,
  destination: buildShortLinkDestination(definition),
  permanent: definition.permanent,
}));

export function getShortLinkUtmContent(path: string): string | null {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return SHORT_LINK_DEFINITIONS.find((definition) => definition.path === normalized)?.utm.utm_content ?? null;
}
