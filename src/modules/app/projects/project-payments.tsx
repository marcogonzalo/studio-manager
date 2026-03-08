"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Wallet, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { PaymentDialog } from "@/components/dialogs/payment-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Payment, PaymentType } from "@/types";
import {
  getDemoAccountMessage,
  getPhaseLabel,
  formatCurrency as formatCurrencyUtil,
} from "@/lib/utils";
import { ProjectTabContent, TabSectionHeader } from "./project-tab-content";

const PAYMENT_TYPE_LABELS: Record<PaymentType, string> = {
  fees: "Honorarios",
  purchase_provision: "Provisión de Compras",
  additional_cost: "Coste Adicional",
  other: "Otro",
};

export function ProjectPayments({
  projectId,
  readOnly = false,
  disabled = false,
}: {
  projectId: string;
  readOnly?: boolean;
  disabled?: boolean;
}) {
  const supabase = getSupabaseClient();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [projectCurrency, setProjectCurrency] = useState<string>("EUR");
  const [budgetGrandTotal, setBudgetGrandTotal] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [filterType, setFilterType] = useState<string>("all");

  const fetchPayments = async () => {
    setLoading(true);
    const [
      { data: projectData },
      { data, error },
      { data: budgetLines },
      { data: items },
    ] = await Promise.all([
      supabase.from("projects").select("currency").eq("id", projectId).single(),
      supabase
        .from("payments")
        .select("*")
        .eq("project_id", projectId)
        .order("payment_date", { ascending: false }),
      supabase
        .from("project_budget_lines")
        .select("estimated_amount")
        .eq("project_id", projectId),
      supabase
        .from("project_items")
        .select("unit_price, quantity")
        .eq("project_id", projectId),
    ]);
    if (projectData?.currency) setProjectCurrency(projectData.currency);
    if (error) {
      toast.error("Error al cargar pagos", { id: "payments-load" });
    } else {
      setPayments(data || []);
    }
    const linesTotal = (budgetLines || []).reduce(
      (sum: number, line: { estimated_amount?: unknown }) =>
        sum + Number(line.estimated_amount),
      0
    );
    const itemsTotal = (items || []).reduce(
      (sum: number, item: { unit_price?: unknown; quantity?: unknown }) =>
        sum + Number(item.unit_price) * Number(item.quantity),
      0
    );
    setBudgetGrandTotal(linesTotal + itemsTotal);
    setLoading(false);
  };

  useEffect(() => {
    fetchPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run when projectId changes only
  }, [projectId]);

  const handleCreateNew = () => {
    setEditingPayment(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (payment: Payment) => {
    setEditingPayment(payment);
    setIsDialogOpen(true);
  };

  const handleDelete = async (paymentId: string) => {
    if (!confirm("¿Está seguro de eliminar este pago?")) {
      return;
    }

    const { error } = await supabase
      .from("payments")
      .delete()
      .eq("id", paymentId);

    if (error) {
      const demoMsg = getDemoAccountMessage(error);
      if (demoMsg) {
        toast.error(`${demoMsg.title}. ${demoMsg.description}`, {
          duration: 5000,
        });
      } else {
        toast.error("Error al eliminar pago");
      }
    } else {
      toast.success("Pago eliminado");
      fetchPayments();
    }
  };

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setEditingPayment(null);
    }
  };

  const filteredPayments =
    filterType === "all"
      ? payments
      : payments.filter((p) => p.payment_type === filterType);

  const totalAmount = filteredPayments.reduce(
    (sum, p) => sum + Number(p.amount),
    0
  );
  const totalReceived = payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const totalPending = Math.max(0, budgetGrandTotal - totalReceived);
  const paidPercentage =
    budgetGrandTotal > 0
      ? Math.min(100, (totalReceived / budgetGrandTotal) * 100)
      : 0;

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-10 w-[200px]" />
        </div>
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-14 w-full rounded-md" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <ProjectTabContent
      disabled={disabled}
      disabledMessage="La gestión de pagos no está incluida en tu plan actual."
    >
      <div className="space-y-6">
        <TabSectionHeader title="Pagos del Proyecto">
          <div className="flex gap-2">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="fees">Honorarios</SelectItem>
                <SelectItem value="purchase_provision">
                  Provisión de Compras
                </SelectItem>
                <SelectItem value="additional_cost">Coste Adicional</SelectItem>
                <SelectItem value="other">Otro</SelectItem>
              </SelectContent>
            </Select>
            {!readOnly && (
              <Button onClick={handleCreateNew}>
                <Plus className="mr-2 h-4 w-4" /> Nuevo Pago
              </Button>
            )}
          </div>
        </TabSectionHeader>

        {/* Totals summary (like cost control) */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-secondary/30 rounded-lg p-3">
                <p className="text-muted-foreground text-xs">Total pendiente</p>
                <p className="text-xl font-bold">
                  {formatCurrencyUtil(totalPending, projectCurrency)}
                </p>
              </div>
              <div className="bg-secondary/30 rounded-lg p-3">
                <p className="text-muted-foreground text-xs">Total recibido</p>
                <p className="text-xl font-bold">
                  {formatCurrencyUtil(totalReceived, projectCurrency)}
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <div
                className="bg-muted h-2 flex-1 overflow-hidden rounded-full"
                role="progressbar"
                aria-valuenow={paidPercentage}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Porcentaje cobrado del presupuesto"
              >
                <div
                  className="bg-primary h-full rounded-full transition-all duration-300"
                  style={{ width: `${paidPercentage}%` }}
                />
              </div>
              <span className="text-muted-foreground min-w-[3rem] text-right text-sm font-medium tabular-nums">
                {paidPercentage.toFixed(0)}%
              </span>
            </div>
          </CardContent>
        </Card>

        {filteredPayments.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Wallet className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
              <p className="text-muted-foreground mb-4">
                No hay pagos registrados.
              </p>
              {!readOnly && (
                <Button onClick={handleCreateNew} variant="outline">
                  <Plus className="mr-2 h-4 w-4" /> Registrar Primer Pago
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Historial de Pagos</CardTitle>
                  <div className="text-muted-foreground text-sm">
                    Total:{" "}
                    <span className="font-semibold">
                      {formatCurrencyUtil(totalAmount, projectCurrency)}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Monto</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Referencia</TableHead>
                        <TableHead>Fase</TableHead>
                        <TableHead>Descripción</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPayments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell>
                            {format(
                              new Date(payment.payment_date),
                              "dd/MM/yyyy"
                            )}
                          </TableCell>
                          <TableCell className="font-semibold">
                            {formatCurrencyUtil(
                              Number(payment.amount),
                              projectCurrency
                            )}
                          </TableCell>
                          <TableCell>
                            <span className="bg-primary/10 text-primary rounded-full px-2 py-1 text-xs">
                              {PAYMENT_TYPE_LABELS[payment.payment_type]}
                            </span>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {payment.reference_number || "-"}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {payment.phase ? getPhaseLabel(payment.phase) : "-"}
                          </TableCell>
                          <TableCell className="text-muted-foreground max-w-xs truncate">
                            {payment.description || "-"}
                          </TableCell>
                          <TableCell className="text-right">
                            {!readOnly && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    aria-label="Acciones del pago"
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => handleEdit(payment)}
                                  >
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Editar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleDelete(payment.id)}
                                    className="text-destructive"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Eliminar
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        <PaymentDialog
          open={isDialogOpen}
          onOpenChange={handleDialogClose}
          onSuccess={fetchPayments}
          projectId={projectId}
          payment={editingPayment}
          currency={projectCurrency}
        />
      </div>
    </ProjectTabContent>
  );
}
