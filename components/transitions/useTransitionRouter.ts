"use client";
import { useRouter } from "next/navigation";
import { usePageTransition } from "./transition-context";
import { useCallback } from "react";

export const useTransitionRouter = () => {
  const router = useRouter();
  const { playExit, setPendingNavigation, isNavigationLocked } =
    usePageTransition();

  const push = useCallback(
    (href: string) => {
      if (isNavigationLocked()) return;

      setPendingNavigation(true);
      playExit(() => {
        router.push(href);
      });
    },
    [router, playExit, setPendingNavigation, isNavigationLocked],
  );

  return { push, router };
};
