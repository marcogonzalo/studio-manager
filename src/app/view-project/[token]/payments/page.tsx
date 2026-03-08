import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ViewProjectShell } from "../view-project-shell";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";

const PAYMENT_TYPE_LABELS: Record<string, string> = {
  fees: "Honorarios",
  purchase_provision: "Provisión de Compras",
  additional_cost: "Coste Adicional",
  other: "Otro",
};

interface PageProps {
  params: Promise<{ token: string }>;
}

export const metadata = {
  title: "Pagos del proyecto",
  description: "Historial de pagos del proyecto compartido",
};

export default async function ViewProjectPaymentsPage({ params }: PageProps) {
  const { token } = await params;
  const supabase = await createClient();

  const [shareRes, currencyRes, paymentsRes] = await Promise.all([
    supabase.rpc("get_project_share_by_token", { share_token: token }),
    supabase.rpc("get_project_public_currency", { share_token: token }),
    supabase.rpc("get_project_public_payments", { share_token: token }),
  ]);

  if (shareRes.error || !shareRes.data?.length) notFound();
  const currency =
    (currencyRes.data?.[0] as { currency: string | null } | undefined)
      ?.currency ?? "EUR";
  const payments = (paymentsRes.data ?? []) as {
    id: string;
    amount: number;
    payment_date: string;
    reference_number: string | null;
    description: string | null;
    payment_type: string;
  }[];

  const totalAmount = payments.reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <ViewProjectShell token={token} showBack title="Pagos">
      <div className="mx-auto w-full max-w-4xl space-y-4">
        {payments.length === 0 ? (
          <Card>
            <CardContent className="text-muted-foreground py-12 text-center">
              No hay pagos registrados.
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="border-border flex justify-end border-b px-4 py-3">
                <span className="text-muted-foreground text-sm">
                  Total:{" "}
                  <span className="text-foreground font-semibold">
                    {formatCurrency(totalAmount, currency)}
                  </span>
                </span>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Referencia</TableHead>
                    <TableHead>Descripción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        {format(new Date(payment.payment_date), "dd/MM/yyyy")}
                      </TableCell>
                      <TableCell className="font-semibold tabular-nums">
                        {formatCurrency(Number(payment.amount), currency)}
                      </TableCell>
                      <TableCell>
                        <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-medium">
                          {PAYMENT_TYPE_LABELS[payment.payment_type] ??
                            payment.payment_type}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground max-w-[12rem] truncate">
                        {payment.reference_number ?? "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground max-w-[16rem] truncate">
                        {payment.description ?? "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </ViewProjectShell>
  );
}
