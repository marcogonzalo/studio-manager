import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { AddItemDialog } from './add-item-dialog';
import { ProductDetailModal } from '@/components/product-detail-modal';
import type { Space } from '@/types';
import type { ProjectItem } from './project-budget';

interface SpaceProductsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  space: Space;
  projectId: string;
}

export function SpaceProductsDialog({ open, onOpenChange, space, projectId }: SpaceProductsDialogProps) {
  const [items, setItems] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ProjectItem | null>(null);
  const [selectedItem, setSelectedItem] = useState<ProjectItem | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('project_items')
      .select('*, product:products(supplier:suppliers(name), description, reference_code, category)')
      .eq('space_id', space.id)
      .order('created_at');
    
    if (!error) setItems(data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (open) fetchItems();
  }, [open, space.id]);

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar producto del espacio?')) return;
    await supabase.from('project_items').delete().eq('id', id);
    toast.success('Producto eliminado');
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
        <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-2xl">{space.name}</DialogTitle>
            <p className="text-sm text-gray-500 mt-1">{space.description || "Sin descripción"}</p>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto py-4">
            {loading ? (
              <div className="text-center py-8 text-gray-500">Cargando...</div>
            ) : items.length === 0 ? (
              <div className="text-center py-12 border border-dashed rounded-lg">
                <p className="text-gray-500 mb-4">No hay productos en este espacio</p>
                <Button onClick={handleAddNew} variant="outline" size="sm">
                  <Plus className="mr-2 h-4 w-4" /> Añadir primer producto
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {items.map((item) => (
                  <div key={item.id} className="border rounded-lg overflow-hidden bg-white dark:bg-gray-800 hover:shadow-md transition-shadow">
                    <div 
                      className="aspect-square bg-gray-100 dark:bg-gray-700 relative cursor-pointer"
                      onClick={() => {
                        setSelectedItem(item);
                        setIsProductModalOpen(true);
                      }}
                    >
                      {item.image_url ? (
                        <img 
                          src={item.image_url} 
                          alt={item.name}
                          className="w-full h-full object-cover hover:opacity-90 transition-opacity"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          Sin imagen
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h4 className="font-medium text-sm mb-1 truncate">{item.name}</h4>
                      <p className="text-xs text-gray-500 mb-2">{item.product?.supplier?.name || '-'}</p>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-gray-500">Cant: {item.quantity}</span>
                        <span className="text-sm font-medium">${item.unit_price.toFixed(2)}</span>
                      </div>
                      <div className="text-xs font-bold text-right border-t pt-2">
                        Total: ${(item.unit_price * item.quantity).toFixed(2)}
                      </div>
                      <div className="flex gap-1 mt-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 text-blue-500 hover:text-blue-600" 
                          onClick={() => handleEdit(item)}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 text-red-500 hover:text-red-600" 
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
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
      />
    </>
  );
}

