import type { Metadata } from "next";
import Link from "next/link";
import { getBlogPosts } from "@/config/blog";
import TransitionLink from "@/components/transitions/TransitionLink";

export const metadata: Metadata = {
  title: "Блог",
  description:
    "Практически съвети за собственици на физически магазини, които искат да растат онлайн.",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("bg-BG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export default function BlogPage() {
  const posts = getBlogPosts();

  return (
    <div className="pt-24 pb-16 md:pt-28 md:pb-24">
      <div className="container mx-auto px-4 space-y-10">
        <section className="max-w-4xl space-y-4">
          <p className="text-sm font-medium tracking-wide uppercase text-primary">
            DigiStart Blog
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            Идеи за растеж на физическия ти магазин
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-3xl">
            Реални стратегии, които ти помагат да продаваш повече - без хаос,
            без сложни термини и без излишни разходи.
          </p>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {posts.map((post) => (
            <article
              key={post.slug}
              className="rounded-2xl border border-border bg-card p-6 md:p-8 space-y-4"
            >
              <p className="text-sm text-muted-foreground">
                {formatDate(post.publishedAt)}
              </p>
              <h2 className="text-2xl font-semibold leading-tight">
                <TransitionLink
                  href={`/blog/${post.slug}`}
                  className="hover:text-primary transition-colors"
                >
                  {post.title}
                </TransitionLink>
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {post.excerpt}
              </p>
              <TransitionLink
                href={`/blog/${post.slug}`}
                className="inline-flex text-sm font-medium text-primary hover:underline"
              >
                Прочети статията
              </TransitionLink>
            </article>
          ))}
        </section>
      </div>
    </div>
  );
}
