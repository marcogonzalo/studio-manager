import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, Pencil, DollarSign, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AdditionalCostDialog } from '@/components/dialogs/additional-cost-dialog';
import { toast } from 'sonner';
import type { AdditionalCost } from '@/types';

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

export function ProjectAdditionalCosts({ projectId }: { projectId: string }) {
  const [costs, setCosts] = useState<AdditionalCost[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCost, setEditingCost] = useState<AdditionalCost | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCosts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('additional_project_costs')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });
    
    if (error) {
      toast.error('Error al cargar costes adicionales');
    } else {
      setCosts(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCosts();
  }, [projectId]);

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este coste adicional?')) return;
    const { error } = await supabase
      .from('additional_project_costs')
      .delete()
      .eq('id', id);
    
    if (error) {
      toast.error('Error al eliminar coste adicional');
    } else {
      toast.success('Coste adicional eliminado');
      fetchCosts();
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

  // Group costs by type
  const costsByType = costs.reduce((acc, cost) => {
    if (!acc[cost.cost_type]) {
      acc[cost.cost_type] = [];
    }
    acc[cost.cost_type].push(cost);
    return acc;
  }, {} as Record<string, AdditionalCost[]>);

  const totalAmount = costs.reduce((sum, cost) => sum + Number(cost.amount), 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h3 className="text-lg font-medium">Costes Adicionales</h3>
          <div className="text-sm text-gray-500">
            Total: ${totalAmount.toFixed(2)}
          </div>
        </div>
        <Button onClick={handleAddNew} className="print:hidden">
          <Plus className="mr-2 h-4 w-4" /> Añadir Coste
        </Button>
      </div>

      {loading ? (
        <p className="text-center py-8 text-gray-500">Cargando...</p>
      ) : costs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <DollarSign className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">No hay costes adicionales registrados.</p>
            <Button onClick={handleAddNew} className="mt-4">
              <Plus className="mr-2 h-4 w-4" /> Añadir Primer Coste
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Grouped view by cost type */}
          {Object.entries(costsByType).map(([type, typeCosts]) => {
            const typeTotal = typeCosts.reduce((sum, cost) => sum + Number(cost.amount), 0);
            return (
              <Card key={type}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-base">
                        {COST_TYPE_LABELS[type] || type}
                      </CardTitle>
                      <CardDescription>
                        {typeCosts.length} {typeCosts.length === 1 ? 'coste' : 'costes'} • Total: ${typeTotal.toFixed(2)}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Descripción</TableHead>
                          <TableHead className="text-right">Importe</TableHead>
                          <TableHead className="text-right">Acciones</TableHead>
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
                            <TableCell className="text-right">
                              <div className="flex justify-end">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleEdit(cost)}>
                                      <Pencil className="mr-2 h-4 w-4" />
                                      Editar
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      onClick={() => handleDelete(cost.id)}
                                      className="text-red-600 dark:text-red-400"
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Eliminar
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {/* Summary card */}
          <Card className="bg-gray-50 dark:bg-gray-900/50">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total General</span>
                <span className="text-2xl font-bold">${totalAmount.toFixed(2)}</span>
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
    </div>
  );
}


