"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/routing";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { BlogPostSummary } from "@/lib/blog";

export type BlogPostCardLabels = {
  formattedDate: string;
  readMore: string;
};

type BlogPostCardProps = {
  post: BlogPostSummary;
  labels: BlogPostCardLabels;
};

export function BlogPostCard({ post, labels }: BlogPostCardProps) {
  return (
    <Link
      href={{
        pathname: "/blog/[slug]",
        params: { slug: post.slug },
      }}
      className="group focus-visible:ring-ring block h-full rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
    >
      <Card className="hover:border-primary/30 flex h-full flex-col transition-all duration-300 ease-[cubic-bezier(0.25,0.4,0.25,1)] group-hover:-translate-y-1 group-hover:shadow-lg">
        {post.coverImage ? (
          <div className="border-border/60 relative aspect-[16/10] w-full overflow-hidden rounded-t-xl border-b">
            <Image
              src={post.coverImage}
              alt=""
              fill
              className="object-cover transition-transform duration-500 ease-[cubic-bezier(0.25,0.4,0.25,1)] group-hover:scale-105"
              sizes="(min-width: 768px) 40vw, 100vw"
            />
          </div>
        ) : null}
        <CardHeader className="flex-1">
          <p className="text-muted-foreground mb-2 text-xs font-medium">
            {labels.formattedDate}
          </p>
          <CardTitle className="group-hover:text-primary text-xl transition-colors">
            {post.title}
          </CardTitle>
          <CardDescription className="text-base">
            {post.excerpt}
          </CardDescription>
        </CardHeader>
        <CardContent className="mt-auto pt-0">
          <p className="text-primary flex items-center gap-1 text-sm font-medium">
            {labels.readMore}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
