import type { Metadata } from "next";
import { getBlogPosts } from "@/config/blog";
import { BlogPostCard } from "@/components/blog/blog-post-card";
import { ThreeFreeTipsCtaSection } from "@/components/google/three-free-tips-cta-section";

export const metadata: Metadata = {
  title: "Блог",
  description:
    "Прости маркетингови тактики за локални бизнеси и физически магазини - без теории, с неща, които можеш да приложиш тази седмица.",
};

export default function BlogPage() {
  const posts = getBlogPosts();

  return (
    <div className="pt-24 pb-16 md:pt-28 md:pb-24">
      <div className="container mx-auto px-4 space-y-12 md:space-y-16">
        <section className="max-w-3xl space-y-4">
          <p className="text-sm font-medium tracking-wide uppercase text-accent">
            Блог
          </p>
          <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            Блогът за повече клиенти.
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed">
            Прости маркетингови тактики, които работят за локални бизнеси.
            Без боза и теории - само неща, които можеш да ползваш още тази седмица,
            за да вкараш повече хора през вратата.
          </p>
        </section>

        <section className="grid grid-cols-1 gap-8 sm:gap-10 lg:grid-cols-2 lg:gap-x-8 lg:gap-y-12">
          {posts.map((post) => (
            <BlogPostCard key={post.slug} post={post} />
          ))}
        </section>

        <ThreeFreeTipsCtaSection variant="tips" />
      </div>
    </div>
  );
}
