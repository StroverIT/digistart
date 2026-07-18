"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { getYoutubeEmbedUrl } from "@/config/videos";
import { cn } from "@/lib/utils";

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

function sendYouTubeCommand(iframe: HTMLIFrameElement | null, func: string) {
  if (!iframe?.contentWindow) return;
  iframe.contentWindow.postMessage(
    JSON.stringify({ event: "command", func, args: [] }),
    "*",
  );
}

export default function HeroVideo({
  videoId,
  title,
  thumbnailSrc,
  muteOnPlay = false,
}: HeroVideoProps) {
  const [hasStarted, setHasStarted] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playMutedInBackground = Boolean(thumbnailSrc) && muteOnPlay;

  const forcePlay = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    sendYouTubeCommand(iframe, "playVideo");
    if (muteOnPlay) sendYouTubeCommand(iframe, "mute");
  }, [muteOnPlay]);

  useEffect(() => {
    if (!playMutedInBackground) return;

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
  }, [forcePlay, playMutedInBackground, videoId]);

  const startVideo = () => {
    setHasStarted(true);
    forcePlay();
    // Retry after React paints the interactive iframe.
    window.setTimeout(forcePlay, 100);
    window.setTimeout(forcePlay, 400);
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
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
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
            className={cn(
              "absolute inset-0 h-full w-full border-0",
              !hasStarted && "pointer-events-none",
            )}
            src={getYoutubeEmbedUrl(videoId, {
              autoplay: playMutedInBackground || hasStarted,
              mute: muteOnPlay || playMutedInBackground,
              enableJsApi: true,
            })}
            title={title}
            loading="eager"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />

          {!hasStarted ? (
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
          ) : null}
        </div>
      </div>
    </article>
  );
}
