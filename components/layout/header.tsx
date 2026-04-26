"use client";

import TransitionLink from "@/components/transitions/TransitionLink";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Menu, X, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { getCartItemCount } from "@/lib/store/cart";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Начало", paths: ["/"] },
  { href: "/услуги/уебсайт", label: "Уебсайт", paths: ["/услуги/уебсайт", "/services/website"] },
  {
    href: "/услуги/онлайн-магазин",
    label: "Онлайн магазин",
    paths: ["/услуги/онлайн-магазин", "/services/online-store"],
  },
  {
    href: "/услуги/google-business",
    label: "Google Business",
    paths: ["/услуги/google-business", "/services/google-business"],
  },
  {
    href: "/услуги/социални-мрежи",
    label: "Социални мрежи",
    paths: ["/услуги/социални-мрежи", "/services/social-media"],
  },
] as const;

function isPathActive(pathname: string, paths: readonly string[]) {
  const decoded = (() => {
    try {
      return decodeURI(pathname);
    } catch {
      return pathname;
    }
  })();
  return paths.some((p) => p === pathname || p === decoded);
}

export function Header() {
  const pathname = usePathname();
  const [cartCount, setCartCount] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  const isHome = isPathActive(pathname, navLinks[0].paths);
  const pathnameDecoded = (() => {
    try {
      return decodeURI(pathname);
    } catch {
      return pathname;
    }
  })();
  const isCartPage =
    pathnameDecoded === "/кошница" || pathname === "/cart" || pathnameDecoded === "/cart";

  useEffect(() => {
    // Initial cart count
    setCartCount(getCartItemCount());

    // Listen for cart updates
    const handleCartUpdate = () => {
      setCartCount(getCartItemCount());
    };

    window.addEventListener("cart-updated", handleCartUpdate);

    // Handle scroll for header background
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("cart-updated", handleCartUpdate);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
          ? "bg-background/95 backdrop-blur-md border-b border-border shadow-lg"
          : "bg-transparent"
        }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}

          <TransitionLink href="/" className="flex items-center gap-2 group rounded-lg">
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

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Основна навигация">
            {navLinks.map((link) => {
              const active = isPathActive(pathname, link.paths);
              return active ? (
                <span
                  key={link.href}
                  aria-current="page"
                  className={cn(
                    "px-4 py-2 text-sm font-semibold rounded-lg cursor-default",
                    "text-primary bg-primary/10 ring-1 ring-primary/20",
                  )}
                >
                  {link.label}
                </span>
              ) : (
                <TransitionLink
                  key={link.href}
                  href={link.href}
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary/50"
                >
                  {link.label}
                </TransitionLink>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Cart Button */}
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
              <TransitionLink href="/кошница">
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "relative group rounded-xl transition-all duration-200 ease-out",
                    "text-muted-foreground hover:text-primary",
                    "hover:bg-primary/10 hover:ring-1 hover:ring-primary/20",
                    "hover:shadow-[0_0_24px_-8px] hover:shadow-primary/30",
                    "active:scale-[0.96] motion-reduce:active:scale-100",
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

            {/* CTA Button - Desktop */}
            <TransitionLink href="/#услуги" className="hidden md:block">
              <Button className="glow-primary">Започнете сега</Button>
            </TransitionLink>

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Меню</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 bg-background border-border">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between mb-8">
                    {isHome ? (
                      <span className="flex items-center gap-2" aria-current="page">
                        <Image
                          src="/logo.png"
                          alt="DigiStart logo"
                          width={28}
                          height={28}
                          className="h-7 w-7"
                          priority
                        />
                        <span className="text-lg font-bold">
                          Digi<span className="text-primary">Start</span>
                        </span>
                      </span>
                    ) : (
                      <SheetClose asChild>
                        <TransitionLink href="/" className="flex items-center gap-2">
                          <Image
                            src="/logo.png"
                            alt="DigiStart logo"
                            width={28}
                            height={28}
                            className="h-7 w-7"
                            priority
                          />
                          <span className="text-lg font-bold">
                            Digi<span className="text-primary">Start</span>
                          </span>
                        </TransitionLink>
                      </SheetClose>
                    )}
                    <SheetClose asChild>
                      <Button variant="ghost" size="icon">
                        <X className="h-5 w-5" />
                      </Button>
                    </SheetClose>
                  </div>

                  <nav className="flex flex-col gap-2" aria-label="Мобилна навигация">
                    {navLinks.map((link) => {
                      const active = isPathActive(pathname, link.paths);
                      return active ? (
                        <span
                          key={link.href}
                          aria-current="page"
                          className={cn(
                            "px-4 py-3 text-lg font-semibold rounded-lg cursor-default",
                            "text-primary bg-primary/10 ring-1 ring-primary/20",
                          )}
                        >
                          {link.label}
                        </span>
                      ) : (
                        <SheetClose key={link.href} asChild>
                          <TransitionLink
                            href={link.href}
                            className="px-4 py-3 text-lg font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg transition-colors"
                          >
                            {link.label}
                          </TransitionLink>
                        </SheetClose>
                      );
                    })}
                  </nav>

                  <div className="mt-auto pt-8">
                    <SheetClose asChild>
                      <TransitionLink href="/#услуги" className="block">
                        <Button className="w-full glow-primary" size="lg">
                          Започнете сега
                        </Button>
                      </TransitionLink>
                    </SheetClose>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
