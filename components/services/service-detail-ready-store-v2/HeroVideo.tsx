"use client";

import { X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { getYoutubeEmbedUrl } from "@/config/videos";

type HeroVideoProps = {
  videoId: string;
  title: string;
  thumbnailSrc?: string;
  /** Keep playback muted (required for background autoplay). */
  muteOnPlay?: boolean;
};

function YouTubePlayButton() {
  return (
    <span
      className="pointer-events-none flex h-12 w-[68px] items-center justify-center rounded-[14px] bg-[#f00] shadow-[0_2px_12px_rgba(0,0,0,0.45)] transition-transform duration-200 group-hover:scale-110 motion-reduce:transition-none motion-reduce:group-hover:scale-100 sm:h-14 sm:w-[78px] sm:rounded-[16px]"
      aria-hidden
    >
      <svg viewBox="0 0 24 24" className="ml-0.5 h-5 w-5 fill-white sm:h-6 sm:w-6" focusable="false">
        <path d="M8 5.14v13.72L19 12 8 5.14z" />
      </svg>
    </span>
  );
}

function sendYouTubeCommand(
  iframe: HTMLIFrameElement | null,
  func: string,
  args: unknown[] = [],
) {
  if (!iframe?.contentWindow) return;
  iframe.contentWindow.postMessage(
    JSON.stringify({ event: "command", func, args }),
    "*",
  );
}

export default function HeroVideo({
  videoId,
  title,
  thumbnailSrc,
  muteOnPlay = false,
}: HeroVideoProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const fullscreenIframeRef = useRef<HTMLIFrameElement>(null);
  const playMutedInBackground = Boolean(thumbnailSrc) && muteOnPlay;

  const forcePlay = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    sendYouTubeCommand(iframe, "playVideo");
    if (muteOnPlay) sendYouTubeCommand(iframe, "mute");
  }, [muteOnPlay]);

  const unmuteFullscreen = useCallback(() => {
    const iframe = fullscreenIframeRef.current;
    if (!iframe) return;
    sendYouTubeCommand(iframe, "unMute");
    sendYouTubeCommand(iframe, "setVolume", [100]);
  }, []);

  useEffect(() => {
    if (!playMutedInBackground || isFullscreen) return;

    const iframe = iframeRef.current;
    if (!iframe) return;

    const retries: number[] = [];
    const onLoad = () => {
      forcePlay();
      retries.push(
        window.setTimeout(forcePlay, 250),
        window.setTimeout(forcePlay, 750),
        window.setTimeout(forcePlay, 1500),
      );
    };

    iframe.addEventListener("load", onLoad);
    forcePlay();

    return () => {
      iframe.removeEventListener("load", onLoad);
      retries.forEach(clearTimeout);
    };
  }, [forcePlay, isFullscreen, playMutedInBackground, videoId]);

  useEffect(() => {
    if (!isFullscreen) return;

    sendYouTubeCommand(iframeRef.current, "pauseVideo");

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

  useEffect(() => {
    if (!isFullscreen) return;

    const iframe = fullscreenIframeRef.current;
    if (!iframe) return;

    // Fresh autoplay embed already starts at 0 — only unmute, never seek/replay.
    const retries = [
      window.setTimeout(unmuteFullscreen, 300),
      window.setTimeout(unmuteFullscreen, 800),
    ];
    iframe.addEventListener("load", unmuteFullscreen);

    return () => {
      iframe.removeEventListener("load", unmuteFullscreen);
      retries.forEach(clearTimeout);
    };
  }, [isFullscreen, unmuteFullscreen]);

  const startVideo = () => {
    setIsFullscreen(true);
  };

  const closeFullscreen = () => {
    setIsFullscreen(false);
  };

  if (!thumbnailSrc) {
    return (
      <article className="w-full flex-1">
        <div className="overflow-hidden rounded-2xl border border-border/80 bg-muted/40 p-2 shadow-xl shadow-primary/5 sm:p-3">
          <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-background">
            <iframe
              className="absolute inset-0 h-full w-full border-0"
              src={getYoutubeEmbedUrl(videoId)}
              title={title}
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="w-full flex-1">
      <div className="overflow-hidden rounded-2xl border border-border/80 bg-muted/40 p-2 shadow-xl shadow-primary/5 sm:p-3">
        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black">
          <iframe
            ref={iframeRef}
            className="pointer-events-none absolute inset-0 h-full w-full border-0"
            src={getYoutubeEmbedUrl(videoId, {
              autoplay: playMutedInBackground,
              mute: muteOnPlay || playMutedInBackground,
              enableJsApi: true,
            })}
            title={title}
            loading="eager"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />

          <button
            type="button"
            onClick={startVideo}
            className="group absolute inset-0 z-10 block h-full w-full cursor-pointer"
            aria-label={`Пусни видео: ${title}`}
          >
            <Image
              src={thumbnailSrc}
              alt=""
              fill
              priority
              sizes="(max-width: 896px) 100vw, 896px"
              className="object-cover"
            />
            <span className="absolute inset-0 flex items-center justify-center">
              <YouTubePlayButton />
            </span>
          </button>
        </div>
      </div>

      {isFullscreen && typeof document !== "undefined"
        ? createPortal(
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
              role="dialog"
              aria-modal="true"
              aria-label={title}
              onClick={closeFullscreen}
            >
              <button
                type="button"
                onClick={closeFullscreen}
                className="absolute top-4 right-4 z-10 flex size-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                aria-label="Затвори видео"
              >
                <X className="size-5" aria-hidden />
              </button>
              <div
                className="relative aspect-video h-[min(100dvh,calc(100vw*9/16))] w-[min(100vw,calc(100dvh*16/9))] overflow-hidden rounded-xl bg-black shadow-2xl"
                onClick={(event) => event.stopPropagation()}
              >
                <iframe
                  ref={fullscreenIframeRef}
                  className="absolute inset-0 h-full w-full border-0"
                  src={getYoutubeEmbedUrl(videoId, {
                    autoplay: true,
                    mute: false,
                    enableJsApi: true,
                  })}
                  title={title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>
            </div>,
            document.body,
          )
        : null}
    </article>
  );
}
