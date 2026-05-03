import type { Metadata, Viewport } from "next";
import { Inter, Montserrat } from "next/font/google";
import { headers } from "next/headers";
import { DigiStartAnalytics } from "@/components/analytics/digistart-analytics";
import { ComingSoonPage } from "@/components/coming-soon-page";
import { MetaPixelEvents } from "@/components/analytics/meta-pixel-events";
import { Providers } from "@/components/providers";
import { shouldRenderComingSoonInLayout } from "@/lib/coming-soon";
import { Toaster } from "sonner";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin", "cyrillic"],
  variable: "--font-montserrat",
});

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "DigiStart | Дигитална агенция",
    template: "%s | DigiStart",
  },
  description:
    "Онлайн магазини, Google Business оптимизация и управление на социални мрежи. Изграждаме вашето онлайн присъствие.",
  keywords: [
    "онлайн магазини",
    "Google Business",
    "социални мрежи",
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
      "Онлайн магазини, Google Business, социални мрежи и дигитален маркетинг",
  },
  twitter: {
    card: "summary_large_image",
    title: "DigiStart | Дигитална агенция",
    description:
      "Онлайн магазини, Google Business, социални мрежи и дигитален маркетинг",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
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
        className={`${inter.variable} ${montserrat.variable} font-sans antialiased overflow-x-hidden`}
      >
        {showComingSoon ? (
          <>
            <ComingSoonPage />
            <MetaPixelEvents />
            <Toaster richColors position="top-center" />
          </>
        ) : (
          <>
            <DigiStartAnalytics />
            <MetaPixelEvents />
            <Providers>{children}</Providers>
          </>
        )}
      </body>
    </html>
  );
}
