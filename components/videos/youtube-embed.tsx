import { getYoutubeEmbedUrl } from "@/config/videos";
import { cn } from "@/lib/utils";

type YoutubeEmbedProps = {
  youtubeId: string;
  title: string;
  className?: string;
  loading?: "lazy" | "eager";
};

export function YoutubeEmbed({
  youtubeId,
  title,
  className,
  loading = "eager",
}: YoutubeEmbedProps) {
  return (
    <div
      className={cn(
        "relative aspect-video overflow-hidden rounded-2xl border border-border bg-muted",
        className
      )}
    >
      <iframe
        src={getYoutubeEmbedUrl(youtubeId)}
        title={title}
        loading={loading}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
        className="absolute inset-0 h-full w-full"
      />
    </div>
  );
}
