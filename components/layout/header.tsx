"use client";

import TransitionLink from "@/components/transitions/TransitionLink";
import { useState, useEffect, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCartItemCount } from "@/lib/store/cart";
import { cn } from "@/lib/utils";
import gsap from "gsap";
import Hamburger from "hamburger-react";
import { useSession, signOut } from "next-auth/react";
import { AnalyticsToolbar } from "@/components/analytics/analytics-toolbar";
import { TrackedCtaLink } from "@/components/analytics/tracked-cta-link";

const navLinks = [
  { href: "/", label: "Начало", paths: ["/"] },
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
    href: "/services/google-business",
    label: "Google Business",
    paths: ["/услуги/google-business", "/services/google-business"],
  },
  {
    href: "/templates",
    label: "Шаблони",
    paths: ["/templates"],
  },
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

function AnimatedNavLink({
  href,
  children,
  isActive,
  onNavigate,
}: {
  href: string;
  children: string;
  isActive: boolean;
  onNavigate: () => void;
}) {
  return (
    <TransitionLink
      href={href}
      onClick={onNavigate}
      className={cn(
        "block text-zinc-100 text-2xl md:text-3xl font-bold relative overflow-hidden nav-link py-1",
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

export function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [cartCount, setCartCount] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

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
    if (menuRef.current) {
      gsap.set(menuRef.current, { x: "100%" });
    }
  }, []);

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

  const closeMenu = useCallback(() => {
    return new Promise<void>((resolve) => {
      const tl = gsap.timeline({
        onComplete: () => {
          setIsOpen(false);
          if (backdropRef.current) gsap.set(backdropRef.current, { display: "none" });
          resolve();
        },
      });
      if (linksRef.current) {
        const listItems = linksRef.current.querySelectorAll("li");
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
          "-=0.08"
        );
      }
      if (backdropRef.current) {
        tl.to(backdropRef.current, { opacity: 0, duration: 0.22, ease: "power2.in" }, "-=0.2");
      }
    });
  }, []);

  const openMenu = useCallback(() => {
    setIsOpen(true);
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
        "-=0.15"
      );
    }
    if (linksRef.current) {
      const listItems = linksRef.current.querySelectorAll("li");
      gsap.set(listItems, { opacity: 0, y: 28 });
      tl.to(
        listItems,
        { opacity: 1, y: 0, duration: 0.45, stagger: 0.08, ease: "power3.out" },
        "-=0.12"
      );
    }
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
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
          ? "bg-background/95 backdrop-blur-md border-b border-border shadow-lg"
          : "bg-transparent"
          }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            <TransitionLink href="/" className="flex items-center gap-2 group rounded-lg z-60 relative">
              <Image
                src="/logo.png"
                alt="DigiStart logo"
                width={32}
                height={32}
                className="h-8 w-8 transition-transform group-hover:scale-110"
                priority
              />
              <span className="text-xl font-bold tracking-tight">
                Digi<span className="text-primary">Start</span>
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
        className="fixed top-0 right-0 h-dvh bg-zinc-900 text-zinc-50 shadow-xl z-55 w-screen sm:w-[min(100%,28rem)] md:w-[40%] overflow-y-auto will-change-transform"
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
                  src="/logo.png"
                  alt="DigiStart logo"
                  width={32}
                  height={32}
                  className="h-8 w-8 transition-transform group-hover:scale-110"
                />
                <span className="text-xl font-bold tracking-tight">
                  Digi<span className="text-primary">Start</span>
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
              {navLinks.map((link) => {
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
                  href="/consultation"
                  ctaId="menu_free_consultation"
                  onClick={() => closeMenu()}
                >
                  <Button className="w-full glow-primary mt-2" size="lg">
                    Запази безплатна дигитална пътна карта
                  </Button>
                </TrackedCtaLink>
              </li>
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
