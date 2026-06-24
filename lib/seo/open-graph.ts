import type { Metadata } from "next";
import type { PathKey } from "@/lib/data/home-paths";

export const SITE_METADATA_BASE = new URL(
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://digistart.bg",
);

export const OG_COVER = {
  generic: "/sending-covers/1-generic.png",
  homePhysical: "/sending-covers/2-home-page-psychical.png",
  homeOnline: "/sending-covers/3-home-page-online.png",
  homeHybrid: "/sending-covers/4-home-page-hybrid.png",
  onlineStore: "/sending-covers/5-online-store.png",
  googleBusiness: "/sending-covers/6-google-business.png",
  socialMedia: "/sending-covers/7-social-media.png",
  ads: "/sending-covers/8-ads.png",
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
