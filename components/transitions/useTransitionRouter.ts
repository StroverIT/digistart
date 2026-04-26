"use client";
import { useRouter } from "next/navigation";
import { usePageTransition } from "./transition-context";
import { useCallback } from "react";

export const useTransitionRouter = () => {
  const router = useRouter();
  const { playExit, setPendingNavigation } = usePageTransition();

  const push = useCallback(
    (href: string) => {
      setPendingNavigation(true);
      playExit(() => {
        router.push(href);
      });
    },
    [router, playExit, setPendingNavigation]
  );

  return { push, router };
};
