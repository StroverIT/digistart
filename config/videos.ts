export type Video = {
  slug: string;
  title: string;
  excerpt: string;
  youtubeId: string;
  publishedAt: string;
  tags?: string[];
};

const videos: Video[] = [
  {
    slug: "kak-da-sazdam-online-magazin-v-5-stapki",
    title: "Как да създам онлайн магазин в 5 стъпки",
    excerpt:
      "Практичен видео наръчник с 5 ясни стъпки за стартиране на онлайн магазин - без сложни термини и излишна бюрокрация.",
    youtubeId: "bL4jLLDggXI",
    publishedAt: "2026-05-31",
    tags: ["Онлайн магазин", "Ръководство"],
  },
];

function byNewestDate(first: Video, second: Video) {
  return (
    new Date(second.publishedAt).getTime() - new Date(first.publishedAt).getTime()
  );
}

export function getVideos() {
  return [...videos].sort(byNewestDate);
}

export function getVideoBySlug(slug: string) {
  return videos.find((video) => video.slug === slug);
}

export function getYoutubeEmbedUrl(id: string) {
  return `https://www.youtube-nocookie.com/embed/${id}`;
}

export function getYoutubeThumbnailUrl(id: string) {
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}
