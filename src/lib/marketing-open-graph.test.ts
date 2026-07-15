import { describe, expect, it } from "vitest";
import {
  MARKETING_OG_IMAGE,
  MARKETING_OG_IMAGES,
  buildMarketingOpenGraph,
  buildMarketingTwitter,
} from "./marketing-open-graph";

describe("buildMarketingOpenGraph", () => {
  it("falls back to marketing OG image when images omitted", () => {
    const og = buildMarketingOpenGraph({
      title: "Sign in",
      description: "Access your studio",
      url: "https://veta.pro/sign-in",
    });

    expect(og.images).toEqual(MARKETING_OG_IMAGES);
    expect(og.title).toBe("Sign in");
    expect(og.url).toBe("https://veta.pro/sign-in");
  });

  it("uses provided images instead of fallback", () => {
    const custom = [{ url: "https://cdn.example/cover.jpg", width: 1200 }];
    const og = buildMarketingOpenGraph({
      title: "Post",
      description: "Excerpt",
      url: "https://veta.pro/blog/post",
      type: "article",
      images: custom,
    });

    expect(og.images).toEqual(custom);
    expect(og.type).toBe("article");
  });

  it("falls back when images is empty array", () => {
    const og = buildMarketingOpenGraph({
      title: "Post",
      description: "Excerpt",
      url: "https://veta.pro/blog/post",
      images: [],
    });

    expect(og.images).toEqual(MARKETING_OG_IMAGES);
  });
});

describe("buildMarketingTwitter", () => {
  it("falls back to marketing OG image URL when images omitted", () => {
    const twitter = buildMarketingTwitter({
      title: "Sign in",
      description: "Access your studio",
    });

    expect(twitter.card).toBe("summary_large_image");
    expect(twitter.images).toEqual([MARKETING_OG_IMAGE.url]);
  });

  it("uses provided images instead of fallback", () => {
    const twitter = buildMarketingTwitter({
      title: "Post",
      description: "Excerpt",
      images: ["https://cdn.example/cover.jpg"],
    });

    expect(twitter.images).toEqual(["https://cdn.example/cover.jpg"]);
  });
});
