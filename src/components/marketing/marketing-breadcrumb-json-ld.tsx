import {
  breadcrumbListJsonLd,
  JsonLd,
  type BreadcrumbListItem,
} from "@/components/json-ld";

export function MarketingBreadcrumbJsonLd({
  id,
  items,
}: {
  id: string;
  items: BreadcrumbListItem[];
}) {
  return <JsonLd id={id} data={breadcrumbListJsonLd(items)} />;
}
