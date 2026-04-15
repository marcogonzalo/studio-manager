import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import type { Product, ProjectItem } from "@/types";
import { useAppFormatting } from "@/components/providers/app-formatting-provider";

interface ProductDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
  projectItem?: ProjectItem | null;
  onEdit?: () => void;
  projectId?: string;
  currency?: string;
}

export function ProductDetailModal({
  open,
  onOpenChange,
  product,
  projectItem,
  onEdit,
  projectId,
  currency,
}: ProductDetailModalProps) {
  const t = useTranslations("ProductDetailModal");
  const { formatCurrency, formatDate } = useAppFormatting();
  const poStatusLabels: Record<string, string> = {
    draft: t("statusDraft"),
    sent: t("statusSent"),
    confirmed: t("statusConfirmed"),
    received: t("statusReceived"),
    cancelled: t("statusCancelled"),
  };
  // Si hay projectItem, usar sus datos; si no, usar product
  const displayProduct = projectItem || product;

  if (!displayProduct) return null;

  // Si el item del proyecto no tiene imagen, caer al image_url del producto del catálogo.
  // En la mayoría de llamadas, el modal recibe `projectItem` y no `product` como prop.
  const catalogImageUrl = projectItem?.product?.image_url || product?.image_url;
  const imageUrl = projectItem?.image_url || catalogImageUrl;
  const name = projectItem?.name || product?.name;
  const description = projectItem?.description || product?.description || "";
  const referenceCode =
    projectItem?.product?.reference_code || product?.reference_code || "";
  const referenceUrl =
    projectItem?.product?.reference_url || product?.reference_url || "";
  const internalReference = projectItem?.internal_reference || "";
  const category = projectItem?.product?.category || product?.category || "";
  const supplierName =
    projectItem?.product?.supplier?.name ||
    product?.supplier?.name ||
    t("noSupplier");
  const costPrice = projectItem
    ? projectItem.unit_cost
    : product?.cost_price || 0;
  const unitPrice = projectItem?.unit_price || undefined;
  const quantity = projectItem?.quantity || undefined;
  const currencyCode = currency ?? projectItem?.product?.currency ?? product?.currency;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">{name}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Imagen */}
          <div className="space-y-4">
            {imageUrl ? (
              <div className="bg-secondary/30 dark:bg-muted relative aspect-square overflow-hidden rounded-lg">
                <Image
                  src={imageUrl}
                  alt={name ?? ""}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            ) : (
              <div className="bg-secondary/30 dark:bg-muted flex aspect-square items-center justify-center rounded-lg">
                <span className="text-muted-foreground">{t("noImage")}</span>
              </div>
            )}
          </div>

          {/* Detalles */}
          <div className="space-y-4">
            {description && (
              <div>
                <h3 className="text-muted-foreground mb-1 text-sm font-medium">
                  {t("description")}
                </h3>
                <p className="text-sm whitespace-pre-wrap">{description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-muted-foreground mb-1 text-sm font-medium">
                  {t("supplier")}
                </h3>
                <p className="text-sm">{supplierName}</p>
              </div>
              <div>
                <h3 className="text-muted-foreground mb-1 text-sm font-medium">
                  {t("reference")}
                </h3>
                <p className="font-mono text-sm">{referenceCode || "-"}</p>
              </div>
              <div>
                <h3 className="text-muted-foreground mb-1 text-sm font-medium">
                  {t("category")}
                </h3>
                <p className="text-sm">{category || "-"}</p>
              </div>
              <div>
                <h3 className="text-muted-foreground mb-1 text-sm font-medium">
                  {t("code")}
                </h3>
                <p className="font-mono text-sm">{internalReference || "-"}</p>
              </div>
            </div>

            {referenceUrl && (
              <div>
                <h3 className="text-muted-foreground mb-1 text-sm font-medium">
                  {t("referenceUrl")}
                </h3>
                <a
                  href={referenceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm break-all text-blue-600 hover:underline dark:text-blue-400"
                >
                  {referenceUrl}
                </a>
              </div>
            )}

            <div className="space-y-3 border-t pt-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm font-medium">
                  {t("unitCost")}
                </span>
                <span className="font-mono text-sm">
                  {formatCurrency(costPrice, currencyCode)}
                </span>
              </div>

              {quantity && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-sm font-medium">
                    {t("quantity")}
                  </span>
                  <span className="text-sm">{quantity}</span>
                </div>
              )}

              {unitPrice && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-sm font-medium">
                    {t("salePrice")}
                  </span>
                  <span className="font-mono text-sm">
                    {formatCurrency(unitPrice, currencyCode)}
                  </span>
                </div>
              )}

              {quantity && unitPrice && (
                <div className="flex justify-between border-t pt-3">
                  <span className="font-medium">{t("total")}</span>
                  <span className="text-lg font-bold">
                    {formatCurrency(unitPrice * quantity, currencyCode)}
                  </span>
                </div>
              )}
            </div>

            {projectItem?.purchase_order &&
              projectItem.purchase_order.status !== "cancelled" && (
                <div className="bg-muted/50 dark:bg-muted/20 space-y-2 rounded-lg border p-4">
                  <h3 className="text-foreground text-sm font-semibold">
                    {t("purchaseOrder")}
                  </h3>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="text-muted-foreground">
                        {t("poRef")}:
                      </span>{" "}
                      <span className="font-medium">
                        {projectItem.purchase_order.order_number}
                      </span>
                    </p>
                    <p>
                      <span className="text-muted-foreground">
                        {t("status")}:
                      </span>{" "}
                      <span className="font-medium">
                        {poStatusLabels[projectItem.purchase_order.status] ??
                          projectItem.purchase_order.status}
                      </span>
                    </p>
                    {projectItem.purchase_order.delivery_date && (
                      <p>
                        <span className="text-muted-foreground">
                          {t("deliveryDate")}:
                        </span>{" "}
                        <span className="font-medium">
                          {formatDate(projectItem.purchase_order.delivery_date, {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })}
                        </span>
                      </p>
                    )}
                    {!projectItem.purchase_order.delivery_date &&
                      projectItem.purchase_order.delivery_deadline && (
                        <p>
                          <span className="text-muted-foreground">
                            {t("deliveryDeadline")}:
                          </span>{" "}
                          <span className="font-medium">
                            {projectItem.purchase_order.delivery_deadline}
                          </span>
                        </p>
                      )}
                  </div>
                </div>
              )}
          </div>
        </div>

        <DialogFooter>
          {projectItem && projectId && onEdit && (
            <Button onClick={onEdit} variant="default">
              <Pencil className="mr-2 h-4 w-4" />
              {t("edit")}
            </Button>
          )}
          <Button onClick={() => onOpenChange(false)} variant="outline">
            {t("close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
