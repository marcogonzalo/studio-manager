"use client";

import { useState, Fragment } from "react";
import Image from "next/image";
import { ChevronDown, Image as ImageIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ItemPriceOrTbd } from "@/components/price-tbd-pill";
import { formatCurrencyWithLang } from "@/lib/formatting";
import {
  budgetLineEstimatedAmount,
  hasBudgetLinesWithTbd,
  hasPricedItemsWithTbd,
  itemSaleAmount,
  sumBudgetLineEstimatedAmounts,
  sumItemSaleAmounts,
} from "@/lib/project-item-price";
import {
  computeTaxGroups,
  effectiveLineTaxRate,
  formatTaxRatePercent,
  sumTaxAmounts,
} from "@/lib/tax-totals";
import { splitBudgetNotesLines } from "@/lib/budget-notes";
import {
  groupBudgetLinesByPhaseThenCategory,
  groupItemsBySpaceThenCreatedAt,
  orderedBudgetCategoryKeys,
  orderedBudgetPhaseKeys,
} from "@/lib/project-list-order";
import type { Locale } from "@/i18n/config";
import type { BudgetCategory, ProjectPhase } from "@/types";
import { cn } from "@/lib/utils";

export type PublicBudgetLine = {
  id: string;
  category: string;
  subcategory: string;
  description: string | null;
  estimated_amount: number;
  phase: string | null;
  is_price_tbd?: boolean;
  tax_rate?: number | null;
  created_at?: string;
};

export type PublicProduct = {
  id: string;
  name: string;
  description: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  status: string;
  image_url: string | null;
  space_name: string;
  space_created_at?: string | null;
  created_at?: string;
  is_price_tbd?: boolean;
  tax_rate?: number | null;
};

export function ViewProjectCostsClient({
  budgetLines,
  products,
  currency,
  taxRate,
  multitax = false,
  budgetNotes = null,
  locale,
  categoryLabels,
  subcategoryLabels,
}: {
  budgetLines: PublicBudgetLine[];
  products: PublicProduct[];
  currency: string;
  taxRate: number;
  multitax?: boolean;
  budgetNotes?: string | null;
  locale: Locale;
  categoryLabels: Record<BudgetCategory, string>;
  subcategoryLabels: Record<BudgetCategory, Record<string, string>>;
}) {
  const t = useTranslations("ViewProject");
  const tPhase = useTranslations("Phases");
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    products: true,
  });

  const formatCurrency = (amount: number) =>
    formatCurrencyWithLang(amount, currency, locale);
  const tbdLabel = t("priceTbd");

  const productsBySpace = groupItemsBySpaceThenCreatedAt(
    products,
    t("spaceGeneral")
  );
  const productRows = productsBySpace.flatMap((group) => group.items);
  const budgetByPhaseAndCategory =
    groupBudgetLinesByPhaseThenCategory(budgetLines);

  const budgetSubtotal = sumBudgetLineEstimatedAmounts(budgetLines);
  const productsSubtotal = sumItemSaleAmounts(productRows);
  const hasPriceTbd =
    hasPricedItemsWithTbd(productRows) || hasBudgetLinesWithTbd(budgetLines);
  const subtotal = budgetSubtotal + productsSubtotal;
  const taxGroups = computeTaxGroups(
    [
      ...productRows.map((item) => ({
        amount: itemSaleAmount(item),
        tax_rate: item.tax_rate,
      })),
      ...budgetLines.map((line) => ({
        amount: budgetLineEstimatedAmount(line),
        tax_rate: line.tax_rate,
      })),
    ],
    { multitax, tax_rate: taxRate }
  );
  const tax = sumTaxAmounts(taxGroups);
  const total = subtotal + tax;
  const taxProjectCtx = { multitax, tax_rate: taxRate };
  const hasContent = budgetLines.length > 0 || productRows.length > 0;

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const phaseLabel = (phase: string) =>
    phase === "no_phase" ? t("costsNoPhase") : tPhase(phase as ProjectPhase);

  if (!hasContent) {
    return (
      <Card>
        <CardContent className="text-muted-foreground py-12 text-center">
          {t("costsNoLines")}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {productRows.length > 0 && (
        <Collapsible
          open={openSections.products !== false}
          onOpenChange={() => toggleSection("products")}
        >
          <Card className="border-l-primary border-l-4">
            <CollapsibleTrigger asChild>
              <CardHeader className="hover:bg-accent/30 cursor-pointer">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform",
                        openSections.products === false && "-rotate-90"
                      )}
                    />
                    {t("costsProductsSection")}
                  </CardTitle>
                  <span className="text-foreground font-semibold">
                    {formatCurrency(productsSubtotal)}
                    {hasPricedItemsWithTbd(productRows) ? "*" : ""}
                  </span>
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-3 pt-0">
                {productsBySpace.map(
                  ({ spaceKey, spaceName, items: spaceItems }) => {
                    const spaceSectionKey = `products_${spaceKey}`;
                    const spaceTotal = sumItemSaleAmounts(spaceItems);
                    const spaceHasTbd = hasPricedItemsWithTbd(spaceItems);
                    return (
                      <Collapsible
                        key={spaceKey}
                        open={openSections[spaceSectionKey] !== false}
                        onOpenChange={() => toggleSection(spaceSectionKey)}
                      >
                        <Card>
                          <CollapsibleTrigger asChild>
                            <CardHeader className="hover:bg-accent/30 cursor-pointer py-3">
                              <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2 text-sm">
                                  <ChevronDown
                                    className={cn(
                                      "h-3 w-3 transition-transform",
                                      openSections[spaceSectionKey] === false &&
                                        "-rotate-90"
                                    )}
                                  />
                                  {spaceName}
                                </CardTitle>
                                <span className="text-foreground text-sm font-semibold">
                                  {formatCurrency(spaceTotal)}
                                  {spaceHasTbd ? "*" : ""}
                                </span>
                              </div>
                            </CardHeader>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <CardContent className="pt-0">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>
                                      {t("costsColProduct")}
                                    </TableHead>
                                    <TableHead className="text-right">
                                      {t("costsColQuantity")}
                                    </TableHead>
                                    <TableHead className="text-right">
                                      {t("costsColTax")}
                                    </TableHead>
                                    <TableHead className="text-right">
                                      {t("costsColAmount")}
                                    </TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {spaceItems.map((p) => (
                                    <TableRow key={p.id}>
                                      <TableCell className="align-middle">
                                        <div className="flex items-center gap-3">
                                          {p.image_url ? (
                                            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded">
                                              <Image
                                                src={p.image_url}
                                                alt={p.name}
                                                fill
                                                className="object-cover"
                                                sizes="40px"
                                              />
                                            </div>
                                          ) : (
                                            <div className="bg-muted flex h-10 w-10 shrink-0 items-center justify-center rounded">
                                              <ImageIcon
                                                className="text-muted-foreground h-5 w-5"
                                                aria-hidden
                                              />
                                            </div>
                                          )}
                                          <div className="min-w-0">
                                            <div className="font-medium">
                                              {p.name}
                                            </div>
                                            {p.description ? (
                                              <div className="text-muted-foreground line-clamp-2 text-xs">
                                                {p.description}
                                              </div>
                                            ) : null}
                                          </div>
                                        </div>
                                      </TableCell>
                                      <TableCell className="text-right align-middle tabular-nums">
                                        {p.quantity}
                                      </TableCell>
                                      <TableCell className="text-muted-foreground text-right align-middle tabular-nums">
                                        {formatTaxRatePercent(
                                          effectiveLineTaxRate(p, taxProjectCtx)
                                        )}
                                      </TableCell>
                                      <TableCell className="text-right align-middle font-medium tabular-nums">
                                        <ItemPriceOrTbd
                                          item={p}
                                          tbdLabel={tbdLabel}
                                        >
                                          {formatCurrency(
                                            Number(p.unit_price ?? 0) *
                                              Number(p.quantity ?? 0)
                                          )}
                                        </ItemPriceOrTbd>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </CardContent>
                          </CollapsibleContent>
                        </Card>
                      </Collapsible>
                    );
                  }
                )}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}

      {orderedBudgetPhaseKeys(budgetByPhaseAndCategory).map((phase) => {
        const phaseData = budgetByPhaseAndCategory[phase];
        if (!phaseData) return null;
        const phaseLines = Object.values(phaseData).flat();
        if (!phaseLines.length) return null;
        const phaseTotal = sumBudgetLineEstimatedAmounts(phaseLines);
        const phaseSectionKey = `phase_${phase}`;
        return (
          <Collapsible
            key={phase}
            open={openSections[phaseSectionKey] !== false}
            onOpenChange={() => toggleSection(phaseSectionKey)}
          >
            <Card className="border-l-primary border-l-4">
              <CollapsibleTrigger asChild>
                <CardHeader className="hover:bg-accent/30 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 transition-transform",
                          openSections[phaseSectionKey] === false &&
                            "-rotate-90"
                        )}
                      />
                      {phaseLabel(phase)}
                    </CardTitle>
                    <span className="text-foreground font-semibold">
                      {formatCurrency(phaseTotal)}
                    </span>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-3 pt-0">
                  {orderedBudgetCategoryKeys(phaseData).map((category) => {
                    const lines = phaseData[category];
                    if (!lines?.length) return null;
                    const categoryTotal = sumBudgetLineEstimatedAmounts(lines);
                    const categoryKey = category as BudgetCategory;
                    const categorySectionKey = `${phaseSectionKey}_${category}`;
                    return (
                      <Collapsible
                        key={category}
                        open={openSections[categorySectionKey] !== false}
                        onOpenChange={() => toggleSection(categorySectionKey)}
                      >
                        <Card>
                          <CollapsibleTrigger asChild>
                            <CardHeader className="hover:bg-accent/30 cursor-pointer py-3">
                              <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2 text-sm">
                                  <ChevronDown
                                    className={cn(
                                      "h-3 w-3 transition-transform",
                                      openSections[categorySectionKey] ===
                                        false && "-rotate-90"
                                    )}
                                  />
                                  {categoryLabels[categoryKey] ?? category}
                                </CardTitle>
                                <span className="text-foreground text-sm font-semibold">
                                  {formatCurrency(categoryTotal)}
                                </span>
                              </div>
                            </CardHeader>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <CardContent className="pt-0">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead className="text-muted-foreground">
                                      {t("costsColDescription")}
                                    </TableHead>
                                    <TableHead>{t("costsColLine")}</TableHead>
                                    <TableHead className="text-right">
                                      {t("costsColTax")}
                                    </TableHead>
                                    <TableHead className="text-right">
                                      {t("costsColAmount")}
                                    </TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {lines.map((line) => (
                                    <TableRow key={line.id}>
                                      <TableCell className="text-muted-foreground max-w-[200px] truncate">
                                        {line.description || "—"}
                                      </TableCell>
                                      <TableCell>
                                        {subcategoryLabels[categoryKey]?.[
                                          line.subcategory
                                        ] ?? line.subcategory}
                                      </TableCell>
                                      <TableCell className="text-muted-foreground text-right tabular-nums">
                                        {formatTaxRatePercent(
                                          effectiveLineTaxRate(
                                            line,
                                            taxProjectCtx
                                          )
                                        )}
                                      </TableCell>
                                      <TableCell className="text-right font-medium tabular-nums">
                                        <ItemPriceOrTbd
                                          item={line}
                                          tbdLabel={tbdLabel}
                                        >
                                          {formatCurrency(
                                            Number(line.estimated_amount)
                                          )}
                                        </ItemPriceOrTbd>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </CardContent>
                          </CollapsibleContent>
                        </Card>
                      </Collapsible>
                    );
                  })}
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        );
      })}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("costsSummary")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {budgetLines.length > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {t("costsSubtotalLines")}
              </span>
              <span className="tabular-nums">
                {formatCurrency(budgetSubtotal)}
              </span>
            </div>
          )}
          {productRows.length > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {t("costsSubtotalProducts")}
              </span>
              <span className="tabular-nums">
                {formatCurrency(productsSubtotal)}
              </span>
            </div>
          )}
          <div className="flex justify-between border-t pt-1 text-sm">
            <span className="text-muted-foreground">{t("costsSubtotal")}</span>
            <span className="tabular-nums">{formatCurrency(subtotal)}</span>
          </div>
          {taxGroups.map((group) => (
            <div key={group.rate} className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {t("costsTax", { rate: group.rate })}
              </span>
              <span className="tabular-nums">
                {formatCurrency(group.taxAmount)}
              </span>
            </div>
          ))}
          <div className="flex justify-between border-t pt-2 font-semibold">
            <span>{t("costsTotal")}</span>
            <span className="tabular-nums">{formatCurrency(total)}</span>
          </div>
          {hasPriceTbd && (
            <p className="text-muted-foreground pt-2 text-xs">
              {t("priceTbdNote")}
            </p>
          )}
        </CardContent>
      </Card>

      {budgetNotes ? (
        <p className="text-muted-foreground px-4 text-[9px] leading-relaxed">
          {splitBudgetNotesLines(budgetNotes).map((line, index, lines) => (
            <Fragment key={index}>
              {line}
              {index < lines.length - 1 ? <br /> : null}
            </Fragment>
          ))}
        </p>
      ) : null}
    </div>
  );
}
