import { notFound } from "next/navigation";
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
import {
  formatCurrency as formatCurrencyUtil,
  getBudgetCategoryLabel,
  getBudgetSubcategoryLabel,
} from "@/lib/utils";
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

export const metadata = {
  title: "Costes del proyecto",
  description: "Presupuesto del proyecto compartido",
};

export default async function ViewProjectCostsPage({ params }: PageProps) {
  const { token } = await params;
  const supabase = await createClient();

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
    formatCurrencyUtil(amount, currency);

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
    <ViewProjectShell token={token} showBack title="Costes del proyecto">
      <div className="mx-auto w-full max-w-3xl space-y-6">
        {budgetLines.length === 0 ? (
          <Card>
            <CardContent className="text-muted-foreground py-12 text-center">
              No hay partidas de presupuesto visibles.
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
                      {getBudgetCategoryLabel(category)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-muted-foreground">
                            Descripción
                          </TableHead>
                          <TableHead>Partida</TableHead>
                          <TableHead className="text-right">Importe</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortedLines.map((line) => (
                          <TableRow key={line.id}>
                            <TableCell className="text-muted-foreground max-w-[200px] truncate">
                              {line.description || "—"}
                            </TableCell>
                            <TableCell>
                              {getBudgetSubcategoryLabel(
                                category as BudgetCategory,
                                line.subcategory
                              )}
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
                            Subtotal
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
                  <CardTitle className="text-base">Productos</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Producto</TableHead>
                        <TableHead className="text-muted-foreground">
                          Espacio
                        </TableHead>
                        <TableHead className="text-right">Cantidad</TableHead>
                        <TableHead className="text-right">Precio</TableHead>
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
                          Subtotal productos
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
                <CardTitle className="text-base">Resumen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {budgetLines.length > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Subtotal partidas
                    </span>
                    <span className="tabular-nums">
                      {formatCurrency(budgetSubtotal)}
                    </span>
                  </div>
                )}
                {products.length > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Subtotal productos
                    </span>
                    <span className="tabular-nums">
                      {formatCurrency(productsSubtotal)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between border-t pt-1 text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="tabular-nums">
                    {formatCurrency(subtotal)}
                  </span>
                </div>
                {taxRate > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Impuestos ({taxRate}%)
                    </span>
                    <span className="tabular-nums">{formatCurrency(tax)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t pt-2 font-semibold">
                  <span>Total</span>
                  <span className="tabular-nums">{formatCurrency(total)}</span>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </ViewProjectShell>
  );
}
