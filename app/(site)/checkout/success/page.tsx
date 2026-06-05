"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import gsap from "gsap";
import { useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { TrackedCtaLink } from "@/components/analytics/tracked-cta-link";
import { CheckCircle2, ArrowRight, Mail, Phone, Home, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Price } from "@/components/ui/price";
import { siteContact } from "@/lib/site-contact";
import { cartItemToMetaLineItem, trackMetaPurchase } from "@/lib/analytics/meta-pixel";
import { clearCart } from "@/lib/store/cart";
import {
  findFirstOnboardingOrderItem,
  getCheckoutSuccessSetupCta,
} from "@/lib/onboarding/service-setup-status";
import type { Order } from "@/lib/types";

const META_PURCHASE_STORAGE_PREFIX = "digistart_meta_purchase_";
/** Dedupes Purchase in React Strict Mode when sessionStorage is blocked. Clears on full reload. */
const metaPurchaseFiredOrderIds = new Set<string>();

const CHECKOUT_STATE_KEYS = [
  "digistart-checkout-draft",
  "digistart-checkout-brand-assets",
  "digistart-checkout-consultation",
  "digistart-checkout-step",
  "digistart-checkout-template",
];

function clearCheckoutClientState() {
  clearCart();
  if (typeof window === "undefined") return;

  for (const key of CHECKOUT_STATE_KEYS) {
    window.localStorage.removeItem(key);
    window.sessionStorage.removeItem(key);
  }
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const orderId = searchParams.get("id");
  const sessionId = searchParams.get("session_id");
  const [order, setOrder] = useState<Order | null>(null);
  const [mounted, setMounted] = useState(false);
  const autoSignInDone = useRef(false);
  const successRootRef = useRef<HTMLDivElement>(null);
  const metaPurchaseFiredRef = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const root = successRootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      const iconWrap = root.querySelector<HTMLElement>("[data-success-icon]");
      const title = root.querySelector<HTMLElement>("[data-success-title]");
      const desc = root.querySelector<HTMLElement>("[data-success-desc]");
      const blocks = root.querySelectorAll<HTMLElement>("[data-success-block]");
      const actions = root.querySelector<HTMLElement>("[data-success-actions]");

      const toReveal: HTMLElement[] = [];
      if (iconWrap) toReveal.push(iconWrap);
      if (title) toReveal.push(title);
      if (desc) toReveal.push(desc);
      blocks.forEach((el) => toReveal.push(el));
      if (actions) toReveal.push(actions);
      gsap.set(toReveal, { opacity: 0, y: 36 });

      const tl = gsap.timeline({ defaults: { ease: "back.out(1.5)" } });
      if (iconWrap) {
        gsap.set(iconWrap, { scale: 0.85 });
        tl.to(iconWrap, { opacity: 1, y: 0, scale: 1, duration: 0.55 }, 0.05);
      }
      if (title) tl.to(title, { opacity: 1, y: 0, duration: 0.5 }, "-=0.25");
      if (desc) tl.to(desc, { opacity: 1, y: 0, duration: 0.45 }, "-=0.2");
      if (blocks.length) {
        tl.to(blocks, { opacity: 1, y: 0, duration: 0.5, stagger: 0.1 }, "-=0.15");
      }
      if (actions) tl.to(actions, { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" }, "-=0.2");
    }, root);

    return () => ctx.revert();
  }, [mounted]);

  useEffect(() => {
    if (!mounted || !order?.id || !successRootRef.current) return;
    const root = successRootRef.current;
    const orderBlocks = root.querySelectorAll<HTMLElement>("[data-success-order-block]");
    if (!orderBlocks.length) return;

    const ctx = gsap.context(() => {
      gsap.set(orderBlocks, { opacity: 0, y: 36 });
      gsap.to(orderBlocks, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: "back.out(1.5)",
      });
    }, root);

    return () => ctx.revert();
  }, [mounted, order?.id]);

  useEffect(() => {
    if (!mounted || !orderId) return;
    clearCheckoutClientState();
  }, [mounted, orderId]);

  useEffect(() => {
    if (!mounted || !orderId) return;

    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 15;

    const poll = async () => {
      if (cancelled) return;
      const res = sessionId
        ? await fetch(`/api/checkout/orders/${orderId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session_id: sessionId }),
        })
        : await fetch(`/api/checkout/orders/${orderId}`);
      if (!res.ok || cancelled) return;
      const data = (await res.json()) as { order?: Order };
      const o = data.order ?? null;
      setOrder(o);

      if (
        o?.status === "paid" &&
        o.userId &&
        o.postCheckoutToken &&
        sessionId &&
        status === "unauthenticated" &&
        !autoSignInDone.current
      ) {
        const result = await signIn("post-checkout", {
          orderId,
          token: o.postCheckoutToken,
          redirect: false,
        });
        if (!result?.error) {
          autoSignInDone.current = true;
        }
      }

      attempts += 1;
      if (attempts < maxAttempts) {
        setTimeout(poll, 1000);
      }
    };

    void poll();
    return () => {
      cancelled = true;
    };
  }, [mounted, orderId, sessionId, status]);

  useEffect(() => {
    if (!order || order.status !== "paid" || !orderId) return;
    if (metaPurchaseFiredRef.current) return;

    const storageKey = `${META_PURCHASE_STORAGE_PREFIX}${orderId}`;
    try {
      if (typeof window !== "undefined" && sessionStorage.getItem(storageKey)) {
        metaPurchaseFiredRef.current = true;
        return;
      }
    } catch {
      // ignore
    }

    if (metaPurchaseFiredOrderIds.has(orderId)) {
      metaPurchaseFiredRef.current = true;
      return;
    }

    metaPurchaseFiredRef.current = true;
    metaPurchaseFiredOrderIds.add(orderId);
    try {
      if (typeof window !== "undefined") {
        sessionStorage.setItem(storageKey, "1");
      }
    } catch {
      // ignore
    }

    const lineItems = order.cart.items.map((item) => cartItemToMetaLineItem(item));
    const value = order.cart.totalOneTime + order.cart.totalMonthly;
    const fullName = (order.customer?.name ?? "").trim();
    const firstSpace = fullName.indexOf(" ");
    const firstName = firstSpace > 0 ? fullName.slice(0, firstSpace) : fullName || undefined;
    const lastName = firstSpace > 0 ? fullName.slice(firstSpace + 1).trim() : undefined;
    trackMetaPurchase({
      lineItems,
      value,
      orderId,
      page_path: "/checkout/success",
      user: {
        email: order.customer?.email,
        phone: order.customer?.phone,
        firstName,
        lastName,
        externalId: order.userId ?? undefined,
      },
    });
  }, [order, orderId]);

  if (!mounted) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const isOrderLoading = Boolean(orderId && !order);
  const onboardingItem = order ? findFirstOnboardingOrderItem(order.cart.items) : null;
  const setupCtaLabel = onboardingItem
    ? getCheckoutSuccessSetupCta(onboardingItem.serviceId).label
    : "Продължи настройката";
  const showSetupCta = Boolean(session?.user?.role === "customer" && onboardingItem);
  const showSetupCtaSkeleton =
    Boolean(orderId) && (isOrderLoading || Boolean(onboardingItem && !showSetupCta));

  return (
    <div ref={successRootRef} className="max-w-2xl mx-auto text-center">
      <div data-success-icon className="relative mb-8 opacity-0 translate-y-10">
        <div className="h-24 w-24 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
          <CheckCircle2 className="h-12 w-12 text-green-500" />
        </div>
        <div className="absolute inset-0 h-24 w-24 mx-auto rounded-full bg-green-500/10 animate-ping" />
      </div>

      <h1 data-success-title className="text-3xl sm:text-4xl font-bold mb-4 opacity-0 translate-y-10">
        Поръчката е успешна!
      </h1>

      <p
        data-success-desc
        className="text-lg text-muted-foreground mb-8 max-w-md mx-auto opacity-0 translate-y-10"
      >
        Благодарим ви за доверието! Ще се свържем с вас в рамките на 24 часа за следващите стъпки.
      </p>

      {order ? (
        <>
          <p
            data-success-order-block
            className="text-sm mb-6 text-muted-foreground opacity-0 translate-y-10"
          >
            Статус на плащането:{" "}
            <span className="font-semibold text-foreground">
              {order.status === "paid" ? "Потвърдено" : "Обработва се"}
            </span>
          </p>

          <Card
            data-success-order-block
            className="bg-card border-border mb-8 text-left opacity-0 translate-y-10"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-muted-foreground">Номер на поръчка</span>
                <span className="font-mono font-bold text-primary">{order.id}</span>
              </div>

              <div className="border-t border-border pt-4 space-y-3">
                {order.cart.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <span>
                      {item.serviceName} - {item.selectedOptionName}
                    </span>
                    <span className="font-medium">
                      <Price value={item.totalPrice} />
                      {item.isMonthly && "/мес"}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-4 mt-4 flex items-center justify-between">
                <span className="font-semibold">Обща сума</span>
                <Price
                  value={order.cart.totalOneTime + order.cart.totalMonthly}
                  className="text-xl gradient-text"
                />
              </div>

              {order.consultation ? (
                <div className="border-t border-border pt-4 mt-4">
                  <p className="text-sm text-muted-foreground mb-1">Запазена консултация</p>
                  <p className="font-medium">
                    {order.consultation.date} в {order.consultation.time}
                  </p>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </>
      ) : isOrderLoading ? (
        <>
          <Skeleton className="mx-auto mb-6 h-5 w-52" aria-hidden />
          <Card className="mb-8 border-border bg-card text-left" aria-busy="true" aria-label="Зареждане на поръчка">
            <CardContent className="space-y-4 p-6">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-40" />
              </div>
              <div className="space-y-3 border-t border-border pt-4">
                <div className="flex items-center justify-between gap-4">
                  <Skeleton className="h-4 w-[62%] max-w-sm" />
                  <Skeleton className="h-4 w-24 shrink-0" />
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-border pt-4">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-6 w-28" />
              </div>
            </CardContent>
          </Card>
        </>
      ) : null}

      <Card
        data-success-block
        className="bg-primary/5 border-primary/20 mb-8 opacity-0 translate-y-10"
      >
        <CardContent className="p-6">
          <h2 className="font-semibold mb-4">Какво следва?</h2>
          <ol className="text-left space-y-3">
            <li className="flex items-start gap-3">
              <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center shrink-0">
                1
              </span>
              <span className="text-muted-foreground">Ще получите имейл с потвърждение на поръчката</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center shrink-0">
                2
              </span>
              <span className="text-muted-foreground">
                {order?.consultation
                  ? `Консултацията ви е потвърдена за ${order.consultation.date} в ${order.consultation.time}`
                  : "Наш екип ще прегледа материалите и ще се свърже с вас"}
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center shrink-0">
                3
              </span>
              <span className="text-muted-foreground">Стартираме работа по вашия проект</span>
            </li>
          </ol>
        </CardContent>
      </Card>

      <div
        data-success-block
        className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-8 text-sm text-muted-foreground opacity-0 translate-y-10"
      >
        <a
          href={`mailto:${siteContact.email}`}
          className="flex items-center gap-2 hover:text-primary transition-colors"
        >
          <Mail className="h-4 w-4" />
          {siteContact.email}
        </a>
        <a
          href={siteContact.phoneHref}
          className="flex items-center gap-2 hover:text-primary transition-colors"
        >
          <Phone className="h-4 w-4" />
          {siteContact.phoneLabel}
        </a>
      </div>

      <div
        data-success-actions
        className="flex flex-col sm:flex-row items-center justify-center gap-4 opacity-0 translate-y-10"
      >
        <TrackedCtaLink href="/" ctaId="checkout_success_home">
          <Button variant="outline" size="lg">
            <Home className="mr-2 h-5 w-5" />
            Към началото
          </Button>
        </TrackedCtaLink>
        <TrackedCtaLink href="/#services" ctaId="checkout_success_more_services">
          <Button size="lg" variant="secondary">
            Разгледайте още услуги
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </TrackedCtaLink>
        {showSetupCta ? (
          <TrackedCtaLink
            href={`/user/services/${onboardingItem!.id}`}
            ctaId="checkout_success_service_setup"
          >
            <Button size="lg" className="glow-primary">
              {setupCtaLabel}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </TrackedCtaLink>
        ) : showSetupCtaSkeleton ? (
          <Skeleton
            className="h-10 w-64 max-w-full rounded-md sm:h-11"
            aria-busy="true"
            aria-label="Зареждане на бутон за настройка"
          />
        ) : null}
        {session?.user?.role === "customer" && order?.cart?.items?.[0]?.id && !onboardingItem ? (
          <TrackedCtaLink
            href={`/user/services/${order.cart.items[0].id}`}
            ctaId="checkout_success_open_user_panel_order"
          >
            <Button size="lg" variant="secondary">
              Виж поръчката в панела
              <User className="ml-2 h-5 w-5" />
            </Button>
          </TrackedCtaLink>
        ) : null}
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        <Suspense
          fallback={
            <div className="h-96 flex items-center justify-center">
              <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          }
        >
          <SuccessContent />
        </Suspense>
      </div>
    </div>
  );
}
