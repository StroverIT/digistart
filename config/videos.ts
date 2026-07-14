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

export function getYoutubeEmbedUrl(id: string, options?: { autoplay?: boolean }) {
  const url = `https://www.youtube-nocookie.com/embed/${id}`;
  return options?.autoplay ? `${url}?autoplay=1` : url;
}

export function getGoogleDriveEmbedUrl(fileId: string, options?: { autoplay?: boolean }) {
  const url = `https://drive.google.com/file/d/${fileId}/preview`;
  return options?.autoplay ? `${url}?autoplay=1` : url;
}

export function getYoutubeThumbnailUrl(id: string) {
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}
