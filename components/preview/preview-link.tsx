"use client";

import {
  flushAnalyticsEventsAsync,
  trackCtaClick,
} from "@/lib/analytics/tracker";
import { useAnalyticsMode } from "@/components/analytics/analytics-mode-provider";
import { cn } from "@/lib/utils";

interface PreviewLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  ctaId?: string;
  ctaPage?: string;
}

/**
 * Hard navigation to external template apps (separate Next.js instances).
 * Do not use next/link - client routing breaks cross-app previews.
 */
export function PreviewLink({
  href,
  ctaId,
  ctaPage,
  className,
  children,
  onClick,
  target = "_blank",
  rel = "noopener noreferrer",
  ...props
}: PreviewLinkProps) {
  const { isAnalyticsMode, notifyCtaClicked, refreshAnalytics } = useAnalyticsMode();

  return (
    <a
      href={href}
      target={target}
      rel={rel}
      className={cn(className)}
      onClick={async (e) => {
        if (ctaId && ctaPage) {
          trackCtaClick(ctaPage, ctaId);
          notifyCtaClicked(ctaPage, ctaId);
          await flushAnalyticsEventsAsync();
          if (isAnalyticsMode) await refreshAnalytics();
        }
        onClick?.(e);
      }}
      {...props}
    >
      {children}
    </a>
  );
}
