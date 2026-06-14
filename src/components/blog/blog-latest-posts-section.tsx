import { ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { AnimatedSection } from "@/components/ui/animated-section";
import type { Locale } from "@/i18n/config";
import { getBlogPostSummaries, type BlogLocale } from "@/lib/blog";
import { BlogPostGrid } from "./blog-post-grid";

type BlogLatestPostsSectionProps = {
  locale: BlogLocale;
  limit?: number;
};

export async function BlogLatestPostsSection({
  locale,
  limit = 3,
}: BlogLatestPostsSectionProps) {
  const posts = (await getBlogPostSummaries(locale)).slice(0, limit);
  if (posts.length === 0) {
    return null;
  }

  const t = await getTranslations({ locale, namespace: "Blog" });

  return (
    <section className="bg-muted/30 py-20">
      <div className="container mx-auto max-w-7xl px-4">
        <AnimatedSection
          className="mx-auto mb-12 max-w-2xl text-center"
          triggerOnMount={false}
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {t("homeLatestTitle")}{" "}
            <strong className="text-primary">
              {t("homeLatestTitleHighlight")}
            </strong>
          </h2>
          <p className="text-muted-foreground mt-4 text-lg">
            {t("homeLatestSubtitle")}
          </p>
        </AnimatedSection>

        <BlogPostGrid
          posts={posts}
          locale={locale as Locale}
          readMoreLabel={t("readMore")}
          columns="three"
        />

        <div className="mt-10 text-center">
          <Link
            href="/blog"
            className="text-primary inline-flex items-center gap-1 text-sm font-medium underline-offset-4 hover:underline"
          >
            {t("viewAllPosts")}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
