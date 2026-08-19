import type { ReactNode } from "react";
import { isItemPriceTbd } from "@/lib/project-item-price";

export function PriceTbdPill({ label }: { label: string }) {
  return (
    <span className="bg-muted text-muted-foreground inline-flex shrink-0 rounded-full px-2 py-1 text-xs font-medium whitespace-nowrap">
      {label}
    </span>
  );
}

export function ItemPriceOrTbd({
  item,
  tbdLabel,
  children,
}: {
  item: { is_price_tbd?: boolean | null };
  tbdLabel: string;
  children: ReactNode;
}) {
  if (isItemPriceTbd(item)) {
    return <PriceTbdPill label={tbdLabel} />;
  }
  return children;
}
