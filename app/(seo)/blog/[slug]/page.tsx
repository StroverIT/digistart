import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getBlogPostBySlug, getBlogPosts } from "@/config/blog";
import { ThreeFreeTipsCtaSection } from "@/components/google/three-free-tips-cta-section";
import TransitionLink from "@/components/transitions/TransitionLink";
import { fitMetaDescription } from "@/lib/seo/metadata";

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
    description: fitMetaDescription(post.excerpt),
    alternates: {
      canonical: `/blog/${post.slug}`,
      languages: {
        "bg-BG": `/blog/${post.slug}`,
        "x-default": `/blog/${post.slug}`,
      },
    },
    openGraph: {
      title: post.title,
      description: fitMetaDescription(post.excerpt),
      type: "article",
      publishedTime: post.publishedAt,
      images: [
        {
          url: post.coverImage.src,
          width: post.coverImage.width,
          height: post.coverImage.height,
          alt: post.coverImage.alt || post.title,
        },
      ],
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) notFound();

  return (
    <article className="space-y-10">
      <header className="space-y-5">
        <TransitionLink
          href="/blog"
          className="inline-flex text-sm font-medium text-accent hover:underline"
        >
          Назад към блога
        </TransitionLink>
        <p className="text-sm text-muted-foreground">
          {formatDate(post.publishedAt)}
        </p>
        <h1 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight leading-tight">
          {post.title}
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
          {post.excerpt}
        </p>
        <div className="relative aspect-669/483 overflow-hidden rounded-2xl bg-muted">
          <Image
            src={post.coverImage.src}
            alt={post.coverImage.alt || post.title}
            width={post.coverImage.width}
            height={post.coverImage.height}
            className="h-full w-full object-cover"
            sizes="(max-width: 896px) 100vw, 896px"
            priority
          />
        </div>
      </header>

      <div className="mx-auto max-w-2xl space-y-8">
        {post.content.map((section, sectionIndex) => (
          <section
            key={section.heading ?? `section-${sectionIndex}`}
            className="space-y-5"
          >
            {section.heading ? (
              <h2 className="font-heading text-2xl font-semibold tracking-tight text-black">
                {section.heading}
              </h2>
            ) : null}
            <div className="space-y-5">
              {section.paragraphs.map((paragraph, paragraphIndex) => (
                <p
                  key={`${section.heading ?? sectionIndex}-${paragraphIndex}`}
                  className="text-lg sm:text-xl text-black leading-[1.8]"
                >
                  {paragraph}
                </p>
              ))}
            </div>

            {section.images?.length ? (
              <div className="space-y-4">
                {section.images.map((image) => (
                  <figure
                    key={`${section.heading ?? sectionIndex}-${image.src}`}
                    className="overflow-hidden rounded-xl border border-border bg-background"
                  >
                    <Image
                      src={image.src}
                      alt={image.alt}
                      width={image.width}
                      height={image.height}
                      className="h-auto w-full object-cover"
                      sizes="(max-width: 896px) 100vw, 672px"
                    />
                  </figure>
                ))}
              </div>
            ) : null}
          </section>
        ))}
      </div>

      <ThreeFreeTipsCtaSection variant="tips" />
    </article>
  );
}
