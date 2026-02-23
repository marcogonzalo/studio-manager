"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { getSupabaseClient } from "@/lib/supabase";
import { reportError, formatCurrency } from "@/lib/utils";
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
        toast.error(
          "No se puede eliminar el producto porque está asociado a un proyecto"
        );
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
        reportError(deleteError, "Error deleting product:");
        if (
          deleteError.code === "42501" ||
          deleteError.message?.includes("permission") ||
          deleteError.message?.includes("policy")
        ) {
          toast.error("No tienes permisos para eliminar este producto");
        } else {
          toast.error(
            `Error al eliminar: ${deleteError.message || "Error desconocido"}`
          );
        }
        return;
      }
      if (!deleted || deleted.length === 0) {
        toast.error(
          "No se pudo eliminar el producto. Verifica que tengas permisos y que el producto no esté asociado a un proyecto."
        );
        fetchProducts();
        return;
      }
      toast.success("Producto eliminado correctamente");
      setDeleteTarget(null);
      fetchProducts();
    } catch (error) {
      reportError(error, "Unexpected error in handleDelete:");
      toast.error("Error inesperado al eliminar el producto");
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
            <h1 className="text-3xl font-bold tracking-tight">
              Catálogo de Productos
            </h1>
          </div>
          <Button
            onClick={() => {
              setEditingProduct(null);
              setIsDialogOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" /> Nuevo Producto
          </Button>
        </div>
        <p className="text-muted-foreground text-sm">
          Productos, referencias y costes para usar en presupuestos.
        </p>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative max-w-sm flex-1">
          <Search
            className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4"
            aria-hidden
          />
          <Input
            type="search"
            placeholder="Buscar por nombre o referencia…"
            className="pl-8"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            aria-label="Buscar productos por nombre o referencia"
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
                No se encontraron productos
              </h3>
              <p className="text-muted-foreground mt-1 max-w-sm text-sm">
                Añade productos al catálogo para usarlos en presupuestos de
                proyectos.
              </p>
              <Button
                onClick={() => {
                  setEditingProduct(null);
                  setIsDialogOpen(true);
                }}
                className="mt-4"
              >
                <Plus className="mr-2 h-4 w-4" /> Nuevo Producto
              </Button>
            </CardContent>
          </Card>
        ) : (
          products.map((p) => (
            <Card key={p.id} className="transition-shadow hover:shadow-md">
              <CardContent className="flex gap-4 p-4">
                <button
                  type="button"
                  className="bg-muted focus-visible:ring-ring relative h-16 w-16 shrink-0 overflow-hidden rounded-md transition-opacity hover:opacity-90 focus-visible:ring-2"
                  onClick={() => {
                    setSelectedProduct(p);
                    setIsProductModalOpen(true);
                  }}
                  aria-label={`Ver imagen de ${p.name}`}
                >
                  {p.image_url ? (
                    <Image
                      src={p.image_url}
                      alt={p.name}
                      width={64}
                      height={64}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <ImageIcon
                        className="text-muted-foreground h-6 w-6"
                        aria-hidden
                      />
                    </div>
                  )}
                </button>
                <div className="min-w-0 flex-1">
                  <p className="text-foreground truncate font-medium">
                    {p.name}
                  </p>
                  <p className="text-muted-foreground font-mono text-xs">
                    {p.reference_code}
                  </p>
                  <div className="text-muted-foreground mt-1 flex flex-wrap gap-x-2 gap-y-0.5 text-sm">
                    {p.category && <span>{p.category}</span>}
                    {p.supplier?.name && (
                      <span className="truncate">{p.supplier.name}</span>
                    )}
                  </div>
                  <p className="text-foreground mt-1 text-sm font-medium tabular-nums">
                    {formatCurrency(
                      Number(p.cost_price),
                      p.currency ?? profileDefaults?.default_currency
                    )}
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Acciones del producto"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => {
                        setEditingProduct(p);
                        setIsDialogOpen(true);
                      }}
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDeleteClick(p)}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardContent>
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
        title="¿Eliminar producto?"
        description="Esta acción no se puede deshacer. No podrá eliminarse si está asociado a un proyecto."
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
      />
    </div>
  );
}
