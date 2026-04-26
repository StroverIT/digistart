"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import TransitionLink from "@/components/transitions/TransitionLink";
import { ArrowLeft, CreditCard, Shield, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Price } from "@/components/ui/price";
import type { Cart, CustomerInfo } from "@/lib/types";
import { getCart, clearCart } from "@/lib/store/cart";
import { createOrder } from "@/lib/store/orders";
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field";
import { useTransitionRouter } from "@/components/transitions/useTransitionRouter";

export default function CheckoutPage() {
  const router = useRouter();
  const { push } = useTransitionRouter();
  const [cart, setCart] = useState<Cart>({ items: [], totalOneTime: 0, totalMonthly: 0 });
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CustomerInfo>({
    name: "",
    email: "",
    phone: "",
    company: "",
    notes: "",
  });

  useEffect(() => {
    setMounted(true);
    const currentCart = getCart();
    setCart(currentCart);
    if (currentCart.items.length === 0) {
      // Replace: avoid empty checkout in history; /кошница rewrites to /cart in middleware.
      router.replace("/кошница");
    }
  }, [router]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Create order
    const order = createOrder(cart, formData);

    // Clear cart
    clearCart();

    // Redirect to success page
    push(`/поръчка/успех?id=${order.id}`);
  };

  if (!mounted || cart.items.length === 0) {
    return (
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="h-96 flex items-center justify-center">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Back link */}
        <TransitionLink
          href="/кошница"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Обратно към кошницата
        </TransitionLink>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left - Form */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-6">
              Завършване на поръчка
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Contact Information */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-lg">Данни за контакт</CardTitle>
                </CardHeader>
                <CardContent>
                  <FieldGroup>
                    <Field>
                      <FieldLabel htmlFor="name">Име и фамилия *</FieldLabel>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Иван Петров"
                        required
                      />
                    </Field>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field>
                        <FieldLabel htmlFor="email">Имейл адрес *</FieldLabel>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="ivan@example.com"
                          required
                        />
                      </Field>

                      <Field>
                        <FieldLabel htmlFor="phone">Телефон *</FieldLabel>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="+359 888 123 456"
                          required
                        />
                      </Field>
                    </div>

                    <Field>
                      <FieldLabel htmlFor="company">Фирма (по избор)</FieldLabel>
                      <Input
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        placeholder="Име на фирма"
                      />
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="notes">
                        Допълнителни бележки (по избор)
                      </FieldLabel>
                      <Textarea
                        id="notes"
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        placeholder="Опишете вашите нужди или специални изисквания..."
                        rows={4}
                      />
                    </Field>
                  </FieldGroup>
                </CardContent>
              </Card>

              {/* Payment - Mock Stripe */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    Плащане
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-secondary/50 rounded-lg p-6 text-center">
                    <Lock className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground text-sm mb-2">
                      Сигурно плащане чрез Stripe
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Демо режим - в реална среда тук ще се появи формата за плащане на Stripe
                    </p>
                  </div>

                  <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
                    <Shield className="h-4 w-4" />
                    <span>Вашите данни са защитени с SSL криптиране</span>
                  </div>
                </CardContent>
              </Card>

              {/* Submit */}
              <Button
                type="submit"
                size="lg"
                className="w-full glow-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin h-5 w-5 border-2 border-primary-foreground border-t-transparent rounded-full mr-2" />
                    Обработка на плащането...
                  </>
                ) : (
                  <>
                    Плати <Price value={cart.totalOneTime + cart.totalMonthly} />
                    {cart.totalMonthly > 0 && cart.totalOneTime === 0 && "/мес"}
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Right - Order Summary */}
          <div>
            <Card className="bg-card border-border sticky top-24">
              <CardHeader>
                <CardTitle>Вашата поръчка</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Items */}
                {cart.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between gap-4 pb-4 border-b border-border"
                  >
                    <div>
                      <p className="font-medium">{item.serviceName}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.selectedOptionName}
                      </p>
                      {item.upsells.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          +{item.upsells.length} допълнителни услуги
                        </p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <Price value={item.totalPrice} className="font-semibold" />
                      {item.isMonthly && (
                        <span className="text-sm text-muted-foreground">
                          /мес
                        </span>
                      )}
                    </div>
                  </div>
                ))}

                {/* Totals */}
                <div className="space-y-2 pt-2">
                  {cart.totalOneTime > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Еднократни услуги
                      </span>
                      <Price value={cart.totalOneTime} />
                    </div>
                  )}
                  {cart.totalMonthly > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Месечни абонаменти
                      </span>
                      <span><Price value={cart.totalMonthly} />/мес</span>
                    </div>
                  )}
                </div>

                <div className="border-t border-border pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold">Обща сума</span>
                    <div className="text-right">
                      <Price
                        value={cart.totalOneTime + cart.totalMonthly}
                        className="text-2xl gradient-text"
                      />
                      {cart.totalMonthly > 0 && cart.totalOneTime === 0 && (
                        <span className="text-muted-foreground">/мес</span>
                      )}
                    </div>
                  </div>
                  {cart.totalMonthly > 0 && cart.totalOneTime > 0 && (
                    <p className="text-sm text-muted-foreground text-right mt-1">
                      + <Price value={cart.totalMonthly} />/мес след това
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
