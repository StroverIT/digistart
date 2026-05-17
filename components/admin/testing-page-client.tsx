"use client";

import { useState } from "react";
import { FlaskConical, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function TestingPageClient() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);

  async function startTestCheckout() {
    setLoading(true);
    setError(null);
    setLastOrderId(null);
    try {
      const res = await fetch("/api/admin/checkout-test", { method: "POST" });
      const data = (await res.json()) as {
        error?: string;
        checkoutUrl?: string;
        orderId?: string;
      };
      if (!res.ok) {
        setError(data.error ?? "Заявката не бе успешна.");
        return;
      }
      if (data.checkoutUrl) {
        setLastOrderId(data.orderId ?? null);
        window.location.assign(data.checkoutUrl);
        return;
      }
      setError("Липсва адрес за пренасочване към Stripe.");
    } catch {
      setError("Мрежова грешка. Опитайте отново.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <FlaskConical className="h-5 w-5 text-primary" />
            Тест на Stripe (production)
          </CardTitle>
          <CardDescription>
            Създава реална поръчка в базата и отваря Stripe Checkout за{" "}
            <span className="font-medium text-foreground">€0.50</span>. След плащане
            проверете поръчката в &quot;Поръчки&quot; и в Stripe Dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTitle>Реално плащане</AlertTitle>
            <AlertDescription>
              Това не е симулация: картата ви ще бъде таксувана с €0.50 (ако използвате
              истински режим на Stripe). Използвайте само за проверка на production
              интеграцията.
            </AlertDescription>
          </Alert>

          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}

          {lastOrderId ? (
            <p className="text-sm text-muted-foreground">
              Поръчка: <span className="font-mono text-foreground">{lastOrderId}</span> -
              пренасочване към Stripe…
            </p>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <Button type="button" onClick={startTestCheckout} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Подготовка…
                </>
              ) : (
                "Стартирай тестово плащане €0.50"
              )}
            </Button>
            <Button variant="outline" asChild>
              <a href="/admin/orders">
                <ExternalLink className="h-4 w-4 mr-2" />
                Към поръчки
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
