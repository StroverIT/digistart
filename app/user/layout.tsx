import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { LayoutDashboard, MessageCircle } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/header";
import { UserNavItemLink } from "@/components/user/user-nav-item-link";
import PageTransitionProvider from "@/components/transitions/PageTransitionProvider";
import { getServiceNavSetupHints } from "@/lib/server/user-nav-setup-hints";
import { getTenantProjectForUser } from "@/lib/server/tenant-projects";
import { cn } from "@/lib/utils";

export default async function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/sign-in?callbackUrl=/user");
  }
  const role = session.user.role;
  if (role !== "customer" && role !== "admin") {
    redirect("/sign-in?callbackUrl=/user");
  }

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id, status: { in: ["paid", "in_progress", "completed"] } },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  const tenantProject = await getTenantProjectForUser(session.user.id);

  const flatOrderItems = orders.flatMap((order) =>
    order.items.map((item) => ({
      id: item.id,
      serviceId: item.serviceId,
      serviceName: item.serviceName,
      upsells: item.upsells,
      order: {
        brandAssets: order.brandAssets,
        items: order.items.map((row) => ({
          serviceId: row.serviceId,
          upsells: row.upsells,
        })),
      },
    })),
  );

  const setupHints = await getServiceNavSetupHints({
    orderItems: flatOrderItems,
    tenantProject,
  });

  const navItems = flatOrderItems.map((item) => ({
    id: item.id,
    label: item.serviceName,
    href: `/user/services/${item.id}` as const,
    setupHint: setupHints[item.id],
  }));

  return (
    <PageTransitionProvider>
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="min-h-screen bg-linear-to-b from-background via-secondary/20 to-background pt-16 md:pt-20">
          <div className="container mx-auto flex min-h-[calc(100vh-5rem)] flex-col gap-6 px-4 py-6 md:flex-row md:py-8">
            <aside className="w-full shrink-0 md:w-72">
              <nav
                className="sticky top-24 rounded-2xl border border-border bg-card/80 p-3 shadow-sm backdrop-blur"
                aria-label="Потребителски панел"
              >
                <div className="mb-3 px-3 py-2">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Клиентски панел</p>
                  <p className="mt-1 text-sm font-semibold">
                    {session.user.name ?? session.user.email}
                  </p>
                </div>
                <Link
                  href="/user"
                  className={cn(
                    "flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Начало
                </Link>
                <Link
                  href="/user/support"
                  className={cn(
                    "flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <MessageCircle className="h-4 w-4" />
                  Поискай помощ
                </Link>
                {navItems.length === 0 ? (
                  <p className="rounded-xl px-3 py-3 text-xs text-muted-foreground">
                    Няма закупени услуги.
                  </p>
                ) : (
                  navItems.map((item) => (
                    <UserNavItemLink
                      key={item.id}
                      href={item.href}
                      label={item.label}
                      showSetupAlert={Boolean(item.setupHint?.incomplete)}
                      missingCount={item.setupHint?.missingCount}
                    />
                  ))
                )}
              </nav>
            </aside>
            <main className="min-w-0 flex-1">{children}</main>
          </div>
        </div>
      </div>
    </PageTransitionProvider>
  );
}
