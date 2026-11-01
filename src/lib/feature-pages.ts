import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";
import { markdownToHtml } from "@/lib/blog-markdown";
import {
  FEATURE_PAGES,
  FEATURE_PAGE_IDS,
  type FeatureLocale,
  type FeaturePageId,
  getFeaturePageDef,
  getFeaturePublicPath,
  isFeaturePageId,
} from "@/lib/feature-registry";

const frontmatterSchema = z.object({
  title: z.coerce.string().min(1),
  excerpt: z.coerce.string().min(1),
  coverImage: z.coerce.string().optional(),
  faq: z
    .array(
      z.object({
        question: z.coerce.string().min(1),
        answer: z.coerce.string().min(1),
      })
    )
    .optional(),
});

export type FeatureFaqEntry = { question: string; answer: string };

export type FeaturePageContent = {
  pageId: FeaturePageId;
  locale: FeatureLocale;
  title: string;
  excerpt: string;
  coverImage?: string;
  faq?: FeatureFaqEntry[];
  bodyMarkdown: string;
  contentHtml: string;
  canonicalPath: string;
};

const defaultFeaturesRoot = path.join(
  process.cwd(),
  "src",
  "content",
  "features"
);

export function getDefaultFeaturesContentRoot(): string {
  return defaultFeaturesRoot;
}

type FeaturesOptions = {
  featuresRoot?: string;
};

async function listMarkdownFiles(dir: string): Promise<string[]> {
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    return entries
      .filter((e) => e.isFile() && e.name.endsWith(".md"))
      .map((e) => path.join(dir, e.name));
  } catch {
    return [];
  }
}

export async function getFeaturePageContent(
  locale: FeatureLocale,
  pageId: FeaturePageId,
  options: FeaturesOptions = {}
): Promise<FeaturePageContent | null> {
  const def = getFeaturePageDef(pageId);
  if (!def.hasMarkdown) return null;

  const root = options.featuresRoot ?? getDefaultFeaturesContentRoot();
  const filePath = path.join(root, locale, `${pageId}.md`);
  let raw: string;
  try {
    raw = await readFile(filePath, "utf8");
  } catch {
    return null;
  }

  const { data, content } = matter(raw);
  const parsed = frontmatterSchema.safeParse(data);
  if (!parsed.success) return null;

  const bodyMarkdown = content.trim();
  const contentHtml = await markdownToHtml(bodyMarkdown);

  return {
    pageId,
    locale,
    title: parsed.data.title,
    excerpt: parsed.data.excerpt,
    coverImage: parsed.data.coverImage,
    faq: parsed.data.faq,
    bodyMarkdown,
    contentHtml,
    canonicalPath: getFeaturePublicPath(locale, pageId),
  };
}

export function getFeatureStaticParams(): {
  locale: FeatureLocale;
  pageId: FeaturePageId;
}[] {
  const locales: FeatureLocale[] = ["es", "en"];
  const params: { locale: FeatureLocale; pageId: FeaturePageId }[] = [];
  for (const locale of locales) {
    for (const pageId of FEATURE_PAGE_IDS) {
      params.push({ locale, pageId });
    }
  }
  return params;
}

/**
 * Resolve locale-switch target for a feature public path (no locale prefix).
 * Returns null if path is not a registered feature page.
 */
export function resolveFeatureLocaleSwitchPath(
  fromLocale: FeatureLocale,
  toLocale: FeatureLocale,
  pathWithoutLocalePrefix: string
): string | null {
  const normalized = pathWithoutLocalePrefix.trim().replace(/\/+$/, "") || "/";

  for (const id of FEATURE_PAGE_IDS) {
    const def = FEATURE_PAGES[id];
    if (def.pathnames[fromLocale] === normalized) {
      return getFeaturePublicPath(toLocale, id);
    }
  }
  return null;
}

export function featurePageIdFromParam(pageId: string): FeaturePageId | null {
  return isFeaturePageId(pageId) ? pageId : null;
}

/** Dev helper: ensure every hasMarkdown page has a file for both locales. */
export async function listMissingFeatureMarkdown(
  options: FeaturesOptions = {}
): Promise<{ locale: FeatureLocale; pageId: FeaturePageId }[]> {
  const root = options.featuresRoot ?? getDefaultFeaturesContentRoot();
  const missing: { locale: FeatureLocale; pageId: FeaturePageId }[] = [];
  for (const locale of ["es", "en"] as FeatureLocale[]) {
    const files = await listMarkdownFiles(path.join(root, locale));
    const basenames = new Set(
      files.map((f) => path.basename(f, path.extname(f)))
    );
    for (const pageId of FEATURE_PAGE_IDS) {
      if (!FEATURE_PAGES[pageId].hasMarkdown) continue;
      if (!basenames.has(pageId)) {
        missing.push({ locale, pageId });
      }
    }
  }
  return missing;
}
