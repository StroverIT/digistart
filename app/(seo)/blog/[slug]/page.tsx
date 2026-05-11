import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBlogPostBySlug, getBlogPosts } from "@/config/blog";
import TransitionLink from "@/components/transitions/TransitionLink";

type BlogPostPageProps = {
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
  return getBlogPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    return {
      title: "Статията не е намерена",
    };
  }

  return {
    title: post.title,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) notFound();

  return (
    <article className="p-6 sm:p-8 md:p-10 space-y-8">
      <header className="space-y-4">
        <TransitionLink
          href="/blog"
          className="inline-flex text-sm font-medium text-primary hover:underline"
        >
          Назад към блога
        </TransitionLink>
        <p className="text-sm text-muted-foreground">{formatDate(post.publishedAt)}</p>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight">
          {post.title}
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
          {post.excerpt}
        </p>
      </header>

      <div className="space-y-6">
        {post.content.map((section) => (
          <section
            key={section.heading}
            className="space-y-4 rounded-2xl border border-border bg-background p-5 sm:p-6"
          >
            <h2 className="text-2xl font-semibold tracking-tight">
              {section.heading}
            </h2>
            <div className="space-y-4">
              {section.paragraphs.map((paragraph, paragraphIndex) => (
                <p
                  key={`${section.heading}-${paragraphIndex}`}
                  className="text-base sm:text-lg text-muted-foreground leading-relaxed"
                >
                  {paragraph}
                </p>
              ))}
            </div>

            {section.images?.length ? (
              <div className="space-y-4">
                {section.images.map((image) => (
                  <figure
                    key={`${section.heading}-${image.src}`}
                    className="overflow-hidden rounded-xl border border-border bg-background"
                  >
                    <Image
                      src={image.src}
                      alt={image.alt}
                      width={image.width}
                      height={image.height}
                      className="h-auto w-full object-cover"
                    />
                  </figure>
                ))}
              </div>
            ) : null}
          </section>
        ))}
      </div>
    </article>
  );
}
