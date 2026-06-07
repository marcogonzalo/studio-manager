"use client";

import { Fragment, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { getSupabaseClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingBag, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { PurchaseOrderDialog } from "@/components/dialogs/purchase-order-dialog";
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog";
import {
  MobileDetailField,
  TableCellMd,
  TableHeadExpandPlaceholder,
  TableHeadMd,
  TableRowExpandTrigger,
  TableRowMobileDetail,
  useExpandableTableRow,
} from "@/components/ui/expandable-table";
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
import { getDemoAccountMessage } from "@/lib/utils";
import { ProjectTabContent, TabSectionHeader } from "./project-tab-content";

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

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-muted text-foreground",
  sent: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300",
  confirmed:
    "bg-purple-100 text-purple-800 dark:bg-purple-950/50 dark:text-purple-300",
  received: "bg-primary/5 text-primary dark:bg-primary/10 dark:text-primary",
  cancelled:
    "bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive",
};

export function ProjectPurchases({
  projectId,
  readOnly = false,
  disabled = false,
}: {
  projectId: string;
  readOnly?: boolean;
  disabled?: boolean;
}) {
  const t = useTranslations("ProjectModulePurchases");
  const ts = useTranslations("ProjectModuleShared");
  const supabase = getSupabaseClient();

  const statusLabels: Record<string, string> = {
    draft: t("status.draft"),
    sent: t("status.sent"),
    confirmed: t("status.confirmed"),
    received: t("status.received"),
    cancelled: t("status.cancelled"),
  };
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<PurchaseOrder | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { toggleRow, isExpanded } = useExpandableTableRow();
  const mobileVisibleColumnCount = 3;

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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run when projectId changes only
  }, [projectId]);

  const handleCreateNew = () => {
    setEditingOrder(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (order: PurchaseOrder) => {
    setEditingOrder(order);
    setIsDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;
    const orderId = deleteTargetId;
    setDeleteLoading(true);
    try {
      const { data: itemsInOrder } = await supabase
        .from("project_items")
        .select("id")
        .eq("purchase_order_id", orderId);

      if (itemsInOrder && itemsInOrder.length > 0) {
        const { data: activeOrders } = await supabase
          .from("purchase_orders")
          .select("id")
          .eq("project_id", projectId)
          .neq("id", orderId)
          .neq("status", "cancelled");

        const activeOrderIds =
          activeOrders?.map((po: { id: string }) => po.id) || [];

        for (const item of itemsInOrder) {
          let hasOtherActiveOrder = false;

          if (activeOrderIds.length > 0) {
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
            await supabase
              .from("project_items")
              .update({ purchase_order_id: null, status: "pending" })
              .eq("id", item.id);
          } else {
            await supabase
              .from("project_items")
              .update({ purchase_order_id: null })
              .eq("id", item.id);
          }
        }
      }

      const { error } = await supabase
        .from("purchase_orders")
        .delete()
        .eq("id", orderId);

      if (error) {
        const demoMsg = getDemoAccountMessage(error);
        if (demoMsg) {
          toast.error(`${demoMsg.title}. ${demoMsg.description}`, {
            duration: 5000,
          });
        } else {
          toast.error(t("toastDeleteError"));
        }
        return;
      }
      toast.success(t("toastDeleted"));
      setDeleteTargetId(null);
      fetchOrders();
    } finally {
      setDeleteLoading(false);
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
    <ProjectTabContent
      disabled={disabled}
      disabledMessage={t("disabledMessage")}
    >
      <div className="space-y-6">
        <TabSectionHeader title={t("title")}>
          {!readOnly && (
            <Button onClick={handleCreateNew} disabled={loading}>
              <Plus className="mr-2 h-4 w-4" /> {t("newOrder")}
            </Button>
          )}
        </TabSectionHeader>

        {orders.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <ShoppingBag className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
              <p className="text-muted-foreground mb-4">{t("empty")}</p>
              {!readOnly && (
                <Button onClick={handleCreateNew} variant="outline">
                  <Plus className="mr-2 h-4 w-4" /> {t("createFirstOrder")}
                </Button>
              )}
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
                            {po.supplier?.name || t("unknownSupplier")}
                          </CardTitle>
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-medium ${STATUS_COLORS[po.status] || STATUS_COLORS.draft}`}
                          >
                            {statusLabels[po.status] || po.status}
                          </span>
                        </div>
                        <div className="text-muted-foreground text-sm">
                          <div className="flex flex-wrap justify-between gap-x-4 gap-y-1">
                            <span>
                              {t("ref")}{" "}
                              <span className="font-medium">
                                {po.order_number}
                              </span>
                            </span>
                            <span>
                              {t("requestDate")}{" "}
                              <span className="font-medium">
                                {format(
                                  new Date(po.order_date || po.created_at),
                                  "dd/MM/yyyy"
                                )}
                              </span>
                            </span>
                            {po.delivery_deadline && !po.delivery_date && (
                              <span>
                                {t("deliveryDeadline")}{" "}
                                <span className="font-medium">
                                  {po.delivery_deadline}
                                </span>
                              </span>
                            )}
                            {po.delivery_date && (
                              <span>
                                {t("deliveryDate")}{" "}
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
                      {!readOnly && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={t("purchaseActionsAria")}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleEdit(po)}
                              disabled={po.status === "cancelled"}
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              {ts("edit")}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setDeleteTargetId(po.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              {ts("delete")}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {po.project_items.length > 0 ? (
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>{ts("colItem")}</TableHead>
                              <TableHead className="text-right">
                                {ts("colTotal")}
                              </TableHead>
                              <TableHeadMd className="text-right">
                                {ts("colQuantity")}
                              </TableHeadMd>
                              <TableHeadMd className="text-right">
                                {ts("colUnitCost")}
                              </TableHeadMd>
                              <TableHeadExpandPlaceholder
                                srLabel={ts("expandRow")}
                              />
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {po.project_items.map((item) => {
                              const expanded = isExpanded(item.id);
                              const lineTotal =
                                (item.unit_cost || 0) * item.quantity;

                              return (
                                <Fragment key={item.id}>
                                  <TableRow>
                                    <TableCell className="max-w-[10rem] truncate font-medium sm:max-w-none">
                                      {item.name}
                                    </TableCell>
                                    <TableCell className="text-right font-medium tabular-nums">
                                      ${lineTotal.toFixed(2)}
                                    </TableCell>
                                    <TableCellMd className="text-right tabular-nums">
                                      {item.quantity}
                                    </TableCellMd>
                                    <TableCellMd className="text-right tabular-nums">
                                      ${(item.unit_cost || 0).toFixed(2)}
                                    </TableCellMd>
                                    <TableRowExpandTrigger
                                      expanded={expanded}
                                      onToggle={() => toggleRow(item.id)}
                                      expandLabel={t("expandItemDetails")}
                                      collapseLabel={t("collapseItemDetails")}
                                    />
                                  </TableRow>
                                  <TableRowMobileDetail
                                    open={expanded}
                                    colSpan={mobileVisibleColumnCount}
                                  >
                                    <div className="space-y-2">
                                      <MobileDetailField
                                        label={ts("colQuantity")}
                                        value={item.quantity}
                                      />
                                      <MobileDetailField
                                        label={ts("colUnitCost")}
                                        value={`$${(item.unit_cost || 0).toFixed(2)}`}
                                      />
                                    </div>
                                  </TableRowMobileDetail>
                                </Fragment>
                              );
                            })}
                            <TableRow className="bg-secondary/30 font-bold md:hidden">
                              <TableCell className="text-right">
                                {t("orderTotal")}
                              </TableCell>
                              <TableCell className="text-right tabular-nums">
                                ${total.toFixed(2)}
                              </TableCell>
                              <TableCell />
                            </TableRow>
                            <TableRow className="bg-secondary/30 hidden font-bold md:table-row">
                              <TableCell className="text-right">
                                {t("orderTotal")}
                              </TableCell>
                              <TableCell className="text-right tabular-nums">
                                ${total.toFixed(2)}
                              </TableCell>
                              <TableCellMd />
                              <TableCellMd />
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="text-muted-foreground py-4 text-center text-sm">
                        {t("noItemsInOrder")}
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
                    ? editingOrder.project_items.map((item) => ({
                        id: item.id,
                      }))
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
        <ConfirmDeleteDialog
          open={deleteTargetId !== null}
          onOpenChange={(open) => !open && setDeleteTargetId(null)}
          title={t("confirmDelete")}
          description={t("confirmDeleteDescription")}
          onConfirm={handleConfirmDelete}
          loading={deleteLoading}
        />
      </div>
    </ProjectTabContent>
  );
}
