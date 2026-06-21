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
      <Header />
      <div className="flex min-h-screen min-w-0 flex-col overflow-x-hidden">
        <main className="min-w-0 flex-auto">{children}</main>
        <Footer />
      </div>
    </PageTransitionProvider>
  );
}
