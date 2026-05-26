import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import PageTransitionProvider from "@/components/transitions/PageTransitionProvider";

export const dynamic = "force-dynamic";

export default function OutreachLayout({
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
