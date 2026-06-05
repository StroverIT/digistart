"use client";
import React, { useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { usePageTransition } from "./transition-context";

function normalizePathname(path: string): string {
  if (!path || path === "") return "/";
  try {
    const decoded = decodeURI(path);
    if (decoded.length > 1 && decoded.endsWith("/")) {
      return decoded.slice(0, -1) || "/";
    }
    return decoded;
  } catch {
    return path;
  }
}

/** Pathname portion of an app-relative href (strips query and hash). */
function pathnameFromHref(href: string): string | null {
  if (
    href.startsWith("http") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:") ||
    href.startsWith("#")
  ) {
    return null;
  }
  const beforeHash = href.split("#")[0] ?? href;
  const beforeQuery = beforeHash.split("?")[0] ?? beforeHash;
  const raw =
    beforeQuery === ""
      ? "/"
      : beforeQuery.startsWith("/")
        ? beforeQuery
        : `/${beforeQuery}`;
  try {
    return new URL(raw, "https://transition-link.local").pathname;
  } catch {
    return raw;
  }
}

function isSameDocumentNavigation(pathname: string, href: string): boolean {
  if (href.startsWith("#")) return true;
  const linkPath = pathnameFromHref(href);
  if (linkPath === null) return false;
  return normalizePathname(linkPath) === normalizePathname(pathname);
}

function scrollToHashFromHref(href: string, pathname: string) {
  const hashIndex = href.indexOf("#");
  if (hashIndex === -1) return;
  const hash = href.slice(hashIndex);
  if (hash.length <= 1) return;
  const id = decodeURIComponent(hash.slice(1));
  if (!id) return;
  requestAnimationFrame(() => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    window.history.replaceState(
      null,
      "",
      `${normalizePathname(pathname)}${hash}`,
    );
  });
}

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

  useEffect(() => {
    currentHrefRef.current = href;
  }, [href]);

  const handleClick = useCallback(
    async (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (
        href.startsWith("#") ||
        href.startsWith("http") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:")
      ) {
        if (parentOnClick) await parentOnClick(e);
        return;
      }

      if (isTransitioning || hasPendingNavigation()) {
        e.preventDefault();
        return;
      }

      if (isSameDocumentNavigation(pathname, href)) {
        e.preventDefault();
        if (parentOnClick) await parentOnClick(e);
        scrollToHashFromHref(href, pathname);
        return;
      }

      e.preventDefault();

      // Animate first; mark navigation pending only when the exit sequence finishes
      playExit(() => {
        setPendingNavigation(true);
        router.push(currentHrefRef.current);
      });

      if (parentOnClick) {
        try {
          void parentOnClick(e);
        } catch (err) {
          console.error("Parent onClick failed:", err);
        }
      }
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
    ],
  );

  return (
    <Link href={href} onClick={handleClick} className={className} {...props}>
      {children}
    </Link>
  );
};

export default TransitionLink;
