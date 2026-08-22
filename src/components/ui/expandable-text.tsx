"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type ExpandableTextProps = {
  text: string;
  className?: string;
  collapsedClassName?: string;
  expandLabel: string;
  collapseLabel: string;
};

export function ExpandableText({
  text,
  className,
  collapsedClassName = "line-clamp-2",
  expandLabel,
  collapseLabel,
}: ExpandableTextProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <button
      type="button"
      className={cn(
        "focus-visible:ring-ring block max-w-full cursor-pointer rounded-sm bg-transparent p-0 text-left break-words decoration-dotted underline-offset-2 hover:underline focus-visible:ring-2 focus-visible:outline-none",
        expanded ? "whitespace-pre-wrap" : collapsedClassName,
        className
      )}
      aria-expanded={expanded}
      title={expanded ? collapseLabel : expandLabel}
      onClick={() => setExpanded((prev) => !prev)}
    >
      {text}
    </button>
  );
}
