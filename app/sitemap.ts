import type { MetadataRoute } from "next";
import { getBlogPosts } from "@/config/blog";
import { SITE_METADATA_BASE } from "@/lib/seo/open-graph";

const STATIC_PATHS: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}> = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/about", changeFrequency: "monthly", priority: 0.8 },
  { path: "/business-consultation", changeFrequency: "monthly", priority: 0.85 },
  { path: "/services/ads", changeFrequency: "monthly", priority: 0.85 },
  { path: "/services/google-business", changeFrequency: "monthly", priority: 0.85 },
  { path: "/services/online-store", changeFrequency: "monthly", priority: 0.85 },
  { path: "/services/social-media", changeFrequency: "monthly", priority: 0.8 },
  { path: "/blog", changeFrequency: "weekly", priority: 0.75 },
  { path: "/templates", changeFrequency: "monthly", priority: 0.6 },
  { path: "/videos", changeFrequency: "monthly", priority: 0.55 },
  { path: "/plans", changeFrequency: "monthly", priority: 0.5 },
  { path: "/marketing", changeFrequency: "monthly", priority: 0.5 },
  { path: "/privacy-policy", changeFrequency: "yearly", priority: 0.2 },
  { path: "/terms-and-conditions", changeFrequency: "yearly", priority: 0.2 },
  { path: "/cookies-policy", changeFrequency: "yearly", priority: 0.2 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE_METADATA_BASE.origin;
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map((entry) => ({
    url: `${base}${entry.path}`,
    lastModified: now,
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
  }));

  const blogEntries: MetadataRoute.Sitemap = getBlogPosts().map((post) => ({
    url: `${base}/blog/${post.slug}`,
    lastModified: new Date(post.publishedAt),
    changeFrequency: "monthly",
    priority: 0.65,
  }));

  return [...staticEntries, ...blogEntries];
}
