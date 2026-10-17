"use client";

import { X } from "lucide-react";
import { useLocale } from "next-intl";
import type { Locale } from "@/i18n/config";
import {
  formatUploadFailureItem,
  type UploadFailureItem,
} from "@/lib/upload-user-error";
import { cn } from "@/lib/utils";

interface UploadErrorListProps {
  items: UploadFailureItem[];
  className?: string;
}

export function UploadErrorList({ items, className }: UploadErrorListProps) {
  const locale = useLocale() as Locale;
  if (items.length === 0) return null;

  return (
    <div
      role="alert"
      className={cn(
        "bg-destructive/10 text-destructive flex items-start gap-2 rounded-md px-3 py-2 text-sm",
        className
      )}
    >
      <X className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <ul className="list-disc space-y-1 pl-4">
        {items.map((item, index) => (
          <li key={`${item.fileName ?? "err"}-${index}`}>
            {formatUploadFailureItem(item, locale)}
          </li>
        ))}
      </ul>
    </div>
  );
}
