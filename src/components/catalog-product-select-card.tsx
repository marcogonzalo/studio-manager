"use client";

import Image from "next/image";
import { Image as ImageIcon, Search } from "lucide-react";

export type CatalogProductSelectCardProduct = {
  id: string;
  name: string;
  image_url?: string | null;
  supplier?: { name?: string | null } | null;
};

type CatalogProductSelectCardProps = {
  product: CatalogProductSelectCardProduct;
  selected: boolean;
  onSelect: () => void;
  onPreview: () => void;
  viewDetailsLabel: string;
  noImageLabel: string;
  noSupplierLabel: string;
};

export function CatalogProductSelectCard({
  product,
  selected,
  onSelect,
  onPreview,
  viewDetailsLabel,
  noImageLabel,
  noSupplierLabel,
}: CatalogProductSelectCardProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl border shadow-sm transition-shadow hover:shadow-md ${
        selected ? "border-primary bg-primary/10" : "border-border bg-card"
      }`}
    >
      <button
        type="button"
        onClick={onSelect}
        className="flex w-full flex-row items-center gap-3 p-3 sm:min-h-32 sm:gap-4 sm:p-4"
      >
        <div className="bg-secondary/30 dark:bg-muted relative h-16 w-16 shrink-0 overflow-hidden rounded-lg">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover"
              sizes="120px"
            />
          ) : (
            <div className="text-muted-foreground flex h-full w-full items-center justify-center">
              <ImageIcon className="h-6 w-6" aria-hidden />
              <span className="sr-only">{noImageLabel}</span>
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1 text-left">
          <div className="mb-1 line-clamp-2 text-sm font-medium">
            {product.name}
          </div>
          <div className="text-muted-foreground line-clamp-1 text-xs">
            {product.supplier?.name || noSupplierLabel}
          </div>
        </div>
      </button>
      {product.image_url ? (
        <button
          type="button"
          onClick={onPreview}
          className="absolute top-3 left-3 flex h-16 w-16 items-center justify-center rounded-lg bg-black/0 opacity-0 transition-colors hover:bg-black/10 hover:opacity-100 focus-visible:bg-black/10 focus-visible:opacity-100 sm:top-4 sm:left-4"
          title={viewDetailsLabel}
          aria-label={viewDetailsLabel}
        >
          <Search className="h-6 w-6 text-white drop-shadow-lg" />
        </button>
      ) : null}
    </div>
  );
}
