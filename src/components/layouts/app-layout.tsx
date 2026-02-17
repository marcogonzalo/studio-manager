"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LayoutDashboard,
  FolderKanban,
  ShoppingBag,
  Truck,
  Settings,
  LogOut,
  Users,
  PanelLeftClose,
  PanelLeft,
  User,
  SlidersHorizontal,
  Palette,
  Rocket,
} from "lucide-react";
import { VetaLogo } from "@/components/veta-logo";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState } from "react";
import { ThemeToggleSimple } from "@/components/theme-toggle-simple";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Clientes", href: "/clients", icon: Users },
  { name: "Proyectos", href: "/projects", icon: FolderKanban },
  { name: "Catálogo", href: "/catalog", icon: ShoppingBag },
  { name: "Proveedores", href: "/suppliers", icon: Truck },
];

const PLAN_DISPLAY_NAMES: Record<string, string> = {
  BASE: "Base",
  PRO: "Pro",
  STUDIO: "Studio",
};

function SidebarContent({
  collapsed = false,
  user,
  effectivePlan,
  signOut,
  pathname,
  setIsMobileOpen,
  isCollapsed,
  setIsCollapsed,
}: {
  collapsed?: boolean;
  user: ReturnType<typeof useAuth>["user"];
  effectivePlan: ReturnType<typeof useAuth>["effectivePlan"];
  signOut: () => Promise<void>;
  pathname: string;
  setIsMobileOpen: (open: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}) {
  return (
    <div className="bg-sidebar border-border relative flex h-full flex-col border-r">
      <div
        className={cn(
          "flex items-center gap-2 p-6",
          collapsed && "justify-center p-4"
        )}
      >
        <Link
          href="/dashboard"
          aria-label={collapsed ? "Veta - Ir al inicio" : undefined}
          className={cn(
            "flex items-center gap-2",
            collapsed && "justify-center"
          )}
        >
          <VetaLogo
            height={28}
            showWordmark={!collapsed}
            className="text-foreground"
          />
        </Link>
      </div>

      {/* Toggle button - positioned at the edge */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="bg-background border-border hover:bg-secondary absolute top-1/2 -right-3 z-10 hidden -translate-y-1/2 rounded-full border p-1 shadow-md transition-colors md:flex"
        aria-label={
          collapsed ? "Expandir barra lateral" : "Minimizar barra lateral"
        }
      >
        {collapsed ? (
          <PanelLeft className="text-muted-foreground h-4 w-4" />
        ) : (
          <PanelLeftClose className="text-muted-foreground h-4 w-4" />
        )}
      </button>

      <nav className={cn("flex-1 space-y-1.5", collapsed ? "px-2" : "px-4")}>
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const linkContent = (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMobileOpen(false)}
              className={cn(
                "group flex items-center rounded-xl text-sm font-medium transition-all duration-200",
                collapsed ? "justify-center px-2 py-2.5" : "px-4 py-2.5",
                isActive
                  ? "bg-primary text-primary-foreground shadow-primary/20 shadow-md"
                  : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 flex-shrink-0 transition-transform group-hover:scale-110",
                  !collapsed && "mr-3",
                  isActive
                    ? "text-primary-foreground"
                    : "text-muted-foreground group-hover:text-secondary-foreground"
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
          "border-border mt-auto border-t",
          collapsed ? "p-2" : "space-y-3 p-4"
        )}
      >
        {effectivePlan?.plan_code === "BASE" && (
          <Link
            href="/pricing"
            className={cn(
              "bg-primary/10 text-primary hover:bg-primary/20 border-primary/20 flex w-full items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors",
              collapsed ? "py-2" : "mb-2"
            )}
          >
            <Rocket className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Mejora tu plan</span>}
          </Link>
        )}
        {collapsed ? (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="hover:bg-secondary flex w-full cursor-pointer justify-center rounded-xl p-2 transition-colors">
                    <Avatar className="border-border h-9 w-9 border">
                      <AvatarImage src={user?.user_metadata?.avatar_url} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {user?.email?.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="right"
                  align="end"
                  className="w-56 rounded-xl"
                >
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">
                        {user?.user_metadata?.full_name || "Usuario"}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/account">
                      <User className="mr-2 h-4 w-4" />
                      Mi perfil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings">
                      <SlidersHorizontal className="mr-2 h-4 w-4" />
                      Configuración
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()}
                    className="flex cursor-default items-center justify-between gap-2"
                  >
                    <span className="flex items-center">
                      <Palette className="mr-2 h-4 w-4" />
                      Tema
                    </span>
                    <ThemeToggleSimple />
                  </DropdownMenuItem>
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
              {user?.user_metadata?.full_name || "Usuario"}
            </TooltipContent>
          </Tooltip>
        ) : (
          <div className="bg-secondary/50 border-border/50 flex items-center gap-3 rounded-xl border p-2">
            <Avatar className="border-border h-9 w-9 border">
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {user?.email?.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
              <p className="text-foreground truncate text-sm font-medium">
                {user?.user_metadata?.full_name || "Usuario"}
              </p>
              <p className="text-muted-foreground truncate text-xs">
                {user?.email}
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-background text-muted-foreground hover:text-foreground h-8 w-8 cursor-pointer"
                  aria-label="Cuenta y configuración"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl">
                <DropdownMenuLabel className="flex flex-wrap items-center gap-2">
                  Mi Cuenta
                  {effectivePlan?.plan_code && (
                    <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs font-medium">
                      {PLAN_DISPLAY_NAMES[effectivePlan.plan_code] ??
                        effectivePlan.plan_code}
                    </span>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/account">
                    <User className="mr-2 h-4 w-4" />
                    Mi perfil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <SlidersHorizontal className="mr-2 h-4 w-4" />
                    Configuración
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={(e) => e.preventDefault()}
                  className="flex cursor-default items-center justify-between gap-2"
                >
                  <span className="flex items-center">
                    <Palette className="mr-2 h-4 w-4" />
                    Tema
                  </span>
                  <ThemeToggleSimple />
                </DropdownMenuItem>
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

export default function AppLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, effectivePlan, signOut, loading } = useAuth();
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-muted-foreground animate-pulse">Cargando...</div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="bg-background text-foreground flex min-h-screen">
        {/* Desktop Sidebar */}
        <div
          className={cn(
            "z-50 hidden shadow-sm transition-all duration-300 md:fixed md:inset-y-0 md:flex md:flex-col print:hidden",
            isCollapsed ? "md:w-16" : "md:w-64"
          )}
        >
          <SidebarContent
            collapsed={isCollapsed}
            user={user}
            effectivePlan={effectivePlan}
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
              className="bg-background/80 border-border fixed bottom-4 left-1/2 z-50 h-10 w-10 -translate-x-1/2 rounded-[25px] border shadow-sm backdrop-blur-sm md:hidden print:hidden"
              aria-label="Abrir menú"
            >
              <VetaLogo variant="icon" height={20} width={28} />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="border-border w-64 border-r p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Menú de Navegación</SheetTitle>
              <SheetDescription>
                Navegación principal de la aplicación
              </SheetDescription>
            </SheetHeader>
            <SidebarContent
              collapsed={false}
              user={user}
              effectivePlan={effectivePlan}
              signOut={signOut}
              pathname={pathname}
              setIsMobileOpen={setIsMobileOpen}
              isCollapsed={isCollapsed}
              setIsCollapsed={setIsCollapsed}
            />
          </SheetContent>
        </Sheet>

        {/* Main Content */}
        <main
          id="main-content"
          className={cn(
            "flex-1 overflow-x-hidden p-4 transition-all duration-300 md:p-5 print:ml-0 print:p-0",
            isCollapsed ? "md:ml-16" : "md:ml-64"
          )}
        >
          <div className="animate-in fade-in slide-in-from-bottom-4 mx-auto max-w-7xl duration-500">
            {children}
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
}
