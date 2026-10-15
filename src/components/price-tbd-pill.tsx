import type { ReactNode } from "react";
import { SoftPill } from "@/components/ui/soft-pill";
import { isItemPriceTbd } from "@/lib/project-item-price";

export function PriceTbdPill({ label }: { label: string }) {
  return (
    <SoftPill className="shrink-0 px-2 py-1 whitespace-nowrap">
      {label}
    </SoftPill>
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
