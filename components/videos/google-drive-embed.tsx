"use client";

import { Play } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { getGoogleDriveEmbedUrl } from "@/config/videos";
import { cn } from "@/lib/utils";

type GoogleDriveEmbedProps = {
  fileId: string;
  title: string;
  thumbnailSrc?: string;
  className?: string;
  loading?: "lazy" | "eager";
};

export function GoogleDriveEmbed({
  fileId,
  title,
  thumbnailSrc,
  className,
  loading = "eager",
}: GoogleDriveEmbedProps) {
  const [isPlaying, setIsPlaying] = useState(!thumbnailSrc);

  return (
    <div
      className={cn(
        "relative aspect-video overflow-hidden rounded-2xl border border-border bg-muted",
        className,
      )}
    >
      {isPlaying ? (
        <iframe
          src={getGoogleDriveEmbedUrl(fileId, { autoplay: Boolean(thumbnailSrc) })}
          title={title}
          loading={loading}
          allow="autoplay; encrypted-media"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      ) : (
        <button
          type="button"
          onClick={() => setIsPlaying(true)}
          className="group absolute inset-0 block h-full w-full cursor-pointer"
          aria-label={`Пусни видео: ${title}`}
        >
          <Image
            src={thumbnailSrc!}
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
      )}
    </div>
  );
}
