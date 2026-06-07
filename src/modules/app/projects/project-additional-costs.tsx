"use client";

import { Fragment, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { getSupabaseClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  ExpandableRowActionsMenu,
  ExpandableRowActionsPanel,
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
import { Plus, Trash2, Pencil, DollarSign } from "lucide-react";
import { AdditionalCostDialog } from "@/components/dialogs/additional-cost-dialog";
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { getDemoAccountMessage } from "@/lib/utils";
import type { AdditionalCost } from "@/types";

const COST_TYPE_VALUES = [
  "shipping",
  "packaging",
  "installation",
  "assembly",
  "transport",
  "insurance",
  "customs",
  "storage",
  "handling",
  "other",
] as const;

export function ProjectAdditionalCosts({ projectId }: { projectId: string }) {
  const t = useTranslations("ProjectModuleAdditionalCosts");
  const ts = useTranslations("ProjectModuleShared");
  const supabase = getSupabaseClient();
  const [costs, setCosts] = useState<AdditionalCost[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCost, setEditingCost] = useState<AdditionalCost | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { toggleRow, isExpanded } = useExpandableTableRow();
  const mobileVisibleColumnCount = 3;

  const costTypeLabel = (type: string) =>
    (COST_TYPE_VALUES as readonly string[]).includes(type)
      ? t(`costType.${type}` as "costType.shipping")
      : type;

  const fetchCosts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("additional_project_costs")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error(t("toastLoadError"), {
        id: "additional-costs-load",
      });
    } else {
      setCosts(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run when projectId changes only
  }, [projectId]);

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;
    setDeleteLoading(true);
    try {
      const { error } = await supabase
        .from("additional_project_costs")
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
      fetchCosts();
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleEdit = (cost: AdditionalCost) => {
    setEditingCost(cost);
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingCost(null);
    setIsDialogOpen(true);
  };

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setEditingCost(null);
    }
  };

  const costsByType = costs.reduce(
    (acc, cost) => {
      if (!acc[cost.cost_type]) {
        acc[cost.cost_type] = [];
      }
      acc[cost.cost_type].push(cost);
      return acc;
    },
    {} as Record<string, AdditionalCost[]>
  );

  const totalAmount = costs.reduce((sum, cost) => sum + Number(cost.amount), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-medium">{t("title")}</h3>
          <div className="text-muted-foreground text-sm">
            {t("total")} ${totalAmount.toFixed(2)}
          </div>
        </div>
        <Button
          onClick={handleAddNew}
          className="w-full sm:w-auto print:hidden"
        >
          <Plus className="mr-2 h-4 w-4" /> {t("addCost")}
        </Button>
      </div>

      {loading ? (
        <div className="space-y-4 py-8">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-md" />
          ))}
        </div>
      ) : costs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <DollarSign className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
            <p className="text-muted-foreground">{t("empty")}</p>
            <Button onClick={handleAddNew} className="mt-4">
              <Plus className="mr-2 h-4 w-4" /> {t("addFirstCost")}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(costsByType).map(([type, typeCosts]) => {
            const typeTotal = typeCosts.reduce(
              (sum, cost) => sum + Number(cost.amount),
              0
            );
            return (
              <Card key={type}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">
                        {costTypeLabel(type)}
                      </CardTitle>
                      <CardDescription>
                        {t("costCount", { count: typeCosts.length })} •{" "}
                        {t("groupTotal")} ${typeTotal.toFixed(2)}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{ts("colDescription")}</TableHead>
                          <TableHead className="text-right">
                            {ts("colAmount")}
                          </TableHead>
                          <TableHeadMd className="text-right">
                            {ts("colActions")}
                          </TableHeadMd>
                          <TableHeadExpandPlaceholder
                            srLabel={ts("expandRow")}
                          />
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {typeCosts.map((cost) => {
                          const expanded = isExpanded(cost.id);
                          const rowActions: ExpandableTableRowAction[] = [
                            {
                              id: "edit",
                              label: ts("edit"),
                              icon: Pencil,
                              onClick: () => handleEdit(cost),
                            },
                            {
                              id: "delete",
                              label: ts("delete"),
                              icon: Trash2,
                              onClick: () => setDeleteTargetId(cost.id),
                              destructive: true,
                            },
                          ];

                          return (
                            <Fragment key={cost.id}>
                              <TableRow>
                                <TableCell className="max-w-[10rem] truncate sm:max-w-none">
                                  {cost.description || (
                                    <span className="text-muted-foreground italic">
                                      {t("noDescription")}
                                    </span>
                                  )}
                                </TableCell>
                                <TableCell className="text-right font-medium tabular-nums">
                                  ${Number(cost.amount).toFixed(2)}
                                </TableCell>
                                <TableCellMd className="text-right">
                                  <ExpandableRowActionsMenu
                                    actions={rowActions}
                                    menuAriaLabel={t("costActionsAria")}
                                  />
                                </TableCellMd>
                                <TableRowExpandTrigger
                                  expanded={expanded}
                                  onToggle={() => toggleRow(cost.id)}
                                  expandLabel={t("expandCostActions")}
                                  collapseLabel={t("collapseCostActions")}
                                />
                              </TableRow>
                              <TableRowMobileDetail
                                open={expanded}
                                colSpan={mobileVisibleColumnCount}
                              >
                                <ExpandableRowActionsPanel
                                  actions={rowActions}
                                />
                              </TableRowMobileDetail>
                            </Fragment>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          <Card className="bg-secondary/30/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">{t("grandTotal")}</span>
                <span className="text-2xl font-bold">
                  ${totalAmount.toFixed(2)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <AdditionalCostDialog
        open={isDialogOpen}
        onOpenChange={handleDialogClose}
        projectId={projectId}
        cost={editingCost}
        onSuccess={() => {
          setIsDialogOpen(false);
          setEditingCost(null);
          fetchCosts();
        }}
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
  );
}
