import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AnimatedSection } from "@/components/ui/animated-section";
import { BlogPostGrid } from "@/components/blog/blog-post-grid";
import { formatDateIntl } from "@/lib/formatting";
import {
  buildMarketingOpenGraph,
  buildMarketingTwitter,
} from "@/lib/marketing-open-graph";
import { MarketingBreadcrumbJsonLd } from "@/components/marketing/marketing-breadcrumb-json-ld";
import {
  marketingBlogPath,
  marketingHomePath,
} from "@/lib/marketing-canonical-paths";
import { getBlogPostSummaries, type BlogLocale } from "@/lib/blog";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1600&q=80";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Blog" });
  const canonical = locale === "es" ? "/blog" : "/en/blog";

  return {
    title: {
      absolute: t("metaTitle"),
    },
    description: t("metaDescription"),
    alternates: {
      canonical,
      languages: {
        es: "/blog",
        en: "/en/blog",
        "x-default": "/blog",
      },
    },
    openGraph: buildMarketingOpenGraph({
      title: t("ogTitle"),
      description: t("ogDescription"),
      url: canonical,
    }),
    twitter: buildMarketingTwitter({
      title: t("twitterTitle"),
      description: t("twitterDescription"),
    }),
  };
}

export default async function BlogIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const locale = localeParam as BlogLocale;
  setRequestLocale(localeParam);

  const t = await getTranslations("Blog");
  const tBreadcrumbs = await getTranslations("Breadcrumbs");
  const posts = await getBlogPostSummaries(locale);

  return (
    <>
      <MarketingBreadcrumbJsonLd
        id="json-ld-breadcrumb-blog"
        items={[
          { name: tBreadcrumbs("home"), path: marketingHomePath(localeParam) },
          { name: tBreadcrumbs("blog"), path: marketingBlogPath(localeParam) },
        ]}
      />
      <section className="border-border/60 relative overflow-hidden border-b">
        <div className="from-primary/5 absolute inset-0 bg-gradient-to-br via-transparent to-transparent" />
        <div className="bg-primary/5 absolute top-1/2 left-1/2 h-[640px] w-[640px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl" />
        <div className="noise-overlay" aria-hidden />

        <div className="relative container mx-auto max-w-7xl px-4 py-16 md:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <AnimatedSection delay={0} duration={0.5} triggerOnMount>
                <p className="text-primary mb-4 text-sm font-semibold tracking-wide uppercase">
                  {t("kicker")}
                </p>
              </AnimatedSection>
              <AnimatedSection delay={0.08} duration={0.55} triggerOnMount>
                <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
                  {t("heroTitle")}{" "}
                  <strong className="text-primary">
                    {t("heroTitleHighlight")}
                  </strong>
                </h1>
              </AnimatedSection>
              <AnimatedSection delay={0.16} duration={0.55} triggerOnMount>
                <p className="text-muted-foreground mt-6 max-w-prose text-lg md:text-xl">
                  {t("intro")}
                </p>
              </AnimatedSection>
            </div>

            <AnimatedSection
              direction="right"
              delay={0.2}
              duration={0.6}
              triggerOnMount
              className="border-border/60 relative aspect-[4/3] w-full overflow-hidden rounded-2xl border shadow-lg"
            >
              <Image
                src={HERO_IMAGE}
                alt={t("coverAlt")}
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 42vw, 100vw"
                priority
              />
            </AnimatedSection>
          </div>
        </div>
      </section>

      <section className="container mx-auto max-w-7xl px-4 py-16 md:py-20">
        <h2 className="mb-10 text-2xl font-bold tracking-tight md:text-3xl">
          {t("latest")}
        </h2>

        {posts.length === 0 ? (
          <p className="text-muted-foreground">{t("empty")}</p>
        ) : (
          <BlogPostGrid
            posts={posts.map((post) => ({
              ...post,
              formattedDate: formatDateIntl(post.date, locale, {
                dateStyle: "medium",
              }),
            }))}
            readMoreLabel={t("readMore")}
            triggerOnMount
          />
        )}
      </section>
    </>
  );
}
