import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import PageTransitionProvider from "@/components/transitions/PageTransitionProvider";

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
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </PageTransitionProvider>
  );
}
