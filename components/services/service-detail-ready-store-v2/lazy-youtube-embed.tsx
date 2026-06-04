"use client";

import { useState } from "react";
import { Play } from "lucide-react";

type LazyYouTubeEmbedProps = {
  videoId: string;
  title: string;
  className?: string;
};

export function LazyYouTubeEmbed({ videoId, title, className }: LazyYouTubeEmbedProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  if (isLoaded) {
    return (
      <iframe
        className={className}
        src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />
    );
  }

  return (
    <button
      type="button"
      className={`group relative flex h-full w-full items-center justify-center overflow-hidden bg-black ${className ?? ""}`}
      onClick={() => setIsLoaded(true)}
      aria-label={`Пусни видео: ${title}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-90 transition-opacity group-hover:opacity-100"
        loading="lazy"
        decoding="async"
        fetchPriority="low"
      />
      <span className="relative flex size-16 items-center justify-center rounded-full bg-primary/95 text-primary-foreground shadow-lg transition-transform group-hover:scale-105 sm:size-20">
        <Play className="ml-1 size-7 fill-current sm:size-8" aria-hidden />
      </span>
    </button>
  );
}
