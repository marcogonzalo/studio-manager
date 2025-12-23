import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Project } from '@/types';
import { ProjectNotes } from './project-notes';
import { ProjectPurchases } from './project-purchases';
import { ProjectSpaces } from './project-spaces';
import { ProjectBudget } from './project-budget';
import { ProjectDocuments } from './project-documents';
import { ProjectAdditionalCosts } from './project-additional-costs';
import { toast } from 'sonner';

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    fetchProject();
  }, [id]);

  if (loading) return <div>Cargando...</div>;
  if (!project) return <div>Proyecto no encontrado</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{project.name}</h2>
        <p className="text-gray-500">{project.client?.full_name}</p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="print:hidden">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="spaces">Espacios</TabsTrigger>
          <TabsTrigger value="budget">Presupuesto</TabsTrigger>
          <TabsTrigger value="purchases">Compras</TabsTrigger>
          <TabsTrigger value="additional-costs">Costes Adicionales</TabsTrigger>
          <TabsTrigger value="notes">Notas</TabsTrigger>
          <TabsTrigger value="documents">Documentos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Información General</CardTitle>
              <CardDescription>Detalles del proyecto.</CardDescription>
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="spaces">
          <ProjectSpaces projectId={project.id} />
        </TabsContent>
        
        <TabsContent value="budget">
          <ProjectBudget projectId={project.id} />
        </TabsContent>

        <TabsContent value="purchases">
          <ProjectPurchases projectId={project.id} />
        </TabsContent>

        <TabsContent value="additional-costs">
          <ProjectAdditionalCosts projectId={project.id} />
        </TabsContent>

        <TabsContent value="notes">
          <ProjectNotes projectId={project.id} />
        </TabsContent>

        <TabsContent value="documents">
          <ProjectDocuments projectId={project.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

