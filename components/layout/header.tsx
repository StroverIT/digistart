"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, ShoppingCart, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { getCartItemCount } from "@/lib/store/cart";

const navLinks = [
  { href: "/", label: "Начало" },
  { href: "/услуги/websites", label: "Уеб сайтове" },
  { href: "/услуги/онлайн-магазини", label: "Онлайн магазини" },
  { href: "/услуги/google-business", label: "Google Business" },
  { href: "/услуги/социални-мрежи", label: "Социални мрежи" },
];

export function Header() {
  const [cartCount, setCartCount] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/95 backdrop-blur-md border-b border-border shadow-lg"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative">
              <Zap className="h-8 w-8 text-primary transition-transform group-hover:scale-110" />
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              Sleek<span className="text-primary">Route</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary/50"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Cart Button */}
            <Link href="/кошница">
              <Button
                variant="ghost"
                size="icon"
                className="relative hover:bg-secondary/50"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
                <span className="sr-only">Кошница</span>
              </Button>
            </Link>

            {/* CTA Button - Desktop */}
            <Link href="/#услуги" className="hidden md:block">
              <Button className="glow-primary">Започнете сега</Button>
            </Link>

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
                    <Link href="/" className="flex items-center gap-2">
                      <Zap className="h-7 w-7 text-primary" />
                      <span className="text-lg font-bold">
                        Sleek<span className="text-primary">Route</span>
                      </span>
                    </Link>
                    <SheetClose asChild>
                      <Button variant="ghost" size="icon">
                        <X className="h-5 w-5" />
                      </Button>
                    </SheetClose>
                  </div>

                  <nav className="flex flex-col gap-2">
                    {navLinks.map((link) => (
                      <SheetClose key={link.href} asChild>
                        <Link
                          href={link.href}
                          className="px-4 py-3 text-lg font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg transition-colors"
                        >
                          {link.label}
                        </Link>
                      </SheetClose>
                    ))}
                  </nav>

                  <div className="mt-auto pt-8">
                    <SheetClose asChild>
                      <Link href="/#услуги" className="block">
                        <Button className="w-full glow-primary" size="lg">
                          Започнете сега
                        </Button>
                      </Link>
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
