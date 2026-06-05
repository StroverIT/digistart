"use client";

import { type ReactNode, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowLeft, Monitor, Smartphone, Tablet } from "lucide-react";
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

type PreviewDevice = "desktop" | "tablet" | "phone";
type HostViewport = "desktop" | "tablet" | "phone";

const OPEN_DURATION = 0.45;
const CLOSE_DURATION = 0.32;
const TABLET_BREAKPOINT = 768;
const DESKTOP_BREAKPOINT = 1024;

const DEVICE_OPTIONS: { id: PreviewDevice; label: string; icon: typeof Monitor }[] = [
  { id: "desktop", label: "Desktop preview", icon: Monitor },
  { id: "tablet", label: "Tablet preview", icon: Tablet },
  { id: "phone", label: "Phone preview", icon: Smartphone },
];

function getHostViewport(width: number): HostViewport {
  if (width >= DESKTOP_BREAKPOINT) return "desktop";
  if (width >= TABLET_BREAKPOINT) return "tablet";
  return "phone";
}

function getDefaultDevice(host: HostViewport): PreviewDevice {
  if (host === "desktop") return "desktop";
  if (host === "tablet") return "tablet";
  return "phone";
}

function getAvailableDevices(host: HostViewport): PreviewDevice[] {
  if (host === "desktop") return ["desktop", "tablet", "phone"];
  if (host === "tablet") return ["tablet", "phone"];
  return [];
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function DeviceSwitcher({
  hostViewport,
  device,
  onDeviceChange,
}: {
  hostViewport: HostViewport;
  device: PreviewDevice;
  onDeviceChange: (device: PreviewDevice) => void;
}) {
  const available = getAvailableDevices(hostViewport);
  if (available.length === 0) return null;

  return (
    <div className="flex items-center gap-0.5 rounded-lg border border-border/60 bg-background p-0.5">
      {DEVICE_OPTIONS.filter((option) => available.includes(option.id)).map((option) => {
        const Icon = option.icon;
        const isActive = device === option.id;

        return (
          <button
            key={option.id}
            type="button"
            aria-label={option.label}
            aria-pressed={isActive}
            onClick={() => onDeviceChange(option.id)}
            className={cn(
              "flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors",
              isActive && "bg-muted text-foreground shadow-xs",
            )}
          >
            <Icon className="size-[18px]" strokeWidth={1.75} />
          </button>
        );
      })}
    </div>
  );
}

function PreviewFrame({
  device,
  hostViewport,
  src,
  title,
  iframeRef,
}: {
  device: PreviewDevice;
  hostViewport: HostViewport;
  src: string;
  title: string;
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
}) {
  const useFullBleed = device === "desktop" || hostViewport === "phone";
  const isTablet = device === "tablet";

  return (
    <div
      className={cn(
        "relative h-full w-full",
        !useFullBleed && "flex items-center justify-center p-4 sm:p-6",
      )}
    >
      <div
        className={cn(
          "relative flex min-h-0 flex-col",
          useFullBleed
            ? "absolute inset-0"
            : cn(
                "max-h-full rounded-4xl bg-zinc-900 p-2.5 shadow-2xl sm:p-3",
                isTablet
                  ? "w-full max-w-[min(100%,520px)]"
                  : "w-full max-w-[min(100%,340px)]",
              ),
        )}
      >
        <div
          className={cn(
            "relative min-h-0 flex-1 overflow-hidden",
            useFullBleed ? "h-full w-full" : "rounded-[1.35rem] bg-white",
            !useFullBleed && (isTablet ? "aspect-3/4" : "aspect-9/19"),
          )}
        >
          <iframe
            ref={iframeRef}
            className="absolute inset-0 h-full w-full border-0"
            src={src}
            title={title}
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
        {!useFullBleed && isTablet ? (
          <div className="mt-2 flex shrink-0 justify-center">
            <span className="size-2.5 rounded-full bg-zinc-700" />
          </div>
        ) : null}
      </div>
    </div>
  );
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
  const previewRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const isClosingRef = useRef(false);
  const closeTimelineRef = useRef<gsap.core.Timeline | null>(null);

  const [hostViewport, setHostViewport] = useState<HostViewport>("desktop");
  const [device, setDevice] = useState<PreviewDevice>("desktop");

  useEffect(() => {
    const syncHostViewport = () => {
      setHostViewport(getHostViewport(window.innerWidth));
    };

    syncHostViewport();
    window.addEventListener("resize", syncHostViewport);
    return () => window.removeEventListener("resize", syncHostViewport);
  }, []);

  useEffect(() => {
    const available = getAvailableDevices(hostViewport);
    const defaultDevice = getDefaultDevice(hostViewport);

    setDevice((current) => {
      if (available.length === 0) return "phone";
      if (available.includes(current)) return current;
      return defaultDevice;
    });
  }, [hostViewport]);

  const runCloseAnimation = useCallback(
    (onDone: () => void) => {
      if (isClosingRef.current) return;
      isClosingRef.current = true;
      closeTimelineRef.current?.kill();

      const preview = previewRef.current;
      const header = headerRef.current;
      const overlay = overlayRef.current;

      if (prefersReducedMotion() || !preview) {
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
        preview,
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
      const preview = previewRef.current;
      const header = headerRef.current;
      const overlay = overlayRef.current;
      if (!preview) return;

      if (prefersReducedMotion()) {
        gsap.set([preview, header, overlay].filter(Boolean), {
          opacity: 1,
          y: 0,
          scale: 1,
        });
        return;
      }

      gsap.set(preview, { opacity: 0, y: 24, scale: 0.98 });
      if (header) gsap.set(header, { opacity: 0, y: -8 });
      if (overlay) gsap.set(overlay, { opacity: 0 });

      if (overlay) {
        gsap.to(overlay, { opacity: 1, duration: 0.25, ease: "power2.out" });
      }
      gsap.to(preview, {
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
  }, [open, device]);

  useEffect(() => {
    return () => {
      closeTimelineRef.current?.kill();
    };
  }, []);

  const resolvedTitle = iframeTitle ?? title;

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
            className="relative z-10 grid w-full shrink-0 grid-cols-[1fr_auto_1fr] items-center border-b bg-background"
          >
            <div className="flex min-w-0 items-center gap-3 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="shrink-0 text-muted-foreground"
                onClick={handleBack}
                aria-label="Назад"
              >
                <ArrowLeft className="size-5" />
              </Button>
              <span className="h-5 w-px shrink-0 bg-border" aria-hidden />
              <DialogTitle className="truncate text-base font-medium text-foreground">
                {title}
              </DialogTitle>
            </div>

            <div className="flex justify-center px-2 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
              <DeviceSwitcher
                hostViewport={hostViewport}
                device={device}
                onDeviceChange={setDevice}
              />
            </div>

            <div className="flex min-w-0 justify-end px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
              {cta ?? null}
            </div>
          </header>

          <div
            ref={previewRef}
            className={cn(
              "relative min-h-0 flex-1 w-full",
              device !== "desktop" && hostViewport !== "phone" && "bg-muted/40",
            )}
          >
            {open ? (
              <PreviewFrame
                device={device}
                hostViewport={hostViewport}
                src={src}
                title={resolvedTitle}
                iframeRef={iframeRef}
              />
            ) : null}
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
