"use client";

import type { BlogPostSummary } from "@/lib/blog";
import {
  StaggerContainer,
  StaggerItem,
} from "@/components/ui/animated-section";
import { BlogPostCard } from "./blog-post-card";

export type BlogPostGridItem = BlogPostSummary & {
  /** Pre-formatted on the server to avoid Intl hydration mismatches. */
  formattedDate?: string;
};

type BlogPostGridProps = {
  posts: BlogPostGridItem[];
  readMoreLabel: string;
  columns?: "two" | "three";
  triggerOnMount?: boolean;
};

export function BlogPostGrid({
  posts,
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
              formattedDate: post.formattedDate ?? post.date,
              readMore: readMoreLabel,
            }}
          />
        </StaggerItem>
      ))}
    </StaggerContainer>
  );
}
