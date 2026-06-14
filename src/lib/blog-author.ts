export const DEFAULT_BLOG_AUTHOR = {
  name: "Marco Gonzalo Gómez Pérez",
  url: "https://www.linkedin.com/in/marcogonzalo",
} as const;

export type BlogAuthor = {
  name: string;
  url?: string;
};

export function resolveBlogAuthor(authorName?: string): BlogAuthor {
  const trimmed = authorName?.trim();
  if (!trimmed) {
    return { ...DEFAULT_BLOG_AUTHOR };
  }
  return {
    name: trimmed,
    url: DEFAULT_BLOG_AUTHOR.url,
  };
}
