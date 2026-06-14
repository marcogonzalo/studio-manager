import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { AnimatedSection } from "@/components/ui/animated-section";
import { BlogAuthorByline } from "@/components/blog/blog-author-byline";
import { BlogRelatedPosts } from "@/components/blog/blog-related-posts";
import { JsonLd, blogPostingJsonLd } from "@/components/json-ld";
import { MarketingBreadcrumbJsonLd } from "@/components/marketing/marketing-breadcrumb-json-ld";
import type { Locale } from "@/i18n/config";
import { formatDateIntl } from "@/lib/formatting";
import {
  buildMarketingOpenGraph,
  buildMarketingTwitter,
} from "@/lib/marketing-open-graph";
import {
  marketingBlogPath,
  marketingHomePath,
} from "@/lib/marketing-canonical-paths";
import {
  getBlogPostBySlug,
  getBlogStaticParams,
  getPublicBlogPostPath,
  type BlogLocale,
} from "@/lib/blog";

export async function generateStaticParams() {
  return getBlogStaticParams();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: localeParam, slug } = await params;
  const locale = localeParam as BlogLocale;
  const post = await getBlogPostBySlug(locale, slug);
  if (!post) {
    return {};
  }

  const t = await getTranslations({ locale: localeParam, namespace: "Blog" });
  const description = post.excerpt || t("postMetaDescriptionFallback");
  const canonical = getPublicBlogPostPath(locale, slug);

  const esPath =
    locale === "es"
      ? canonical
      : post.translations.es
        ? getPublicBlogPostPath("es", post.translations.es)
        : undefined;
  const enPath =
    locale === "en"
      ? canonical
      : post.translations.en
        ? getPublicBlogPostPath("en", post.translations.en)
        : undefined;

  const languages: Record<string, string> = {
    "x-default": esPath ?? enPath ?? canonical,
  };
  if (esPath) {
    languages.es = esPath;
  }
  if (enPath) {
    languages.en = enPath;
  }

  return {
    title: {
      absolute: `${post.title}${t("postMetaTitleSuffix")}`,
    },
    description,
    alternates: {
      canonical,
      languages,
    },
    openGraph: buildMarketingOpenGraph({
      title: post.title,
      description,
      url: canonical,
      type: "article",
      publishedTime: post.date,
      images: post.coverImage ? [{ url: post.coverImage }] : undefined,
    }),
    twitter: buildMarketingTwitter({
      title: post.title,
      description,
      images: post.coverImage ? [post.coverImage] : undefined,
    }),
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: localeParam, slug } = await params;
  const locale = localeParam as BlogLocale;
  setRequestLocale(localeParam);

  const post = await getBlogPostBySlug(locale, slug);
  if (!post) {
    notFound();
  }

  const t = await getTranslations("Blog");
  const tBreadcrumbs = await getTranslations("Breadcrumbs");
  const lang = locale as Locale;
  const canonical = getPublicBlogPostPath(locale, slug);

  return (
    <>
      <MarketingBreadcrumbJsonLd
        id="json-ld-breadcrumb-blog-post"
        items={[
          { name: tBreadcrumbs("home"), path: marketingHomePath(localeParam) },
          { name: tBreadcrumbs("blog"), path: marketingBlogPath(localeParam) },
          { name: post.title, path: canonical },
        ]}
      />
      <JsonLd
        id="json-ld-blog-post"
        data={blogPostingJsonLd({
          title: post.title,
          description: post.excerpt,
          path: canonical,
          datePublished: post.date,
          image: post.coverImage,
          author: post.author,
        })}
      />

      <article className="container mx-auto max-w-3xl px-4 py-12 md:py-16">
        <AnimatedSection delay={0} duration={0.45} triggerOnMount>
          <Button
            variant="ghost"
            className="text-muted-foreground mb-8 -ml-2"
            asChild
          >
            <Link href="/blog">{t("backToBlog")}</Link>
          </Button>
        </AnimatedSection>

        <header className="mb-10">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            {post.title}
          </h1>
          <p className="text-muted-foreground mt-4 text-sm font-medium">
            {formatDateIntl(post.date, lang, { dateStyle: "long" })}
          </p>
          <BlogAuthorByline author={post.author} />
          <p className="text-muted-foreground mt-4 text-lg">{post.excerpt}</p>
        </header>

        {post.coverImage ? (
          <div className="border-border/60 relative mb-12 aspect-[16/9] w-full overflow-hidden rounded-2xl border shadow-md">
            <Image
              src={post.coverImage}
              alt=""
              fill
              className="object-cover"
              sizes="(min-width: 768px) 720px, 100vw"
              priority
            />
          </div>
        ) : null}

        <div
          className="prose prose-neutral dark:prose-invert prose-headings:scroll-mt-24 prose-a:text-primary max-w-none"
          dangerouslySetInnerHTML={{ __html: post.contentHtml }}
        />

        <BlogRelatedPosts locale={locale} currentSlug={slug} />
      </article>
    </>
  );
}
