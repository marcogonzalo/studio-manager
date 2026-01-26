'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, Trash2, Pencil, ChevronDown, TrendingUp, TrendingDown, Minus, Eye, EyeOff, MoreVertical } from 'lucide-react';
import { BudgetLineDialog } from '@/components/dialogs/budget-line-dialog';
import { toast } from 'sonner';
import { 
  getBudgetCategoryLabel, 
  getBudgetSubcategoryLabel,
  getPhaseLabel,
  COST_CATEGORIES,
  isCostCategory
} from '@/lib/utils';

import type { ProjectBudgetLine, BudgetCategory } from '@/types';

interface ProjectItem {
  id: string;
  name: string;
  quantity: number;
  unit_cost: number;
  unit_price: number;
}

export function ProjectCostControl({ projectId }: { projectId: string }) {
  const [budgetLines, setBudgetLines] = useState<ProjectBudgetLine[]>([]);
  const [items, setItems] = useState<ProjectItem[]>([]);
  const [isBudgetLineDialogOpen, setIsBudgetLineDialogOpen] = useState(false);
  const [editingBudgetLine, setEditingBudgetLine] = useState<ProjectBudgetLine | null>(null);
  const [loading, setLoading] = useState(true);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    construction: true,
    external_services: true,
    operations: true,
    products: true,
  });

  const fetchData = async () => {
    setLoading(true);
    
    // Fetch ALL budget lines (including internal)
    const { data: budgetLinesData, error: budgetLinesError } = await supabase
      .from('project_budget_lines')
      .select('*, supplier:suppliers(name)')
      .eq('project_id', projectId)
      .order('category')
      .order('created_at');
    
    if (budgetLinesError) {
      // Table might not exist yet - silently handle it
      if (budgetLinesError.code === '42P01' || budgetLinesError.message?.includes('does not exist')) {
        console.warn('Table project_budget_lines does not exist yet. Please run migrations.');
        setBudgetLines([]);
      } else {
        console.error('Error fetching budget lines:', budgetLinesError);
        setBudgetLines([]);
      }
    } else {
      // Solo cargar partidas que son costes (excluir own_fees que son ingresos)
      setBudgetLines(budgetLinesData?.filter(line => isCostCategory(line.category)) || []);
    }
    
    // Fetch project items for cost summary
    const { data: itemsData, error: itemsError } = await supabase
      .from('project_items')
      .select('id, name, quantity, unit_cost, unit_price')
      .eq('project_id', projectId);
    
    if (!itemsError) setItems(itemsData || []);
    
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [projectId]);

  const handleDeleteBudgetLine = async (id: string) => {
    if (!confirm('¿Eliminar partida?')) return;
    const { error } = await supabase.from('project_budget_lines').delete().eq('id', id);
    if (error) {
      toast.error('Error al eliminar la partida');
      console.error('Error deleting budget line:', error);
    } else {
      toast.success('Partida eliminada');
      fetchData();
    }
  };

  const handleEditBudgetLine = (line: ProjectBudgetLine) => {
    setEditingBudgetLine(line);
    setIsBudgetLineDialogOpen(true);
  };

  const handleAddBudgetLine = () => {
    try {
      setEditingBudgetLine(null);
      setIsBudgetLineDialogOpen(true);
    } catch (error) {
      console.error('Error opening budget line dialog:', error);
      toast.error('Error al abrir el diálogo');
    }
  };

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Group budget lines by category
  const budgetLinesByCategory = budgetLines.reduce((acc, line) => {
    if (!acc[line.category]) {
      acc[line.category] = [];
    }
    acc[line.category].push(line);
    return acc;
  }, {} as Record<BudgetCategory, ProjectBudgetLine[]>);

  // Calculate totals
  const totalProductsCost = items.reduce((sum, item) => sum + (item.unit_cost * item.quantity), 0);
  const totalProductsPrice = items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
  
  // Total budget lines (estimated and actual)
  const totalBudgetLinesEstimated = budgetLines.reduce((sum, line) => sum + Number(line.estimated_amount), 0);
  const totalBudgetLinesActual = budgetLines.reduce((sum, line) => sum + Number(line.actual_amount), 0);
  
  // Grand totals (budget lines + products)
  const grandTotalEstimated = totalBudgetLinesEstimated + totalProductsCost;
  const grandTotalActual = totalBudgetLinesActual + totalProductsCost;
  
  // Deviation percentage (actual / estimated * 100)
  const deviationPercentage = grandTotalEstimated > 0 
    ? (grandTotalActual / grandTotalEstimated) * 100 
    : 0;
  
  // Get bar color based on deviation
  const getDeviationBarColor = (percentage: number) => {
    if (percentage < 100) return 'bg-green-500';
    if (percentage <= 101) return 'bg-yellow-500';
    return 'bg-red-500';
  };
  
  const getDeviationTextColor = (percentage: number) => {
    if (percentage < 100) return 'text-green-600 dark:text-green-400';
    if (percentage <= 101) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  const getDeviationIndicator = (estimated: number, actual: number) => {
    if (estimated === 0 && actual === 0) return { icon: Minus, color: 'text-gray-400', text: '-' };
    if (actual === 0) return { icon: Minus, color: 'text-gray-400', text: 'Pendiente' };
    
    const deviation = ((actual - estimated) / estimated) * 100;
    
    if (deviation > 5) {
      return { icon: TrendingUp, color: 'text-red-500', text: `+${deviation.toFixed(1)}%` };
    } else if (deviation < -5) {
      return { icon: TrendingDown, color: 'text-green-500', text: `${deviation.toFixed(1)}%` };
    }
    return { icon: Minus, color: 'text-gray-500', text: `${deviation >= 0 ? '+' : ''}${deviation.toFixed(1)}%` };
  };

  // Order of categories to display (solo categorías de coste, excluye own_fees)
  const categoryOrder: BudgetCategory[] = COST_CATEGORIES;

  if (loading) {
    return <div className="text-center py-12">Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h3 className="text-lg font-medium">Control de Costes</h3>
          <p className="text-sm text-gray-500">
            Seguimiento interno de estimado vs real
          </p>
        </div>
        <Button onClick={handleAddBudgetLine}>
          <Plus className="mr-2 h-4 w-4" /> Nueva Partida
        </Button>
      </div>

      {/* Cost Totalization Summary */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-3">
            {/* Totals row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-xs text-muted-foreground">Total Estimado</p>
                <p className="text-xl font-bold">{formatCurrency(grandTotalEstimated)}</p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-xs text-muted-foreground">Total Real</p>
                <p className="text-xl font-bold">{formatCurrency(grandTotalActual)}</p>
              </div>
            </div>
            
            {/* Deviation bar with percentage */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${getDeviationBarColor(deviationPercentage)} transition-all duration-300`}
                  style={{ width: `${Math.min(deviationPercentage, 100)}%` }}
                />
              </div>
              <span className={`text-sm font-semibold min-w-[60px] text-right ${getDeviationTextColor(deviationPercentage)}`}>
                {deviationPercentage.toFixed(1)}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Budget Lines by Category */}
      {categoryOrder.map((category) => {
        const lines = budgetLinesByCategory[category] || [];
        if (lines.length === 0) return null;
        
        const categoryEstimated = lines.reduce((sum, line) => sum + Number(line.estimated_amount), 0);
        const categoryActual = lines.reduce((sum, line) => sum + Number(line.actual_amount), 0);
        const categoryDeviation = getDeviationIndicator(categoryEstimated, categoryActual);
        
        return (
          <Collapsible 
            key={category} 
            open={openSections[category]} 
            onOpenChange={() => toggleSection(category)}
          >
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <ChevronDown className={`h-4 w-4 transition-transform ${openSections[category] ? '' : '-rotate-90'}`} />
                      {getBudgetCategoryLabel(category)}
                    </CardTitle>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          Est: {formatCurrency(categoryEstimated)}
                        </p>
                        <p className="font-semibold">
                          Real: {formatCurrency(categoryActual)}
                        </p>
                      </div>
                      <div className={`flex items-center gap-1 ${categoryDeviation.color}`}>
                        <categoryDeviation.icon className="h-4 w-4" />
                        <span className="text-sm font-medium">{categoryDeviation.text}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Concepto</TableHead>
                        <TableHead>Descripción</TableHead>
                        <TableHead>Fase</TableHead>
                        <TableHead className="text-right">Estimado</TableHead>
                        <TableHead className="text-right">Real</TableHead>
                        <TableHead className="text-right">Desviación</TableHead>
                        <TableHead className="w-[100px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {lines.map((line) => {
                        const deviation = getDeviationIndicator(
                          Number(line.estimated_amount), 
                          Number(line.actual_amount)
                        );
                        return (
                          <TableRow key={line.id}>
                            <TableCell className="font-medium">
                              {getBudgetSubcategoryLabel(category, line.subcategory)}
                            </TableCell>
                            <TableCell className="text-gray-500 max-w-[200px] truncate">
                              {line.description || '-'}
                            </TableCell>
                            <TableCell className="text-xs text-gray-500">
                              {line.phase ? getPhaseLabel(line.phase) : '-'}
                            </TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(Number(line.estimated_amount))}
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              {formatCurrency(Number(line.actual_amount))}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className={`flex items-center justify-end gap-1 ${deviation.color}`}>
                                <deviation.icon className="h-3 w-3" />
                                <span className="text-sm">{deviation.text}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex justify-end items-center gap-2">
                                {line.is_internal_cost ? (
                                  <span title="Coste interno (no visible para cliente)">
                                    <EyeOff className="h-4 w-4 text-gray-400" />
                                  </span>
                                ) : (
                                  <span title="Visible para cliente">
                                    <Eye className="h-4 w-4 text-gray-400" />
                                  </span>
                                )}
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleEditBudgetLine(line)}>
                                      <Pencil className="mr-2 h-4 w-4" />
                                      Editar
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      onClick={() => handleDeleteBudgetLine(line.id)}
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
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        );
      })}

      {/* Products Cost Summary */}
      <Collapsible 
        open={openSections.products} 
        onOpenChange={() => toggleSection('products')}
      >
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2 text-base">
                  <ChevronDown className={`h-4 w-4 transition-transform ${openSections.products ? '' : '-rotate-90'}`} />
                  Coste de Productos
                </CardTitle>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      Precio Venta: {formatCurrency(totalProductsPrice)}
                    </p>
                    <p className="font-semibold">
                      Coste: {formatCurrency(totalProductsCost)}
                    </p>
                  </div>
                  <div className="text-green-500 flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      Margen: {formatCurrency(totalProductsPrice - totalProductsCost)}
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground mb-4">
                Resumen de costes de adquisición de los productos del proyecto.
                El detalle de productos se gestiona en la pestaña "Presupuesto".
              </p>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Coste</p>
                  <p className="text-xl font-bold">{formatCurrency(totalProductsCost)}</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Venta</p>
                  <p className="text-xl font-bold">{formatCurrency(totalProductsPrice)}</p>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-sm text-muted-foreground">Margen Productos</p>
                  <p className="text-xl font-bold text-green-600">
                    {formatCurrency(totalProductsPrice - totalProductsCost)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {totalProductsPrice > 0 
                      ? `${(((totalProductsPrice - totalProductsCost) / totalProductsPrice) * 100).toFixed(1)}%`
                      : '0%'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Empty State */}
      {budgetLines.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500 mb-4">No hay partidas de presupuesto registradas.</p>
            <Button onClick={handleAddBudgetLine}>
              <Plus className="mr-2 h-4 w-4" /> Añadir Primera Partida
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Dialog */}
      <BudgetLineDialog
        open={isBudgetLineDialogOpen}
        onOpenChange={(open) => {
          setIsBudgetLineDialogOpen(open);
          if (!open) setEditingBudgetLine(null);
        }}
        projectId={projectId}
        budgetLine={editingBudgetLine}
        onSuccess={() => {
          setIsBudgetLineDialogOpen(false);
          setEditingBudgetLine(null);
          fetchData();
        }}
      />
    </div>
  );
}
