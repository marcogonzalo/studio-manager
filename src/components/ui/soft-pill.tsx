import * as React from "react";
import { cn } from "@/lib/utils";

/** Muted pill; dark mode uses a slightly lighter fill so it reads on dark cards. */
export function SoftPill({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "bg-muted text-muted-foreground inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        "dark:text-muted-foreground dark:bg-white/10",
        className
      )}
      {...props}
    />
  );
}
