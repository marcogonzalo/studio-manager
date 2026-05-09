import { markdownToHtml } from "@/lib/blog-markdown";
import {
  type BlogLocale,
  type BlogPostSource,
  type BlogPostSummary,
  getBlogPostSourceBySlug,
  getBlogPostSummaries,
  getBlogSitemapPaths,
  getBlogStaticParams,
  getDefaultBlogContentRoot,
  getPublicBlogIndexPath,
  getPublicBlogPostPath,
} from "@/lib/blog-data";

export type { BlogLocale, BlogPostSummary };

export type BlogPost = Omit<BlogPostSource, "bodyMarkdown"> & {
  contentHtml: string;
};

export {
  getBlogPostSummaries,
  getBlogSitemapPaths,
  getBlogStaticParams,
  getDefaultBlogContentRoot,
  getPublicBlogIndexPath,
  getPublicBlogPostPath,
};

export async function getBlogPostBySlug(
  locale: BlogLocale,
  slug: string,
  options?: { blogRoot?: string }
): Promise<BlogPost | null> {
  const source = await getBlogPostSourceBySlug(locale, slug, options);
  if (!source) return null;

  const contentHtml = await markdownToHtml(source.bodyMarkdown);
  return {
    slug: source.slug,
    title: source.title,
    date: source.date,
    excerpt: source.excerpt,
    coverImage: source.coverImage,
    entryId: source.entryId,
    translations: source.translations,
    contentHtml,
  };
}
