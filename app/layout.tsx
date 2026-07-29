import type { Metadata, Viewport } from "next";
import { Inter, Roboto_Slab, Unbounded } from "next/font/google";
import { headers } from "next/headers";
import { DigiStartAnalytics } from "@/components/analytics/digistart-analytics";
import { MetaPixelConsentLoader } from "@/components/analytics/meta-pixel-consent-loader";
import { ComingSoonPage } from "@/components/coming-soon-page";
import { MetaPixelEvents } from "@/components/analytics/meta-pixel-events";
import { UtmTracker } from "@/components/analytics/utm-tracker";
import { Providers } from "@/components/providers";
import { LocalBusinessJsonLd } from "@/components/seo/local-business-json-ld";
import { shouldRenderComingSoonInLayout } from "@/lib/coming-soon";
import { OG_COVER, SITE_METADATA_BASE } from "@/lib/seo/open-graph";
import { Toaster } from "sonner";
import "./globals.css";

const unbounded = Unbounded({
  subsets: ["latin", "cyrillic"],
  variable: "--font-unbounded",
  display: "swap",
  preload: false,
});

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
});

const robotoSlab = Roboto_Slab({
  subsets: ["latin", "cyrillic"],
  variable: "--font-roboto-slab",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: SITE_METADATA_BASE,
  title: {
    default: "Рекламна агенция София | DigiStart",
    template: "%s | DigiStart",
  },
  description:
    "Рекламна агенция в София: онлайн магазини, Google Ads, Meta Ads, SEO, Google Business и социални мрежи за малки бизнеси.",
  keywords: [
    "рекламна агенция",
    "рекламна агенция София",
    "дигитална агенция София",
    "онлайн магазини",
    "Google Business",
    "Google Ads",
    "Meta Ads",
    "SEO",
    "социални мрежи",
    "София",
  ],
  authors: [{ name: "DigiStart" }],
  creator: "DigiStart",
  openGraph: {
    type: "website",
    locale: "bg_BG",
    siteName: "DigiStart",
    title: "Рекламна агенция София | DigiStart",
    description:
      "Google Ads, Meta, SEO, Google Business и онлайн магазини за бизнеси в София",
    images: [
      {
        url: OG_COVER.generic,
        width: 2400,
        height: 1260,
        alt: "Рекламна агенция София | DigiStart",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Рекламна агенция София | DigiStart",
    description:
      "Google Ads, Meta, SEO, Google Business и онлайн магазини за бизнеси в София",
    images: [OG_COVER.generic],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      {
        url: "/favicon-light.ico",
        sizes: "any",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/favicon-dark.ico",
        sizes: "any",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/favicon-light-32.png",
        type: "image/png",
        sizes: "32x32",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/favicon-dark-32.png",
        type: "image/png",
        sizes: "32x32",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/favicon-light-16.png",
        type: "image/png",
        sizes: "16x16",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/favicon-dark-16.png",
        type: "image/png",
        sizes: "16x16",
        media: "(prefers-color-scheme: dark)",
      },
    ],
    shortcut: [
      {
        url: "/favicon-light.ico",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/favicon-dark.ico",
        media: "(prefers-color-scheme: dark)",
      },
    ],
    apple: [
      {
        url: "/apple-touch-icon-light.png",
        sizes: "180x180",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/apple-touch-icon-dark.png",
        sizes: "180x180",
        media: "(prefers-color-scheme: dark)",
      },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#1a1a2e",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headerList = await headers();
  const pathname = headerList.get("x-pathname") ?? "/";
  const showComingSoon = shouldRenderComingSoonInLayout(pathname);

  return (
    <html lang="bg" className="bg-background overflow-x-clip">
      <body
        className={`${inter.variable} ${unbounded.variable} ${robotoSlab.variable} font-sans antialiased overflow-x-clip overscroll-x-none`}
      >
        {showComingSoon ? (
          <>
            <UtmTracker />
            <ComingSoonPage />
            <MetaPixelEvents />
            <Toaster richColors position="top-center" />
          </>
        ) : (
          <>
            <LocalBusinessJsonLd />
            <UtmTracker />
            <DigiStartAnalytics />
            <MetaPixelConsentLoader />
            <MetaPixelEvents />
            <Providers>{children}</Providers>
          </>
        )}
      </body>
    </html>
  );
}
