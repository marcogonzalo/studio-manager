import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, ShoppingCart, Printer, Pencil } from 'lucide-react';
import { AddItemDialog } from './add-item-dialog';
import { toast } from 'sonner';

import type { Product, Space } from '@/types';

export interface ProjectItem {
  id: string;
  name: string;
  description: string;
  space_id: string | null;
  product_id: string | null;
  space?: { name: string };
  quantity: number;
  unit_cost: number;
  markup: number;
  unit_price: number;
  status: string;
  image_url: string;
  supplier_id?: string; // from product or adhoc
  product?: { supplier?: { name: string } };
}

export function ProjectBudget({ projectId }: { projectId: string }) {
  const [items, setItems] = useState<ProjectItem[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ProjectItem | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('project_items')
      .select('*, space:spaces(name), product:products(supplier:suppliers(name))')
      .eq('project_id', projectId)
      .order('created_at');
    
    if (!error) setItems(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, [projectId]);

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar ítem?')) return;
    await supabase.from('project_items').delete().eq('id', id);
    toast.success('Ítem eliminado');
    fetchItems();
  };

  const handleEdit = (item: ProjectItem) => {
    setEditingItem(item);
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingItem(null);
    setIsDialogOpen(true);
  };

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setEditingItem(null);
    }
  };

  const totalCost = items.reduce((sum, item) => sum + (item.unit_cost * item.quantity), 0);
  const totalPrice = items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h3 className="text-lg font-medium">Presupuesto y Compras</h3>
          <div className="text-sm text-gray-500">
            Total Costo: ${totalCost.toFixed(2)} | Total Venta: ${totalPrice.toFixed(2)} | Margen: ${ (totalPrice - totalCost).toFixed(2) }
          </div>
        </div>
        <div className="space-x-2 flex">
          <Button variant="outline" onClick={() => window.print()} className="print:hidden">
            <Printer className="mr-2 h-4 w-4" /> Exportar PDF
          </Button>
          <Button onClick={handleAddNew} className="print:hidden">
            <Plus className="mr-2 h-4 w-4" /> Añadir Ítem
          </Button>
        </div>
      </div>

      <div className="border rounded-md bg-white dark:bg-gray-800">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Img</TableHead>
              <TableHead>Ítem</TableHead>
              <TableHead>Ubicación</TableHead>
              <TableHead className="text-right">Cant.</TableHead>
              <TableHead className="text-right">Costo Unit.</TableHead>
              <TableHead className="text-right">Precio Venta</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  {item.image_url && <img src={item.image_url} className="w-8 h-8 object-cover rounded" />}
                </TableCell>
                <TableCell>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-xs text-gray-500">{item.product?.supplier?.name || '-'}</div>
                </TableCell>
                <TableCell>{item.space?.name || 'General'}</TableCell>
                <TableCell className="text-right">{item.quantity}</TableCell>
                <TableCell className="text-right text-gray-500">${item.unit_cost.toFixed(2)}</TableCell>
                <TableCell className="text-right font-medium">${item.unit_price.toFixed(2)}</TableCell>
                <TableCell className="capitalize text-xs">{item.status}</TableCell>
                <TableCell className="text-right font-bold">${(item.unit_price * item.quantity).toFixed(2)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" className="text-blue-500 hover:text-blue-600" onClick={() => handleEdit(item)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(item.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {items.length === 0 && <TableRow><TableCell colSpan={9} className="text-center py-8">No hay ítems.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>

      <AddItemDialog 
        open={isDialogOpen} 
        onOpenChange={handleDialogClose} 
        projectId={projectId}
        item={editingItem}
        onSuccess={() => { setIsDialogOpen(false); setEditingItem(null); fetchItems(); }}
      />
    </div>
  );
}

