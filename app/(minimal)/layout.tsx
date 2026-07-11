import PageTransitionProvider from "@/components/transitions/PageTransitionProvider";

export const dynamic = "force-dynamic";

export default function MinimalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PageTransitionProvider>
      <div className="flex min-h-dvh min-w-0 flex-col bg-background">
        <main className="min-w-0 flex-auto">{children}</main>
      </div>
    </PageTransitionProvider>
  );
}
