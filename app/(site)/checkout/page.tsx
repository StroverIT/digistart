"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { TrackedCtaLink } from "@/components/analytics/tracked-cta-link";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  CreditCard,
  Eye,
  EyeOff,
  KeyRound,
  Package,
  RefreshCw,
  Shield,
  User,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Price } from "@/components/ui/price";
import type { Cart, CustomerInfo, Service } from "@/lib/types";
import { getCheckoutStage } from "@/lib/analytics/checkout-funnel";
import { getCart, clearCart, updateCartItemUpsells } from "@/lib/store/cart";
import { recordCheckoutFunnelStage } from "@/lib/store/checkout-analytics";
import {
  applyAdminPricingToCart,
  isAdminCheckoutRole,
} from "@/lib/pricing/admin-checkout-pricing";
import {
  getCheckoutTemplateSelection,
  type CheckoutTemplateSelection,
} from "@/lib/store/checkout-template";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FieldGroup, Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import {
  downloadPasswordBackup,
  generateStrongPassword,
} from "@/lib/password/generate-strong-password";
import { getServiceById } from "@/lib/data/services";
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { toast } from "sonner";
import Link from "next/link";
import gsap from "gsap";
import { cn } from "@/lib/utils";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "");
const PAYMENT_PREPARE_MAX_RETRIES = 3;
const PAYMENT_PREPARE_FAILED_MESSAGE =
  "Нещо се провали при подготовката за формата за плащане. Опитайте отново.";

function contactFieldsMissingMessage(
  name: string,
  email: string,
  phone: string
): string | null {
  const missing: string[] = [];
  if (!name.trim()) missing.push("име");
  if (!email.trim()) missing.push("имейл");
  if (!phone.trim()) missing.push("телефон");
  if (missing.length === 0) return null;
  if (missing.length === 1) return `Моля попълнете ${missing[0]}.`;
  if (missing.length === 2) return `Моля попълнете ${missing[0]} и ${missing[1]}.`;
  return "Моля попълнете име, имейл и телефон.";
}

const checkoutCheckboxClassName =
  "mt-0.5 size-5 border-foreground/50 bg-background shadow-sm hover:border-foreground/80 group-hover:border-foreground/80";

const checkoutChoiceLabelClassName =
  "group flex cursor-pointer select-none items-start gap-3 rounded-lg p-3 transition-colors hover:bg-muted/30";

const checkoutInputClassName =
  "border-foreground/30 bg-background text-foreground shadow-none placeholder:text-muted-foreground/60 focus-visible:border-primary focus-visible:ring-primary/30 dark:border-foreground/35 dark:bg-background dark:text-foreground";

const checkoutReadOnlyInputClassName =
  "border-foreground/15 bg-muted/50 text-foreground shadow-none cursor-default dark:bg-muted/40 dark:text-foreground";

const checkoutFormCardClassName = "bg-card border-border shadow-sm overflow-hidden";
const checkoutFormCardHeaderClassName = "border-b border-border/60 bg-muted/20 pb-4";

type CheckoutStepIndicatorProps = {
  currentStep: number;
  labels: string[];
};

function CheckoutStepIndicator({ currentStep, labels }: CheckoutStepIndicatorProps) {
  return (
    <ol className="mb-8 flex items-center gap-1 sm:gap-2" aria-label="Стъпки на поръчката">
      {labels.map((label, index) => {
        const stepNum = index + 1;
        const isComplete = stepNum < currentStep;
        const isCurrent = stepNum === currentStep;

        return (
          <li key={label} className="flex min-w-0 flex-1 items-center gap-1 sm:gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                  isComplete && "bg-accent text-accent-foreground",
                  isCurrent && "bg-accent/15 text-accent ring-2 ring-accent/25",
                  !isComplete && !isCurrent && "bg-muted text-muted-foreground",
                )}
              >
                {isComplete ? <CheckCircle2 className="size-4" aria-hidden /> : stepNum}
              </span>
              <span
                className={cn(
                  "hidden truncate text-sm font-medium sm:block",
                  isCurrent ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {label}
              </span>
            </div>
            {index < labels.length - 1 ? (
              <div
                className={cn(
                  "h-px min-w-3 flex-1",
                  stepNum < currentStep ? "bg-accent/40" : "bg-border",
                )}
                aria-hidden
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

function CheckoutErrorAlert({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="rounded-lg border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive"
    >
      {message}
    </div>
  );
}

type CheckoutLegalConsentProps = {
  checkboxId: string;
  checked: boolean;
  onCheckedChange: (accepted: boolean) => void;
  error?: string;
  variant?: "bordered" | "plain";
};

function CheckoutLegalConsent({
  checkboxId,
  checked,
  onCheckedChange,
  error,
  variant = "bordered",
}: CheckoutLegalConsentProps) {
  return (
    <div
      className={cn(
        variant === "bordered" &&
          "rounded-lg border border-border bg-muted/25 p-4 transition-colors has-focus-visible:ring-2 has-focus-visible:ring-ring/50",
        variant === "plain" && "pt-1",
      )}
    >
      <label
        htmlFor={checkboxId}
        className={cn(checkoutChoiceLabelClassName, variant === "bordered" && "-m-3 p-3")}
      >
        <Checkbox
          id={checkboxId}
          checked={checked}
          className={checkoutCheckboxClassName}
          onCheckedChange={(value) => onCheckedChange(value === true)}
        />
        <span className="text-sm font-medium leading-relaxed text-foreground">
          Съгласен/на съм с{" "}
          <Link
            href="/terms-and-conditions"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-accent underline underline-offset-2 hover:text-accent/80"
          >
            Общите условия
          </Link>
          ,{" "}
          <Link
            href="/privacy-policy"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-accent underline underline-offset-2 hover:text-accent/80"
          >
            Политиката за поверителност
          </Link>{" "}
          и{" "}
          <Link
            href="/terms-and-conditions#refund-policy"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-accent underline underline-offset-2 hover:text-accent/80"
          >
            Политиката за връщане на суми
          </Link>
          .
        </span>
      </label>
      {error ? <p className="mt-2 text-xs text-red-500">{error}</p> : null}
    </div>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const isAdminCheckout = isAdminCheckoutRole(session?.user?.role);
  const isLoggedInCustomer =
    session?.user?.email &&
    session.user.role !== "admin";
  const isLoggedInForCheckout = isLoggedInCustomer || isAdminCheckout;

  const totalSteps = isLoggedInForCheckout ? 2 : 3;
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
  const [generatePasswordOpen, setGeneratePasswordOpen] = useState(false);
  const [downloadPasswordOpen, setDownloadPasswordOpen] = useState(false);
  const [pendingGeneratedPassword, setPendingGeneratedPassword] = useState("");
  const [acceptedCheckoutTerms, setAcceptedCheckoutTerms] = useState(false);
  const [purchaseAsBusiness, setPurchaseAsBusiness] = useState(false);
  const [legalConsentError, setLegalConsentError] = useState("");
  const [templateSelection, setTemplateSelection] = useState<CheckoutTemplateSelection | null>(
    null,
  );
  const paymentInitRef = useRef(false);
  const checkoutRootRef = useRef<HTMLDivElement>(null);
  const recordedFunnelStagesRef = useRef<Set<string>>(new Set());

  const [formData, setFormData] = useState<CustomerInfo>({
    name: "",
    email: "",
    phone: "",
    company: "",
    notes: "",
  });

  const displayCart = useMemo(
    () => (isAdminCheckout ? applyAdminPricingToCart(cart) : cart),
    [cart, isAdminCheckout],
  );

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

  const openGeneratePasswordDialog = useCallback(() => {
    setPendingGeneratedPassword(generateStrongPassword());
    setGeneratePasswordOpen(true);
  }, []);

  const regeneratePendingPassword = useCallback(() => {
    setPendingGeneratedPassword(generateStrongPassword());
  }, []);

  const acceptGeneratedPassword = useCallback(() => {
    setPassword(pendingGeneratedPassword);
    setPasswordConfirm(pendingGeneratedPassword);
    setPasswordFieldTouched(true);
    setShowPassword(true);
    setGeneratePasswordOpen(false);
    setDownloadPasswordOpen(true);
  }, [pendingGeneratedPassword]);

  const skipPasswordDownload = useCallback(() => {
    setDownloadPasswordOpen(false);
    setPendingGeneratedPassword("");
    toast.success("Паролата е попълнена в полетата.");
  }, []);

  const downloadPasswordAndClose = useCallback(() => {
    downloadPasswordBackup(pendingGeneratedPassword);
    setDownloadPasswordOpen(false);
    setPendingGeneratedPassword("");
    toast.success("Паролата е изтеглена и попълнена в полетата.");
  }, [pendingGeneratedPassword]);

  useEffect(() => {
    if (isLoggedInForCheckout && session?.user) {
      setFormData((prev) => ({
        ...prev,
        name: session.user.name ?? prev.name,
        email: session.user.email ?? prev.email,
      }));
    }
  }, [isLoggedInForCheckout, session?.user?.name, session?.user?.email]);

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
    const firstItem = currentCart.items[0];
    if (firstItem?.upsells.some((u) => u.upsellId === "color-palette" && u.quantity > 0)) {
      const nextUpsells = firstItem.upsells.filter((u) => u.upsellId !== "color-palette");
      setCart(updateCartItemUpsells(firstItem.id, nextUpsells));
    } else {
      setCart(currentCart);
    }
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

  useEffect(() => {
    if (!mounted || cart.items.length === 0) return;

    const stage = getCheckoutStage(logicalStep, isLoggedInForCheckout);
    if (recordedFunnelStagesRef.current.has(stage)) return;

    recordedFunnelStagesRef.current.add(stage);
    recordCheckoutFunnelStage(stage, {
      logicalStep,
      totalSteps,
      isLoggedIn: isLoggedInForCheckout,
    });
  }, [mounted, cart.items.length, logicalStep, isLoggedInForCheckout, totalSteps]);

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
    const contactError = contactFieldsMissingMessage(
      formData.name,
      formData.email,
      formData.phone
    );
    if (contactError) {
      setCheckoutError(contactError);
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

  const validateBusinessStep = () => {
    setCheckoutError("");
    if (isLoggedInForCheckout) {
      const contactError = contactFieldsMissingMessage(
        formData.name,
        formData.email,
        formData.phone
      );
      if (contactError) {
        setCheckoutError(contactError);
        return false;
      }
    }
    if (purchaseAsBusiness && !formData.company?.trim()) {
      setCheckoutError("При закупуване като фирма въведете име на фирмата.");
      return false;
    }
    return true;
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

  const handleContinueFromBusiness = () => {
    if (!acceptedCheckoutTerms) {
      notifyMissingLegalConsent();
      return;
    }
    if (!validateBusinessStep()) return;
    paymentInitRef.current = false;
    setStripeClientSecret(null);
    setLogicalStep(isLoggedInForCheckout ? 2 : 3);
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
    if (isLoggedInForCheckout) {
      return logicalStep === 1 ? "Фирма" : "Плащане";
    }
    return logicalStep === 1
      ? "Акаунт"
      : logicalStep === 2
        ? "Фирма"
        : "Плащане";
  }, [isLoggedInForCheckout, logicalStep]);

  const checkoutStepLabels = useMemo(
    () => (isLoggedInForCheckout ? ["Фирма", "Плащане"] : ["Акаунт", "Фирма", "Плащане"]),
    [isLoggedInForCheckout],
  );

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
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div data-checkout-reveal className="space-y-6 opacity-0 translate-y-10 lg:col-span-2">
            <TrackedCtaLink
              href="/cart"
              ctaId="checkout_back_to_cart"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Обратно към кошницата
            </TrackedCtaLink>

            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <CreditCard className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold sm:text-3xl">Завършване на поръчка</h1>
                <p className="text-muted-foreground">
                  Стъпка {logicalStep} от {totalSteps}: {displayStepLabel}
                </p>
              </div>
            </div>

            <CheckoutStepIndicator currentStep={logicalStep} labels={checkoutStepLabels} />

            <div className="space-y-6">
              {!isLoggedInForCheckout && logicalStep === 1 ? (
                <>
                  <Card className={checkoutFormCardClassName}>
                    <CardHeader className={checkoutFormCardHeaderClassName}>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <User className="h-5 w-5 shrink-0 text-accent" />
                        Създаване на акаунт
                      </CardTitle>
                      <CardDescription>
                        Създайте акаунт, за да управлявате поръчката и услугите си.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <FieldGroup>
                        <Field>
                          <FieldLabel htmlFor="name">Име и фамилия *</FieldLabel>
                          <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="Иван Петров"
                            className={checkoutInputClassName}
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
                              className={checkoutInputClassName}
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
                              placeholder="+359 88 123 4567"
                              className={checkoutInputClassName}
                              required
                            />
                          </Field>
                        </div>
                        <Field>
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <FieldLabel htmlFor="password" className="mb-0">
                              Парола *
                            </FieldLabel>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-8 gap-1.5 border-accent/30 text-xs text-accent hover:bg-accent/10 hover:text-accent"
                              onClick={openGeneratePasswordDialog}
                            >
                              <KeyRound className="h-3.5 w-3.5" />
                              Генерирай сигурна парола
                            </Button>
                          </div>
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
                              className={cn(checkoutInputClassName, "pr-11")}
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
                        <Dialog
                          open={generatePasswordOpen}
                          onOpenChange={(open) => {
                            setGeneratePasswordOpen(open);
                            if (!open) setPendingGeneratedPassword("");
                          }}
                        >
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Сигурна парола</DialogTitle>
                              <DialogDescription>
                                Генерирахме парола, която отговаря на изискванията за сигурност.
                                Прегледайте я и изберете дали да я използвате.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="relative">
                              <div className="rounded-md border border-border bg-muted/40 px-3 py-2.5 pr-11">
                                <p className="break-all font-mono text-sm">{pendingGeneratedPassword}</p>
                              </div>
                              <button
                                type="button"
                                onClick={regeneratePendingPassword}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                aria-label="Генерирай нова парола"
                              >
                                <RefreshCw className="h-4 w-4" />
                              </button>
                            </div>
                            <DialogFooter className="gap-4">
                              <Button type="button" variant="outline" onClick={() => setGeneratePasswordOpen(false)}>
                                Отказ
                              </Button>
                              <Button type="button" onClick={acceptGeneratedPassword}>
                                Използвай паролата
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        <Dialog
                          open={downloadPasswordOpen}
                          onOpenChange={(open) => {
                            setDownloadPasswordOpen(open);
                            if (!open) setPendingGeneratedPassword("");
                          }}
                        >
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Запазване на паролата</DialogTitle>
                              <DialogDescription>
                                Паролата е попълнена в двете полета. Искате ли да я изтеглите като
                                текстов файл, за да я запазите на сигурно място?
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter className="gap-4">
                              <Button type="button" variant="outline" onClick={skipPasswordDownload}>
                                Не, благодаря
                              </Button>
                              <Button type="button" onClick={downloadPasswordAndClose}>
                                Да, изтегли файла
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
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
                              className={cn(checkoutInputClassName, "pr-11")}
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
                      </FieldGroup>
                    </CardContent>
                  </Card>
                  {checkoutError ? <CheckoutErrorAlert message={checkoutError} /> : null}
                  <div className="space-y-4 rounded-xl border border-border bg-card p-4 shadow-sm">
                    <CheckoutLegalConsent
                      checkboxId="checkout-terms-guest"
                      checked={acceptedCheckoutTerms}
                      onCheckedChange={(isAccepted) => {
                        setAcceptedCheckoutTerms(isAccepted);
                        if (isAccepted) setLegalConsentError("");
                      }}
                      error={legalConsentError}
                      variant="plain"
                    />
                    <Button
                      type="button"
                      size="lg"
                      className="w-full glow-primary"
                      onClick={handleContinueFromAccount}
                    >
                      Напред
                    </Button>
                  </div>

                </>
              ) : null}

              {((isLoggedInForCheckout && logicalStep === 1) ||
                (!isLoggedInForCheckout && logicalStep === 2)) ? (
                <>
                  <Card className={checkoutFormCardClassName}>
                    <CardHeader className={checkoutFormCardHeaderClassName}>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Building2 className="h-5 w-5 shrink-0 text-accent" />
                        Закупуване като фирма
                      </CardTitle>
                      <CardDescription>
                        По желание въведете фирмени данни за фактура. Полето за фирма е задължително
                        само ако изберете закупуване като фирма.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                      {isLoggedInForCheckout ? (
                        <FieldGroup className="gap-5">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field>
                              <FieldLabel>Имейл</FieldLabel>
                              <Input
                                value={formData.email}
                                disabled
                                className={checkoutReadOnlyInputClassName}
                              />
                            </Field>
                            <Field>
                              <FieldLabel htmlFor="phone2">Телефон *</FieldLabel>
                              <Input
                                id="phone2"
                                name="phone"
                                type="tel"
                                value={formData.phone}
                                onChange={handleInputChange}
                                placeholder="+359 88 123 4567"
                                className={checkoutInputClassName}
                                required
                              />
                            </Field>
                          </div>
                        </FieldGroup>
                      ) : null}

                      <div className="space-y-4">
                        <label
                          htmlFor="checkout-purchase-as-business"
                          className={cn(
                            checkoutChoiceLabelClassName,
                            "items-center",
                            purchaseAsBusiness && "bg-accent/5 hover:bg-accent/8",
                          )}
                        >
                          <Checkbox
                            id="checkout-purchase-as-business"
                            checked={purchaseAsBusiness}
                            className={checkoutCheckboxClassName}
                            onCheckedChange={(value) => {
                              const on = value === true;
                              setPurchaseAsBusiness(on);
                              if (!on) setCheckoutError("");
                            }}
                          />
                          <span className="text-sm font-medium leading-snug text-foreground group-hover:text-foreground">
                            Закупувам като фирма
                          </span>
                        </label>

                        <Field
                          className={cn(
                            "rounded-lg px-3 py-3 transition-colors",
                            purchaseAsBusiness && "bg-accent/5",
                          )}
                        >
                          <FieldLabel htmlFor="company" className="text-foreground">
                            {purchaseAsBusiness ? "Име на фирмата *" : "Фирма (по избор)"}
                          </FieldLabel>
                          <Input
                            id="company"
                            name="company"
                            value={formData.company ?? ""}
                            onChange={handleInputChange}
                            placeholder="Пример: Дигистарт ООД"
                            className={checkoutInputClassName}
                            required={purchaseAsBusiness}
                            aria-invalid={purchaseAsBusiness && !formData.company?.trim()}
                          />
                          {!purchaseAsBusiness ? (
                            <FieldDescription>
                              Оставете празно, ако поръчката е за лично ползване.
                            </FieldDescription>
                          ) : null}
                        </Field>
                      </div>

                      {isLoggedInForCheckout ? (
                        <CheckoutLegalConsent
                          checkboxId="checkout-terms-logged-in"
                          checked={acceptedCheckoutTerms}
                          onCheckedChange={(isAccepted) => {
                            setAcceptedCheckoutTerms(isAccepted);
                            if (isAccepted) setLegalConsentError("");
                          }}
                          error={legalConsentError}
                          variant="plain"
                        />
                      ) : null}

                    </CardContent>
                  </Card>
                  {checkoutError ? <CheckoutErrorAlert message={checkoutError} /> : null}
                  <div className="flex gap-3">
                    {!isLoggedInForCheckout ? (
                      <Button type="button" variant="outline" size="lg" className="flex-1" onClick={handleBack}>
                        Назад
                      </Button>
                    ) : null}
                    <Button
                      type="button"
                      size="lg"
                      className="flex-1 glow-primary"
                      onClick={handleContinueFromBusiness}
                    >
                      Напред към плащане
                    </Button>
                  </div>
                </>
              ) : null}

              {logicalStep === paymentStepIndex ? (
                <>
                  <Card className={checkoutFormCardClassName}>
                    <CardHeader className={checkoutFormCardHeaderClassName}>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <CreditCard className="h-5 w-5 shrink-0 text-accent" />
                        Плащане
                      </CardTitle>
                      <CardDescription>
                        Въведете данните на картата си за сигурно завършване на поръчката.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-6">
                      {stripeClientSecret ? (
                        <div className="overflow-hidden rounded-lg border border-border/60 bg-muted/15 p-2">
                          <EmbeddedCheckoutProvider
                            stripe={stripePromise}
                            options={{ clientSecret: stripeClientSecret }}
                          >
                            <EmbeddedCheckout />
                          </EmbeddedCheckoutProvider>
                        </div>
                      ) : !hasPaymentPrepareFailed || isPreparingPayment ? (
                        <div className="rounded-lg border border-border/60 bg-muted/20 p-6">
                          <div className="space-y-3 animate-pulse">
                            <div className="h-4 w-2/3 rounded bg-muted" />
                            <div className="h-10 w-full rounded bg-muted" />
                            <div className="h-10 w-full rounded bg-muted" />
                            <div className="h-10 w-5/6 rounded bg-muted" />
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-lg border border-border/60 bg-muted/20 p-6 text-center">
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

                      <div className="mt-2 flex items-center gap-2 rounded-lg border border-border/60 bg-muted/25 px-3 py-2.5 text-sm text-muted-foreground">
                        <Shield className="h-4 w-4 shrink-0 text-accent" />
                        <span>Вашите данни са защитени с SSL криптиране</span>
                      </div>

                    </CardContent>
                  </Card>

                  <Button type="button" variant="outline" size="lg" className="w-full" onClick={handleBack}>
                    Назад
                  </Button>
                </>
              ) : null}
            </div>
          </div>

          <div data-checkout-reveal className="opacity-0 translate-y-10 lg:col-span-1">
            <Card className="sticky top-24 border-border bg-card shadow-sm">
              <CardHeader className="border-b border-border/60 pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 shrink-0 text-accent" />
                  Вашата поръчка
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {displayCart.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between gap-4 rounded-lg border border-border/60 bg-muted/15 px-3 py-3"
                  >
                    <div className="min-w-0">
                      <p className="font-medium leading-snug">{item.serviceName}</p>
                      <p className="text-sm text-muted-foreground">{item.selectedOptionName}</p>
                      {!isAdminCheckout && item.billingCycle === "annual-prepaid" ? (
                        <p className="mt-1 text-xs font-medium text-accent">
                          Предплатено за 1 година
                          {item.annualDiscountAmount
                            ? ` с ${Math.round((item.annualDiscountRate ?? 0) * 100)}% отстъпка`
                            : ""}
                        </p>
                      ) : null}
                      {cart.items.find((cartItem) => cartItem.id === item.id)?.upsells.length ? (
                        <ul className="mt-2 space-y-1">
                          {(cart.items.find((cartItem) => cartItem.id === item.id)?.upsells ?? []).map(
                            (upsell) => {
                              const service = servicesById[item.serviceId] ?? getServiceById(item.serviceId);
                              const serviceUpsell = service?.upsells.find((config) => config.id === upsell.upsellId);
                              if (!serviceUpsell) return null;
                              const choiceName =
                                serviceUpsell.kind === "choice" && !serviceUpsell.multiQuantityChoice
                                  ? serviceUpsell.choices?.find((choice) => choice.id === upsell.choiceId)?.name
                                  : null;
                              const multiChoiceSummary =
                                serviceUpsell.multiQuantityChoice && upsell.choiceQuantities
                                  ? serviceUpsell.choices
                                      ?.map((choice) => {
                                        const choiceQty = upsell.choiceQuantities?.[choice.id] ?? 0;
                                        if (choiceQty <= 0) return null;
                                        return `${choice.name} x${choiceQty}`;
                                      })
                                      .filter(Boolean)
                                      .join(", ")
                                  : null;
                              return (
                                <li key={upsell.upsellId} className="text-xs text-muted-foreground">
                                  + {serviceUpsell.name}
                                  {multiChoiceSummary ? ` (${multiChoiceSummary})` : ""}
                                  {choiceName ? ` (${choiceName})` : ""}
                                  {!multiChoiceSummary && upsell.quantity > 0 ? ` x${upsell.quantity}` : ""}
                                  {upsell.entries?.filter(Boolean).length
                                    ? ` - ${upsell.entries.filter(Boolean).join(", ")}`
                                    : ""}
                                </li>
                              );
                            })}
                        </ul>
                      ) : null}
                    </div>
                    <div className="shrink-0 text-right">
                      {isAdminCheckout ? (
                        <p className="text-sm font-medium text-accent">Включено</p>
                      ) : (
                        <Price value={item.totalPrice} className="font-semibold text-accent" />
                      )}
                      {!isAdminCheckout && item.billingCycle === "annual-prepaid" ? (
                        <div className="text-xs text-muted-foreground">за 1 година</div>
                      ) : !isAdminCheckout && item.isMonthly ? (
                        <span className="text-sm text-muted-foreground">/мес</span>
                      ) : null}
                    </div>
                  </div>
                ))}

                <div className="space-y-2 border-t border-border pt-4">
                  {displayCart.totalOneTime > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {isAdminCheckout
                          ? "Еднократно (админ)"
                          : displayCart.items.some((item) => item.billingCycle === "annual-prepaid")
                            ? "Еднократни плащания и предплащания"
                            : "Еднократни услуги"}
                      </span>
                      <Price value={displayCart.totalOneTime} />
                    </div>
                  )}
                  {!isAdminCheckout && displayCart.totalMonthly > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Месечни абонаменти</span>
                      <span>
                        <Price value={displayCart.totalMonthly} />/мес
                      </span>
                    </div>
                  )}
                </div>

                <div className="border-t border-border pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold">Обща сума</span>
                    <div className="text-right">
                      <Price
                        value={displayCart.totalOneTime + displayCart.totalMonthly}
                        className="text-2xl text-accent"
                      />
                      {!isAdminCheckout &&
                        displayCart.totalMonthly > 0 &&
                        displayCart.totalOneTime === 0 ? (
                        <span className="text-muted-foreground">/мес</span>
                      ) : null}
                    </div>
                  </div>
                  {!isAdminCheckout &&
                    displayCart.totalMonthly > 0 &&
                    displayCart.totalOneTime > 0 ? (
                    <p className="text-sm text-muted-foreground text-right mt-1">
                      + <Price value={displayCart.totalMonthly} />/мес след това
                    </p>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
