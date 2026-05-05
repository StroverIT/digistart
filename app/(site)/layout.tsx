import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { SpotCapacityProvider } from "@/components/layout/spot-capacity-context";
import PageTransitionProvider from "@/components/transitions/PageTransitionProvider";
import { getSpotCapacity } from "@/lib/server/spot-capacity";

/**
 * Next.js 16 can throw InvalidCharacterError while prerendering some client routes.
 * Opting this segment out of static generation avoids that failure.
 */
export const dynamic = "force-dynamic";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const initialCapacity = await getSpotCapacity();

  return (
    <SpotCapacityProvider initialData={initialCapacity}>
      <PageTransitionProvider>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </PageTransitionProvider>
    </SpotCapacityProvider>
  );
}
