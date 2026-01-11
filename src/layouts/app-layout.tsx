import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { LayoutDashboard, FolderKanban, ShoppingBag, Truck, Settings, LogOut, Menu, Users, Leaf } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '@/components/ui/sheet';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export default function AppLayout() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Clientes', href: '/clients', icon: Users },
    { name: 'Proyectos', href: '/projects', icon: FolderKanban },
    { name: 'Catálogo', href: '/catalog', icon: ShoppingBag },
    { name: 'Proveedores', href: '/suppliers', icon: Truck },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-sidebar border-r border-border">
      <div className="p-6 flex items-center gap-2">
        <div className="bg-primary text-primary-foreground p-1.5 rounded-lg">
          <Leaf className="h-5 w-5" />
        </div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Studio<span className="text-primary">Manager</span></h1>
      </div>
      <nav className="flex-1 px-4 space-y-1.5">
        {navItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            onClick={() => setIsMobileOpen(false)}
            className={cn(
              "flex items-center px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 group",
              location.pathname === item.href
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
            )}
          >
            <item.icon className={cn("mr-3 h-5 w-5 transition-transform group-hover:scale-110", location.pathname === item.href ? "text-primary-foreground" : "text-muted-foreground group-hover:text-secondary-foreground")} />
            {item.name}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-border mt-auto">
        <div className="flex items-center gap-3 bg-secondary/50 p-2 rounded-xl border border-border/50">
          <Avatar className="h-9 w-9 border border-border">
            <AvatarImage src={user?.user_metadata?.avatar_url} />
            <AvatarFallback className="bg-primary/10 text-primary">{user?.email?.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium truncate text-foreground">{user?.user_metadata?.full_name || 'Usuario'}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-background text-muted-foreground hover:text-foreground">
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl">
              <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut} className="text-destructive focus:text-destructive cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-50 print:hidden shadow-sm">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden fixed top-4 left-4 z-50 print:hidden bg-background/80 backdrop-blur-sm border border-border shadow-sm">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64 border-r border-border">
          <SheetHeader className="sr-only">
            <SheetTitle>Menú de Navegación</SheetTitle>
            <SheetDescription>Navegación principal de la aplicación</SheetDescription>
          </SheetHeader>
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 md:ml-64 p-4 md:p-8 print:ml-0 print:p-0 overflow-x-hidden">
        <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
           <Outlet />
        </div>
      </div>
    </div>
  );
}
