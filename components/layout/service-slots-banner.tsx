"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { serviceIdFromPathSlug } from "@/lib/service-slots-path";
import type { ServiceSlotAvailability } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ServiceSlotsBannerProps {
  className?: string;
}

export function ServiceSlotsBanner({ className }: ServiceSlotsBannerProps) {
  const pathname = usePathname();
  const [availability, setAvailability] = useState<ServiceSlotAvailability | null>(null);

  useEffect(() => {
    const match = pathname.match(/^\/services\/([^/]+)/);
    const slug = match?.[1];
    const serviceId = slug ? serviceIdFromPathSlug(slug) : null;
    if (!serviceId) {
      setAvailability(null);
      return;
    }

    const controller = new AbortController();
    fetch(`/api/service-slots?serviceId=${encodeURIComponent(serviceId)}`, {
      signal: controller.signal,
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("slots"))))
      .then((data: { availability?: ServiceSlotAvailability }) => {
        setAvailability(data.availability ?? null);
      })
      .catch(() => {
        if (!controller.signal.aborted) setAvailability(null);
      });

    return () => controller.abort();
  }, [pathname]);

  if (!availability) return null;

  return (
    <div
      className={cn(
        "bg-black text-white text-center text-sm font-medium py-2 px-4",
        className,
      )}
      role="status"
    >
      Свободни места: {availability.remaining}
    </div>
  );
}
