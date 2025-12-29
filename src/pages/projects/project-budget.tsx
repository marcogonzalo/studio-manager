import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, Printer, Pencil } from 'lucide-react';
import { AddItemDialog } from '@/components/dialogs/add-item-dialog';
import { ProductDetailModal } from '@/components/product-detail-modal';
import { toast } from 'sonner';
import { useAuth } from '@/components/auth-provider';

import type { AdditionalCost, Project } from '@/types';

const COST_TYPE_LABELS: Record<string, string> = {
  shipping: 'Envío',
  packaging: 'Embalaje',
  installation: 'Instalación',
  assembly: 'Montaje',
  transport: 'Transporte',
  insurance: 'Seguro',
  customs: 'Aduanas',
  storage: 'Almacenamiento',
  handling: 'Manejo',
  other: 'Otro',
};

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
  const { user } = useAuth();
  const [items, setItems] = useState<ProjectItem[]>([]);
  const [additionalCosts, setAdditionalCosts] = useState<AdditionalCost[]>([]);
  const [project, setProject] = useState<Project & { client?: { full_name: string; email?: string; phone?: string; address?: string } } | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ProjectItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<ProjectItem | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    
    // Fetch project with client info
    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .select('*, client:clients(full_name, email, phone, address)')
      .eq('id', projectId)
      .single();
    
    if (!projectError && projectData) {
      setProject(projectData);
    }
    
    const { data, error } = await supabase
      .from('project_items')
      .select('*, space:spaces(name), product:products(supplier:suppliers(name), description, reference_code, category)')
      .eq('project_id', projectId)
      .order('created_at');
    
    if (!error) setItems(data || []);
    
    // Fetch additional costs
    const { data: costsData, error: costsError } = await supabase
      .from('additional_project_costs')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at');
    
    if (!costsError) setAdditionalCosts(costsData || []);
    
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

  const handleGeneratePDF = async () => {
    if (!project) {
      toast.error('No se pudo cargar la información del proyecto');
      return;
    }

    setIsGeneratingPDF(true);
    try {
      // Dynamic import to avoid issues with Vite
      const { generateProjectPDF } = await import('@/lib/pdf-generator');
      
      // Get architect name from user metadata or profile
      const architectName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Arquitecto/a';
      
      const asPdf = await generateProjectPDF(project, items, additionalCosts, 21, architectName);
      const blob = await asPdf.toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Presupuesto_${project.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('PDF generado correctamente');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Error al generar el PDF');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const totalCost = items.reduce((sum, item) => sum + (item.unit_cost * item.quantity), 0);
  const totalPrice = items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
  const totalAdditionalCosts = additionalCosts.reduce((sum, cost) => sum + Number(cost.amount), 0);
  const grandTotal = totalPrice + totalAdditionalCosts;

  // Group additional costs by type
  const costsByType = additionalCosts.reduce((acc, cost) => {
    if (!acc[cost.cost_type]) {
      acc[cost.cost_type] = [];
    }
    acc[cost.cost_type].push(cost);
    return acc;
  }, {} as Record<string, AdditionalCost[]>);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h3 className="text-lg font-medium">Presupuesto y Compras</h3>
          <div className="text-sm text-gray-500">
            Total Costo: ${totalCost.toFixed(2)} | Total Venta: ${totalPrice.toFixed(2)} | Margen: ${ (totalPrice - totalCost).toFixed(2) }
            {additionalCosts.length > 0 && ` | Costes Adicionales: ${totalAdditionalCosts.toFixed(2)} | Total General: ${grandTotal.toFixed(2)}`}
          </div>
        </div>
        <div className="space-x-2 flex">
          <Button 
            variant="outline" 
            onClick={handleGeneratePDF} 
            className="print:hidden"
            disabled={isGeneratingPDF || !project}
          >
            <Printer className="mr-2 h-4 w-4" /> 
            {isGeneratingPDF ? 'Generando PDF...' : 'Exportar PDF'}
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
                  {item.image_url && (
                    <img 
                      src={item.image_url} 
                      className="w-8 h-8 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => {
                        setSelectedItem(item);
                        setIsProductModalOpen(true);
                      }}
                      alt={item.name}
                    />
                  )}
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

      {/* Additional Costs Section - Visible in print and screen */}
      {additionalCosts.length > 0 && (
        <div className="mt-8 space-y-4">
          <h4 className="text-lg font-semibold">Costes Adicionales</h4>
          {Object.entries(costsByType).map(([type, typeCosts]) => {
            const typeTotal = typeCosts.reduce((sum, cost) => sum + Number(cost.amount), 0);
            return (
              <div key={type} className="border rounded-md bg-white dark:bg-gray-800">
                <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border-b">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{COST_TYPE_LABELS[type] || type}</span>
                    <span className="font-semibold">Total: ${typeTotal.toFixed(2)}</span>
                  </div>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Descripción</TableHead>
                      <TableHead className="text-right">Importe</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {typeCosts.map((cost) => (
                      <TableRow key={cost.id}>
                        <TableCell>
                          {cost.description || <span className="text-gray-400 italic">Sin descripción</span>}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ${Number(cost.amount).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            );
          })}
          <div className="flex justify-end pt-4 border-t">
            <div className="text-right space-y-1">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Subtotal Ítems: ${totalPrice.toFixed(2)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Costes Adicionales: ${totalAdditionalCosts.toFixed(2)}
              </div>
              <div className="text-lg font-bold pt-2 border-t">
                Total General: ${grandTotal.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      )}

      <AddItemDialog 
        open={isDialogOpen} 
        onOpenChange={handleDialogClose} 
        projectId={projectId}
        item={editingItem}
        onSuccess={() => { setIsDialogOpen(false); setEditingItem(null); fetchItems(); }}
      />

      <ProductDetailModal
        open={isProductModalOpen}
        onOpenChange={setIsProductModalOpen}
        projectItem={selectedItem}
      />
    </div>
  );
}

