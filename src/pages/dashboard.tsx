import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, ArrowRight, FolderKanban, Users, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Hola, Bienvenido</h2>
          <p className="text-muted-foreground mt-1">Aquí tienes un resumen de tu estudio de diseño.</p>
        </div>
        <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-105">
          <Link to="/projects">
            <Plus className="mr-2 h-4 w-4" /> Nuevo Proyecto
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-none shadow-md bg-gradient-to-br from-white to-secondary/20 hover:shadow-lg transition-all duration-300 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Proyectos Activos</CardTitle>
            <FolderKanban className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">0</div>
            <p className="text-xs text-muted-foreground mt-1">
              +0% desde el mes pasado
            </p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-md bg-gradient-to-br from-white to-secondary/20 hover:shadow-lg transition-all duration-300 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Clientes Totales</CardTitle>
            <Users className="h-4 w-4 text-chart-2 group-hover:scale-110 transition-transform" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">0</div>
            <p className="text-xs text-muted-foreground mt-1">
              +0 nuevos este mes
            </p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-md bg-gradient-to-br from-white to-secondary/20 hover:shadow-lg transition-all duration-300 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Productos en Catálogo</CardTitle>
            <ShoppingBag className="h-4 w-4 text-chart-4 group-hover:scale-110 transition-transform" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">0</div>
            <p className="text-xs text-muted-foreground mt-1">
              Actualizado recientemente
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 border-none shadow-md">
          <CardHeader>
            <CardTitle>Proyectos Recientes</CardTitle>
            <CardDescription>
              No tienes proyectos recientes.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <div className="flex flex-col items-center justify-center py-10 text-center space-y-4 bg-secondary/10 rounded-xl border border-dashed border-border">
                <div className="p-4 bg-background rounded-full shadow-sm">
                  <FolderKanban className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-medium text-foreground">Comienza tu primer proyecto</h3>
                  <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                    Crea un proyecto para empezar a gestionar clientes, espacios y presupuestos.
                  </p>
                </div>
                <Button variant="outline" asChild className="mt-4">
                  <Link to="/projects">Crear Proyecto</Link>
                </Button>
             </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-3 border-none shadow-md bg-primary/5">
          <CardHeader>
            <CardTitle>Accesos Rápidos</CardTitle>
            <CardDescription>
              Acciones frecuentes
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Link to="/clients" className="flex items-center justify-between p-4 bg-background rounded-xl shadow-sm hover:shadow-md transition-all hover:bg-accent/10 group border border-border/50">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-chart-2/10 text-chart-2 rounded-full group-hover:scale-110 transition-transform">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium leading-none text-foreground">Registrar Cliente</p>
                  <p className="text-xs text-muted-foreground mt-1">Añadir nuevo contacto</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link to="/catalog" className="flex items-center justify-between p-4 bg-background rounded-xl shadow-sm hover:shadow-md transition-all hover:bg-accent/10 group border border-border/50">
              <div className="flex items-center space-x-4">
                 <div className="p-2 bg-chart-4/10 text-chart-4 rounded-full group-hover:scale-110 transition-transform">
                  <ShoppingBag className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium leading-none text-foreground">Añadir Producto</p>
                  <p className="text-xs text-muted-foreground mt-1">Actualizar catálogo</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
