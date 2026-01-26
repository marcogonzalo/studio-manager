'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  LayoutDashboard,
  FolderKanban,
  ShoppingBag,
  Truck,
  Settings,
  LogOut,
  Menu,
  Users,
  Leaf,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Clientes', href: '/clients', icon: Users },
  { name: 'Proyectos', href: '/projects', icon: FolderKanban },
  { name: 'Catálogo', href: '/catalog', icon: ShoppingBag },
  { name: 'Proveedores', href: '/suppliers', icon: Truck },
];

function SidebarContent({
  collapsed = false,
  user,
  signOut,
  pathname,
  setIsMobileOpen,
  isCollapsed,
  setIsCollapsed,
}: {
  collapsed?: boolean;
  user: ReturnType<typeof useAuth>['user'];
  signOut: () => Promise<void>;
  pathname: string;
  setIsMobileOpen: (open: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}) {
  return (
    <div className="flex flex-col h-full bg-sidebar border-r border-border relative">
      <div
        className={cn(
          'p-6 flex items-center gap-2',
          collapsed && 'justify-center p-4'
        )}
      >
        <div className="bg-primary text-primary-foreground p-1.5 rounded-lg flex-shrink-0">
          <Leaf className="h-5 w-5" />
        </div>
        {!collapsed && (
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Studio<span className="text-primary">Manager</span>
          </h1>
        )}
      </div>

      {/* Toggle button - positioned at the edge */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute top-5 -right-3 z-10 bg-background border border-border rounded-full p-1 shadow-md hover:bg-secondary transition-colors hidden md:flex"
        aria-label={collapsed ? 'Expandir barra lateral' : 'Minimizar barra lateral'}
      >
        {collapsed ? (
          <PanelLeft className="h-4 w-4 text-muted-foreground" />
        ) : (
          <PanelLeftClose className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      <nav className={cn('flex-1 space-y-1.5', collapsed ? 'px-2' : 'px-4')}>
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const linkContent = (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMobileOpen(false)}
              className={cn(
                'flex items-center text-sm font-medium rounded-xl transition-all duration-200 group',
                collapsed ? 'justify-center px-2 py-2.5' : 'px-4 py-2.5',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                  : 'text-muted-foreground hover:bg-secondary hover:text-secondary-foreground'
              )}
            >
              <item.icon
                className={cn(
                  'h-5 w-5 transition-transform group-hover:scale-110 flex-shrink-0',
                  !collapsed && 'mr-3',
                  isActive
                    ? 'text-primary-foreground'
                    : 'text-muted-foreground group-hover:text-secondary-foreground'
                )}
              />
              {!collapsed && item.name}
            </Link>
          );

          if (collapsed) {
            return (
              <Tooltip key={item.href} delayDuration={0}>
                <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                <TooltipContent side="right">{item.name}</TooltipContent>
              </Tooltip>
            );
          }

          return linkContent;
        })}
      </nav>
      <div
        className={cn(
          'border-t border-border mt-auto',
          collapsed ? 'p-2' : 'p-4'
        )}
      >
        {collapsed ? (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="w-full flex justify-center p-2 rounded-xl hover:bg-secondary transition-colors">
                    <Avatar className="h-9 w-9 border border-border">
                      <AvatarImage src={user?.user_metadata?.avatar_url} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {user?.email?.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="right" align="end" className="w-56 rounded-xl">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">
                        {user?.user_metadata?.full_name || 'Usuario'}
                      </p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={signOut}
                    className="text-destructive focus:text-destructive cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Cerrar Sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TooltipTrigger>
            <TooltipContent side="right">
              {user?.user_metadata?.full_name || 'Usuario'}
            </TooltipContent>
          </Tooltip>
        ) : (
          <div className="flex items-center gap-3 bg-secondary/50 p-2 rounded-xl border border-border/50">
            <Avatar className="h-9 w-9 border border-border">
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {user?.email?.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate text-foreground">
                {user?.user_metadata?.full_name || 'Usuario'}
              </p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-background text-muted-foreground hover:text-foreground"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl">
                <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={signOut}
                  className="text-destructive focus:text-destructive cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AppLayoutClient({ children }: { children: React.ReactNode }) {
  const { user, signOut, loading } = useAuth();
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Cargando...</div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex min-h-screen bg-background text-foreground">
        {/* Desktop Sidebar */}
        <div
          className={cn(
            'hidden md:flex md:flex-col md:fixed md:inset-y-0 z-50 print:hidden shadow-sm transition-all duration-300',
            isCollapsed ? 'md:w-16' : 'md:w-64'
          )}
        >
          <SidebarContent
            collapsed={isCollapsed}
            user={user}
            signOut={signOut}
            pathname={pathname}
            setIsMobileOpen={setIsMobileOpen}
            isCollapsed={isCollapsed}
            setIsCollapsed={setIsCollapsed}
          />
        </div>

        {/* Mobile Sidebar */}
        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-50 print:hidden bg-background/80 backdrop-blur-sm border border-border shadow-sm"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64 border-r border-border">
            <SheetHeader className="sr-only">
              <SheetTitle>Menú de Navegación</SheetTitle>
              <SheetDescription>Navegación principal de la aplicación</SheetDescription>
            </SheetHeader>
            <SidebarContent
              collapsed={false}
              user={user}
              signOut={signOut}
              pathname={pathname}
              setIsMobileOpen={setIsMobileOpen}
              isCollapsed={isCollapsed}
              setIsCollapsed={setIsCollapsed}
            />
          </SheetContent>
        </Sheet>

        {/* Main Content */}
        <div
          className={cn(
            'flex-1 p-4 md:p-5 print:ml-0 print:p-0 overflow-x-hidden transition-all duration-300',
            isCollapsed ? 'md:ml-16' : 'md:ml-64'
          )}
        >
          <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
