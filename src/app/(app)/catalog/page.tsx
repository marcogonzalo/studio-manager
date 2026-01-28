'use client';

import { useEffect, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Image as ImageIcon,
  MoreVertical,
  ShoppingBag,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ProductDialog } from '@/components/dialogs/product-dialog';
import { ProductDetailModal } from '@/components/product-detail-modal';
import { toast } from 'sonner';

import type { Product } from '@/types';

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const supabase = getSupabaseClient();

  const fetchProducts = async () => {
    setLoading(true);
    let query = supabase
      .from('products')
      .select('*, supplier:suppliers(name)')
      .order('name');
    if (search)
      query = query.or(`name.ilike.%${search}%,reference_code.ilike.%${search}%`);

    const { data, error } = await query;
    if (!error) setProducts(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, [search]);

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar producto?')) return;
    
    try {
      // Verificar si puede ser eliminado
      const { canDeleteProduct } = await import('@/lib/validation');
      const canDelete = await canDeleteProduct(id);
      
      if (!canDelete) {
        toast.error('No se puede eliminar el producto porque está asociado a un proyecto');
        return;
      }
      
      const { error, data } = await supabase.from('products').delete().eq('id', id).select();
      
      if (error) {
        console.error('Error deleting product:', error);
        // Error específico para permisos RLS
        if (error.code === '42501' || error.message?.includes('permission') || error.message?.includes('policy')) {
          toast.error('No tienes permisos para eliminar este producto');
        } else {
          toast.error(`Error al eliminar: ${error.message || 'Error desconocido'}`);
        }
        return;
      }
      
      // Verificar que realmente se eliminó
      if (!data || data.length === 0) {
        // Si no hay error pero tampoco datos, puede ser que RLS bloqueó silenciosamente
        toast.error('No se pudo eliminar el producto. Verifica que tengas permisos y que el producto no esté asociado a un proyecto.');
        fetchProducts(); // Refrescar para actualizar la lista
        return;
      }
      
      toast.success('Producto eliminado correctamente');
      fetchProducts();
    } catch (error) {
      console.error('Unexpected error in handleDelete:', error);
      toast.error('Error inesperado al eliminar el producto');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <ShoppingBag className="h-8 w-8 text-primary" />
          <h2 className="text-3xl font-bold">Catálogo de Productos</h2>
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

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o referencia..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="border rounded-md bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Img</TableHead>
              <TableHead>Referencia</TableHead>
              <TableHead>Producto</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Proveedor</TableHead>
              <TableHead className="text-right">Costo</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10">
                  Cargando...
                </TableCell>
              </TableRow>
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10">
                  No se encontraron productos
                </TableCell>
              </TableRow>
            ) : (
              products.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    {p.image_url ? (
                      <img
                        src={p.image_url}
                        alt={p.name}
                        className="w-10 h-10 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => {
                          setSelectedProduct(p);
                          setIsProductModalOpen(true);
                        }}
                      />
                    ) : (
                      <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                        <ImageIcon className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {p.reference_code}
                  </TableCell>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>{p.category}</TableCell>
                  <TableCell>{p.supplier?.name}</TableCell>
                  <TableCell className="text-right">
                    {new Intl.NumberFormat('es-ES', {
                      style: 'currency',
                      currency: 'EUR',
                    }).format(p.cost_price)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
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
                          onClick={() => handleDelete(p.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
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
    </div>
  );
}
