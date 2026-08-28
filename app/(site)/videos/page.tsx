import type { Metadata } from "next";
import Image from "next/image";
import { Play } from "lucide-react";
import { getVideos, getYoutubeThumbnailUrl } from "@/config/videos";
import TransitionLink from "@/components/transitions/TransitionLink";
import { fitMetaDescription } from "@/lib/seo/metadata";

export const metadata: Metadata = {
  title: "Видеа",
  description: fitMetaDescription(
    "Практични видео ръководства за собственици на бизнеси: онлайн магазин, поръчки, доставка и реклами - кратко, ясно и без излишна бюрокрация.",
  ),
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("bg-BG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export default function VideosPage() {
  const videos = getVideos();

  return (
    <div className="pt-24 pb-16 md:pt-28 md:pb-24">
      <div className="container mx-auto px-4 space-y-10">
        <section className="max-w-4xl space-y-4">
          <p className="text-sm font-medium tracking-wide uppercase text-primary">
            DigiStart Видеа
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            Видео ръководства за твоя онлайн бизнес
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-3xl">
            Гледай кратки и ясни видеа с практични стъпки - без сложни термини и
            излишна бюрокрация. Подходящи са, ако искаш да разбереш как да стартираш
            онлайн магазин, как да приемаш поръчки и как да избегнеш типичните грешки
            в началото.
          </p>
          <p className="text-base text-muted-foreground max-w-3xl leading-relaxed">
            Всяко видео е направено за собственици, които вършат всичко сами и нямат
            време за дълги курсове. Гледай на телефона, спри на важните моменти и
            приложи следващата стъпка още днес - без да чакаш „перфектния“ момент.
          </p>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {videos.map((video) => (
            <article
              key={video.slug}
              className="rounded-2xl border border-border bg-card overflow-hidden"
            >
              <TransitionLink
                href={`/videos/${video.slug}`}
                className="group block relative aspect-video overflow-hidden bg-muted"
              >
                <Image
                  src={getYoutubeThumbnailUrl(video.youtubeId)}
                  alt={video.title}
                  fill
                  loading="lazy"
                  sizes="(max-width: 1024px) 100vw, 560px"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <span className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors group-hover:bg-black/30">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/90 text-primary-foreground shadow-lg transition-transform group-hover:scale-110">
                    <Play className="h-6 w-6 fill-current ml-0.5" aria-hidden />
                  </span>
                </span>
              </TransitionLink>

              <div className="p-6 md:p-8 space-y-4">
                <p className="text-sm text-muted-foreground">
                  {formatDate(video.publishedAt)}
                </p>
                <h2 className="text-2xl font-semibold leading-tight">
                  <TransitionLink
                    href={`/videos/${video.slug}`}
                    className="hover:text-primary transition-colors"
                  >
                    {video.title}
                  </TransitionLink>
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {video.excerpt}
                </p>
                <TransitionLink
                  href={`/videos/${video.slug}`}
                  className="inline-flex text-sm font-medium text-primary hover:underline"
                >
                  Гледай видеото
                </TransitionLink>
              </div>
            </article>
          ))}
        </section>
      </div>
    </div>
  );
}
