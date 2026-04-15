"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { getSupabaseClient } from "@/lib/supabase";
import {
  getDemoAccountMessage,
  reportError,
  formatCurrency,
} from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Image as ImageIcon,
  MoreVertical,
  ShoppingBag,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProductDialog } from "@/components/dialogs/product-dialog";
import { ProductDetailModal } from "@/components/product-detail-modal";
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useProfileDefaults } from "@/lib/use-profile-defaults";
import { useDebouncedState } from "@/lib/use-debounced-value";
import { toast } from "sonner";

import type { Product } from "@/types";

export default function CatalogPage() {
  const t = useTranslations("CatalogPage");
  const profileDefaults = useProfileDefaults();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, searchDebounced, setSearchInput] = useDebouncedState(
    "",
    500
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const supabase = getSupabaseClient();

  const fetchProducts = async () => {
    setLoading(true);
    let query = supabase
      .from("products")
      .select("*, supplier:suppliers(name)")
      .order("name");
    if (searchDebounced)
      query = query.or(
        `name.ilike.%${searchDebounced}%,reference_code.ilike.%${searchDebounced}%`
      );
    const { data, error } = await query;
    if (!error) setProducts(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run when searchDebounced changes only
  }, [searchDebounced]);

  const handleDeleteClick = (product: Product) => setDeleteTarget(product);

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    const product = deleteTarget;
    setDeleteLoading(true);
    try {
      const { canDeleteProduct } = await import("@/lib/validation");
      const canDelete = await canDeleteProduct(product.id);
      if (!canDelete) {
        toast.error(t("toastDeleteBlocked"));
        setDeleteTarget(null);
        return;
      }
      if (product.image_url?.trim()) {
        try {
          const res = await fetch(
            `/api/upload/product-image?url=${encodeURIComponent(product.image_url)}`,
            { method: "DELETE" }
          );
          if (!res.ok) {
            const data = (await res.json()) as { error?: string };
            reportError(new Error(data.error), "Error deleting B2 image:");
          }
        } catch (err) {
          reportError(err, "Error deleting B2 image:");
        }
      }
      const { error: deleteError, data: deleted } = await supabase
        .from("products")
        .delete()
        .eq("id", product.id)
        .select();
      if (deleteError) {
        const demoMsg = getDemoAccountMessage(deleteError);
        if (demoMsg) {
          toast.error(`${demoMsg.title}. ${demoMsg.description}`, {
            duration: 5000,
          });
          return;
        }
        reportError(deleteError, "Error deleting product:");
        if (
          deleteError.code === "42501" ||
          deleteError.message?.includes("permission") ||
          deleteError.message?.includes("policy")
        ) {
          toast.error(t("toastNoPermission"));
        } else {
          toast.error(
            `${t("toastDeleteError")}: ${deleteError.message || t("unknownError")}`
          );
        }
        return;
      }
      if (!deleted || deleted.length === 0) {
        toast.error(t("toastDeleteFailed"));
        fetchProducts();
        return;
      }
      toast.success(t("toastDeleted"));
      setDeleteTarget(null);
      fetchProducts();
    } catch (error) {
      reportError(error, "Unexpected error in handleDelete:");
      toast.error(t("toastUnexpectedDeleteError"));
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShoppingBag className="text-primary h-8 w-8" />
            <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          </div>
          <Button
            onClick={() => {
              setEditingProduct(null);
              setIsDialogOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" /> {t("newProduct")}
          </Button>
        </div>
        <p className="text-muted-foreground text-sm">{t("description")}</p>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative max-w-sm flex-1">
          <Search
            className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4"
            aria-hidden
          />
          <Input
            type="search"
            placeholder={t("searchPlaceholder")}
            className="pl-8"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            aria-label={t("searchAria")}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          [...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="flex gap-4 p-4">
                <Skeleton className="h-16 w-16 shrink-0 rounded" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : products.length === 0 ? (
          <Card className="border-dashed sm:col-span-2 lg:col-span-3">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="bg-muted rounded-full p-4">
                <ShoppingBag className="text-muted-foreground h-8 w-8" />
              </div>
              <h3 className="text-foreground mt-4 font-medium">
                {t("emptyTitle")}
              </h3>
              <p className="text-muted-foreground mt-1 max-w-sm text-sm">
                {t("emptyDescription")}
              </p>
              <Button
                onClick={() => {
                  setEditingProduct(null);
                  setIsDialogOpen(true);
                }}
                className="mt-4"
              >
                <Plus className="mr-2 h-4 w-4" /> {t("newProduct")}
              </Button>
            </CardContent>
          </Card>
        ) : (
          products.map((p) => (
            <Card
              key={p.id}
              className="relative cursor-pointer transition-shadow hover:shadow-md"
              role="button"
              tabIndex={0}
              onClick={() => {
                setSelectedProduct(p);
                setIsProductModalOpen(true);
              }}
              onKeyDown={(e) => {
                if (e.key !== "Enter" && e.key !== " ") return;
                e.preventDefault();
                setSelectedProduct(p);
                setIsProductModalOpen(true);
              }}
            >
              <CardContent className="flex gap-4 p-4">
                <button
                  type="button"
                  className="bg-muted focus-visible:ring-ring relative h-24 w-24 shrink-0 overflow-hidden rounded-md transition-opacity hover:opacity-90 focus-visible:ring-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedProduct(p);
                    setIsProductModalOpen(true);
                  }}
                  aria-label={t("viewImageAria", { name: p.name })}
                  style={
                    p.image_url
                      ? {
                          backgroundImage: `url(${p.image_url})`,
                          backgroundRepeat: "no-repeat",
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }
                      : undefined
                  }
                >
                  {!p.image_url && (
                    <div className="flex h-full w-full items-center justify-center">
                      <ImageIcon
                        className="text-muted-foreground h-6 w-6"
                        aria-hidden
                      />
                    </div>
                  )}
                </button>
                <div className="min-w-0 flex-1">
                  <button
                    type="button"
                    className="text-foreground line-clamp-2 w-full text-left font-medium hover:underline"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedProduct(p);
                      setIsProductModalOpen(true);
                    }}
                  >
                    {p.name}
                  </button>
                  {p.supplier?.name && (
                    <p className="text-muted-foreground mt-1 truncate text-sm">
                      {p.supplier.name}
                    </p>
                  )}
                  <p className="text-foreground mt-1 text-sm font-medium tabular-nums">
                    {formatCurrency(
                      Number(p.cost_price),
                      p.currency ?? profileDefaults?.default_currency
                    )}
                  </p>
                </div>
              </CardContent>
              <div
                className="absolute right-3 bottom-3 z-10"
                style={{ inset: "auto 0.75rem 0.75rem auto" }}
              >
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      aria-label={t("actionsAria")}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" side="top">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingProduct(p);
                        setIsDialogOpen(true);
                      }}
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      {t("edit")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(p);
                      }}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      {t("delete")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </Card>
          ))
        )}
      </div>

      <ProductDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        product={editingProduct}
        onSuccess={() => {
          setIsDialogOpen(false);
          fetchProducts();
        }}
      />

      <ProductDetailModal
        product={selectedProduct}
        open={isProductModalOpen}
        onOpenChange={setIsProductModalOpen}
      />

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t("confirmDeleteTitle")}
        description={t("confirmDeleteDescription")}
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
      />
    </div>
  );
}
