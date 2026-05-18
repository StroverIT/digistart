"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { TrackedCtaLink } from "@/components/analytics/tracked-cta-link";
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Eye,
  EyeOff,
  Shield,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Price } from "@/components/ui/price";
import type { Cart, CustomerInfo, Service } from "@/lib/types";
import { getCart, clearCart, updateCartItemUpsells } from "@/lib/store/cart";
import {
  getCheckoutTemplateSelection,
  type CheckoutTemplateSelection,
} from "@/lib/store/checkout-template";
import { CheckoutTemplatePicker } from "@/components/checkout/checkout-template-picker";
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field";
import { getServiceById } from "@/lib/data/services";
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { toast } from "sonner";
import Link from "next/link";
import gsap from "gsap";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "");
const PAYMENT_PREPARE_MAX_RETRIES = 3;
const PAYMENT_PREPARE_FAILED_MESSAGE =
  "Нещо се провали при подготовката за формата за плащане. Опитайте отново.";

const LOGO_UPSELL = "logo-design";
const PALETTE_UPSELL = "color-palette";
const READY_STORE_SERVICE_ID = "ready-store";

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
  const [isPreparingPayment, setIsPreparingPayment] = useState(false);
  const [hasPaymentPrepareFailed, setHasPaymentPrepareFailed] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [logicalStep, setLogicalStep] = useState(1);
  const [stripeClientSecret, setStripeClientSecret] = useState<string | null>(null);
  const [servicesById, setServicesById] = useState<Record<string, Service>>({});
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [passwordFieldTouched, setPasswordFieldTouched] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedCheckoutTerms, setAcceptedCheckoutTerms] = useState(false);
  const [purchaseAsBusiness, setPurchaseAsBusiness] = useState(false);
  const [legalConsentError, setLegalConsentError] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [paletteFile, setPaletteFile] = useState<File | null>(null);
  const [brandUrls, setBrandUrls] = useState<{ logoUrl?: string; paletteUrl?: string }>({});
  const [templateSelection, setTemplateSelection] = useState<CheckoutTemplateSelection | null>(
    null,
  );
  /** Merged URLs committed before entering payment (avoids stale state after upload). */
  const [stripeBrandPayload, setStripeBrandPayload] = useState<{
    logoUrl?: string | null;
    paletteUrl?: string | null;
  } | null>(null);
  const paymentInitRef = useRef(false);
  const checkoutRootRef = useRef<HTMLDivElement>(null);

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
  const requiresTemplateSelection = cart.items.some(
    (item) => item.serviceId === READY_STORE_SERVICE_ID,
  );
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
        brandAssets,
        purchaseAsBusiness,
        ...(templateSelection
          ? {
              selectedTemplate: {
                productCategory: templateSelection.category,
                templateId: templateSelection.id,
              },
            }
          : {}),
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

  const prepareStripeSessionWithRetries = async () => {
    setHasPaymentPrepareFailed(false);
    setIsPreparingPayment(true);
    setCheckoutError("");
    for (let attempt = 1; attempt <= PAYMENT_PREPARE_MAX_RETRIES; attempt += 1) {
      const result = await createEmbeddedSession();
      if (result.ok) {
        setIsPreparingPayment(false);
        return result;
      }

      if (attempt < PAYMENT_PREPARE_MAX_RETRIES) {
        setCheckoutError("");
        await new Promise((resolve) => setTimeout(resolve, 700));
      }
    }

    setIsPreparingPayment(false);
    setHasPaymentPrepareFailed(true);
    setCheckoutError(PAYMENT_PREPARE_FAILED_MESSAGE);
    return { ok: false as const };
  };

  useEffect(() => {
    setMounted(true);
    const currentCart = getCart();
    setCart(currentCart);
    setTemplateSelection(getCheckoutTemplateSelection());
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

  useEffect(() => {
    if (!mounted || cart.items.length === 0) return;
    const root = checkoutRootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      const els = root.querySelectorAll<HTMLElement>("[data-checkout-reveal]");
      if (!els.length) return;
      gsap.set(els, { opacity: 0, y: 32 });
      gsap.to(els, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.14,
        ease: "back.out(1.25)",
      });
    }, root);

    return () => ctx.revert();
  }, [mounted, cart.items.length, logicalStep]);

  const paymentStepIndex = totalSteps;

  useEffect(() => {
    if (logicalStep !== paymentStepIndex) {
      paymentInitRef.current = false;
      return;
    }
    if (!acceptedCheckoutTerms) {
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
    prepareStripeSessionWithRetries()
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
          setIsPreparingPayment(false);
          paymentInitRef.current = false;
          setCheckoutError(PAYMENT_PREPARE_FAILED_MESSAGE);
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
    acceptedCheckoutTerms,
    purchaseAsBusiness,
    formData.company,
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
    if (purchaseAsBusiness && !formData.company?.trim()) {
      setCheckoutError("При закупуване като фирма въведете име на фирмата.");
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
    if (purchaseAsBusiness && !formData.company?.trim()) {
      setCheckoutError("При закупуване като фирма въведете име на фирмата.");
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
      const json = (await res.json()) as {
        logoUrl?: string | null;
        paletteUrl?: string | null;
        error?: string;
      };
      if (!res.ok) {
        setCheckoutError(json.error ?? "Качването не бе успешно.");
        return false;
      }
      const uploadedUrls: Record<string, string> = {};
      if (typeof json.logoUrl === "string" && json.logoUrl) uploadedUrls.logoUrl = json.logoUrl;
      if (typeof json.paletteUrl === "string" && json.paletteUrl) uploadedUrls.paletteUrl = json.paletteUrl;
      const merged = { ...brandUrls, ...uploadedUrls };
      setBrandUrls(merged);
      return merged;
    } catch {
      setCheckoutError("Качването не бе успешно.");
      return false;
    }
  };

  const notifyMissingLegalConsent = () => {
    const message =
      "Моля приемете Общите условия, Политиката за поверителност и Политиката за връщане.";
    setLegalConsentError(message);
    toast.error(message);
  };

  const handleContinueFromAccount = async () => {
    if (!acceptedCheckoutTerms) {
      notifyMissingLegalConsent();
      return;
    }
    if (!(await validateAccount())) return;
    setLogicalStep(2);
  };

  const handleContinueFromAssets = async () => {
    if (!acceptedCheckoutTerms) {
      notifyMissingLegalConsent();
      return;
    }
    if (requiresTemplateSelection && !templateSelection) {
      const message = "Моля изберете шаблон за онлайн магазина.";
      setCheckoutError(message);
      toast.error(message);
      return;
    }
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
      return logicalStep === 1 ? "Шаблон и бранд" : "Плащане";
    }
    return logicalStep === 1
      ? "Акаунт"
      : logicalStep === 2
        ? "Шаблон и бранд"
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
    <div ref={checkoutRootRef} className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div data-checkout-reveal className="opacity-0 translate-y-10">
            <TrackedCtaLink
              href="/cart"
              ctaId="checkout_back_to_cart"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
            >
              <ArrowLeft className="h-4 w-4" />
              Обратно към кошницата
            </TrackedCtaLink>

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
                        <div className="rounded-lg border border-border p-4 space-y-3">
                          <label className="flex items-start gap-3 cursor-pointer">
                            <Checkbox
                              checked={purchaseAsBusiness}
                              onCheckedChange={(value) => {
                                const on = value === true;
                                setPurchaseAsBusiness(on);
                                if (!on) setCheckoutError("");
                              }}
                            />
                            <span className="text-sm text-muted-foreground leading-snug">
                              Закупувам като фирма - във формата за плащане на Stripe ще има задължително поле
                              „VAT / ДДС номер (фирма)“.
                            </span>
                          </label>
                          <Field>
                            <FieldLabel htmlFor="company">
                              {purchaseAsBusiness ? "Име на фирмата *" : "Фирма (по избор)"}
                            </FieldLabel>
                            <Input
                              id="company"
                              name="company"
                              value={formData.company}
                              onChange={handleInputChange}
                              placeholder="Име на фирма"
                              required={purchaseAsBusiness}
                            />
                          </Field>
                        </div>
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
                  <div className="rounded-lg border border-border p-4">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <Checkbox
                        checked={acceptedCheckoutTerms}
                        onCheckedChange={(value) => {
                          const isAccepted = value === true;
                          setAcceptedCheckoutTerms(isAccepted);
                          if (isAccepted) setLegalConsentError("");
                        }}
                      />
                      <span className="text-sm text-muted-foreground">
                        Съгласен/на съм с{" "}
                        <Link
                          href="/terms-and-conditions"
                          className="underline hover:text-foreground"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Общите условия
                        </Link>
                        ,{" "}
                        <Link
                          href="/privacy-policy"
                          className="underline hover:text-foreground"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Политиката за поверителност
                        </Link>{" "}
                        и{" "}
                        <Link
                          href="/terms-and-conditions#refund-policy"
                          className="underline hover:text-foreground"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Политиката за връщане на суми
                        </Link>
                        .
                      </span>
                    </label>
                    {legalConsentError ? (
                      <p className="mt-2 text-xs text-red-500">{legalConsentError}</p>
                    ) : null}
                  </div>
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
                      <CardTitle className="text-lg">Шаблон, лого и палитра</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {requiresTemplateSelection ? (
                        <CheckoutTemplatePicker
                          value={templateSelection}
                          onChange={setTemplateSelection}
                        />
                      ) : null}

                      {isLoggedInCustomer ? (
                        <div className="space-y-4">
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
                          <div className="rounded-lg border border-border p-4 space-y-3">
                            <label className="flex items-start gap-3 cursor-pointer">
                              <Checkbox
                                checked={purchaseAsBusiness}
                                onCheckedChange={(value) => {
                                  const on = value === true;
                                  setPurchaseAsBusiness(on);
                                  if (!on) setCheckoutError("");
                                }}
                              />
                              <span className="text-sm text-muted-foreground leading-snug">
                                Закупувам като фирма - във формата за плащане на Stripe ще има задължително поле
                                „VAT / ДДС номер (фирма)“.
                              </span>
                            </label>
                            <Field>
                              <FieldLabel htmlFor="companyLoggedIn">
                                {purchaseAsBusiness ? "Име на фирмата *" : "Фирма (по избор)"}
                              </FieldLabel>
                              <Input
                                id="companyLoggedIn"
                                name="company"
                                value={formData.company ?? ""}
                                onChange={handleInputChange}
                                placeholder="Име на фирма"
                                required={purchaseAsBusiness}
                              />
                            </Field>
                          </div>
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
                      {isLoggedInCustomer ? (
                        <div className="rounded-lg border border-border p-4">
                          <label className="flex items-start gap-3 cursor-pointer">
                            <Checkbox
                              checked={acceptedCheckoutTerms}
                              onCheckedChange={(value) => {
                                const isAccepted = value === true;
                                setAcceptedCheckoutTerms(isAccepted);
                                if (isAccepted) setLegalConsentError("");
                              }}
                            />
                            <span className="text-sm text-muted-foreground">
                              Съгласен/на съм с{" "}
                              <Link
                                href="/terms-and-conditions"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline hover:text-foreground"
                              >
                                Общите условия
                              </Link>
                              ,{" "}
                              <Link
                                href="/privacy-policy"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline hover:text-foreground"
                              >
                                Политиката за поверителност
                              </Link>{" "}
                              и{" "}
                              <Link
                                href="/terms-and-conditions#refund-policy"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline hover:text-foreground"
                              >
                                Политиката за връщане на суми
                              </Link>
                              .
                            </span>
                          </label>
                          {legalConsentError ? (
                            <p className="mt-2 text-xs text-red-500">{legalConsentError}</p>
                          ) : null}
                        </div>
                      ) : null}

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
                      {stripeClientSecret ? (
                        <div className="bg-secondary/30 rounded-lg p-2">
                          <EmbeddedCheckoutProvider
                            stripe={stripePromise}
                            options={{ clientSecret: stripeClientSecret }}
                          >
                            <EmbeddedCheckout />
                          </EmbeddedCheckoutProvider>
                        </div>
                      ) : !hasPaymentPrepareFailed || isPreparingPayment ? (
                        <div className="bg-secondary/50 rounded-lg p-6">
                          <div className="space-y-3 animate-pulse">
                            <div className="h-4 w-2/3 rounded bg-muted" />
                            <div className="h-10 w-full rounded bg-muted" />
                            <div className="h-10 w-full rounded bg-muted" />
                            <div className="h-10 w-5/6 rounded bg-muted" />
                          </div>
                        </div>
                      ) : (
                        <div className="bg-secondary/50 rounded-lg p-6 text-center">
                          <p className="text-muted-foreground text-sm mb-2">
                            Нещо се провали при подгодовката за формата за плащане...
                          </p>
                          {checkoutError ? (
                            <p className="text-xs text-red-500 mb-4">{checkoutError}</p>
                          ) : null}
                          <Button
                            type="button"
                            variant="outline"
                            disabled={isSubmitting}
                            onClick={async () => {
                              if (!acceptedCheckoutTerms) {
                                notifyMissingLegalConsent();
                                return;
                              }
                              setIsSubmitting(true);
                              setCheckoutError("");
                              paymentInitRef.current = false;
                              const r = await prepareStripeSessionWithRetries();
                              setIsSubmitting(false);
                              if (r.ok && r.clientSecret) {
                                setStripeClientSecret(r.clientSecret);
                              } else if (r.ok && r.checkoutUrl) {
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

                  <div>
                    <Button type="button" variant="outline" className="w-full" onClick={handleBack}>
                      Назад
                    </Button>
                  </div>
                </>
              ) : null}
            </div>
          </div>

          <div data-checkout-reveal className="opacity-0 translate-y-10">
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
