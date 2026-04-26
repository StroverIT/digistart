"use client";
import React, { useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { usePageTransition } from "./transition-context";

type TransitionLinkProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void | Promise<void>;
  [key: string]: unknown;
};

const TransitionLink = ({
  href,
  children,
  className,
  onClick: parentOnClick,
  ...props
}: TransitionLinkProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const {
    playExit,
    isTransitioning,
    setPendingNavigation,
    hasPendingNavigation,
  } = usePageTransition();
  const currentHrefRef = useRef(href);

  // Keep href ref up to date
  useEffect(() => {
    currentHrefRef.current = href;
  }, [href]);

  const handleClick = useCallback(
    async (e: React.MouseEvent<HTMLAnchorElement>) => {
      // Don't prevent default for hash links or external links
      if (
        href.startsWith("#") ||
        href.startsWith("http") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:")
      ) {
        // Still call parent's onClick for hash links/external links if needed
        if (parentOnClick) {
          parentOnClick(e);
        }
        return;
      }

      // Prevent double navigation
      if (isTransitioning || hasPendingNavigation()) {
        e.preventDefault();
        return;
      }

      // Skip if navigating to the same page
      if (pathname === href) {
        if (parentOnClick) {
          parentOnClick(e);
        }
        return;
      }

      e.preventDefault();

      // Call parent's onClick first (e.g., to close menu) and wait for it to complete
      if (parentOnClick) {
        const result = parentOnClick(e);
        // If parent's onClick returns a Promise, wait for it to complete
        if (result instanceof Promise) {
          await result;
        }
      }

      // Mark navigation as pending
      setPendingNavigation(true);

      // Exit animation -> then navigate
      playExit(() => {
        router.push(encodeURI(currentHrefRef.current));
      });
    },
    [
      href,
      pathname,
      router,
      playExit,
      isTransitioning,
      hasPendingNavigation,
      setPendingNavigation,
      parentOnClick,
    ]
  );

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={className}
      {...props}
    >
      {children}
    </Link>
  );
};

export default TransitionLink;
