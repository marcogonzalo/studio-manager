import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { ViewProjectShell } from "../view-project-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrencyWithLang } from "@/lib/formatting";
import { getViewProjectLocale } from "@/lib/view-project-locale";
import type { BudgetCategory } from "@/types";
import type { ProjectPhase } from "@/types";

const PHASE_ORDER: (ProjectPhase | string)[] = [
  "diagnosis",
  "design",
  "executive",
  "budget",
  "construction",
  "delivery",
  "no_phase",
];

interface PageProps {
  params: Promise<{ token: string }>;
}

export async function generateMetadata() {
  const locale = await getViewProjectLocale();
  setRequestLocale(locale);
  const t = await getTranslations("ViewProject");
  return {
    title: t("costsMetaTitle"),
    description: t("costsMetaDescription"),
  };
}

export default async function ViewProjectCostsPage({ params }: PageProps) {
  const { token } = await params;
  const locale = await getViewProjectLocale();
  setRequestLocale(locale);
  const t = await getTranslations("ViewProject");
  const supabase = await createClient();
  const categoryLabels: Record<BudgetCategory, string> = {
    construction: t("budgetCategory.construction"),
    own_fees: t("budgetCategory.own_fees"),
    external_services: t("budgetCategory.external_services"),
    operations: t("budgetCategory.operations"),
  };
  const subcategoryLabels: Record<BudgetCategory, Record<string, string>> = {
    construction: {
      demolition: t("budgetSubcategory.construction.demolition"),
      masonry: t("budgetSubcategory.construction.masonry"),
      electricity: t("budgetSubcategory.construction.electricity"),
      plumbing: t("budgetSubcategory.construction.plumbing"),
      interior_painting: t("budgetSubcategory.construction.interior_painting"),
      exterior_painting: t("budgetSubcategory.construction.exterior_painting"),
      domotics: t("budgetSubcategory.construction.domotics"),
      carpentry: t("budgetSubcategory.construction.carpentry"),
      locksmithing: t("budgetSubcategory.construction.locksmithing"),
      hvac: t("budgetSubcategory.construction.hvac"),
      flooring: t("budgetSubcategory.construction.flooring"),
      tiling: t("budgetSubcategory.construction.tiling"),
      other: t("budgetSubcategory.construction.other"),
    },
    own_fees: {
      design: t("budgetSubcategory.own_fees.design"),
      executive_project: t("budgetSubcategory.own_fees.executive_project"),
      site_supervision: t("budgetSubcategory.own_fees.site_supervision"),
      management: t("budgetSubcategory.own_fees.management"),
      other: t("budgetSubcategory.own_fees.other"),
    },
    external_services: {
      technical_architect: t(
        "budgetSubcategory.external_services.technical_architect"
      ),
      engineering: t("budgetSubcategory.external_services.engineering"),
      logistics: t("budgetSubcategory.external_services.logistics"),
      permits: t("budgetSubcategory.external_services.permits"),
      consulting: t("budgetSubcategory.external_services.consulting"),
      other: t("budgetSubcategory.external_services.other"),
    },
    operations: {
      shipping: t("budgetSubcategory.operations.shipping"),
      packaging: t("budgetSubcategory.operations.packaging"),
      transport: t("budgetSubcategory.operations.transport"),
      storage: t("budgetSubcategory.operations.storage"),
      insurance: t("budgetSubcategory.operations.insurance"),
      customs: t("budgetSubcategory.operations.customs"),
      handling: t("budgetSubcategory.operations.handling"),
      other: t("budgetSubcategory.operations.other"),
    },
  };

  const [shareRes, currencyRes, budgetRes, productsRes] = await Promise.all([
    supabase.rpc("get_project_share_by_token", { share_token: token }),
    supabase.rpc("get_project_public_currency", { share_token: token }),
    supabase.rpc("get_project_public_budget", { share_token: token }),
    supabase.rpc("get_project_public_products", { share_token: token }),
  ]);

  if (shareRes.error || !shareRes.data?.length) notFound();
  const currencyRow = currencyRes.data?.[0] as
    | { currency: string | null; tax_rate: number }
    | undefined;
  const currency = currencyRow?.currency ?? "EUR";
  const taxRate = Number(currencyRow?.tax_rate ?? 0);
  const budgetLines = (budgetRes.data ?? []) as {
    id: string;
    category: string;
    subcategory: string;
    description: string | null;
    estimated_amount: number;
    phase: string | null;
  }[];
  const products = (productsRes.data ?? []) as {
    id: string;
    name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    status: string;
    space_name: string;
  }[];

  const formatCurrency = (amount: number) =>
    formatCurrencyWithLang(amount, currency, locale);

  type BudgetLine = (typeof budgetLines)[number];
  const byCategory = budgetLines.reduce(
    (acc, line) => {
      const cat = line.category as BudgetCategory;
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(line);
      return acc;
    },
    {} as Record<string, BudgetLine[]>
  );

  const categoryOrder: BudgetCategory[] = [
    "own_fees",
    "construction",
    "external_services",
    "operations",
  ];

  let budgetSubtotal = 0;
  for (const line of budgetLines) {
    budgetSubtotal += Number(line.estimated_amount);
  }
  const productsSubtotal = products.reduce(
    (sum, p) => sum + Number(p.total_price),
    0
  );
  const subtotal = budgetSubtotal + productsSubtotal;
  const tax = subtotal * (taxRate / 100);
  const total = subtotal + tax;

  return (
    <ViewProjectShell token={token} showBack title={t("costsTitle")}>
      {budgetLines.length === 0 ? (
        <Card>
          <CardContent className="text-muted-foreground py-12 text-center">
            {t("costsNoLines")}
          </CardContent>
        </Card>
      ) : (
        <>
          {categoryOrder.map((category) => {
            const lines = byCategory[category];
            if (!lines?.length) return null;
            const categoryTotal = lines.reduce(
              (sum, l) => sum + Number(l.estimated_amount),
              0
            );
            const sortedLines = [...lines].sort((a, b) => {
              const phaseA = PHASE_ORDER.indexOf(a.phase || "no_phase");
              const phaseB = PHASE_ORDER.indexOf(b.phase || "no_phase");
              const iA = phaseA === -1 ? 999 : phaseA;
              const iB = phaseB === -1 ? 999 : phaseB;
              return iA - iB;
            });
            return (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="text-base">
                    {categoryLabels[category] ?? category}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-muted-foreground">
                          {t("costsColDescription")}
                        </TableHead>
                        <TableHead>{t("costsColLine")}</TableHead>
                        <TableHead className="text-right">
                          {t("costsColAmount")}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedLines.map((line) => (
                        <TableRow key={line.id}>
                          <TableCell className="text-muted-foreground max-w-[200px] truncate">
                            {line.description || "—"}
                          </TableCell>
                          <TableCell>
                            {subcategoryLabels[category]?.[line.subcategory] ??
                              line.subcategory}
                          </TableCell>
                          <TableCell className="text-right font-medium tabular-nums">
                            {formatCurrency(Number(line.estimated_amount))}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                    <TableFooter>
                      <TableRow>
                        <TableCell
                          colSpan={2}
                          className="text-muted-foreground text-left"
                        >
                          {t("costsSubtotal")}
                        </TableCell>
                        <TableCell className="text-right font-medium tabular-nums">
                          {formatCurrency(categoryTotal)}
                        </TableCell>
                      </TableRow>
                    </TableFooter>
                  </Table>
                </CardContent>
              </Card>
            );
          })}
          {products.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {t("costsProductsSection")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("costsColProduct")}</TableHead>
                      <TableHead className="text-muted-foreground">
                        {t("costsColSpace")}
                      </TableHead>
                      <TableHead className="text-right">
                        {t("costsColQuantity")}
                      </TableHead>
                      <TableHead className="text-right">
                        {t("costsColPrice")}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>{p.name}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {p.space_name || "—"}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {p.quantity}
                        </TableCell>
                        <TableCell className="text-right font-medium tabular-nums">
                          {formatCurrency(Number(p.total_price))}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="text-muted-foreground text-left"
                      >
                        {t("costsSubtotalProducts")}
                      </TableCell>
                      <TableCell className="text-right font-medium tabular-nums">
                        {formatCurrency(
                          products.reduce(
                            (sum, p) => sum + Number(p.total_price),
                            0
                          )
                        )}
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </CardContent>
            </Card>
          )}
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
              {products.length > 0 && (
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
                <span className="text-muted-foreground">
                  {t("costsSubtotal")}
                </span>
                <span className="tabular-nums">{formatCurrency(subtotal)}</span>
              </div>
              {taxRate > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {t("costsTax", { rate: taxRate })}
                  </span>
                  <span className="tabular-nums">{formatCurrency(tax)}</span>
                </div>
              )}
              <div className="flex justify-between border-t pt-2 font-semibold">
                <span>{t("costsTotal")}</span>
                <span className="tabular-nums">{formatCurrency(total)}</span>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </ViewProjectShell>
  );
}
