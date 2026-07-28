import type { Metadata } from "next";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { getBlogPosts } from "@/config/blog";
import { ThreeFreeTipsCtaSection } from "@/components/google/three-free-tips-cta-section";
import TransitionLink from "@/components/transitions/TransitionLink";

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
          <p className="text-sm font-medium tracking-wide uppercase text-primary">
            Блог
          </p>
          <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            Блогът за повече клиенти.
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed">
            Прости маркетингови тактики, които работят за локални бизнеси. Без
            вода и теории - само неща, които можеш да ползваш още тази седмица,
            за да вкарат повече хора през вратата.
          </p>
        </section>

        <section className="grid grid-cols-1 gap-8 sm:gap-10 lg:grid-cols-2 lg:gap-x-8 lg:gap-y-12">
          {posts.map((post) => (
            <TransitionLink
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group flex flex-col gap-4 outline-none"
            >
              <div className="relative aspect-669/483 overflow-hidden rounded-2xl bg-muted">
                <Image
                  src={post.coverImage.src}
                  alt={post.coverImage.alt || post.title}
                  width={post.coverImage.width}
                  height={post.coverImage.height}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  sizes="(max-width: 1024px) 100vw, 669px"
                />
              </div>

              <article className="relative flex flex-1 flex-col gap-3 rounded-2xl bg-card px-5 py-6 shadow-sm ring-1 ring-border/60 transition-colors group-hover:ring-primary/30 md:px-6 md:py-7">
                <h2 className="font-heading text-xl font-bold leading-snug tracking-tight text-foreground md:text-2xl">
                  {post.title}
                </h2>
                <p className="flex-1 text-sm leading-relaxed text-muted-foreground md:text-base">
                  {post.excerpt}
                </p>
                <span className="mt-2 inline-flex size-10 items-center justify-center self-end rounded-full bg-foreground text-background transition-transform group-hover:scale-105">
                  <ArrowRight className="size-4" strokeWidth={2.4} />
                  <span className="sr-only">Прочети статията</span>
                </span>
              </article>
            </TransitionLink>
          ))}
        </section>

        <ThreeFreeTipsCtaSection variant="tips" />
      </div>
    </div>
  );
}
