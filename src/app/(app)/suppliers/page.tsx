"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  ExternalLink,
  MoreVertical,
  Truck,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SupplierDialog } from "@/components/dialogs/supplier-dialog";
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useDebouncedState } from "@/lib/use-debounced-value";

import type { Supplier } from "@/types";

function getWebsiteHostname(website: string): string {
  const normalized =
    website.startsWith("http://") || website.startsWith("https://")
      ? website
      : `https://${website}`;
  try {
    return new URL(normalized).hostname.replace(/^www\./, "");
  } catch {
    return website.replace(/^https?:\/\//, "").replace(/^www\./, "");
  }
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, searchDebounced, setSearchInput] = useDebouncedState(
    "",
    500
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Supplier | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const supabase = getSupabaseClient();

  const fetchSuppliers = async () => {
    setLoading(true);
    let query = supabase.from("suppliers").select("*").order("name");
    if (searchDebounced) query = query.ilike("name", `%${searchDebounced}%`);
    const { data, error } = await query;
    if (!error) setSuppliers(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchSuppliers();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run when searchDebounced changes only
  }, [searchDebounced]);

  const handleDeleteClick = (s: Supplier) => setDeleteTarget(s);

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    setDeleteLoading(true);
    try {
      const { canDeleteSupplier } = await import("@/lib/validation");
      const canDelete = await canDeleteSupplier(id);
      if (!canDelete) {
        toast.error(
          "No se puede eliminar el proveedor porque está asociado a productos u órdenes de compra en proyectos"
        );
        setDeleteTarget(null);
        return;
      }
      const { error } = await supabase.from("suppliers").delete().eq("id", id);
      if (error) {
        toast.error("Error al eliminar");
        return;
      }
      toast.success("Proveedor eliminado");
      setDeleteTarget(null);
      fetchSuppliers();
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Truck className="text-primary h-8 w-8" />
            <h1 className="text-3xl font-bold tracking-tight">Proveedores</h1>
          </div>
          <Button
            onClick={() => {
              setEditingSupplier(null);
              setIsDialogOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" /> Nuevo Proveedor
          </Button>
        </div>
        <p className="text-muted-foreground text-sm">
          Gestiona proveedores y sus datos de contacto para el catálogo y las
          compras.
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
            placeholder="Buscar proveedores…"
            className="pl-8"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            aria-label="Buscar proveedores"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          [...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="mb-2 h-5 w-3/4" />
                <Skeleton className="mb-1 h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))
        ) : suppliers.length === 0 ? (
          <Card className="border-dashed sm:col-span-2 lg:col-span-3">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="bg-muted rounded-full p-4">
                <Truck className="text-muted-foreground h-8 w-8" />
              </div>
              <h3 className="text-foreground mt-4 font-medium">
                No se encontraron proveedores
              </h3>
              <p className="text-muted-foreground mt-1 max-w-sm text-sm">
                Añade proveedores para asociarlos a productos del catálogo.
              </p>
              <Button
                onClick={() => {
                  setEditingSupplier(null);
                  setIsDialogOpen(true);
                }}
                className="mt-4"
              >
                <Plus className="mr-2 h-4 w-4" /> Nuevo Proveedor
              </Button>
            </CardContent>
          </Card>
        ) : (
          suppliers.map((s) => (
            <Card key={s.id} className="transition-shadow hover:shadow-md">
              <CardContent className="flex items-start justify-between gap-2 p-4">
                <div className="min-w-0 flex-1">
                  <p className="text-foreground font-medium">{s.name}</p>
                  {s.contact_name && (
                    <p className="text-muted-foreground mt-0.5 text-sm">
                      {s.contact_name}
                    </p>
                  )}
                  <div className="text-muted-foreground mt-1 space-y-0.5 text-sm">
                    {s.email && <p className="truncate">{s.email}</p>}
                    {s.phone && <p className="truncate">{s.phone}</p>}
                  </div>
                  {s.website && (
                    <a
                      href={
                        s.website.startsWith("http")
                          ? s.website
                          : `https://${s.website}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary mt-1 inline-flex items-center gap-1 text-sm hover:underline"
                    >
                      <span className="truncate">
                        {getWebsiteHostname(s.website)}
                      </span>
                      <ExternalLink className="h-3 w-3 shrink-0" aria-hidden />
                    </a>
                  )}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Acciones del proveedor"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => {
                        setEditingSupplier(s);
                        setIsDialogOpen(true);
                      }}
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDeleteClick(s)}
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

      <SupplierDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        supplier={editingSupplier}
        onSuccess={() => {
          setIsDialogOpen(false);
          fetchSuppliers();
        }}
      />

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="¿Eliminar proveedor?"
        description="Esta acción no se puede deshacer. No podrá eliminarse si está asociado a productos u órdenes de compra."
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
      />
    </div>
  );
}
