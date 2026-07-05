"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getFunnelByPathname } from "@/lib/service-funnels/path";
import type { FunnelSlotAvailability } from "@/lib/types";
import { cn } from "@/lib/utils";

interface FunnelSlotsBannerProps {
  className?: string;
}

export function FunnelSlotsBanner({ className }: FunnelSlotsBannerProps) {
  const pathname = usePathname();
  const funnel = getFunnelByPathname(pathname);
  const [availability, setAvailability] = useState<FunnelSlotAvailability | null>(null);

  useEffect(() => {
    if (!funnel) {
      setAvailability(null);
      return;
    }

    const controller = new AbortController();
    fetch(`/api/funnel-slots?funnelId=${encodeURIComponent(funnel.id)}`, {
      signal: controller.signal,
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("slots"))))
      .then((data: { availability?: FunnelSlotAvailability }) => {
        setAvailability(data.availability ?? null);
      })
      .catch(() => {
        if (!controller.signal.aborted) setAvailability(null);
      });

    return () => controller.abort();
  }, [funnel]);

  if (!funnel || !availability) return null;

  return (
    <div
      className={cn(
        "bg-accent text-accent-foreground text-center text-sm font-medium py-2 px-4",
        className,
      )}
      role="status"
    >
      {availability.isSoldOut
        ? "Няма свободни места"
        : `Свободни места: ${availability.remaining}`}
    </div>
  );
}
