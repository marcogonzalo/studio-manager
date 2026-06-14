import { describe, expect, it } from "vitest";
import { DEFAULT_BLOG_AUTHOR, resolveBlogAuthor } from "@/lib/blog-author";

describe("resolveBlogAuthor", () => {
  it("returns default author when frontmatter is missing", () => {
    expect(resolveBlogAuthor()).toEqual(DEFAULT_BLOG_AUTHOR);
    expect(resolveBlogAuthor("   ")).toEqual(DEFAULT_BLOG_AUTHOR);
  });

  it("uses custom name with default profile URL", () => {
    expect(resolveBlogAuthor("Guest Author")).toEqual({
      name: "Guest Author",
      url: DEFAULT_BLOG_AUTHOR.url,
    });
  });
});
