import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin", "cyrillic"],
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  title: {
    default: "Sleek Route | Дигитална агенция",
    template: "%s | Sleek Route",
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
  authors: [{ name: "Sleek Route" }],
  creator: "Sleek Route",
  openGraph: {
    type: "website",
    locale: "bg_BG",
    siteName: "Sleek Route",
    title: "Sleek Route | Дигитална агенция",
    description:
      "Професионални уеб сайтове, онлайн магазини и дигитален маркетинг",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sleek Route | Дигитална агенция",
    description:
      "Професионални уеб сайтове, онлайн магазини и дигитален маркетинг",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#1a1a2e",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bg" className="bg-background">
      <body className={`${montserrat.className} font-sans antialiased`}>
        {children}
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  );
}
