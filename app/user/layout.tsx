import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import TransitionLink from "@/components/transitions/TransitionLink";
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

  const navItems = orders.flatMap((order) =>
    order.items.map((item) => ({
      id: item.id,
      label: item.serviceName,
      href: `/user/services/${item.id}` as const,
    }))
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row pt-16 md:pt-20">
      <aside className="w-full md:w-64 shrink-0 border-b md:border-b-0 md:border-r border-border bg-card/50">
        <nav className="p-4 space-y-1" aria-label="Потребителски панел">
          <TransitionLink
            href="/user"
            className={cn(
              "block rounded-lg px-3 py-2 text-sm font-medium",
              "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            Начало
          </TransitionLink>
          {navItems.length === 0 ? (
            <p className="text-xs text-muted-foreground px-3 py-2">Няма закупени услуги.</p>
          ) : (
            navItems.map((item) => (
              <TransitionLink
                key={item.id}
                href={item.href}
                className={cn(
                  "block rounded-lg px-3 py-2 text-sm font-medium",
                  "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                {item.label}
              </TransitionLink>
            ))
          )}
        </nav>
      </aside>
      <main className="flex-1 p-4 md:p-8">{children}</main>
    </div>
  );
}
