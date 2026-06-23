"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Layers2, Smartphone, Store, type LucideIcon } from "lucide-react";
import {
  HOME_PATHS,
  parsePathKey,
  type PathKey,
} from "@/lib/data/home-paths";
import { PathContent } from "@/components/home/path-content";
import { cn } from "@/lib/utils";

const PATH_ICONS: Record<PathKey, LucideIcon> = {
  online: Smartphone,
  physical: Store,
  hybrid: Layers2,
};

const PATH_QUERY_KEY = "path";
const DEFAULT_PATH: PathKey = "online";

function PathTabsInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pathFromUrl = parsePathKey(searchParams.get(PATH_QUERY_KEY));
  const [active, setActive] = useState<PathKey>(pathFromUrl ?? DEFAULT_PATH);
  const current = HOME_PATHS.find((p) => p.key === active)!;

  useEffect(() => {
    const next = parsePathKey(searchParams.get(PATH_QUERY_KEY)) ?? DEFAULT_PATH;
    setActive(next);
  }, [searchParams]);

  useEffect(() => {
    if (!pathFromUrl) return;
    document.getElementById("paths")?.scrollIntoView({ behavior: "smooth" });
  }, [pathFromUrl]);

  const selectPath = useCallback(
    (key: PathKey) => {
      setActive(key);

      const params = new URLSearchParams(searchParams.toString());
      if (key === DEFAULT_PATH) {
        params.delete(PATH_QUERY_KEY);
      } else {
        params.set(PATH_QUERY_KEY, key);
      }

      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  return (
    <section id="paths" className="container mx-auto px-4 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground md:text-5xl">
          Избери своя модел на работа
        </h2>
        <p className="mt-4 text-base text-muted-foreground md:text-lg">
          Как стигат поръчките до теб в момента?
        </p>
      </div>

      <div className="mt-10 flex flex-wrap justify-center gap-2 md:gap-3">
        {HOME_PATHS.map((p) => {
          const isActive = p.key === active;
          const Icon = PATH_ICONS[p.key];

          return (
            <button
              key={p.key}
              type="button"
              onClick={() => selectPath(p.key)}
              className={cn(
                "group flex items-start gap-3 rounded-2xl border px-5 py-4 text-left transition-all md:px-6",
                isActive
                  ? "border-primary bg-primary text-primary-foreground shadow-[var(--shadow-soft)]"
                  : "border-border bg-card text-foreground hover:border-primary/40",
              )}
            >
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "bg-accent/10 text-accent group-hover:bg-accent/15",
                )}
              >
                <Icon className="h-5 w-5" strokeWidth={2.2} />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold md:text-base">{p.label}</div>
                <div
                  className={cn(
                    "mt-0.5 text-xs",
                    isActive ? "text-primary-foreground/80" : "text-muted-foreground",
                  )}
                >
                  {p.short}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div
        key={current.key}
        className="mt-12 animate-in fade-in slide-in-from-bottom-2 duration-500"
      >
        <PathContent path={current} />
      </div>
    </section>
  );
}

export function PathTabs() {
  return (
    <Suspense fallback={null}>
      <PathTabsInner />
    </Suspense>
  );
}
