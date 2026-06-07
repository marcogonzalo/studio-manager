"use client";

import { Fragment, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { getSupabaseClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Wallet, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog";
import { PaymentDialog } from "@/components/dialogs/payment-dialog";
import {
  ExpandableRowActionsMenu,
  ExpandableRowActionsPanel,
  MobileDetailField,
  TableCellMd,
  TableHeadExpandPlaceholder,
  TableHeadMd,
  TableRowExpandTrigger,
  TableRowMobileDetail,
  useExpandableTableRow,
  type ExpandableTableRowAction,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Payment, PaymentType } from "@/types";
import {
  getDemoAccountMessage,
  formatCurrency as formatCurrencyUtil,
} from "@/lib/utils";
import { usePhaseLabel } from "@/lib/use-project-labels";
import { ProjectTabContent, TabSectionHeader } from "./project-tab-content";

export function ProjectPayments({
  projectId,
  readOnly = false,
  disabled = false,
}: {
  projectId: string;
  readOnly?: boolean;
  disabled?: boolean;
}) {
  const t = useTranslations("ProjectModulePayments");
  const ts = useTranslations("ProjectModuleShared");
  const phaseLabel = usePhaseLabel();
  const supabase = getSupabaseClient();

  const paymentTypeLabel = (type: PaymentType) => t(`paymentType.${type}`);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [projectCurrency, setProjectCurrency] = useState<string>("EUR");
  const [budgetGrandTotal, setBudgetGrandTotal] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { toggleRow, isExpanded } = useExpandableTableRow();
  const mobileVisibleColumnCount = 4;

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
      toast.error(t("toastLoadError"), { id: "payments-load" });
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

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;
    setDeleteLoading(true);
    try {
      const { error } = await supabase
        .from("payments")
        .delete()
        .eq("id", deleteTargetId);

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
      fetchPayments();
    } finally {
      setDeleteLoading(false);
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
          <Skeleton className="h-10 w-full sm:w-[200px]" />
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
      disabledMessage={t("disabledMessage")}
    >
      <div className="space-y-6">
        <TabSectionHeader title={t("title")}>
          <div className="flex w-full min-w-0 flex-col gap-2 sm:w-auto sm:flex-row">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full min-w-0 sm:w-[200px]">
                <SelectValue placeholder={t("filterPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("filterAll")}</SelectItem>
                <SelectItem value="fees">{paymentTypeLabel("fees")}</SelectItem>
                <SelectItem value="purchase_provision">
                  {paymentTypeLabel("purchase_provision")}
                </SelectItem>
                <SelectItem value="additional_cost">
                  {paymentTypeLabel("additional_cost")}
                </SelectItem>
                <SelectItem value="other">
                  {paymentTypeLabel("other")}
                </SelectItem>
              </SelectContent>
            </Select>
            {!readOnly && (
              <Button onClick={handleCreateNew} className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" /> {t("newPayment")}
              </Button>
            )}
          </div>
        </TabSectionHeader>

        {/* Totals summary (like cost control) */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="bg-secondary/30 rounded-lg p-3">
                <p className="text-muted-foreground text-xs">
                  {t("totalPending")}
                </p>
                <p className="text-xl font-bold">
                  {formatCurrencyUtil(totalPending, projectCurrency)}
                </p>
              </div>
              <div className="bg-secondary/30 rounded-lg p-3">
                <p className="text-muted-foreground text-xs">
                  {t("totalReceived")}
                </p>
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
                aria-label={t("paidPercentageAria")}
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
              <p className="text-muted-foreground mb-4">{t("empty")}</p>
              {!readOnly && (
                <Button onClick={handleCreateNew} variant="outline">
                  <Plus className="mr-2 h-4 w-4" /> {t("registerFirstPayment")}
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <CardTitle>{t("historyTitle")}</CardTitle>
                  <div className="text-muted-foreground text-sm">
                    {ts("totalLabel")}{" "}
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
                        <TableHead>{ts("colDate")}</TableHead>
                        <TableHead>{ts("colType")}</TableHead>
                        <TableHead className="text-right">
                          {ts("colAmount")}
                        </TableHead>
                        <TableHeadMd>{ts("colReference")}</TableHeadMd>
                        <TableHeadMd>{ts("colPhase")}</TableHeadMd>
                        <TableHeadMd>{ts("colDescription")}</TableHeadMd>
                        <TableHeadMd className="text-right">
                          {ts("colActions")}
                        </TableHeadMd>
                        <TableHeadExpandPlaceholder srLabel={ts("expandRow")} />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPayments.map((payment) => {
                        const expanded = isExpanded(payment.id);
                        const rowActions: ExpandableTableRowAction[] = readOnly
                          ? []
                          : [
                              {
                                id: "edit",
                                label: ts("edit"),
                                icon: Pencil,
                                onClick: () => handleEdit(payment),
                              },
                              {
                                id: "delete",
                                label: ts("delete"),
                                icon: Trash2,
                                onClick: () => setDeleteTargetId(payment.id),
                                destructive: true,
                              },
                            ];

                        const typeBadge = (
                          <span className="bg-primary/10 text-primary inline-flex max-w-[7rem] truncate rounded-full px-2 py-1 text-xs sm:max-w-none">
                            {paymentTypeLabel(payment.payment_type)}
                          </span>
                        );

                        return (
                          <Fragment key={payment.id}>
                            <TableRow>
                              <TableCell className="whitespace-nowrap">
                                {format(
                                  new Date(payment.payment_date),
                                  "dd/MM/yyyy"
                                )}
                              </TableCell>
                              <TableCell>{typeBadge}</TableCell>
                              <TableCell className="text-right font-semibold tabular-nums">
                                {formatCurrencyUtil(
                                  Number(payment.amount),
                                  projectCurrency
                                )}
                              </TableCell>
                              <TableCellMd className="text-muted-foreground">
                                {payment.reference_number || "-"}
                              </TableCellMd>
                              <TableCellMd className="text-muted-foreground">
                                {payment.phase
                                  ? phaseLabel(payment.phase)
                                  : "-"}
                              </TableCellMd>
                              <TableCellMd className="text-muted-foreground max-w-xs truncate">
                                {payment.description || "-"}
                              </TableCellMd>
                              <TableCellMd className="text-right">
                                <ExpandableRowActionsMenu
                                  actions={rowActions}
                                  menuAriaLabel={t("paymentActionsAria")}
                                />
                              </TableCellMd>
                              <TableRowExpandTrigger
                                expanded={expanded}
                                onToggle={() => toggleRow(payment.id)}
                                expandLabel={t("expandPaymentDetails")}
                                collapseLabel={t("collapsePaymentDetails")}
                              />
                            </TableRow>
                            <TableRowMobileDetail
                              open={expanded}
                              colSpan={mobileVisibleColumnCount}
                            >
                              <div className="space-y-2">
                                <MobileDetailField
                                  label={ts("colReference")}
                                  value={payment.reference_number || "-"}
                                />
                                <MobileDetailField
                                  label={ts("colPhase")}
                                  value={
                                    payment.phase
                                      ? phaseLabel(payment.phase)
                                      : "-"
                                  }
                                />
                                <MobileDetailField
                                  label={ts("colDescription")}
                                  value={payment.description || "-"}
                                />
                                <ExpandableRowActionsPanel
                                  actions={rowActions}
                                />
                              </div>
                            </TableRowMobileDetail>
                          </Fragment>
                        );
                      })}
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

        <ConfirmDeleteDialog
          open={deleteTargetId !== null}
          onOpenChange={(open) => !open && setDeleteTargetId(null)}
          title={t("confirmDelete")}
          description={ts("confirmDeleteDescription")}
          onConfirm={handleConfirmDelete}
          loading={deleteLoading}
        />
      </div>
    </ProjectTabContent>
  );
}
