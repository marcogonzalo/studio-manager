"use client";

import type { Locale } from "@/i18n/config";
import { formatDateIntl } from "@/lib/formatting";
import type { BlogPostSummary } from "@/lib/blog";
import {
  StaggerContainer,
  StaggerItem,
} from "@/components/ui/animated-section";
import { BlogPostCard } from "./blog-post-card";

type BlogPostGridProps = {
  posts: BlogPostSummary[];
  locale: Locale;
  readMoreLabel: string;
  columns?: "two" | "three";
  triggerOnMount?: boolean;
};

export function BlogPostGrid({
  posts,
  locale,
  readMoreLabel,
  columns = "two",
  triggerOnMount = false,
}: BlogPostGridProps) {
  const gridClassName =
    columns === "three"
      ? "grid gap-8 md:grid-cols-2 lg:grid-cols-3 md:items-stretch"
      : "grid gap-8 md:grid-cols-2 md:items-stretch";

  return (
    <StaggerContainer
      className={gridClassName}
      staggerDelay={0.1}
      triggerOnMount={triggerOnMount}
    >
      {posts.map((post) => (
        <StaggerItem key={post.slug} className="h-full">
          <BlogPostCard
            post={post}
            labels={{
              formattedDate: formatDateIntl(post.date, locale, {
                dateStyle: "medium",
              }),
              readMore: readMoreLabel,
            }}
          />
        </StaggerItem>
      ))}
    </StaggerContainer>
  );
}
