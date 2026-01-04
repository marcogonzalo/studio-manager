import { useAuth } from '@/components/auth-provider';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

export default function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="flex h-screen items-center justify-center">Cargando...</div>;
  if (!user) {
    // Guardar la ruta actual en query params para redirigir después del login
    const redirectTo = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/auth?redirect=${redirectTo}`} replace />;
  }

  return <Outlet />;
}
