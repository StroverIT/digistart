"use client";

import TransitionLink from "@/components/transitions/TransitionLink";
import { useState, useEffect, useRef, useCallback, useLayoutEffect } from "react";
import { usePathname } from "next/navigation";
import { ChevronDown, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCartItemCount } from "@/lib/store/cart";
import { cn } from "@/lib/utils";
import Hamburger from "hamburger-react";
import { useSession, signOut } from "next-auth/react";
import { AnalyticsToolbar } from "@/components/analytics/analytics-toolbar";
import { TrackedCtaLink } from "@/components/analytics/tracked-cta-link";
import { ServiceSlotsBanner } from "@/components/layout/service-slots-banner";
import { FunnelSlotsBanner } from "@/components/layout/funnel-slots-banner";
import { SiteLogo } from "@/components/layout/site-logo";
import { gbContainerClass } from "@/components/services/service-detail-google-business-v2/shared";
import { isServiceFunnelPath } from "@/lib/service-funnels/path";

let gsapModule: Promise<typeof import("gsap")> | null = null;
function loadGsap() {
  gsapModule ??= import("gsap");
  return gsapModule;
}

const serviceNavLinks = [
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

const usefulNavLinks = [
  {
    href: "/templates",
    label: "Шаблони",
    paths: ["/templates"],
  },
  { href: "/videos", label: "Видеа", paths: ["/videos"] },
  { href: "/about", label: "За нас", paths: ["/about"] },
  { href: "/blog", label: "Блог", paths: ["/blog"] },
] as const;

const navLinks = [
  { href: "/", label: "Начало", paths: ["/"] },
  { href: "/marketing", label: "Маркетинг", paths: ["/marketing"] },
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

function isUsefulNavActive(pathname: string) {
  return usefulNavLinks.some((link) => isPathActive(pathname, link.paths));
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
        "block font-bold relative overflow-hidden nav-link py-1 text-background",
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

function UsefulNavGroup({
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
  const isActive = isUsefulNavActive(pathname);
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
          "group flex w-full items-center justify-start gap-2 text-left text-background text-2xl md:text-3xl font-bold py-1 transition-colors hover:text-primary/90",
          isActive && "text-primary"
        )}
      >
        <span>Полезни</span>
        <ChevronDown
          ref={chevronRef}
          className="h-6 w-6 shrink-0 text-background/60 group-hover:text-primary/80"
          aria-hidden
        />
      </button>
      <div ref={submenuRef} className="overflow-hidden" aria-hidden={!isExpanded}>
        <ul
          ref={contentRef}
          className="flex flex-col gap-y-3 border-l-2 border-background/15 pl-4"
        >
          {usefulNavLinks.map((link) => (
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
  const { data: session } = useSession();
  const [cartCount, setCartCount] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [usefulExpanded, setUsefulExpanded] = useState(false);

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
  const isFunnelPage = isServiceFunnelPath(pathname);
  const isGoogleBusinessPage =
    pathname === "/services/google-business" ||
    pathnameDecoded === "/services/google-business";

  useEffect(() => {
    setCartCount(getCartItemCount());
    const handleCartUpdate = () => setCartCount(getCartItemCount());
    window.addEventListener("cart-updated", handleCartUpdate);
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("cart-updated", handleCartUpdate);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (isGoogleBusinessPage) {
      root.style.setProperty("--site-slots-banner-height", "0px");
      return () => {
        root.style.removeProperty("--site-slots-banner-height");
      };
    }
    root.style.removeProperty("--site-slots-banner-height");
  }, [isGoogleBusinessPage]);

  const closeMenu = useCallback(() => {
    return new Promise<void>((resolve) => {
      void loadGsap().then(({ default: gsap }) => {
        const tl = gsap.timeline({
          onComplete: () => {
            setIsOpen(false);
            setUsefulExpanded(false);
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

  if (isFunnelPage) {
    return (
      <div className="sticky top-0 z-50">
        <FunnelSlotsBanner />
      </div>
    );
  }

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50">
        <header
          className={`transition-all duration-300 border-b border-white/50 bg-white/55 backdrop-blur-xl backdrop-saturate-150 supports-backdrop-filter:bg-white/40 ${isScrolled ? "shadow-[var(--shadow-soft)]" : "shadow-sm shadow-black/5"
            }`}
        >
          <div
            className={cn(
              isGoogleBusinessPage ? gbContainerClass : "container mx-auto px-4",
            )}
          >
            <div className="flex h-16 items-center justify-between md:h-20">
              <SiteLogo className="relative z-60" />

              <div className="relative z-60 flex items-center gap-2">
                <AnalyticsToolbar />
                <div className="flex items-center gap-4">
                  {isCartPage ? (
                    <Button
                      variant="ghost"
                      size="icon-xl"
                      className="relative rounded-xl bg-primary/10 ring-2 ring-primary/25 pointer-events-none"
                      tabIndex={-1}
                      aria-current="page"
                    >
                      <ShoppingCart className="size-6" />
                      {cartCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex size-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                          {cartCount}
                        </span>
                      )}
                      <span className="sr-only">Кошница (текуща страница)</span>
                    </Button>
                  ) : (
                    <TransitionLink href="/cart">
                      <Button
                        variant="ghost"
                        size="icon-xl"
                        className={cn(
                          "relative group rounded-xl transition-all duration-200 ease-out",
                          "text-muted-foreground hover:text-primary",
                          "hover:bg-primary/10 hover:ring-1 hover:ring-primary/20",
                          "hover:shadow-[0_0_24px_-8px] hover:shadow-primary/30",
                          "active:scale-[0.96] motion-reduce:active:scale-100"
                        )}
                      >
                        <ShoppingCart className="size-6 transition-transform duration-200 ease-out group-hover:scale-110 motion-reduce:group-hover:scale-100" />
                        {cartCount > 0 && (
                          <span className="absolute -top-1 -right-1 flex size-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                            {cartCount}
                          </span>
                        )}
                        <span className="sr-only">Кошница</span>
                      </Button>
                    </TransitionLink>
                  )}

                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-card">
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
          </div>
        </header>
        {!isGoogleBusinessPage ? <ServiceSlotsBanner /> : null}
      </div>

      <div
        ref={backdropRef}
        className="fixed inset-0 z-45 hidden bg-black/30 backdrop-blur-[2px]"
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
        className="fixed top-0 right-0 z-55 h-dvh w-screen translate-x-full overflow-y-auto overflow-x-hidden bg-foreground text-background shadow-xl will-change-transform sm:w-[min(100%,28rem)] md:w-[40%]"
        role="dialog"
        aria-modal="true"
        aria-label="Главно меню"
        aria-hidden={!isOpen}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-primary/30 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-primary/20 blur-3xl"
        />
        <div className="relative flex min-h-full flex-col px-6 pb-10">
          <div className="sticky top-0 -mx-6 z-10 bg-foreground/95 px-6 backdrop-blur-md">
            <div className="flex h-16 items-center justify-end md:h-20">
              <div className="flex items-center gap-5">
                <TransitionLink href="/cart" onClick={() => void closeMenu()}>
                  <Button
                    variant="ghost"
                    size="icon-xl"
                    className={cn(
                      "relative group rounded-xl transition-all duration-200 ease-out",
                      "text-background hover:text-primary",
                      "hover:bg-primary/10 hover:ring-1 hover:ring-primary/20",
                      "hover:shadow-[0_0_24px_-8px] hover:shadow-primary/30",
                      "active:scale-[0.96] motion-reduce:active:scale-100"
                    )}
                    aria-label="Кошница"
                  >
                    <ShoppingCart className="size-6 transition-transform duration-200 ease-out group-hover:scale-110 motion-reduce:group-hover:scale-100" />
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex size-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                        {cartCount}
                      </span>
                    )}
                  </Button>
                </TransitionLink>

                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-background/20 bg-background/10">
                  <Hamburger
                    toggled={isOpen}
                    toggle={toggleMenu}
                    size={18}
                    rounded
                    color="#fafafa"
                    label={isOpen ? "Затвори менюто" : "Отвори менюто"}
                  />
                </div>
              </div>
            </div>
          </div>

          <nav aria-label="Основна навигация" className="pt-8">
            <ul ref={linksRef} className="flex flex-col gap-y-5 md:gap-y-7">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <AnimatedNavLink
                    href={link.href}
                    isActive={isPathActive(pathname, link.paths)}
                    onNavigate={() => void closeMenu()}
                  >
                    {link.label}
                  </AnimatedNavLink>
                </li>
              ))}
              {serviceNavLinks.map((link) => (
                <li key={link.href}>
                  <AnimatedNavLink
                    href={link.href}
                    isActive={isPathActive(pathname, link.paths)}
                    onNavigate={() => void closeMenu()}
                  >
                    {link.label}
                  </AnimatedNavLink>
                </li>
              ))}
              <UsefulNavGroup
                pathname={pathname}
                isExpanded={usefulExpanded}
                onToggle={() => setUsefulExpanded((current) => !current)}
                onNavigate={() => void closeMenu()}
              />
              <li>
                <TrackedCtaLink
                  href="/business-consultation"
                  ctaId="menu_free_consultation"
                  onClick={() => closeMenu()}
                >
                  <Button className="w-full glow-primary mt-2" size="lg">
                    Запази безплатна консултация
                  </Button>
                </TrackedCtaLink>
              </li>
            </ul>
          </nav>

          <div className="mt-auto space-y-3 border-t border-background/15 pt-10">
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
                  className="mt-4 w-full border-background/20 bg-transparent text-background"
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
