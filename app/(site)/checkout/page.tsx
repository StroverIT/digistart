"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import TransitionLink from "@/components/transitions/TransitionLink";
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Eye,
  EyeOff,
  Lock,
  Shield,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Price } from "@/components/ui/price";
import type { Cart, CustomerInfo, Service } from "@/lib/types";
import { getCart, clearCart, updateCartItemUpsells } from "@/lib/store/cart";
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field";
import { getServiceById } from "@/lib/data/services";
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "");

const LOGO_UPSELL = "logo-design";
const PALETTE_UPSELL = "color-palette";

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const isLoggedInCustomer =
    session?.user?.email &&
    session.user.role !== "admin";

  const totalSteps = isLoggedInCustomer ? 2 : 3;
  const [cart, setCart] = useState<Cart>({ items: [], totalOneTime: 0, totalMonthly: 0 });
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [logicalStep, setLogicalStep] = useState(1);
  const [stripeClientSecret, setStripeClientSecret] = useState<string | null>(null);
  const [servicesById, setServicesById] = useState<Record<string, Service>>({});
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [passwordFieldTouched, setPasswordFieldTouched] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [invoiceWanted, setInvoiceWanted] = useState(false);
  const [invoiceCompany, setInvoiceCompany] = useState("");
  const [invoiceTaxId, setInvoiceTaxId] = useState("");
  const [invoiceVat, setInvoiceVat] = useState("");
  const [invoiceAddress, setInvoiceAddress] = useState("");
  const [invoiceMol, setInvoiceMol] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [paletteFile, setPaletteFile] = useState<File | null>(null);
  const [brandUrls, setBrandUrls] = useState<{ logoUrl?: string; paletteUrl?: string }>({});
  /** Merged URLs committed before entering payment (avoids stale state after upload). */
  const [stripeBrandPayload, setStripeBrandPayload] = useState<{
    logoUrl?: string | null;
    paletteUrl?: string | null;
  } | null>(null);
  const paymentInitRef = useRef(false);

  const [formData, setFormData] = useState<CustomerInfo>({
    name: "",
    email: "",
    phone: "",
    company: "",
    notes: "",
  });

  const passwordChecks = useMemo(
    () => [
      {
        label: "Поне 8 символа",
        checked: password.length >= 8,
      },
      {
        label: "Поне една малка и една главна буква",
        checked: /[a-z]/.test(password) && /[A-Z]/.test(password),
      },
      {
        label: "Поне една цифра",
        checked: /\d/.test(password),
      },
      {
        label: "Поне един специален символ",
        checked: /[^A-Za-z0-9]/.test(password),
      },
    ],
    [password]
  );
  const isPasswordStrong = passwordChecks.every((check) => check.checked);
  const isConfirmMatching = passwordConfirm.length > 0 && password === passwordConfirm;

  useEffect(() => {
    if (isLoggedInCustomer && session?.user) {
      setFormData((prev) => ({
        ...prev,
        name: session.user.name ?? prev.name,
        email: session.user.email ?? prev.email,
      }));
    }
  }, [isLoggedInCustomer, session?.user?.name, session?.user?.email]);

  const firstCartItem = cart.items[0];
  const hasLogoUpsell = Boolean(
    firstCartItem?.upsells.some((u) => u.upsellId === LOGO_UPSELL && u.quantity > 0)
  );
  const hasPaletteUpsell = Boolean(
    firstCartItem?.upsells.some((u) => u.upsellId === PALETTE_UPSELL && u.quantity > 0)
  );

  const setUpsellOnFirstItem = useCallback((upsellId: string, on: boolean) => {
    const current = getCart();
    const item = current.items[0];
    if (!item) return;
    const service = getServiceById(item.serviceId);
    if (!service) return;
    const others = item.upsells.filter((u) => u.upsellId !== upsellId);
    const next = on
      ? [...others, { upsellId, quantity: 1 }]
      : others;
    const updated = updateCartItemUpsells(item.id, next);
    setCart(updated);
  }, []);

  const createEmbeddedSession = async () => {
    setCheckoutError("");
    const emailLooksValid = /\S+@\S+\.\S+/.test(formData.email);
    if (!emailLooksValid) {
      setCheckoutError("Моля въведете валиден имейл.");
      return { ok: false as const };
    }

    const pendingUser =
      !isLoggedInCustomer && password
        ? {
          email: formData.email.trim(),
          password,
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          company: formData.company?.trim(),
        }
        : undefined;

    const brandSource = stripeBrandPayload ?? brandUrls;
    const brandAssets =
      brandSource.logoUrl || brandSource.paletteUrl
        ? {
          logoUrl: brandSource.logoUrl ?? null,
          paletteUrl: brandSource.paletteUrl ?? null,
        }
        : undefined;

    const invoice =
      invoiceWanted
        ? {
          companyName: invoiceCompany.trim(),
          taxId: invoiceTaxId.trim(),
          vatNumber: invoiceVat.trim() || undefined,
          addressLine1: invoiceAddress.trim(),
          mol: invoiceMol.trim(),
        }
        : undefined;

    const response = await fetch("/api/checkout/stripe-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cart,
        customer: {
          name: formData.name.trim() || "Клиент",
          email: formData.email.trim(),
          phone: formData.phone.trim() || "000000",
          company: formData.company?.trim() || undefined,
          notes: formData.notes?.trim() || undefined,
        },
        uiMode: "embedded",
        pendingUser,
        invoiceWanted,
        invoice,
        brandAssets,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      setCheckoutError(typeof err.error === "string" ? err.error : "Грешка при плащане.");
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
      router.replace("/cart");
    }
  }, [router]);

  const paymentStepIndex = totalSteps;

  const canStartStripe = useMemo(() => {
    if (!invoiceWanted) return true;
    return Boolean(
      invoiceCompany.trim() &&
      invoiceTaxId.trim() &&
      invoiceAddress.trim() &&
      invoiceMol.trim()
    );
  }, [invoiceWanted, invoiceCompany, invoiceTaxId, invoiceAddress, invoiceMol]);

  useEffect(() => {
    if (logicalStep !== paymentStepIndex) {
      paymentInitRef.current = false;
      return;
    }
    if (!canStartStripe) {
      paymentInitRef.current = false;
      return;
    }
    if (!mounted) return;
    if (cart.items.length === 0) return;
    if (stripeClientSecret) return;
    if (sessionStatus === "loading") return;
    if (paymentInitRef.current) return;
    paymentInitRef.current = true;

    let cancelled = false;
    createEmbeddedSession()
      .then((result) => {
        if (cancelled) return;
        if (!result.ok) {
          paymentInitRef.current = false;
          return;
        }
        if (result.clientSecret) {
          setStripeClientSecret(result.clientSecret);
        } else if (result.checkoutUrl) {
          clearCart();
          window.location.assign(result.checkoutUrl);
        } else {
          paymentInitRef.current = false;
          setCheckoutError("Stripe не върна client secret за вградено плащане.");
        }
      })
      .catch(() => {
        if (!cancelled) {
          paymentInitRef.current = false;
          setCheckoutError("Възникна грешка при зареждане на плащането.");
        }
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one-shot Stripe init on payment step
  }, [
    mounted,
    cart.items.length,
    stripeClientSecret,
    logicalStep,
    paymentStepIndex,
    sessionStatus,
    stripeBrandPayload,
    canStartStripe,
  ]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateAccount = async () => {
    setCheckoutError("");
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      setCheckoutError("Моля попълнете име, имейл и телефон.");
      return false;
    }
    if (!isPasswordStrong) {
      setCheckoutError("Паролата трябва да покрива всички изисквания.");
      return false;
    }
    if (password !== passwordConfirm) {
      setCheckoutError("Паролите не съвпадат.");
      return false;
    }
    const res = await fetch("/api/checkout/account/precheck", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: formData.email.trim() }),
    });
    const data = (await res.json()) as { available?: boolean };
    if (!data.available) {
      setCheckoutError("Този имейл вече е регистриран. Моля влезте в профила си.");
      return false;
    }
    return true;
  };

  const validateAssetsAndContact = () => {
    setCheckoutError("");
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      setCheckoutError("Моля попълнете име, имейл и телефон.");
      return false;
    }
    return true;
  };

  const uploadBrandFiles = async (): Promise<Record<string, string> | true | false> => {
    if (!logoFile && !paletteFile) return true;
    const fd = new FormData();
    if (logoFile) fd.append("logo", logoFile);
    if (paletteFile) fd.append("palette", paletteFile);
    try {
      const res = await fetch("/api/uploads/brand", { method: "POST", body: fd });
      const json = (await res.json()) as { logoUrl?: string; paletteUrl?: string; error?: string };
      if (!res.ok) {
        setCheckoutError(json.error ?? "Качването не бе успешно.");
        return false;
      }
      const merged = { ...brandUrls, ...json };
      setBrandUrls(merged);
      return merged;
    } catch {
      setCheckoutError("Качването не бе успешно.");
      return false;
    }
  };

  const validateInvoice = () => {
    if (!invoiceWanted) return true;
    if (
      !invoiceCompany.trim() ||
      !invoiceTaxId.trim() ||
      !invoiceAddress.trim() ||
      !invoiceMol.trim()
    ) {
      setCheckoutError("Попълнете всички полета за фактура.");
      return false;
    }
    return true;
  };

  const handleContinueFromAccount = async () => {
    if (!(await validateAccount())) return;
    setLogicalStep(2);
  };

  const handleContinueFromAssets = async () => {
    if (!validateAssetsAndContact()) return;
    const uploaded = await uploadBrandFiles();
    if (uploaded === false) return;
    const merged =
      uploaded === true
        ? brandUrls
        : { ...brandUrls, ...uploaded };
    setStripeBrandPayload({
      logoUrl: merged.logoUrl ?? null,
      paletteUrl: merged.paletteUrl ?? null,
    });
    paymentInitRef.current = false;
    setStripeClientSecret(null);
    setLogicalStep(isLoggedInCustomer ? 2 : 3);
  };

  const handleBack = () => {
    setCheckoutError("");
    if (logicalStep <= 1) return;
    setLogicalStep((s) => s - 1);
    if (logicalStep === paymentStepIndex) {
      setStripeClientSecret(null);
      paymentInitRef.current = false;
    }
  };

  const displayStepLabel = useMemo(() => {
    if (isLoggedInCustomer) {
      return logicalStep === 1 ? "Лого и палитра" : "Плащане";
    }
    return logicalStep === 1
      ? "Акаунт"
      : logicalStep === 2
        ? "Лого и палитра"
        : "Плащане";
  }, [isLoggedInCustomer, logicalStep]);

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
        <TransitionLink
          href="/cart"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Обратно към кошницата
        </TransitionLink>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-6">Завършване на поръчка</h1>

            <div className="space-y-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-base">
                    Стъпка {logicalStep} от {totalSteps}: {displayStepLabel}
                  </CardTitle>
                </CardHeader>
              </Card>

              {!isLoggedInCustomer && logicalStep === 1 ? (
                <>
                  <Card className="bg-card border-border">
                    <CardHeader>
                      <CardTitle className="text-lg">Създаване на акаунт</CardTitle>
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
                            <FieldLabel htmlFor="email">Имейл *</FieldLabel>
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
                          <FieldLabel htmlFor="password">Парола *</FieldLabel>
                          <div className="relative">
                            <Input
                              id="password"
                              name="password"
                              type={showPassword ? "text" : "password"}
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              onFocus={() => setPasswordFieldTouched(true)}
                              placeholder="Създай сигурна парола"
                              autoComplete="new-password"
                              className="pr-11"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword((prev) => !prev)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                              aria-label={showPassword ? "Скрий паролата" : "Покажи паролата"}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                          {passwordFieldTouched ? (
                            <div className="mt-3 space-y-1.5 rounded-md border border-border/80 bg-muted/30 p-3">
                              {passwordChecks.map((check) => (
                                <div
                                  key={check.label}
                                  className={
                                    check.checked
                                      ? "flex items-center gap-2 text-xs text-emerald-600"
                                      : "flex items-center gap-2 text-xs text-red-500"
                                  }
                                >
                                  {check.checked ? (
                                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                                  ) : (
                                    <XCircle className="h-3.5 w-3.5 shrink-0" />
                                  )}
                                  <span>{check.label}</span>
                                </div>
                              ))}
                            </div>
                          ) : null}
                        </Field>
                        <Field>
                          <FieldLabel htmlFor="passwordConfirm">Потвърди парола *</FieldLabel>
                          <div className="relative">
                            <Input
                              id="passwordConfirm"
                              name="passwordConfirm"
                              type={showPassword ? "text" : "password"}
                              value={passwordConfirm}
                              onChange={(e) => setPasswordConfirm(e.target.value)}
                              placeholder="Повтори паролата"
                              autoComplete="new-password"
                              className="pr-11"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword((prev) => !prev)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                              aria-label={showPassword ? "Скрий паролата" : "Покажи паролата"}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                          {passwordConfirm ? (
                            <div
                              className={
                                isConfirmMatching
                                  ? "mt-2 flex items-center gap-2 text-xs text-emerald-600"
                                  : "mt-2 flex items-center gap-2 text-xs text-red-500"
                              }
                            >
                              {isConfirmMatching ? (
                                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                              ) : (
                                <XCircle className="h-3.5 w-3.5 shrink-0" />
                              )}
                              <span>
                                {isConfirmMatching ? "Паролите съвпадат" : "Паролите не съвпадат"}
                              </span>
                            </div>
                          ) : null}
                        </Field>
                        <Field>
                          <FieldLabel htmlFor="notes">Бележки (по избор)</FieldLabel>
                          <Textarea
                            id="notes"
                            name="notes"
                            value={formData.notes}
                            onChange={handleInputChange}
                            rows={3}
                          />
                        </Field>
                      </FieldGroup>
                    </CardContent>
                  </Card>
                  {checkoutError ? <p className="text-sm text-red-500">{checkoutError}</p> : null}
                  <Button
                    type="button"
                    size="lg"
                    className="w-full glow-primary"
                    onClick={handleContinueFromAccount}
                  >
                    Напред
                  </Button>
                </>
              ) : null}

              {((isLoggedInCustomer && logicalStep === 1) || (!isLoggedInCustomer && logicalStep === 2)) ? (
                <>
                  <Card className="bg-card border-border">
                    <CardHeader>
                      <CardTitle className="text-lg">Лого и цветова палитра</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {isLoggedInCustomer ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <Field>
                            <FieldLabel>Имейл</FieldLabel>
                            <Input value={formData.email} disabled className="opacity-80" />
                          </Field>
                          <Field>
                            <FieldLabel htmlFor="phone2">Телефон *</FieldLabel>
                            <Input
                              id="phone2"
                              name="phone"
                              type="tel"
                              value={formData.phone}
                              onChange={handleInputChange}
                              required
                            />
                          </Field>
                        </div>
                      ) : null}

                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field>
                          <FieldLabel htmlFor="logo">Лого (файл)</FieldLabel>
                          <Input
                            id="logo"
                            type="file"
                            accept="image/png,image/jpeg,image/webp,image/svg+xml"
                            onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)}
                          />
                        </Field>
                        <Field>
                          <FieldLabel htmlFor="palette">Цветова палитра (файл)</FieldLabel>
                          <Input
                            id="palette"
                            type="file"
                            accept="image/png,image/jpeg,image/webp,application/pdf"
                            onChange={(e) => setPaletteFile(e.target.files?.[0] ?? null)}
                          />
                        </Field>
                      </div>

                      <div className="rounded-lg border border-border p-4 space-y-3">
                        <p className="text-sm text-muted-foreground">
                          Нямаш готови материали? Добави изработка към поръчката:
                        </p>
                        <label className="flex items-center gap-3 cursor-pointer">
                          <Checkbox
                            checked={hasLogoUpsell}
                            onCheckedChange={(v) => setUpsellOnFirstItem(LOGO_UPSELL, v === true)}
                          />
                          <span>Изработка на лого (+50 €)</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                          <Checkbox
                            checked={hasPaletteUpsell}
                            onCheckedChange={(v) => setUpsellOnFirstItem(PALETTE_UPSELL, v === true)}
                          />
                          <span>Цветова палитра и бранд гайд (+20 €)</span>
                        </label>
                      </div>
                    </CardContent>
                  </Card>
                  {checkoutError ? <p className="text-sm text-red-500">{checkoutError}</p> : null}
                  <div className="flex gap-3">
                    {!isLoggedInCustomer ? (
                      <Button type="button" variant="outline" className="flex-1" onClick={handleBack}>
                        Назад
                      </Button>
                    ) : null}
                    <Button
                      type="button"
                      className="flex-1 glow-primary"
                      onClick={handleContinueFromAssets}
                    >
                      Напред към плащане
                    </Button>
                  </div>
                </>
              ) : null}

              {logicalStep === paymentStepIndex ? (
                <>
                  <Card className="bg-card border-border">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-primary" />
                        Плащане
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id="invoice"
                          checked={invoiceWanted}
                          onCheckedChange={(v) => setInvoiceWanted(v === true)}
                        />
                        <div>
                          <Label htmlFor="invoice" className="cursor-pointer">
                            Искам фактура
                          </Label>
                          <p className="text-xs text-muted-foreground mt-1">
                            Попълнете данните за фирмата по-долу.
                          </p>
                        </div>
                      </div>

                      {invoiceWanted ? (
                        <FieldGroup className="border border-border rounded-lg p-4">
                          <Field>
                            <FieldLabel>Фирма *</FieldLabel>
                            <Input value={invoiceCompany} onChange={(e) => setInvoiceCompany(e.target.value)} />
                          </Field>
                          <Field>
                            <FieldLabel>ЕИК *</FieldLabel>
                            <Input value={invoiceTaxId} onChange={(e) => setInvoiceTaxId(e.target.value)} />
                          </Field>
                          <Field>
                            <FieldLabel>ДДС № (по избор)</FieldLabel>
                            <Input value={invoiceVat} onChange={(e) => setInvoiceVat(e.target.value)} />
                          </Field>
                          <Field>
                            <FieldLabel>Адрес *</FieldLabel>
                            <Input value={invoiceAddress} onChange={(e) => setInvoiceAddress(e.target.value)} />
                          </Field>
                          <Field>
                            <FieldLabel>МОЛ *</FieldLabel>
                            <Input value={invoiceMol} onChange={(e) => setInvoiceMol(e.target.value)} />
                          </Field>
                        </FieldGroup>
                      ) : null}

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
                          {checkoutError ? (
                            <p className="text-xs text-red-500 mb-4">{checkoutError}</p>
                          ) : null}
                          <Button
                            type="button"
                            variant="outline"
                            disabled={isSubmitting}
                            onClick={async () => {
                              if (!validateInvoice()) return;
                              setIsSubmitting(true);
                              setCheckoutError("");
                              paymentInitRef.current = false;
                              const r = await createEmbeddedSession();
                              setIsSubmitting(false);
                              if (r.ok && r.clientSecret) setStripeClientSecret(r.clientSecret);
                              else if (r.ok && r.checkoutUrl) {
                                clearCart();
                                window.location.assign(r.checkoutUrl!);
                              }
                            }}
                          >
                            {isSubmitting ? "Зареждане..." : "Опитай отново"}
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
                    <Button type="button" variant="outline" className="flex-1" onClick={handleBack}>
                      Назад
                    </Button>
                    <Button type="button" className="flex-1" disabled>
                      Завършете плащането във формата
                    </Button>
                  </div>
                </>
              ) : null}
            </div>
          </div>

          <div>
            <Card className="bg-card border-border sticky top-24">
              <CardHeader>
                <CardTitle>Вашата поръчка</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cart.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between gap-4 pb-4 border-b border-border"
                  >
                    <div>
                      <p className="font-medium">{item.serviceName}</p>
                      <p className="text-sm text-muted-foreground">{item.selectedOptionName}</p>
                      {item.upsells.length > 0 && (
                        <ul className="mt-2 space-y-1">
                          {item.upsells.map((upsell) => {
                            const service = servicesById[item.serviceId] ?? getServiceById(item.serviceId);
                            const serviceUpsell = service?.upsells.find((config) => config.id === upsell.upsellId);
                            if (!serviceUpsell) return null;
                            const choiceName =
                              serviceUpsell.kind === "choice"
                                ? serviceUpsell.choices?.find((choice) => choice.id === upsell.choiceId)?.name
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
                      {item.isMonthly && <span className="text-sm text-muted-foreground">/мес</span>}
                    </div>
                  </div>
                ))}

                <div className="space-y-2 pt-2">
                  {cart.totalOneTime > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Еднократни услуги</span>
                      <Price value={cart.totalOneTime} />
                    </div>
                  )}
                  {cart.totalMonthly > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Месечни абонаменти</span>
                      <span>
                        <Price value={cart.totalMonthly} />/мес
                      </span>
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
