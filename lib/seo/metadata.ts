import type { Metadata } from "next";

export const NOINDEX_ROBOTS: Metadata["robots"] = {
  index: false,
  follow: false,
  googleBot: {
    index: false,
    follow: false,
    noimageindex: true,
  },
};

const DESCRIPTION_MAX = 155;

/** Clamp a meta description so crawlers do not flag it as too long. */
export function fitMetaDescription(text: string, max = DESCRIPTION_MAX): string {
  const trimmed = text.replace(/\s+/g, " ").trim();
  if (trimmed.length <= max) return trimmed;

  const sliced = trimmed.slice(0, max);
  const lastSpace = sliced.lastIndexOf(" ");
  const cut = lastSpace > 80 ? sliced.slice(0, lastSpace) : sliced;
  return `${cut.replace(/[.,;:–—-]\s*$/, "")}.`;
}
