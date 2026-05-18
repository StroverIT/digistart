"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import TransitionLink from "@/components/transitions/TransitionLink";
import {
  flushAnalyticsEventsAsync,
  trackAnalyticsEvent,
} from "@/lib/analytics/tracker";
import { useAnalyticsMode } from "@/components/analytics/analytics-mode-provider";

type TrackedCtaLinkProps = {
  href: string;
  ctaId: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void | Promise<void>;
  _blank?: boolean;
};

function getOverlayTone(views: number, clicks: number) {
  if (views >= 100 && clicks >= 50) return "bg-red-500/20 border-red-500/60";
  if (views >= 20 && clicks >= 10) return "bg-yellow-400/20 border-yellow-400/60";
  return "bg-primary/15 border-primary/50";
}

export function TrackedCtaLink({
  href,
  ctaId,
  _blank = false,
  children,
  className,
  onClick,
}: TrackedCtaLinkProps) {
  const pathname = usePathname();
  const {
    isAnalyticsMode,
    showAllCtaStats,
    ctaStats,
    pageStats,
    notifyCtaClicked,
    refreshAnalytics,
  } = useAnalyticsMode();

  const currentPage = pathname || "/";
  const cta = ctaStats.find((item) => item.page === currentPage && item.ctaId === ctaId);
  const views = pageStats.find((item) => item.page === currentPage)?.views ?? 0;
  const clicks = cta?.clicks ?? 0;
  const shouldRenderOverlay = isAnalyticsMode && clicks > 0;
  const showBadge = shouldRenderOverlay && (showAllCtaStats || clicks > 0);

  return (
    <span className="relative inline-flex group">
      <TransitionLink
        href={href}
        target={_blank ? "_blank" : undefined}
        className={className}
        onClick={async () => {
          if (onClick) await onClick();
          trackAnalyticsEvent("cta_click", currentPage, { cta_id: ctaId });
          notifyCtaClicked(currentPage, ctaId);
          await flushAnalyticsEventsAsync();
          if (isAnalyticsMode) await refreshAnalytics();
        }}
      >
        {children}
      </TransitionLink>
      {shouldRenderOverlay ? (
        <span
          className={`pointer-events-none absolute inset-0 rounded-md border ${getOverlayTone(
            views,
            clicks,
          )} ${showAllCtaStats ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
        />
      ) : null}
      {showBadge ? (
        <span
          className={`pointer-events-none absolute -top-2 right-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold text-foreground shadow-sm transition-opacity ${getOverlayTone(views, clicks)
            } ${showAllCtaStats ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
        >
          {clicks} клика
        </span>
      ) : null}
    </span>
  );
}
