"use client";

import { trackCtaClick } from "@/lib/analytics/tracker";
import { cn } from "@/lib/utils";

interface PreviewLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  ctaId?: string;
  ctaPage?: string;
}

/**
 * Hard navigation to external template apps (separate Next.js instances).
 * Do not use next/link — client routing breaks cross-app previews.
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
  return (
    <a
      href={href}
      target={target}
      rel={rel}
      className={cn(className)}
      onClick={(e) => {
        if (ctaId && ctaPage) {
          trackCtaClick(ctaPage, ctaId);
        }
        onClick?.(e);
      }}
      {...props}
    >
      {children}
    </a>
  );
}
