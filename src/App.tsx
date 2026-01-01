import { Routes, Route, Navigate } from 'react-router-dom';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { AuthProvider } from '@/components/auth-provider';
import { Toaster } from '@/components/ui/sonner';
import AuthPage from '@/pages/auth';
import ProtectedRoute from '@/components/protected-route';
import AppLayout from '@/layouts/app-layout';
import ClientsPage from '@/pages/clients/page';

// Placeholder pages
import Dashboard from '@/pages/dashboard';
import ProjectsPage from '@/pages/projects/page';
import ProjectDetailPage from '@/pages/projects/detail';
import SuppliersPage from '@/pages/suppliers/page';
import CatalogPage from '@/pages/catalog/page';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/clients" element={<ClientsPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/projects/:id" element={<ProjectDetailPage />} />
            <Route path="/catalog" element={<CatalogPage />} />
            <Route path="/suppliers" element={<SuppliersPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
      <SpeedInsights />
    </AuthProvider>
  );
}

export default App;
