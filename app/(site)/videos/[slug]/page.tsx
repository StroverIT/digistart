import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getVideoBySlug, getVideos } from "@/config/videos";
import TransitionLink from "@/components/transitions/TransitionLink";
import { YoutubeEmbed } from "@/components/videos/youtube-embed";

type VideoPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("bg-BG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export async function generateStaticParams() {
  return getVideos().map((video) => ({ slug: video.slug }));
}

export async function generateMetadata({
  params,
}: VideoPageProps): Promise<Metadata> {
  const { slug } = await params;
  const video = getVideoBySlug(slug);

  if (!video) {
    return {
      title: "Видеото не е намерено",
    };
  }

  return {
    title: video.title,
    description: video.excerpt,
  };
}

export default async function VideoPage({ params }: VideoPageProps) {
  const { slug } = await params;
  const video = getVideoBySlug(slug);

  if (!video) notFound();

  const otherVideos = getVideos().filter((item) => item.slug !== slug);

  return (
    <article className="p-6 sm:p-8 md:p-10 space-y-8">
      <header className="space-y-4">
        <TransitionLink
          href="/videos"
          className="inline-flex text-sm font-medium text-primary hover:underline"
        >
          Назад към видеата
        </TransitionLink>
        <p className="text-sm text-muted-foreground">
          {formatDate(video.publishedAt)}
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight">
          {video.title}
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
          {video.excerpt}
        </p>
      </header>

      <YoutubeEmbed youtubeId={video.youtubeId} title={video.title} />

      {otherVideos.length > 0 ? (
        <section className="space-y-4 rounded-2xl border border-border bg-card p-5 sm:p-6">
          <h2 className="text-xl font-semibold tracking-tight">Други видеа</h2>
          <ul className="space-y-3">
            {otherVideos.map((item) => (
              <li key={item.slug}>
                <TransitionLink
                  href={`/videos/${item.slug}`}
                  className="text-primary hover:underline"
                >
                  {item.title}
                </TransitionLink>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </article>
  );
}
