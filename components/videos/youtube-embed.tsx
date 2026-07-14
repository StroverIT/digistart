"use client";

import { Play, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { getYoutubeEmbedUrl } from "@/config/videos";
import { cn } from "@/lib/utils";

type VideoFormat = "short" | "standard";

type YoutubeEmbedProps = {
  youtubeId: string;
  title: string;
  thumbnailSrc?: string;
  format?: VideoFormat;
  className?: string;
  loading?: "lazy" | "eager";
};

const fullscreenFrameClass: Record<VideoFormat, string> = {
  short:
    "aspect-[9/16] h-[min(100dvh,calc(100vw*16/9))] w-[min(100vw,calc(100dvh*9/16))]",
  standard:
    "aspect-video h-[min(100dvh,calc(100vw*9/16))] w-[min(100vw,calc(100dvh*16/9))]",
};

export function YoutubeEmbed({
  youtubeId,
  title,
  thumbnailSrc,
  format = "standard",
  className,
  loading = "eager",
}: YoutubeEmbedProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (!isFullscreen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsFullscreen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isFullscreen]);

  const iframe = (
    <iframe
      src={getYoutubeEmbedUrl(youtubeId, { autoplay: Boolean(thumbnailSrc) })}
      title={title}
      loading={loading}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
      referrerPolicy="strict-origin-when-cross-origin"
      allowFullScreen
      className="absolute inset-0 h-full w-full"
    />
  );

  return (
    <>
      <div
        className={cn(
          "relative aspect-video overflow-hidden rounded-2xl border border-border bg-muted",
          className,
        )}
      >
        {thumbnailSrc ? (
          <button
            type="button"
            onClick={() => setIsFullscreen(true)}
            className="group absolute inset-0 block h-full w-full cursor-pointer"
            aria-label={`Пусни видео: ${title}`}
          >
            <Image
              src={thumbnailSrc}
              alt={title}
              fill
              priority={loading === "eager"}
              className="object-cover transition-transform duration-300 group-hover:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            />
            <span className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors group-hover:bg-black/30">
              <span className="flex size-14 items-center justify-center rounded-full bg-primary/90 text-primary-foreground shadow-lg transition-transform group-hover:scale-110 motion-reduce:transition-none motion-reduce:group-hover:scale-100">
                <Play className="ml-0.5 size-6 fill-current" aria-hidden />
              </span>
            </span>
          </button>
        ) : (
          iframe
        )}
      </div>

      {isFullscreen && typeof document !== "undefined"
        ? createPortal(
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
              role="dialog"
              aria-modal="true"
              aria-label={title}
              onClick={() => setIsFullscreen(false)}
            >
              <button
                type="button"
                onClick={() => setIsFullscreen(false)}
                className="absolute top-4 right-4 z-10 flex size-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                aria-label="Затвори видео"
              >
                <X className="size-5" aria-hidden />
              </button>
              <div
                className={cn(
                  "relative overflow-hidden rounded-xl bg-black shadow-2xl",
                  fullscreenFrameClass[format],
                )}
                onClick={(event) => event.stopPropagation()}
              >
                {iframe}
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
