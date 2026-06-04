"use client";

import { LazyYouTubeEmbed } from "./lazy-youtube-embed";

type HeroVideoProps = {
  videoId: string;
  title: string;
};

export default function HeroVideo({ videoId, title }: HeroVideoProps) {
  return (
    <article className="w-full flex-1">
      <div className="overflow-hidden rounded-2xl border border-border/80 bg-muted/40 p-2 shadow-xl shadow-primary/5 sm:p-3">
        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-background">
          <LazyYouTubeEmbed
            videoId={videoId}
            title={title}
            className="absolute inset-0 h-full w-full"
          />
        </div>
      </div>
    </article>
  );
}
