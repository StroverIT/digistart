"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Zap,
  LayoutDashboard,
  ShoppingBag,
  RefreshCw,
  CalendarDays,
  MapPin,
  LogOut,
  ExternalLink,
  User,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface AdminSidebarProps {
  user?: {
    name?: string | null;
    email?: string | null;
  };
}

const navItems = [
  { href: "/admin", label: "Табло", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Поръчки", icon: ShoppingBag },
  { href: "/admin/subscriptions", label: "Абонаменти", icon: RefreshCw },
  { href: "/admin/consultations", label: "Консултации", icon: CalendarDays },
  { href: "/admin/businesses", label: "Бизнеси", icon: MapPin },
] as const;

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();
  const sidebarInnerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = sidebarInnerRef.current;
    if (!root) return;
    const links = root.querySelectorAll<HTMLElement>("[data-admin-nav-link]");
    if (!links.length) return;

    const ctx = gsap.context(() => {
      gsap.set(links, { opacity: 0, x: -12 });
      gsap.to(links, {
        opacity: 1,
        x: 0,
        duration: 0.4,
        stagger: 0.06,
        ease: "power2.out",
      });
    }, root);

    return () => ctx.revert();
  }, [pathname]);

  const handleSignOut = () => {
    signOut({ callbackUrl: "/admin/login" });
  };

  const sidebarContent = (
    <div ref={sidebarInnerRef} className="flex flex-col h-full min-h-0">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-border">
        <Link href="/" className="flex items-center gap-2">
          <Zap className="h-7 w-7 text-primary" />
          <span className="text-lg font-bold">
            Digi<span className="text-primary">Start</span>
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              data-admin-nav-link
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors opacity-0 -translate-x-3",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}

        <div className="pt-4 mt-4 border-t border-border">
          <Link
            data-admin-nav-link
            href="/"
            target="_blank"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors opacity-0 -translate-x-3"
          >
            <ExternalLink className="h-5 w-5" />
            Преглед на сайта
          </Link>
        </div>
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 px-4 py-3 mb-2">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {user?.name || "Администратор"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Изход
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <header className="md:hidden h-16 px-4 border-b border-border bg-card sticky top-0 z-30 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Zap className="h-6 w-6 text-primary" />
          <span className="text-base font-bold">
            Digi<span className="text-primary">Start</span>
          </span>
        </Link>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" aria-label="Open navigation">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Admin Navigation</SheetTitle>
              <SheetDescription>Open admin navigation links</SheetDescription>
            </SheetHeader>
            <aside className="h-full bg-card flex flex-col">{sidebarContent}</aside>
          </SheetContent>
        </Sheet>
      </header>

      <aside className="hidden md:flex md:w-64 bg-card border-r border-border md:sticky md:top-0 md:h-screen md:overflow-y-auto shrink-0 flex-col">
        {sidebarContent}
      </aside>
    </>
  );
}
