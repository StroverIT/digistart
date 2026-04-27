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
import { Checkbox } from "@/components/ui/checkbox";
import { Price } from "@/components/ui/price";
import type { Cart, ConsultationBooking, CustomerInfo, Service } from "@/lib/types";
import { getCart, clearCart } from "@/lib/store/cart";
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field";
import { getServiceById } from "@/lib/data/services";
import ConsultationBookingForm from "@/components/consultation/consultation-booking-form";
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "");

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<Cart>({ items: [], totalOneTime: 0, totalMonthly: 0 });
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [wantsConsultation, setWantsConsultation] = useState(false);
  const [bookedConsultation, setBookedConsultation] = useState<ConsultationBooking | null>(
    null
  );
  const [consultationError, setConsultationError] = useState("");
  const [checkoutStep, setCheckoutStep] = useState<1 | 2>(1);
  const [stripeClientSecret, setStripeClientSecret] = useState<string | null>(null);
  const [servicesById, setServicesById] = useState<Record<string, Service>>({});
  const [formData, setFormData] = useState<CustomerInfo>({
    name: "",
    email: "",
    phone: "",
    company: "",
    notes: "",
  });

  const createEmbeddedSession = async (source: "auto" | "submit") => {
    const fallbackEmail = `guest-${Date.now()}@digistart.local`;
    const emailLooksValid = /\S+@\S+\.\S+/.test(formData.email);
    const payloadCustomer: CustomerInfo = {
      name: formData.name.trim() || "Клиент",
      email: emailLooksValid ? formData.email.trim() : fallbackEmail,
      phone: formData.phone.trim() || "000000",
      company: formData.company?.trim() || undefined,
      notes: formData.notes?.trim() || undefined,
    };
    const response = await fetch("/api/checkout/stripe-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cart,
        customer: payloadCustomer,
        consultationId: bookedConsultation?.id,
        uiMode: "embedded",
      }),
    });

    if (!response.ok) {
      return { ok: false as const };
    }

    const { checkoutUrl, clientSecret } = (await response.json()) as {
      checkoutUrl?: string;
      clientSecret?: string;
    };
    return { ok: true as const, checkoutUrl, clientSecret };
  };

  useEffect(() => {
    setMounted(true);
    const currentCart = getCart();
    setCart(currentCart);
    fetch("/api/services")
      .then((response) => response.json())
      .then((data: { services?: Service[] }) => {
        const map: Record<string, Service> = {};
        for (const service of data.services ?? []) {
          map[service.id] = service;
        }
        setServicesById(map);
      })
      .catch(() => undefined);
    if (currentCart.items.length === 0) {
      // Replace: avoid empty checkout in history; return to cart.
      router.replace("/cart");
    }
  }, [router]);

  useEffect(() => {
    if (!mounted) return;
    if (cart.items.length === 0) return;
    if (checkoutStep !== 2) return;
    if (stripeClientSecret) return;

    let cancelled = false;
    createEmbeddedSession("auto")
      .then((result) => {
        if (cancelled) return;
        if (!result.ok) {
          setConsultationError("Възникна грешка при зареждане на плащането.");
          return;
        }
        if (result.clientSecret) {
          setStripeClientSecret(result.clientSecret);
        } else if (result.checkoutUrl) {
          clearCart();
          window.location.assign(result.checkoutUrl);
        } else {
          setConsultationError("Stripe не върна client secret за вградено плащане.");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setConsultationError("Възникна грешка при зареждане на плащането.");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [mounted, cart.items.length, stripeClientSecret, checkoutStep]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateStepOne = () => {
    setConsultationError("");

    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      setConsultationError("Моля попълнете име, имейл и телефон.");
      return false;
    }

    if (wantsConsultation && !bookedConsultation) {
      setConsultationError(
        "Маркирахте консултация, но няма запазен час. Моля запазете час преди плащане."
      );
      return false;
    }

    return true;
  };

  const handleContinueToPayment = () => {
    if (!validateStepOne()) return;
    setCheckoutStep(2);
  };

  const handleRetryPayment = async () => {
    setConsultationError("");
    if (!validateStepOne()) return;
    if (stripeClientSecret) return;

    setIsSubmitting(true);
    const result = await createEmbeddedSession("submit");
    if (!result.ok) {
      setIsSubmitting(false);
      setConsultationError("Възникна грешка при стартиране на плащането. Моля опитайте отново.");
      return;
    }
    if (!result.clientSecret && !result.checkoutUrl) {
      setIsSubmitting(false);
      setConsultationError("Липсва линк за плащане. Моля опитайте отново.");
      return;
    }

    if (result.clientSecret) {
      setStripeClientSecret(result.clientSecret);
      setIsSubmitting(false);
      return;
    }

    clearCart();
    window.location.assign(result.checkoutUrl!);
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
          href="/cart"
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

            <div className="space-y-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-base">
                    Стъпка {checkoutStep} от 2:{" "}
                    {checkoutStep === 1 ? "Данни за контакт" : "Плащане"}
                  </CardTitle>
                </CardHeader>
              </Card>

              {checkoutStep === 1 ? (
                <>
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

                  <Card className="bg-card border-border">
                    <CardHeader>
                      <CardTitle className="text-lg">Безплатна консултация</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id="consultation"
                          checked={wantsConsultation}
                          onCheckedChange={(value) => {
                            const checked = value === true;
                            setWantsConsultation(checked);
                            if (!checked) {
                              setBookedConsultation(null);
                              setConsultationError("");
                            }
                          }}
                        />
                        <div className="space-y-1">
                          <Label htmlFor="consultation" className="cursor-pointer">
                            Искам да запазя безплатна консултация
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Ще резервирате конкретен ден и час директно тук.
                          </p>
                        </div>
                      </div>

                      {wantsConsultation ? (
                        <ConsultationBookingForm
                          source="checkout"
                          title="Изберете ден и час"
                          description="Консултацията е безплатна и не влияе на цената на поръчката."
                          submitLabel={
                            bookedConsultation ? "Промени часа за консултация" : "Запази час"
                          }
                          initialValues={{
                            name: formData.name,
                            email: formData.email,
                            phone: formData.phone,
                            company: formData.company,
                            notes: formData.notes,
                          }}
                          onBooked={(booking) => {
                            setBookedConsultation(booking);
                            setConsultationError("");
                          }}
                        />
                      ) : null}

                      {bookedConsultation ? (
                        <p className="text-sm text-green-600">
                          Запазен час: {bookedConsultation.date} в {bookedConsultation.time}
                        </p>
                      ) : null}
                      {consultationError ? (
                        <p className="text-sm text-red-500">{consultationError}</p>
                      ) : null}
                    </CardContent>
                  </Card>

                  <Button
                    type="button"
                    size="lg"
                    className="w-full glow-primary"
                    onClick={handleContinueToPayment}
                  >
                    Продължи към плащане
                  </Button>
                </>
              ) : (
                <>
                  <Card className="bg-card border-border">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-primary" />
                        Плащане
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {stripeClientSecret ? (
                        <div className="bg-secondary/30 rounded-lg p-2">
                          <EmbeddedCheckoutProvider
                            stripe={stripePromise}
                            options={{ clientSecret: stripeClientSecret }}
                          >
                            <EmbeddedCheckout />
                          </EmbeddedCheckoutProvider>
                        </div>
                      ) : (
                        <div className="bg-secondary/50 rounded-lg p-6 text-center">
                          <Lock className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
                          <p className="text-muted-foreground text-sm mb-2">
                            Подготвяме защитената форма за плащане...
                          </p>
                          {consultationError ? (
                            <p className="text-xs text-red-500 mb-4">{consultationError}</p>
                          ) : null}
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleRetryPayment}
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? "Обработка..." : "Опитай отново"}
                          </Button>
                        </div>
                      )}

                      <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
                        <Shield className="h-4 w-4" />
                        <span>Вашите данни са защитени с SSL криптиране</span>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => setCheckoutStep(1)}
                    >
                      Назад към данните
                    </Button>
                    <Button
                      type="button"
                      className="flex-1"
                      disabled
                    >
                      Завършете плащането във формата
                    </Button>
                  </div>
                </>
              )}
            </div>
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
                        <ul className="mt-2 space-y-1">
                          {item.upsells.map((upsell) => {
                            const service = servicesById[item.serviceId] ?? getServiceById(item.serviceId);
                            const serviceUpsell = service?.upsells.find(
                              (config) => config.id === upsell.upsellId
                            );
                            if (!serviceUpsell) return null;

                            const choiceName =
                              serviceUpsell.kind === "choice"
                                ? serviceUpsell.choices?.find((choice) => choice.id === upsell.choiceId)
                                  ?.name
                                : null;

                            return (
                              <li key={upsell.upsellId} className="text-xs text-muted-foreground">
                                + {serviceUpsell.name}
                                {choiceName ? ` (${choiceName})` : ""}
                                {upsell.quantity > 0 ? ` x${upsell.quantity}` : ""}
                                {upsell.entries?.filter(Boolean).length
                                  ? ` - ${upsell.entries.filter(Boolean).join(", ")}`
                                  : ""}
                              </li>
                            );
                          })}
                        </ul>
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
