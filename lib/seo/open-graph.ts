import type { Metadata } from "next";
import type { PathKey } from "@/lib/data/home-paths";

function resolveSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");
  return "https://digistart.bg";
}

export const SITE_METADATA_BASE = new URL(resolveSiteUrl());

export const OG_COVER = {
  generic: "/sending-covers/og-brand.png",
  homePhysical: "/sending-covers/og-home-physical.png",
  homeOnline: "/sending-covers/og-home-online.png",
  homeHybrid: "/sending-covers/og-home-hybrid.png",
  onlineStore: "/sending-covers/og-online-store.png",
  googleBusiness: "/sending-covers/og-google-business.png",
  socialMedia: "/sending-covers/og-social-media.png",
  ads: "/sending-covers/og-ads.png",
} as const;

export type OgCoverKey = keyof typeof OG_COVER;

const OG_IMAGE_WIDTH = 2400;
const OG_IMAGE_HEIGHT = 1260;

export const HOME_PATH_OG_COVER: Record<PathKey, (typeof OG_COVER)[OgCoverKey]> = {
  online: OG_COVER.homeOnline,
  physical: OG_COVER.homePhysical,
  hybrid: OG_COVER.homeHybrid,
};

export function ogImageMetadata(
  coverKey: OgCoverKey,
  alt: string,
): Pick<Metadata, "openGraph" | "twitter"> {
  const path = OG_COVER[coverKey];

  return {
    openGraph: {
      images: [
        {
          url: path,
          width: OG_IMAGE_WIDTH,
          height: OG_IMAGE_HEIGHT,
          alt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      images: [path],
    },
  };
}
