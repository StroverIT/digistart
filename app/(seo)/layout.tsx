import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { SiteBookingSection } from "@/components/layout/site-booking-section";
import PageTransitionProvider from "@/components/transitions/PageTransitionProvider";

export default function SeoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PageTransitionProvider>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          {children}
          <SiteBookingSection />
        </main>
        <Footer />
      </div>
    </PageTransitionProvider>
  );
}
