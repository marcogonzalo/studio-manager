import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/config";
import { getBlogPostSummaries, type BlogLocale } from "@/lib/blog";
import { BlogPostGrid } from "./blog-post-grid";

type BlogRelatedPostsProps = {
  locale: BlogLocale;
  currentSlug: string;
  limit?: number;
};

export async function BlogRelatedPosts({
  locale,
  currentSlug,
  limit = 2,
}: BlogRelatedPostsProps) {
  const posts = (await getBlogPostSummaries(locale))
    .filter((post) => post.slug !== currentSlug)
    .slice(0, limit);

  if (posts.length === 0) {
    return null;
  }

  const t = await getTranslations({ locale, namespace: "Blog" });

  return (
    <aside className="border-border/60 mt-16 border-t pt-12">
      <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
        {t("relatedTitle")}
      </h2>
      <p className="text-muted-foreground mt-3 mb-8 text-base">
        {t("relatedSubtitle")}
      </p>
      <BlogPostGrid
        posts={posts}
        locale={locale as Locale}
        readMoreLabel={t("readMore")}
        columns="two"
      />
    </aside>
  );
}
