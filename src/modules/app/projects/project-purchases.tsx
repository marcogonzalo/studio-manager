"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingBag, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
// import { useAuth } from '@/components/auth-provider'; // No usado actualmente
import { PurchaseOrderDialog } from "@/components/dialogs/purchase-order-dialog";
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

interface PurchaseOrder {
  id: string;
  order_number: string;
  supplier_id: string;
  supplier?: { name: string };
  status: string;
  order_date: string;
  notes: string | null;
  delivery_deadline?: string | null;
  delivery_date?: string | null;
  created_at: string;
  project_items: {
    id: string;
    name: string;
    quantity: number;
    unit_cost: number;
  }[];
}

const STATUS_LABELS: Record<string, string> = {
  draft: "Borrador",
  sent: "Enviada",
  confirmed: "Confirmada",
  received: "Recibida",
  cancelled: "Cancelada",
};

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-muted text-foreground",
  sent: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300",
  confirmed: "bg-primary/5 text-primary dark:bg-primary/10 dark:text-primary",
  received:
    "bg-purple-100 text-purple-800 dark:bg-purple-950/50 dark:text-purple-300",
  cancelled:
    "bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive",
};

export function ProjectPurchases({ projectId }: { projectId: string }) {
  // const { user } = useAuth(); // No usado actualmente
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<PurchaseOrder | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("purchase_orders")
      .select(
        "*, supplier:suppliers(name), project_items(id, name, quantity, unit_cost)"
      )
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });

    if (!error) setOrders(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, [projectId]);

  const handleCreateNew = () => {
    setEditingOrder(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (order: PurchaseOrder) => {
    setEditingOrder(order);
    setIsDialogOpen(true);
  };

  const handleDelete = async (orderId: string) => {
    if (
      !confirm(
        "¿Está seguro de eliminar esta orden de compra? Los ítems asociados volverán a estado pendiente, a menos que estén en otra orden activa."
      )
    ) {
      return;
    }

    // Get all items in this order
    const { data: itemsInOrder } = await supabase
      .from("project_items")
      .select("id")
      .eq("purchase_order_id", orderId);

    if (itemsInOrder && itemsInOrder.length > 0) {
      // Get all non-cancelled orders (excluding this one)
      const { data: activeOrders } = await supabase
        .from("purchase_orders")
        .select("id")
        .eq("project_id", projectId)
        .neq("id", orderId)
        .neq("status", "cancelled");

      const activeOrderIds = activeOrders?.map((po) => po.id) || [];

      // For each item, check if it's in another active order
      for (const item of itemsInOrder) {
        let hasOtherActiveOrder = false;

        if (activeOrderIds.length > 0) {
          // Check if this item is in any active order
          const { data: itemInOtherOrder, error: checkError } = await supabase
            .from("project_items")
            .select("id")
            .eq("id", item.id)
            .in("purchase_order_id", activeOrderIds)
            .limit(1)
            .maybeSingle();

          hasOtherActiveOrder = !checkError && !!itemInOtherOrder;
        }

        if (!hasOtherActiveOrder) {
          // No other active order, set to pending
          await supabase
            .from("project_items")
            .update({ purchase_order_id: null, status: "pending" })
            .eq("id", item.id);
        } else {
          // Item is in another active order, just unlink from this order
          await supabase
            .from("project_items")
            .update({ purchase_order_id: null })
            .eq("id", item.id);
        }
      }
    }

    // Then delete the order
    const { error } = await supabase
      .from("purchase_orders")
      .delete()
      .eq("id", orderId);

    if (error) {
      toast.error("Error al eliminar la orden");
    } else {
      toast.success("Orden eliminada");
      fetchOrders();
    }
  };

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setEditingOrder(null);
    }
  };

  const calculateOrderTotal = (
    items: { quantity: number; unit_cost: number }[]
  ) => {
    return items.reduce(
      (sum, item) => sum + item.quantity * (item.unit_cost || 0),
      0
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <CardTitle>Órdenes de Compra</CardTitle>
        <div className="flex gap-2">
          <Button onClick={handleCreateNew} disabled={loading}>
            <Plus className="mr-2 h-4 w-4" /> Nueva Orden
          </Button>
        </div>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ShoppingBag className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
            <p className="text-muted-foreground mb-4">
              No hay órdenes de compra.
            </p>
            <Button onClick={handleCreateNew} variant="outline">
              <Plus className="mr-2 h-4 w-4" /> Crear Primera Orden
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((po) => {
            const total = calculateOrderTotal(po.project_items);
            return (
              <Card key={po.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-3">
                        <CardTitle className="text-lg">
                          {po.supplier?.name || "Proveedor Desconocido"}
                        </CardTitle>
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${STATUS_COLORS[po.status] || STATUS_COLORS.draft}`}
                        >
                          {STATUS_LABELS[po.status] || po.status}
                        </span>
                      </div>
                      <div className="text-muted-foreground text-sm">
                        <div className="flex flex-wrap justify-between gap-x-4 gap-y-1">
                          <span>
                            Ref:{" "}
                            <span className="font-medium">
                              {po.order_number}
                            </span>
                          </span>
                          <span>
                            Fecha de solicitud:{" "}
                            <span className="font-medium">
                              {format(
                                new Date(po.order_date || po.created_at),
                                "dd/MM/yyyy"
                              )}
                            </span>
                          </span>
                          {po.delivery_deadline && !po.delivery_date && (
                            <span>
                              Plazo de Entrega:{" "}
                              <span className="font-medium">
                                {po.delivery_deadline}
                              </span>
                            </span>
                          )}
                          {po.delivery_date && (
                            <span>
                              Fecha de Entrega:{" "}
                              <span className="font-medium">
                                {format(
                                  new Date(po.delivery_date),
                                  "dd/MM/yyyy"
                                )}
                              </span>
                            </span>
                          )}
                        </div>
                        {po.notes && (
                          <div className="mt-2 italic">"{po.notes}"</div>
                        )}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleEdit(po)}
                          disabled={po.status === "cancelled"}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(po.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  {po.project_items.length > 0 ? (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Ítem</TableHead>
                            <TableHead className="text-right">
                              Cantidad
                            </TableHead>
                            <TableHead className="text-right">
                              Costo Unit.
                            </TableHead>
                            <TableHead className="text-right">Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {po.project_items.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell className="font-medium">
                                {item.name}
                              </TableCell>
                              <TableCell className="text-right">
                                {item.quantity}
                              </TableCell>
                              <TableCell className="text-right">
                                ${(item.unit_cost || 0).toFixed(2)}
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                $
                                {(
                                  (item.unit_cost || 0) * item.quantity
                                ).toFixed(2)}
                              </TableCell>
                            </TableRow>
                          ))}
                          <TableRow className="bg-secondary/30 font-bold">
                            <TableCell colSpan={3} className="text-right">
                              Total de la Orden:
                            </TableCell>
                            <TableCell className="text-right">
                              ${total.toFixed(2)}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-muted-foreground py-4 text-center text-sm">
                      No hay ítems en esta orden
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <PurchaseOrderDialog
        open={isDialogOpen}
        onOpenChange={handleDialogClose}
        projectId={projectId}
        order={
          editingOrder
            ? {
                id: editingOrder.id,
                supplier_id: editingOrder.supplier_id || "",
                order_number: editingOrder.order_number || "",
                order_date:
                  editingOrder.order_date ||
                  editingOrder.created_at ||
                  new Date().toISOString().split("T")[0],
                status: editingOrder.status || "draft",
                notes: editingOrder.notes || null,
                delivery_deadline: editingOrder.delivery_deadline ?? null,
                delivery_date: editingOrder.delivery_date ?? null,
                project_items: editingOrder.project_items
                  ? editingOrder.project_items.map((item) => ({ id: item.id }))
                  : [],
              }
            : null
        }
        onSuccess={() => {
          fetchOrders();
          setIsDialogOpen(false);
          setEditingOrder(null);
        }}
      />
    </div>
  );
}
