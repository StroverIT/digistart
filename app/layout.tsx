import type { Metadata, Viewport } from "next";
import { Inter, Montserrat } from "next/font/google";
import { DigiStartAnalytics } from "@/components/analytics/digistart-analytics";
import { ComingSoonPage } from "@/components/coming-soon-page";
import { MetaPixelEvents } from "@/components/analytics/meta-pixel-events";
import { Providers } from "@/components/providers";
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
    "Професионални уеб сайтове, онлайн магазини, Google Business оптимизация и управление на социални мрежи. Изграждаме вашето онлайн присъствие.",
  keywords: [
    "уеб дизайн",
    "уеб сайтове",
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
      "Професионални уеб сайтове, онлайн магазини и дигитален маркетинг",
  },
  twitter: {
    card: "summary_large_image",
    title: "DigiStart | Дигитална агенция",
    description:
      "Професионални уеб сайтове, онлайн магазини и дигитален маркетинг",
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

function isComingSoonEnabled() {
  return ["1", "true", "yes", "on"].includes(
    (process.env.IS_COMING_SOON ?? "").trim().toLowerCase(),
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isComingSoon = isComingSoonEnabled();

  return (
    <html lang="bg" className="bg-background">
      <body
        className={`${inter.variable} ${montserrat.variable} font-sans antialiased overflow-x-hidden`}
      >
        {isComingSoon ? (
          <ComingSoonPage />
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
