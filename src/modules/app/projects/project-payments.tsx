"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { getPhaseLabel } from "@/lib/utils";

const PAYMENT_TYPE_LABELS: Record<PaymentType, string> = {
  fees: "Honorarios",
  purchase_provision: "Provisión de Compras",
  additional_cost: "Coste Adicional",
  other: "Otro",
};

export function ProjectPayments({ projectId }: { projectId: string }) {
  const supabase = getSupabaseClient();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [filterType, setFilterType] = useState<string>("all");

  const fetchPayments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("payments")
      .select("*")
      .eq("project_id", projectId)
      .order("payment_date", { ascending: false });

    if (error) {
      toast.error("Error al cargar pagos", { id: "payments-load" });
    } else {
      setPayments(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPayments();
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
      toast.error("Error al eliminar pago");
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

  if (loading) {
    return <div className="py-12 text-center">Cargando...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <CardTitle>Pagos del Proyecto</CardTitle>
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
          <Button onClick={handleCreateNew}>
            <Plus className="mr-2 h-4 w-4" /> Nuevo Pago
          </Button>
        </div>
      </div>

      {filteredPayments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Wallet className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
            <p className="text-muted-foreground mb-4">
              No hay pagos registrados.
            </p>
            <Button onClick={handleCreateNew} variant="outline">
              <Plus className="mr-2 h-4 w-4" /> Registrar Primer Pago
            </Button>
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
                    {new Intl.NumberFormat("es-ES", {
                      style: "currency",
                      currency: "EUR",
                    }).format(totalAmount)}
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
                          {format(new Date(payment.payment_date), "dd/MM/yyyy")}
                        </TableCell>
                        <TableCell className="font-semibold">
                          {new Intl.NumberFormat("es-ES", {
                            style: "currency",
                            currency: "EUR",
                          }).format(Number(payment.amount))}
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
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
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
      />
    </div>
  );
}
