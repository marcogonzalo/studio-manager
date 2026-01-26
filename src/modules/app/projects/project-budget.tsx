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
import { Plus, Trash2, Printer, Pencil, ChevronDown, MoreVertical } from 'lucide-react';
import { AddItemDialog } from '@/components/dialogs/add-item-dialog';
import { BudgetLineDialog } from '@/components/dialogs/budget-line-dialog';
import { ProductDetailModal } from '@/components/product-detail-modal';
import { toast } from 'sonner';
import { useAuth } from '@/components/auth-provider';
import { 
  getBudgetCategoryLabel, 
  getBudgetSubcategoryLabel,
  getPhaseLabel
} from '@/lib/utils';

import type { Project, ProjectBudgetLine, BudgetCategory, ProjectPhase } from '@/types';

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
  supplier_id?: string;
  product?: {
    name?: string;
    supplier?: { name: string };
    description?: string;
    reference_code?: string;
    reference_url?: string;
    category?: string;
  };
}

export function ProjectBudget({ projectId }: { projectId: string }) {
  const { user } = useAuth();
  const [items, setItems] = useState<ProjectItem[]>([]);
  const [budgetLines, setBudgetLines] = useState<ProjectBudgetLine[]>([]);
  const [project, setProject] = useState<Project & { client?: { full_name: string; email?: string; phone?: string; address?: string } } | null>(null);
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [isBudgetLineDialogOpen, setIsBudgetLineDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ProjectItem | null>(null);
  const [editingBudgetLine, setEditingBudgetLine] = useState<ProjectBudgetLine | null>(null);
  const [selectedItem, setSelectedItem] = useState<ProjectItem | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    products: true,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch project with client info
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*, client:clients(full_name, email, phone, address)')
        .eq('id', projectId)
        .single();
      
      if (!projectError && projectData) {
        setProject(projectData);
      } else if (projectError) {
        console.error('Error fetching project:', projectError);
        setError('Error al cargar el proyecto');
      }
      
      // Fetch project items (products)
      const { data: itemsData, error: itemsError } = await supabase
        .from('project_items')
        .select('*, space:spaces(name), product:products(name, supplier:suppliers(name), description, reference_code, category)')
        .eq('project_id', projectId)
        .order('created_at');
      
      if (itemsError) {
        console.error('Error fetching items:', itemsError);
        setItems([]);
      } else {
        setItems(itemsData || []);
      }
      
      // Fetch budget lines (only non-internal for client budget view)
      const { data: budgetLinesData, error: budgetLinesError } = await supabase
        .from('project_budget_lines')
        .select('*, supplier:suppliers(name)')
        .eq('project_id', projectId)
        .eq('is_internal_cost', false)
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
        setBudgetLines(budgetLinesData || []);
      }
    } catch (error: any) {
      console.error('Unexpected error in fetchData:', error);
      setError('Error inesperado al cargar los datos: ' + (error?.message || 'Error desconocido'));
      // Ensure we set empty arrays to prevent UI from breaking
      setItems([]);
      setBudgetLines([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [projectId]);

  const handleDeleteItem = async (id: string) => {
    if (!confirm('¿Eliminar ítem?')) return;
    await supabase.from('project_items').delete().eq('id', id);
    toast.success('Ítem eliminado');
    fetchData();
  };

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

  const handleEditItem = (item: ProjectItem) => {
    setEditingItem(item);
    setIsItemDialogOpen(true);
  };

  const handleEditBudgetLine = (line: ProjectBudgetLine) => {
    setEditingBudgetLine(line);
    setIsBudgetLineDialogOpen(true);
  };

  const handleAddItem = () => {
    setEditingItem(null);
    setIsItemDialogOpen(true);
  };

  const handleAddBudgetLine = () => {
    setEditingBudgetLine(null);
    setIsBudgetLineDialogOpen(true);
  };

  const handleGeneratePDF = async () => {
    if (!project) {
      toast.error('No se pudo cargar la información del proyecto');
      return;
    }

    setIsGeneratingPDF(true);
    try {
      const { generateProjectPDF } = await import('@/lib/pdf-generator');
      const architectName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Arquitecto/a';
      
      // Pass budget lines to PDF generator
      const asPdf = await generateProjectPDF(project, items, budgetLines, 21, architectName);
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

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Group budget lines by phase first, then by category
  const budgetLinesByPhaseAndCategory = budgetLines.reduce((acc, line) => {
    const phaseKey = line.phase || 'no_phase';
    if (!acc[phaseKey]) {
      acc[phaseKey] = {} as Record<BudgetCategory, ProjectBudgetLine[]>;
    }
    if (!acc[phaseKey][line.category]) {
      acc[phaseKey][line.category] = [];
    }
    acc[phaseKey][line.category].push(line);
    return acc;
  }, {} as Record<string, Record<BudgetCategory, ProjectBudgetLine[]>>);

  // Calculate totals
  const totalItemsPrice = items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
  const totalBudgetLinesEstimated = budgetLines.reduce((sum, line) => sum + Number(line.estimated_amount), 0);
  
  // For client budget, we use estimated_amount as the price shown
  const grandTotal = totalItemsPrice + totalBudgetLinesEstimated;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  // Order of phases to display
  const phaseOrder: (ProjectPhase | 'no_phase')[] = ['diagnosis', 'design', 'executive', 'budget', 'construction', 'delivery', 'no_phase'];
  
  // Order of categories to display within each phase
  const categoryOrder: BudgetCategory[] = ['own_fees', 'external_services', 'construction', 'operations'];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-gray-500">Cargando presupuesto...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <p className="text-red-500 font-medium">{error}</p>
          <Button onClick={fetchData} variant="outline">
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h3 className="text-lg font-medium">Presupuesto</h3>
          <div className="text-sm text-gray-500">
            Productos: {formatCurrency(totalItemsPrice)} | Partidas: {formatCurrency(totalBudgetLinesEstimated)} | 
            <span className="font-semibold"> Total: {formatCurrency(grandTotal)}</span>
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
          <Button variant="outline" onClick={handleAddBudgetLine} className="print:hidden">
            <Plus className="mr-2 h-4 w-4" /> Nueva Partida
          </Button>
          <Button onClick={handleAddItem} className="print:hidden">
            <Plus className="mr-2 h-4 w-4" /> Añadir Producto
          </Button>
        </div>
      </div>

      {/* Budget Lines by Phase and Category */}
      {phaseOrder.map((phase) => {
        const phaseData = budgetLinesByPhaseAndCategory[phase];
        if (!phaseData) return null;
        
        // Check if this phase has any lines
        const hasLines = Object.values(phaseData).some(lines => lines.length > 0);
        if (!hasLines) return null;
        
        const phaseTotal = Object.values(phaseData).reduce((sum, lines) => 
          sum + lines.reduce((lineSum, line) => lineSum + Number(line.estimated_amount), 0), 0
        );
        
        const phaseSectionKey = `phase_${phase}`;
        
        return (
          <div key={phase} className="space-y-3">
            <Collapsible 
              open={openSections[phaseSectionKey] !== false} 
              onOpenChange={() => toggleSection(phaseSectionKey)}
            >
              <Card className="border-l-4 border-l-primary">
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <div className="flex justify-between items-center">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <ChevronDown className={`h-4 w-4 transition-transform ${openSections[phaseSectionKey] !== false ? '' : '-rotate-90'}`} />
                        {phase === 'no_phase' ? 'Sin Fase' : getPhaseLabel(phase as ProjectPhase)}
                      </CardTitle>
                      <span className="font-semibold text-primary">
                        {formatCurrency(phaseTotal)}
                      </span>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0 space-y-3">
                    {categoryOrder.map((category) => {
                      const lines = phaseData[category] || [];
                      if (lines.length === 0) return null;
                      
                      const categoryTotal = lines.reduce((sum, line) => sum + Number(line.estimated_amount), 0);
                      const categorySectionKey = `${phaseSectionKey}_${category}`;
                      
                      return (
                        <Collapsible 
                          key={category} 
                          open={openSections[categorySectionKey] !== false} 
                          onOpenChange={() => toggleSection(categorySectionKey)}
                        >
                          <Card className="ml-4">
                            <CollapsibleTrigger asChild>
                              <CardHeader className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 py-3">
                                <div className="flex justify-between items-center">
                                  <CardTitle className="flex items-center gap-2 text-sm">
                                    <ChevronDown className={`h-3 w-3 transition-transform ${openSections[categorySectionKey] !== false ? '' : '-rotate-90'}`} />
                                    {getBudgetCategoryLabel(category)}
                                  </CardTitle>
                                  <span className="font-semibold text-sm text-primary">
                                    {formatCurrency(categoryTotal)}
                                  </span>
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
                                      <TableHead className="text-right">Importe</TableHead>
                                      <TableHead className="w-[80px]"></TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {lines.map((line) => (
                                      <TableRow key={line.id}>
                                        <TableCell className="font-medium">
                                          {getBudgetSubcategoryLabel(category, line.subcategory)}
                                        </TableCell>
                                        <TableCell className="text-gray-500">
                                          {line.description || '-'}
                                        </TableCell>
                                        <TableCell className="text-right font-semibold">
                                          {formatCurrency(Number(line.estimated_amount))}
                                        </TableCell>
                                        <TableCell>
                                          <div className="flex justify-end">
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
                                    ))}
                                  </TableBody>
                                </Table>
                              </CardContent>
                            </CollapsibleContent>
                          </Card>
                        </Collapsible>
                      );
                    })}
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          </div>
        );
      })}

      {/* Products Section */}
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
                  Mobiliario y Productos
                </CardTitle>
                <span className="font-semibold text-primary">
                  {formatCurrency(totalItemsPrice)}
                </span>
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">Img</TableHead>
                    <TableHead>Ítem</TableHead>
                    <TableHead>Ubicación</TableHead>
                    <TableHead className="text-right">Cant.</TableHead>
                    <TableHead className="text-right">Costo Unit.</TableHead>
                    <TableHead className="text-right">Precio Venta</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
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
                            alt={item.product?.name || item.name}
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{item.product?.name || item.name}</div>
                        <div className="text-xs text-gray-500">{item.product?.supplier?.name || '-'}</div>
                      </TableCell>
                      <TableCell>{item.space?.name || 'General'}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right text-gray-500">{formatCurrency(item.unit_cost)}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(item.unit_price)}</TableCell>
                      <TableCell className="capitalize text-xs">{item.status}</TableCell>
                      <TableCell className="text-right font-bold">{formatCurrency(item.unit_price * item.quantity)}</TableCell>
                      <TableCell>
                        <div className="flex justify-end">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditItem(item)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeleteItem(item.id)}
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
                  {items.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                        No hay productos añadidos.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Grand Total Summary */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Presupuesto</p>
              <p className="text-xs text-muted-foreground">
                Partidas: {formatCurrency(totalBudgetLinesEstimated)} + Productos: {formatCurrency(totalItemsPrice)}
              </p>
            </div>
            <p className="text-3xl font-bold text-primary">{formatCurrency(grandTotal)}</p>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <AddItemDialog 
        open={isItemDialogOpen} 
        onOpenChange={(open) => {
          setIsItemDialogOpen(open);
          if (!open) setEditingItem(null);
        }} 
        projectId={projectId}
        item={editingItem}
        onSuccess={() => { 
          setIsItemDialogOpen(false); 
          setEditingItem(null); 
          fetchData(); 
        }}
      />

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

      <ProductDetailModal
        open={isProductModalOpen}
        onOpenChange={setIsProductModalOpen}
        projectItem={selectedItem}
      />
    </div>
  );
}
