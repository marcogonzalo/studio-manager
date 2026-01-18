import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import type { Project } from '@/types';
import { getPhaseLabel } from '@/lib/utils';
import { ProjectNotes } from './project-notes';
import { ProjectPurchases } from './project-purchases';
import { ProjectSpaces } from './project-spaces';
import { ProjectBudget } from './project-budget';
import { ProjectCostControl } from './project-cost-control';
import { ProjectDocuments } from './project-documents';
import { ProjectPayments } from './project-payments';
import { ProjectDashboard } from './project-dashboard';
import { ProjectDialog } from '@/components/project-dialog';
import { toast } from 'sonner';
import { Pencil, ChevronDown } from 'lucide-react';

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  async function fetchProject() {
    if (!id) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('projects')
      .select('*, client:clients(full_name)')
      .eq('id', id)
      .single();
    
    if (error) {
      toast.error('Error al cargar proyecto');
    } else {
      setProject(data);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchProject();
  }, [id]);

  if (loading) return <div>Cargando...</div>;
  if (!project) return <div>Proyecto no encontrado</div>;

  return (
    <div className="space-y-6">
      <Collapsible>
        <div className="flex items-center justify-between">
          <CollapsibleTrigger className="flex-1 text-left group">
            <div>
              <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                {project.name}
                <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
              </h2>
              <p className="text-gray-500">{project.client?.full_name}</p>
            </div>
          </CollapsibleTrigger>
        </div>
        
        <CollapsibleContent>
          <Card className="mt-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Información del Proyecto</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditDialogOpen(true)}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-medium">Descripción</p>
                <p className="text-gray-500">{project.description || "Sin descripción"}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-medium">Fecha Inicio</p>
                  <p className="text-gray-500">{project.start_date}</p>
                </div>
                <div>
                  <p className="font-medium">Estado</p>
                  <p className="capitalize text-gray-500">{project.status}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {project.end_date && (
                  <div>
                    <p className="font-medium">Fecha Estimada de Entrega</p>
                    <p className="text-gray-500">{project.end_date}</p>
                  </div>
                )}
                {project.status === 'completed' && project.completed_date && (
                  <div>
                    <p className="font-medium">Fecha Efectiva de Finalización</p>
                    <p className="text-gray-500">{project.completed_date}</p>
                  </div>
                )}
                <div>
                  <p className="font-medium">Fase</p>
                  <p className="text-gray-500">{getPhaseLabel(project.phase)}</p>
                </div>
              </div>
              {project.address && (
                <div>
                  <p className="font-medium">Dirección</p>
                  <p className="text-gray-500">{project.address}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>

      <Tabs defaultValue="resumen" className="space-y-4">
        <TabsList className="print:hidden w-full flex">
          <TabsTrigger value="resumen" className="flex-1">Resumen</TabsTrigger>
          <TabsTrigger value="spaces" className="flex-1">Espacios</TabsTrigger>
          <TabsTrigger value="budget" className="flex-1">Presupuesto</TabsTrigger>
          <TabsTrigger value="cost-control" className="flex-1">Control de costes</TabsTrigger>
          <TabsTrigger value="purchases" className="flex-1">Compras</TabsTrigger>
          <TabsTrigger value="payments" className="flex-1">Pagos</TabsTrigger>
          <TabsTrigger value="documents" className="flex-1">Documentos</TabsTrigger>
          <TabsTrigger value="notes" className="flex-1">Notas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="resumen">
          <ProjectDashboard projectId={project.id} />
        </TabsContent>

        <TabsContent value="spaces">
          <ProjectSpaces projectId={project.id} />
        </TabsContent>
        
        <TabsContent value="budget">
          <ProjectBudget projectId={project.id} />
        </TabsContent>

        <TabsContent value="cost-control">
          <ProjectCostControl projectId={project.id} />
        </TabsContent>

        <TabsContent value="purchases">
          <ProjectPurchases projectId={project.id} />
        </TabsContent>

        <TabsContent value="payments">
          <ProjectPayments projectId={project.id} />
        </TabsContent>

        <TabsContent value="documents">
          <ProjectDocuments projectId={project.id} />
        </TabsContent>

        <TabsContent value="notes">
          <ProjectNotes projectId={project.id} />
        </TabsContent>
      </Tabs>

      <ProjectDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        project={project}
        onSuccess={() => {
          fetchProject();
          setIsEditDialogOpen(false);
        }}
      />
    </div>
  );
}

