"use client";
import { useRouter } from "next/navigation";
import { usePageTransition } from "./transition-context";
import { useCallback } from "react";

export const useTransitionRouter = () => {
  const router = useRouter();
  const {
    playExit,
    playEnter,
    setPendingNavigation,
    isNavigationLocked,
  } = usePageTransition();

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

  const startLoadingOverlay = useCallback(() => {
    if (isNavigationLocked()) return false;

    setPendingNavigation(true);
    playExit(() => {});
    return true;
  }, [playExit, setPendingNavigation, isNavigationLocked]);

  const cancelLoadingOverlay = useCallback(() => {
    setPendingNavigation(false);
    playEnter();
  }, [playEnter, setPendingNavigation]);

  return {
    push,
    router,
    startLoadingOverlay,
    cancelLoadingOverlay,
    isNavigationLocked,
  };
};
