import { getYoutubeEmbedUrl } from "@/config/videos";
import { cn } from "@/lib/utils";
import type { Ref } from "react";

type LazyYouTubeEmbedProps = {
  videoId: string;
  title: string;
  className?: string;
  autoplay?: boolean;
  mute?: boolean;
  enableJsApi?: boolean;
  iframeRef?: Ref<HTMLIFrameElement>;
};

export function LazyYouTubeEmbed({
  videoId,
  title,
  className,
  autoplay = false,
  mute = false,
  enableJsApi = false,
  iframeRef,
}: LazyYouTubeEmbedProps) {
  return (
    <iframe
      ref={iframeRef}
      className={cn("h-full w-full border-0", className)}
      src={getYoutubeEmbedUrl(videoId, { autoplay, mute, enableJsApi })}
      title={title}
      // Dynamically mounted autoplay iframes never load if marked lazy.
      loading={autoplay ? "eager" : "lazy"}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      referrerPolicy="strict-origin-when-cross-origin"
      allowFullScreen
    />
  );
}
