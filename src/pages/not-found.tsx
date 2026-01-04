import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, Construction, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <Card className="w-full max-w-2xl border-2 border-dashed border-gray-300 dark:border-gray-700">
      <CardHeader className="text-center space-y-4 pb-4">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30">
            <Construction className="h-12 w-12 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <CardTitle className="text-6xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              404
            </CardTitle>
            <CardDescription className="text-xl font-semibold text-gray-700 dark:text-gray-300">
              Parece que esta vista no estaba en los planos originales. 😅
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-base text-gray-600 dark:text-gray-400">
            Nuestro arquitecto digital no encontró los planos para construir esta ruta.
          </p>
          <p className="text-base text-muted-foreground">
            Por favor, intenta volver a la página anterior o ir al inicio.
          </p>
          <div className="pt-4 space-y-2">
            <p className="text-sm text-muted-foreground italic">
              En arquitectura, cada error es una lección. En la vida, una oportunidad de mejorar.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Button onClick={handleGoHome} size="lg" className="w-full sm:w-auto">
            <Home className="mr-2 h-4 w-4" />
            {user ? 'Volver al Dashboard' : 'Ir al Inicio'}
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver atrás
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

