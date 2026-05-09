import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";
import { z } from "zod";

export type BlogLocale = "en" | "es";

const blogLocales: BlogLocale[] = ["en", "es"];

const frontmatterSchema = z.object({
  title: z.coerce.string().min(1),
  date: z.union([z.string().min(1), z.date()]),
  excerpt: z.coerce.string().min(1),
  slug: z.coerce.string().min(1).optional(),
  coverImage: z.coerce.string().optional(),
  entryId: z.coerce.string().min(1).optional(),
});

function normalizeFrontmatterDate(value: string | Date): string {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  return value;
}

export type BlogPostSummary = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  coverImage?: string;
  entryId?: string;
};

export type BlogPostSource = BlogPostSummary & {
  bodyMarkdown: string;
  translations: Partial<Record<BlogLocale, string>>;
};

const defaultBlogContentRoot = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "content",
  "blog"
);

export function getDefaultBlogContentRoot(): string {
  return defaultBlogContentRoot;
}

/** Localized public path (no domain), aligned with `localePrefix: "as-needed"`. */
export function getPublicBlogPostPath(
  locale: BlogLocale,
  slug: string
): string {
  const prefix = locale === "es" ? "" : "/en";
  return `${prefix}/blog/${slug}`;
}

export function getPublicBlogIndexPath(locale: BlogLocale): string {
  return locale === "es" ? "/blog" : "/en/blog";
}

type BlogIOptions = {
  blogRoot?: string;
};

function slugFromFilename(filePath: string): string {
  return path.basename(filePath, path.extname(filePath));
}

type ParsedPost = {
  locale: BlogLocale;
  filePath: string;
  slug: string;
  title: string;
  date: string;
  dateMs: number;
  excerpt: string;
  coverImage?: string;
  entryId?: string;
  bodyMarkdown: string;
};

async function parsePostFile(
  locale: BlogLocale,
  filePath: string
): Promise<ParsedPost | null> {
  const raw = await readFile(filePath, "utf8");
  const { data, content } = matter(raw);
  const parsed = frontmatterSchema.safeParse(data);
  if (!parsed.success) {
    return null;
  }
  const slug = parsed.data.slug?.trim() || slugFromFilename(filePath);
  const dateNormalized = normalizeFrontmatterDate(parsed.data.date);
  const dateMs = Date.parse(dateNormalized);
  if (Number.isNaN(dateMs)) {
    return null;
  }
  return {
    locale,
    filePath,
    slug,
    title: parsed.data.title,
    date: dateNormalized,
    dateMs,
    excerpt: parsed.data.excerpt,
    coverImage: parsed.data.coverImage,
    entryId: parsed.data.entryId,
    bodyMarkdown: content.trim(),
  };
}

async function listMarkdownFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  return entries
    .filter((e) => e.isFile() && e.name.endsWith(".md"))
    .map((e) => path.join(dir, e.name));
}

async function loadAllParsedPosts(blogRoot: string): Promise<ParsedPost[]> {
  const posts: ParsedPost[] = [];
  for (const locale of blogLocales) {
    const dir = path.join(blogRoot, locale);
    let files: string[];
    try {
      files = await listMarkdownFiles(dir);
    } catch {
      continue;
    }
    for (const filePath of files) {
      const parsed = await parsePostFile(locale, filePath);
      if (parsed) posts.push(parsed);
    }
  }
  return posts;
}

function buildTranslationMap(
  posts: ParsedPost[]
): Map<string, Partial<Record<BlogLocale, string>>> {
  const byEntry = new Map<string, Partial<Record<BlogLocale, string>>>();
  for (const post of posts) {
    if (!post.entryId) continue;
    const current = byEntry.get(post.entryId) ?? {};
    current[post.locale] = post.slug;
    byEntry.set(post.entryId, current);
  }
  return byEntry;
}

export async function getBlogPostSummaries(
  locale: BlogLocale,
  options: BlogIOptions = {}
): Promise<BlogPostSummary[]> {
  const blogRoot = options.blogRoot ?? getDefaultBlogContentRoot();
  const posts = await loadAllParsedPosts(blogRoot);
  const filtered = posts.filter((p) => p.locale === locale);
  filtered.sort((a, b) => b.dateMs - a.dateMs);
  return filtered.map((p) => ({
    slug: p.slug,
    title: p.title,
    date: p.date,
    excerpt: p.excerpt,
    coverImage: p.coverImage,
    entryId: p.entryId,
  }));
}

export async function getBlogPostSourceBySlug(
  locale: BlogLocale,
  slug: string,
  options: BlogIOptions = {}
): Promise<BlogPostSource | null> {
  const blogRoot = options.blogRoot ?? getDefaultBlogContentRoot();
  const posts = await loadAllParsedPosts(blogRoot);
  const match = posts.find((p) => p.locale === locale && p.slug === slug);
  if (!match) return null;

  const translations = buildTranslationMap(posts);
  const map = match.entryId ? translations.get(match.entryId) : undefined;
  const translationsForPost: Partial<Record<BlogLocale, string>> = {};
  if (map) {
    for (const loc of blogLocales) {
      if (loc === locale) continue;
      const other = map[loc];
      if (other) translationsForPost[loc] = other;
    }
  }

  return {
    slug: match.slug,
    title: match.title,
    date: match.date,
    excerpt: match.excerpt,
    coverImage: match.coverImage,
    entryId: match.entryId,
    bodyMarkdown: match.bodyMarkdown,
    translations: translationsForPost,
  };
}

export async function getBlogStaticParams(
  options: BlogIOptions = {}
): Promise<{ locale: BlogLocale; slug: string }[]> {
  const blogRoot = options.blogRoot ?? getDefaultBlogContentRoot();
  const posts = await loadAllParsedPosts(blogRoot);
  return posts.map((p) => ({ locale: p.locale, slug: p.slug }));
}

/** Paths like `/blog` (es) and `/en/blog` (en) for sitemap. */
export async function getBlogSitemapPaths(
  options: BlogIOptions = {}
): Promise<{ path: string; lastModified: Date }[]> {
  const blogRoot = options.blogRoot ?? getDefaultBlogContentRoot();
  const posts = await loadAllParsedPosts(blogRoot);
  const paths: { path: string; lastModified: Date }[] = [
    { path: "/blog", lastModified: new Date() },
    { path: "/en/blog", lastModified: new Date() },
  ];
  for (const post of posts) {
    const prefix = post.locale === "es" ? "" : "/en";
    paths.push({
      path: `${prefix}/blog/${post.slug}`,
      lastModified: new Date(post.dateMs),
    });
  }
  return paths;
}
