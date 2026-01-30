import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { AddItemDialog } from "@/components/dialogs/add-item-dialog";
import { ProductDetailModal } from "@/components/product-detail-modal";
import type { Space } from "@/types";
import type { ProjectItem } from "@/modules/app/projects/project-budget";

interface SpaceProductsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  space: Space;
  projectId: string;
}

export function SpaceProductsDialog({
  open,
  onOpenChange,
  space,
  projectId,
}: SpaceProductsDialogProps) {
  const [items, setItems] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ProjectItem | null>(null);
  const [selectedItem, setSelectedItem] = useState<ProjectItem | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("project_items")
      .select(
        "*, product:products(supplier:suppliers(name), description, reference_code, category), purchase_order:purchase_orders(order_number, status, delivery_deadline, delivery_date)"
      )
      .eq("space_id", space.id)
      .order("created_at");

    if (!error) setItems(data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (open) fetchItems();
  }, [open, space.id]);

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar producto del espacio?")) return;
    await supabase.from("project_items").delete().eq("id", id);
    toast.success("Producto eliminado");
    fetchItems();
  };

  const handleEdit = (item: ProjectItem) => {
    setEditingItem(item);
    setIsAddDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingItem(null);
    setIsAddDialogOpen(true);
  };

  const handleDialogClose = (open: boolean) => {
    setIsAddDialogOpen(open);
    if (!open) {
      setEditingItem(null);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="flex max-h-[80vh] max-w-4xl flex-col">
          <DialogHeader>
            <DialogTitle className="text-2xl">{space.name}</DialogTitle>
            <p className="text-muted-foreground mt-1 text-sm">
              {space.description || "Sin descripción"}
            </p>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto py-4">
            {loading ? (
              <div className="text-muted-foreground py-8 text-center">
                Cargando...
              </div>
            ) : items.length === 0 ? (
              <div className="rounded-lg border border-dashed py-12 text-center">
                <p className="text-muted-foreground mb-4">
                  No hay productos en este espacio
                </p>
                <Button onClick={handleAddNew} variant="outline" size="sm">
                  <Plus className="mr-2 h-4 w-4" /> Añadir primer producto
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className={`bg-card overflow-hidden rounded-lg border transition-shadow hover:shadow-md ${item.is_excluded ? "opacity-50 grayscale" : ""}`}
                  >
                    <div
                      className="bg-secondary/30 dark:bg-muted relative aspect-square cursor-pointer"
                      onClick={() => {
                        setSelectedItem(item);
                        setIsProductModalOpen(true);
                      }}
                    >
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="h-full w-full object-cover transition-opacity hover:opacity-90"
                        />
                      ) : (
                        <div className="text-muted-foreground flex h-full w-full items-center justify-center">
                          Sin imagen
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      {item.is_excluded && (
                        <div className="text-muted-foreground mb-1 text-xs italic">
                          Excluido del proyecto
                        </div>
                      )}
                      <h4 className="mb-1 truncate text-sm font-medium">
                        {item.product?.name || item.name}
                      </h4>
                      {item.internal_reference && (
                        <p className="text-muted-foreground mb-1 font-mono text-xs">
                          Cód.: {item.internal_reference}
                        </p>
                      )}
                      <p className="text-muted-foreground mb-2 text-xs">
                        {item.product?.supplier?.name || "-"}
                      </p>
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-muted-foreground text-xs">
                          Cant: {item.quantity}
                        </span>
                        <span className="text-sm font-medium">
                          ${item.unit_price.toFixed(2)}
                        </span>
                      </div>
                      <div className="border-t pt-2 text-right text-xs font-bold">
                        Total: ${(item.unit_price * item.quantity).toFixed(2)}
                      </div>
                      <div className="mt-2 flex justify-end">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <MoreVertical className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(item)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(item.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" onClick={handleAddNew}>
              <Plus className="mr-2 h-4 w-4" /> Añadir Producto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AddItemDialog
        open={isAddDialogOpen}
        onOpenChange={handleDialogClose}
        projectId={projectId}
        item={editingItem}
        spaceId={space.id}
        onSuccess={() => {
          setIsAddDialogOpen(false);
          setEditingItem(null);
          fetchItems();
        }}
      />

      <ProductDetailModal
        open={isProductModalOpen}
        onOpenChange={setIsProductModalOpen}
        projectItem={selectedItem}
        projectId={projectId}
        onEdit={() => {
          setIsProductModalOpen(false);
          handleEdit(selectedItem!);
        }}
      />
    </>
  );
}
