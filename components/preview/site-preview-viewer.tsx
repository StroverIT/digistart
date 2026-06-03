"use client";

import { type ReactNode, useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { ArrowLeft } from "lucide-react";
import gsap from "gsap";
import { Button } from "@/components/ui/button";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Dialog, DialogOverlay, DialogPortal, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export type SitePreviewViewerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  src: string;
  title: string;
  cta?: ReactNode;
  iframeTitle?: string;
};

const OPEN_DURATION = 0.45;
const CLOSE_DURATION = 0.32;

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function SitePreviewViewer({
  open,
  onOpenChange,
  src,
  title,
  cta,
  iframeTitle,
}: SitePreviewViewerProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const isClosingRef = useRef(false);
  const closeTimelineRef = useRef<gsap.core.Timeline | null>(null);

  const runCloseAnimation = useCallback(
    (onDone: () => void) => {
      if (isClosingRef.current) return;
      isClosingRef.current = true;
      closeTimelineRef.current?.kill();

      const iframe = iframeRef.current;
      const header = headerRef.current;
      const overlay = overlayRef.current;

      if (prefersReducedMotion() || !iframe) {
        isClosingRef.current = false;
        onDone();
        return;
      }

      const tl = gsap.timeline({
        onComplete: () => {
          isClosingRef.current = false;
          closeTimelineRef.current = null;
          onDone();
        },
      });
      closeTimelineRef.current = tl;

      if (header) {
        tl.to(header, { opacity: 0, y: -8, duration: 0.2, ease: "power2.in" }, 0);
      }
      tl.to(
        iframe,
        { opacity: 0, y: 20, scale: 0.98, duration: CLOSE_DURATION, ease: "power2.in" },
        0,
      );
      if (overlay) {
        tl.to(overlay, { opacity: 0, duration: 0.28, ease: "power2.in" }, 0.04);
      }
    },
    [],
  );

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (next) {
        onOpenChange(true);
        return;
      }
      runCloseAnimation(() => onOpenChange(false));
    },
    [onOpenChange, runCloseAnimation],
  );

  const handleBack = useCallback(() => {
    runCloseAnimation(() => onOpenChange(false));
  }, [onOpenChange, runCloseAnimation]);

  useLayoutEffect(() => {
    if (!open) return;

    const ctx = gsap.context(() => {
      const iframe = iframeRef.current;
      const header = headerRef.current;
      const overlay = overlayRef.current;
      if (!iframe) return;

      if (prefersReducedMotion()) {
        gsap.set([iframe, header, overlay].filter(Boolean), {
          opacity: 1,
          y: 0,
          scale: 1,
        });
        return;
      }

      gsap.set(iframe, { opacity: 0, y: 24, scale: 0.98 });
      if (header) gsap.set(header, { opacity: 0, y: -8 });
      if (overlay) gsap.set(overlay, { opacity: 0 });

      if (overlay) {
        gsap.to(overlay, { opacity: 1, duration: 0.25, ease: "power2.out" });
      }
      gsap.to(iframe, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: OPEN_DURATION,
        ease: "power3.out",
      });
      if (header) {
        gsap.to(header, {
          opacity: 1,
          y: 0,
          duration: 0.35,
          ease: "power2.out",
          delay: 0.08,
        });
      }
    }, contentRef);

    return () => ctx.revert();
  }, [open]);

  useEffect(() => {
    return () => {
      closeTimelineRef.current?.kill();
    };
  }, []);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogPortal>
        <DialogOverlay
          ref={overlayRef}
          className="z-60 bg-background data-[state=closed]:animate-none data-[state=open]:animate-none"
        />
        <DialogPrimitive.Content
          ref={contentRef}
          data-slot="dialog-content"
          className={cn(
            "bg-background",
            "fixed inset-0 z-60 m-0 flex h-screen w-screen max-w-none flex-col overflow-hidden rounded-none border-0 p-0 shadow-none outline-none",
            "translate-x-0 translate-y-0 sm:max-w-none",
          )}
        >
          <header
            ref={headerRef}
            className="relative z-10 grid w-full shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-2 border-b bg-background px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]"
          >
            <div className="flex justify-start">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="gap-1.5"
                onClick={handleBack}
              >
                <ArrowLeft className="size-4" />
                Назад
              </Button>
            </div>
            <DialogTitle className="truncate text-center text-base font-semibold">
              {title}
            </DialogTitle>
            <div className="flex min-w-22 justify-end">{cta ?? null}</div>
          </header>
          <div className="relative min-h-0 flex-1 w-full">
            {open ? (
              <iframe
                ref={iframeRef}
                className="absolute inset-0 h-full w-full border-0"
                src={src}
                title={iframeTitle ?? title}
                referrerPolicy="strict-origin-when-cross-origin"
              />
            ) : null}
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
