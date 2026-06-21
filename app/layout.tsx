import type { Metadata, Viewport } from "next";
import { Inter, Roboto_Slab, Unbounded } from "next/font/google";
import { headers } from "next/headers";
import { DigiStartAnalytics } from "@/components/analytics/digistart-analytics";
import { MetaPixelConsentLoader } from "@/components/analytics/meta-pixel-consent-loader";
import { ComingSoonPage } from "@/components/coming-soon-page";
import { MetaPixelEvents } from "@/components/analytics/meta-pixel-events";
import { UtmTracker } from "@/components/analytics/utm-tracker";
import { Providers } from "@/components/providers";
import { shouldRenderComingSoonInLayout } from "@/lib/coming-soon";
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
  title: {
    default: "DigiStart | Дигитална агенция",
    template: "%s | DigiStart",
  },
  description:
    "Онлайн магазини, Google Business оптимизация и социални мрежи за малки бизнеси, странични проекти и създатели в България.",
  keywords: [
    "онлайн магазини",
    "Google Business",
    "социални мрежи",
    "Социални мрежи и реклама",
    "дигитален маркетинг",
    "SEO",
    "България",
  ],
  authors: [{ name: "DigiStart" }],
  creator: "DigiStart",
  openGraph: {
    type: "website",
    locale: "bg_BG",
    siteName: "DigiStart",
    title: "DigiStart | Дигитална агенция",
    description:
      "Бърз и бюджетен онлайн старт за малки бизнеси, странични проекти и създатели",
  },
  twitter: {
    card: "summary_large_image",
    title: "DigiStart | Дигитална агенция",
    description:
      "Бърз и бюджетен онлайн старт за малки бизнеси, странични проекти и създатели",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32.png", type: "image/png", sizes: "32x32" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
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
    <html lang="bg" className="bg-background">
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
