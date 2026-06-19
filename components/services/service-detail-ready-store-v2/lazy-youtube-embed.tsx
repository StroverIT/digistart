import { getYoutubeEmbedUrl } from "@/config/videos";
import { cn } from "@/lib/utils";

type LazyYouTubeEmbedProps = {
  videoId: string;
  title: string;
  className?: string;
};

export function LazyYouTubeEmbed({ videoId, title, className }: LazyYouTubeEmbedProps) {
  return (
    <iframe
      className={cn("h-full w-full", className)}
      src={getYoutubeEmbedUrl(videoId)}
      title={title}
      loading="lazy"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      referrerPolicy="strict-origin-when-cross-origin"
      allowFullScreen
    />
  );
}
