"use client";

import TransitionLink from "@/components/transitions/TransitionLink";
import { useState, useEffect, useRef, useCallback, useLayoutEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { ChevronDown, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCartItemCount } from "@/lib/store/cart";
import { cn } from "@/lib/utils";
import Hamburger from "hamburger-react";
import { useSession, signOut } from "next-auth/react";
import { AnalyticsToolbar } from "@/components/analytics/analytics-toolbar";
import { TrackedCtaLink } from "@/components/analytics/tracked-cta-link";
import { ServiceSlotsBanner } from "@/components/layout/service-slots-banner";
import { clearPreferences, hasCompletedSurvey } from "@/lib/visitor-preferences/storage";
import {
  SITE_LOGO_HEIGHT,
  SITE_LOGO_SIZES,
  SITE_LOGO_SRC,
  SITE_LOGO_WIDTH,
} from "@/lib/site-brand";

let gsapModule: Promise<typeof import("gsap")> | null = null;
function loadGsap() {
  gsapModule ??= import("gsap");
  return gsapModule;
}

const serviceNavLinks = [
  {
    href: "/services/ai-automation",
    label: "AI Automation",
    paths: ["/услуги/ai-automation", "/services/ai-automation"],
  },
  {
    href: "/services/online-store",
    label: "Онлайн магазин",
    paths: ["/услуги/онлайн-магазин", "/services/online-store"],
  },
  {
    href: "/services/social-media",
    label: "Социални Мрежи",
    paths: ["/услуги/социални-мрежи", "/services/social-media"],
  },
  {
    href: "/services/ads",
    label: "Реклами",
    paths: ["/услуги/реклами", "/services/ads"],
  },
  {
    href: "/services/google-business",
    label: "Google Business",
    paths: ["/услуги/google-business", "/services/google-business"],
  },
] as const;

const navLinks = [
  { href: "/", label: "Начало", paths: ["/"] },
  {
    href: "/templates",
    label: "Шаблони",
    paths: ["/templates"],
  },
  { href: "/videos", label: "Видеа", paths: ["/videos"] },
  { href: "/about", label: "За нас", paths: ["/about"] },
  { href: "/blog", label: "Блог", paths: ["/blog"] },
] as const;

function isPathActive(pathname: string, paths: readonly string[]) {
  const decoded = (() => {
    try {
      return decodeURI(pathname);
    } catch {
      return pathname;
    }
  })();
  return paths.some((p) => {
    const isExactMatch = p === pathname || p === decoded;
    if (isExactMatch) return true;

    if (p === "/") return false;

    return pathname.startsWith(`${p}/`) || decoded.startsWith(`${p}/`);
  });
}

function isServicesNavActive(pathname: string) {
  return serviceNavLinks.some((link) => isPathActive(pathname, link.paths));
}

function AnimatedNavLink({
  href,
  children,
  isActive,
  onNavigate,
  variant = "default",
}: {
  href: string;
  children: string;
  isActive: boolean;
  onNavigate: () => void;
  variant?: "default" | "sub";
}) {
  return (
    <TransitionLink
      href={href}
      onClick={onNavigate}
      className={cn(
        "block text-zinc-100 font-bold relative overflow-hidden nav-link py-1",
        variant === "default" ? "text-2xl md:text-3xl" : "text-lg md:text-xl",
        isActive && "nav-link-active"
      )}
    >
      <span className="relative inline-block leading-none">
        <span className="relative">{children}</span>
        <span
          className="absolute inset-0 z-10 digistart-nav-link-accent pointer-events-none text-primary whitespace-nowrap"
          aria-hidden
        >
          {children}
        </span>
      </span>
    </TransitionLink>
  );
}

function ServicesNavGroup({
  pathname,
  isExpanded,
  onToggle,
  onNavigate,
}: {
  pathname: string;
  isExpanded: boolean;
  onToggle: () => void;
  onNavigate: () => void;
}) {
  const isActive = isServicesNavActive(pathname);
  const submenuRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLUListElement>(null);
  const chevronRef = useRef<SVGSVGElement>(null);
  const hasMountedRef = useRef(false);

  useLayoutEffect(() => {
    const wrapper = submenuRef.current;
    const content = contentRef.current;
    if (!wrapper || !content) return;

    let cancelled = false;

    void loadGsap().then(({ default: gsap }) => {
      if (cancelled) return;

      const items = content.querySelectorAll("li");
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      gsap.killTweensOf([wrapper, items, chevronRef.current]);

      if (!hasMountedRef.current) {
        hasMountedRef.current = true;
        gsap.set(wrapper, { height: 0, opacity: 0, marginTop: 0 });
        gsap.set(items, { opacity: 0, x: -10 });
        gsap.set(chevronRef.current, { rotate: 0 });
        return;
      }

      if (reducedMotion) {
        gsap.set(wrapper, {
          height: isExpanded ? "auto" : 0,
          opacity: isExpanded ? 1 : 0,
          marginTop: isExpanded ? 12 : 0,
        });
        gsap.set(items, { opacity: isExpanded ? 1 : 0, x: 0 });
        gsap.set(chevronRef.current, { rotate: isExpanded ? 180 : 0 });
        return;
      }

      if (isExpanded) {
        gsap.set(wrapper, { height: 0, opacity: 0, marginTop: 0 });
        gsap.set(items, { opacity: 0, x: -12 });

        const targetHeight = content.scrollHeight;

        gsap
          .timeline()
          .to(chevronRef.current, { rotate: 180, duration: 0.3, ease: "power2.out" }, 0)
          .to(
            wrapper,
            {
              height: targetHeight,
              opacity: 1,
              marginTop: 12,
              duration: 0.38,
              ease: "power3.out",
              onComplete: () => {
                gsap.set(wrapper, { height: "auto" });
              },
            },
            0,
          )
          .to(
            items,
            {
              opacity: 1,
              x: 0,
              duration: 0.32,
              stagger: 0.05,
              ease: "power2.out",
            },
            0.1,
          );
        return;
      }

      if (wrapper.offsetHeight === 0) {
        gsap.set(wrapper, { height: 0, opacity: 0, marginTop: 0 });
        gsap.set(items, { opacity: 0, x: -10 });
        gsap.set(chevronRef.current, { rotate: 0 });
        return;
      }

      gsap.set(wrapper, { height: wrapper.offsetHeight });

      gsap
        .timeline()
        .to(chevronRef.current, { rotate: 0, duration: 0.28, ease: "power2.in" }, 0)
        .to(
          items,
          {
            opacity: 0,
            x: -8,
            duration: 0.2,
            stagger: { each: 0.03, from: "end" },
            ease: "power2.in",
          },
          0,
        )
        .to(
          wrapper,
          {
            height: 0,
            opacity: 0,
            marginTop: 0,
            duration: 0.28,
            ease: "power2.inOut",
          },
          0.08,
        );
    });

    return () => {
      cancelled = true;
    };
  }, [isExpanded]);

  return (
    <li>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isExpanded}
        className={cn(
          "group flex w-full items-center justify-start gap-2 text-left text-zinc-100 text-2xl md:text-3xl font-bold py-1 transition-colors hover:text-primary/90",
          isActive && "text-primary"
        )}
      >
        <span>Услуги</span>
        <ChevronDown
          ref={chevronRef}
          className="h-6 w-6 shrink-0 text-zinc-400 group-hover:text-primary/80"
          aria-hidden
        />
      </button>
      <div ref={submenuRef} className="overflow-hidden" aria-hidden={!isExpanded}>
        <ul
          ref={contentRef}
          className="flex flex-col gap-y-3 border-l-2 border-zinc-700 pl-4"
        >
          {serviceNavLinks.map((link) => (
            <li key={link.href}>
              <AnimatedNavLink
                href={link.href}
                isActive={isPathActive(pathname, link.paths)}
                onNavigate={onNavigate}
                variant="sub"
              >
                {link.label}
              </AnimatedNavLink>
            </li>
          ))}
        </ul>
      </div>
    </li>
  );
}

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [cartCount, setCartCount] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [hasSurveyPreferences, setHasSurveyPreferences] = useState(false);
  const [servicesExpanded, setServicesExpanded] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const linksRef = useRef<HTMLUListElement>(null);
  const htmlOverflowRef = useRef<string | null>(null);

  const pathnameDecoded = (() => {
    try {
      return decodeURI(pathname);
    } catch {
      return pathname;
    }
  })();
  const isCartPage = pathname === "/cart" || pathnameDecoded === "/cart";

  useEffect(() => {
    setCartCount(getCartItemCount());
    const handleCartUpdate = () => setCartCount(getCartItemCount());
    const syncSurveyPreferences = () => {
      setHasSurveyPreferences(hasCompletedSurvey());
    };
    syncSurveyPreferences();
    window.addEventListener("cart-updated", handleCartUpdate);
    window.addEventListener("visitor-preferences-updated", syncSurveyPreferences);
    window.addEventListener("storage", syncSurveyPreferences);
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("cart-updated", handleCartUpdate);
      window.removeEventListener("visitor-preferences-updated", syncSurveyPreferences);
      window.removeEventListener("storage", syncSurveyPreferences);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const closeMenu = useCallback(() => {
    return new Promise<void>((resolve) => {
      void loadGsap().then(({ default: gsap }) => {
        const tl = gsap.timeline({
          onComplete: () => {
            setIsOpen(false);
            setServicesExpanded(false);
            if (backdropRef.current) gsap.set(backdropRef.current, { display: "none" });
            resolve();
          },
        });
        if (linksRef.current) {
          const listItems = linksRef.current.querySelectorAll(":scope > li");
          tl.to(listItems, {
            opacity: 0,
            y: -24,
            duration: 0.22,
            stagger: 0.04,
            ease: "power2.in",
          });
        }
        if (menuRef.current) {
          tl.to(
            menuRef.current,
            { x: "100%", skewX: 0, duration: 0.28, ease: "power3.in" },
            "-=0.08",
          );
        }
        if (backdropRef.current) {
          tl.to(backdropRef.current, { opacity: 0, duration: 0.22, ease: "power2.in" }, "-=0.2");
        }
      });
    });
  }, []);

  const resetSurveyPreferences = useCallback(() => {
    clearPreferences();
    setHasSurveyPreferences(false);
    void closeMenu().then(() => router.push("/"));
  }, [closeMenu, router]);

  const openMenu = useCallback(() => {
    setIsOpen(true);
    void loadGsap().then(({ default: gsap }) => {
      const tl = gsap.timeline();
      if (backdropRef.current) {
        gsap.set(backdropRef.current, { display: "block", opacity: 0 });
      }
      if (menuRef.current) {
        gsap.set(menuRef.current, { x: "100%", skewX: -5 });
      }
      if (backdropRef.current) {
        tl.to(backdropRef.current, { opacity: 1, duration: 0.25, ease: "power2.out" });
      }
      if (menuRef.current) {
        tl.to(
          menuRef.current,
          { x: 0, skewX: 0, duration: 0.3, ease: "power3.out" },
          "-=0.15",
        );
      }
      if (linksRef.current) {
        const listItems = linksRef.current.querySelectorAll(":scope > li");
        gsap.set(listItems, { opacity: 0, y: 28 });
        tl.to(
          listItems,
          { opacity: 1, y: 0, duration: 0.45, stagger: 0.08, ease: "power3.out" },
          "-=0.12",
        );
      }
    });
  }, []);

  const toggleMenu = () => {
    if (isOpen) void closeMenu();
    else openMenu();
  };

  useEffect(() => {
    const html = document.documentElement;
    htmlOverflowRef.current = html.style.overflow;
    if (isOpen) {
      html.style.overflow = "hidden";
    } else {
      html.style.overflow = htmlOverflowRef.current ?? "";
    }
    return () => {
      html.style.overflow = htmlOverflowRef.current ?? "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") void closeMenu();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, closeMenu]);

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50">
        <header
          className={`transition-all duration-300 ${isScrolled
            ? "bg-background/95 backdrop-blur-md border-b border-border shadow-lg"
            : "bg-transparent"
            }`}
        >
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16 md:h-20">
              <TransitionLink href="/" className="flex items-center gap-2 group rounded-lg z-60 relative">
                <Image
                  src={SITE_LOGO_SRC}
                  alt="DigiStart logo"
                  width={SITE_LOGO_WIDTH}
                  height={SITE_LOGO_HEIGHT}
                  sizes={SITE_LOGO_SIZES}
                  className="h-8 w-auto transition-transform group-hover:scale-110"
                />
                <span className="flex flex-col leading-tight">
                  <span className="text-xl font-bold tracking-tight">
                    <span className="text-primary">Digi</span>
                    <span className="text-accent">Start</span>
                  </span>
                  <span className="text-[10px] sm:text-xs text-muted-foreground font-medium tracking-widest uppercase">
                    Easy Start
                  </span>
                </span>
              </TransitionLink>

              <div className="flex items-center gap-2 z-60 relative">
                <AnalyticsToolbar />
                {isCartPage ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative bg-primary/10 ring-2 ring-primary/25 pointer-events-none"
                    tabIndex={-1}
                    aria-current="page"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                        {cartCount}
                      </span>
                    )}
                    <span className="sr-only">Кошница (текуща страница)</span>
                  </Button>
                ) : (
                  <TransitionLink href="/cart">
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "relative group rounded-xl transition-all duration-200 ease-out",
                        "text-muted-foreground hover:text-primary",
                        "hover:bg-primary/10 hover:ring-1 hover:ring-primary/20",
                        "hover:shadow-[0_0_24px_-8px] hover:shadow-primary/30",
                        "active:scale-[0.96] motion-reduce:active:scale-100"
                      )}
                    >
                      <ShoppingCart className="h-5 w-5 transition-transform duration-200 ease-out group-hover:scale-110 motion-reduce:group-hover:scale-100" />
                      {cartCount > 0 && (
                        <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                          {cartCount}
                        </span>
                      )}
                      <span className="sr-only">Кошница</span>
                    </Button>
                  </TransitionLink>
                )}

                <div className="flex items-center justify-center rounded-full bg-card border border-border w-12 h-12">
                  <Hamburger
                    toggled={isOpen}
                    toggle={toggleMenu}
                    size={18}
                    rounded
                    label={isOpen ? "Затвори менюто" : "Отвори менюто"}
                  />
                </div>
              </div>
            </div>
          </div>
        </header>
        <ServiceSlotsBanner />
      </div>

      <div
        ref={backdropRef}
        className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-45 hidden"
        aria-hidden
        onClick={() => void closeMenu()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") void closeMenu();
        }}
        role="button"
        tabIndex={0}
      />

      <div
        ref={menuRef}
        className="fixed top-0 right-0 h-dvh translate-x-full bg-zinc-900 text-zinc-50 shadow-xl z-55 w-screen sm:w-[min(100%,28rem)] md:w-[40%] overflow-y-auto will-change-transform"
        role="dialog"
        aria-modal="true"
        aria-label="Главно меню"
        aria-hidden={!isOpen}
      >
        <div className="flex flex-col pb-10 px-6 min-h-full">
          <div className="sticky top-0 -mx-6 px-6 bg-zinc-900/95 backdrop-blur-md border-b border-zinc-800 z-10">
            <div className="flex items-center justify-between h-16 md:h-20">
              <TransitionLink
                href="/"
                className="flex items-center gap-2 group rounded-lg"
                onClick={() => void closeMenu()}
              >
                <Image
                  src={SITE_LOGO_SRC}
                  alt="DigiStart logo"
                  width={SITE_LOGO_WIDTH}
                  height={SITE_LOGO_HEIGHT}
                  sizes={SITE_LOGO_SIZES}
                  className="h-8 w-auto transition-transform group-hover:scale-110"
                />
                <span className="flex flex-col leading-tight">
                  <span className="text-xl font-bold tracking-tight">
                    <span className="text-primary">Digi</span>
                    <span className="text-accent">Start</span>
                  </span>
                  <span className="text-[10px] sm:text-xs text-zinc-400 font-medium tracking-widest uppercase">
                    Easy Start
                  </span>
                </span>
              </TransitionLink>

              <div className="flex items-center gap-2">
                <TransitionLink href="/cart" onClick={() => void closeMenu()}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "relative group rounded-xl transition-all duration-200 ease-out",
                      "text-zinc-100 hover:text-primary",
                      "hover:bg-primary/10 hover:ring-1 hover:ring-primary/20",
                      "hover:shadow-[0_0_24px_-8px] hover:shadow-primary/30",
                      "active:scale-[0.96] motion-reduce:active:scale-100"
                    )}
                    aria-label="Кошница"
                  >
                    <ShoppingCart className="h-5 w-5 transition-transform duration-200 ease-out group-hover:scale-110 motion-reduce:group-hover:scale-100" />
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                        {cartCount}
                      </span>
                    )}
                  </Button>
                </TransitionLink>

                <div className="flex items-center justify-center rounded-full bg-zinc-800 border border-zinc-700 w-12 h-12">
                  <Hamburger
                    toggled={isOpen}
                    toggle={toggleMenu}
                    size={18}
                    rounded
                    color="white"
                    label={isOpen ? "Затвори менюто" : "Отвори менюто"}
                  />
                </div>
              </div>
            </div>
          </div>

          <nav aria-label="Основна навигация" className="pt-8">
            <ul ref={linksRef} className="flex flex-col gap-y-5 md:gap-y-7">
              <li>
                <AnimatedNavLink
                  href="/"
                  isActive={isPathActive(pathname, navLinks[0].paths)}
                  onNavigate={() => void closeMenu()}
                >
                  {navLinks[0].label}
                </AnimatedNavLink>
              </li>
              <ServicesNavGroup
                pathname={pathname}
                isExpanded={servicesExpanded}
                onToggle={() => setServicesExpanded((current) => !current)}
                onNavigate={() => void closeMenu()}
              />
              {navLinks.slice(1).map((link) => {
                const active = isPathActive(pathname, link.paths);
                return (
                  <li key={link.href}>
                    <AnimatedNavLink
                      href={link.href}
                      isActive={active}
                      onNavigate={() => void closeMenu()}
                    >
                      {link.label}
                    </AnimatedNavLink>
                  </li>
                );
              })}
              <li>
                <TrackedCtaLink
                  href="/digital-roadmap"
                  ctaId="menu_digital_roadmap"
                  onClick={() => closeMenu()}
                >
                  <Button className="w-full glow-primary mt-2" size="lg">
                    Запази безплатна дигитална пътна карта
                  </Button>
                </TrackedCtaLink>
              </li>
              {hasSurveyPreferences ? (
                <li>
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full border-zinc-600 text-zinc-50 bg-transparent hover:bg-zinc-800"
                    onClick={resetSurveyPreferences}
                  >
                    Промени мнението си
                  </Button>
                </li>
              ) : null}
            </ul>
          </nav>

          <div className="mt-auto pt-10 border-t border-zinc-700 space-y-3">
            {session?.user ? (
              <>
                {session.user.role === "customer" ? (
                  <TransitionLink href="/user" onClick={() => void closeMenu()}>
                    <Button variant="secondary" className="w-full">
                      Моят панел
                    </Button>
                  </TransitionLink>
                ) : null}
                <Button
                  variant="outline"
                  className="w-full mt-4 border-zinc-600 text-zinc-50 bg-transparent"
                  onClick={() => {
                    void closeMenu();
                    void signOut({ callbackUrl: "/" });
                  }}
                >
                  Изход
                </Button>
              </>
            ) : (
              <>
                <TransitionLink href="/sign-in" onClick={() => void closeMenu()}>
                  <Button className="w-full glow-primary">
                    Вход
                  </Button>
                </TransitionLink>

              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
