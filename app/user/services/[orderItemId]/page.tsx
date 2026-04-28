import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Price } from "@/components/ui/price";
import { getServiceById } from "@/lib/data/services";
import type { CartItemUpsell } from "@/lib/types";

export default async function UserServiceDetailPage({
  params,
}: {
  params: Promise<{ orderItemId: string }>;
}) {
  const { orderItemId } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) notFound();

  const item = await prisma.orderItem.findFirst({
    where: {
      id: orderItemId,
      order: { userId: session.user.id },
    },
    include: { order: true },
  });

  if (!item) notFound();

  const upsells = (item.upsells as unknown as CartItemUpsell[]) ?? [];
  const service = getServiceById(item.serviceId);
  const renew = item.order.subscriptionRenewsAt;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">{item.serviceName}</h1>
        <p className="text-muted-foreground">{item.selectedOptionName}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Цена</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Еднократно</span>
            <Price value={item.totalOneTime} className="font-medium" />
          </div>
          {item.totalMonthly > 0 ? (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Месечно</span>
              <span>
                <Price value={item.totalMonthly} className="font-medium" /> /мес
              </span>
            </div>
          ) : null}
          <div className="flex justify-between border-t pt-2 font-semibold">
            <span>Общо позиция</span>
            <Price value={item.totalPrice} />
          </div>
        </CardContent>
      </Card>

      {renew ? (
        <Card>
          <CardHeader>
            <CardTitle>Абонамент</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Следващо подновяване</p>
            <p className="text-lg font-semibold">
              {renew.toLocaleDateString("bg-BG", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Закупени добавки</CardTitle>
        </CardHeader>
        <CardContent>
          {upsells.length === 0 ? (
            <p className="text-sm text-muted-foreground">Няма допълнителни модули.</p>
          ) : (
            <ul className="space-y-2">
              {upsells.map((u) => {
                const cfg = service?.upsells.find((x) => x.id === u.upsellId);
                if (!cfg || u.quantity <= 0) return null;
                const choice =
                  cfg.kind === "choice" && u.choiceId
                    ? cfg.choices?.find((c) => c.id === u.choiceId)?.name
                    : null;
                return (
                  <li key={u.upsellId} className="text-sm border-b border-border pb-2 last:border-0">
                    <span className="font-medium">{cfg.name}</span>
                    {choice ? ` — ${choice}` : null}
                    {u.quantity > 1 ? ` ×${u.quantity}` : null}
                    {cfg.isMonthly ? (
                      <span className="text-muted-foreground"> (месечно)</span>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
