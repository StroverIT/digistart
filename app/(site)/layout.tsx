import nextDynamic from "next/dynamic";
import PageTransitionProvider from "@/components/transitions/PageTransitionProvider";

const Header = nextDynamic(
  () => import("@/components/layout/header").then((mod) => ({ default: mod.Header })),
  { ssr: true },
);

const Footer = nextDynamic(
  () => import("@/components/layout/footer").then((mod) => ({ default: mod.Footer })),
  { ssr: true },
);

/**
 * Next.js 16 can throw InvalidCharacterError while prerendering some client routes.
 * Opting this segment out of static generation avoids that failure.
 */
export const dynamic = "force-dynamic";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PageTransitionProvider>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </PageTransitionProvider>
  );
}
