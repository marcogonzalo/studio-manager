import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Plus, Calendar, User as UserIcon } from 'lucide-react';
import { ProjectDialog } from './project-dialog';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

import type { Project } from '@/types';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchProjects = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('projects')
      .select('*, client:clients(full_name)')
      .order('created_at', { ascending: false });
    
    if (error) {
      toast.error('Error al cargar proyectos');
    } else {
      setProjects(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Proyectos</h2>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Nuevo Proyecto
        </Button>
      </div>

      {loading ? (
        <div>Cargando...</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card key={project.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>{project.name}</CardTitle>
                <CardDescription className="line-clamp-2">{project.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-500">
                  <div className="flex items-center">
                    <UserIcon className="mr-2 h-4 w-4" />
                    {project.client?.full_name || 'Sin cliente'}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4" />
                    {project.start_date ? format(new Date(project.start_date), 'dd/MM/yyyy') : 'Sin fecha'}
                  </div>
                  <div className="capitalize">
                    Estado: <span className="font-medium text-gray-900 dark:text-gray-100">{project.status}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full" variant="outline">
                  <Link to={`/projects/${project.id}`}>Ver Detalles</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
          {projects.length === 0 && (
            <div className="col-span-full text-center py-10 text-gray-500">
              No tienes proyectos activos. Crea uno nuevo.
            </div>
          )}
        </div>
      )}

      <ProjectDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        onSuccess={() => {
          setIsDialogOpen(false);
          fetchProjects();
        }}
      />
    </div>
  );
}

