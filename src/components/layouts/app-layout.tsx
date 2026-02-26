"use client";

import { Fragment } from "react";
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
  Moon,
  Rocket,
  Sun,
  ArrowLeft,
  CreditCard,
  Bug,
  ChevronRight,
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
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { PageLoading } from "@/components/loaders/page-loading";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { getDisplayName } from "@/lib/display-name";
import { appPath } from "@/lib/app-paths";
import { getReportBugUrl } from "@/lib/report-bug";

function AppLayoutSkeleton() {
  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>
      <div className="mt-8 flex-1">
        <PageLoading variant="default" />
      </div>
    </>
  );
}

const navItems = [
  { name: "Dashboard", href: appPath("/dashboard"), icon: LayoutDashboard },
  { name: "Clientes", href: appPath("/clients"), icon: Users },
  { name: "Proyectos", href: appPath("/projects"), icon: FolderKanban },
  { name: "Catálogo", href: appPath("/catalog"), icon: ShoppingBag },
  { name: "Proveedores", href: appPath("/suppliers"), icon: Truck },
];

const settingsNavItems = [
  { name: "Volver atrás", href: appPath("/dashboard"), icon: ArrowLeft },
  { name: "Cuenta", href: appPath("/settings/account"), icon: User },
  {
    name: "Personalización",
    href: appPath("/customization"),
    icon: SlidersHorizontal,
  },
  { name: "Tu plan", href: appPath("/settings/plan"), icon: CreditCard },
];

const PLAN_DISPLAY_NAMES: Record<string, string> = {
  BASE: "Base",
  PRO: "Pro",
  STUDIO: "Studio",
};

const SETTINGS_BREADCRUMB_LABELS: Record<string, string> = {
  [appPath("/settings")]: "Cuenta",
  [appPath("/settings/account")]: "Cuenta",
  [appPath("/settings/plan")]: "Tu plan",
  [appPath("/settings/plan/change")]: "Cambiar plan",
  [appPath("/customization")]: "Personalización",
};

function getSettingsBreadcrumbs(
  pathname: string
): { label: string; href?: string }[] {
  const base = { label: "Configuración", href: appPath("/settings") };
  const current = SETTINGS_BREADCRUMB_LABELS[pathname];
  if (!current) return [base];
  const items = [base, { label: current }];
  if (pathname === appPath("/settings/plan/change")) {
    items.splice(1, 0, { label: "Tu plan", href: appPath("/settings/plan") });
  }
  return items;
}

function SidebarContent({
  collapsed = false,
  user,
  profileFullName,
  effectivePlan,
  signOut,
  pathname,
  setIsMobileOpen,
  isCollapsed,
  setIsCollapsed,
}: {
  collapsed?: boolean;
  user: ReturnType<typeof useAuth>["user"];
  profileFullName: ReturnType<typeof useAuth>["profileFullName"];
  effectivePlan: ReturnType<typeof useAuth>["effectivePlan"];
  signOut: () => Promise<void>;
  pathname: string;
  setIsMobileOpen: (open: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}) {
  const { theme, setTheme } = useTheme();
  const [themeMounted, setThemeMounted] = useState(false);
  useEffect(() => setThemeMounted(true), []);

  const isInSettings =
    pathname.includes("/settings") || pathname === appPath("/customization");
  const navSource = isInSettings ? settingsNavItems : navItems;

  const renderNavLink = (
    item: (typeof navItems)[number] | (typeof settingsNavItems)[number],
    isActive: boolean,
    animationDelayMs?: number
  ) => {
    const linkContent = (
      <Link
        href={item.href}
        onClick={() => setIsMobileOpen(false)}
        className={cn(
          "group flex items-center rounded-xl text-sm font-medium transition-all duration-200",
          collapsed ? "justify-center px-2 py-2.5" : "px-4 py-2.5",
          isActive
            ? "bg-primary text-primary-foreground shadow-primary/20 shadow-md"
            : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
        )}
        style={
          animationDelayMs != null
            ? { animationDelay: `${animationDelayMs}ms` }
            : undefined
        }
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
    const wrapped = (
      <span
        className={cn(
          "block",
          isInSettings &&
            "animate-in fade-in slide-in-from-bottom-4 fill-mode-backwards duration-300"
        )}
        style={
          isInSettings && animationDelayMs != null
            ? { animationDelay: `${animationDelayMs}ms` }
            : undefined
        }
      >
        {linkContent}
      </span>
    );
    if (collapsed) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{wrapped}</TooltipTrigger>
          <TooltipContent side="right">{item.name}</TooltipContent>
        </Tooltip>
      );
    }
    return wrapped;
  };

  return (
    <div className="bg-sidebar border-border relative flex h-full flex-col border-r">
      <div
        className={cn(
          "flex items-center gap-2 p-6",
          collapsed && "justify-center p-4"
        )}
      >
        <Link
          href={isInSettings ? appPath("/settings") : appPath("/dashboard")}
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
        {navSource.map((item, index) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Fragment key={item.href}>
              {renderNavLink(
                item,
                isActive,
                isInSettings ? index * 80 : undefined
              )}
            </Fragment>
          );
        })}
        {isInSettings && (
          <span
            className="animate-in fade-in slide-in-from-bottom-4 fill-mode-backwards block duration-300"
            style={{ animationDelay: "320ms" }}
          >
            {(() => {
              const isDark = theme === "dark";
              const oppositeLabel = isDark ? "Modo claro" : "Modo oscuro";
              const ariaLabel = isDark
                ? "Cambiar a modo claro"
                : "Cambiar a modo oscuro";
              if (!themeMounted) {
                return (
                  <div className="text-muted-foreground flex cursor-default items-center justify-between gap-2 rounded-xl px-4 py-2.5 text-sm font-medium">
                    <span className="flex items-center gap-3">
                      <Sun className="h-5 w-5 flex-shrink-0" />
                      {!collapsed && "Tema"}
                    </span>
                  </div>
                );
              }
              return collapsed ? (
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      onClick={() => setTheme(isDark ? "light" : "dark")}
                      className="group text-muted-foreground hover:bg-secondary hover:text-secondary-foreground flex w-full cursor-pointer items-center justify-center rounded-xl px-2 py-2.5 text-sm font-medium transition-all duration-200 [&_svg]:size-5"
                      aria-label={ariaLabel}
                    >
                      {isDark ? (
                        <Sun className="h-5 w-5 flex-shrink-0 transition-transform group-hover:scale-110" />
                      ) : (
                        <Moon className="h-5 w-5 flex-shrink-0 transition-transform group-hover:scale-110" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">{oppositeLabel}</TooltipContent>
                </Tooltip>
              ) : (
                <Button
                  variant="ghost"
                  onClick={() => setTheme(isDark ? "light" : "dark")}
                  className="text-muted-foreground hover:bg-secondary hover:text-secondary-foreground flex w-full cursor-pointer items-center justify-between gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors [&_svg]:size-5"
                  aria-label={ariaLabel}
                >
                  <span className="flex items-center gap-3">
                    {isDark ? (
                      <Sun className="h-5 w-5 flex-shrink-0" />
                    ) : (
                      <Moon className="h-5 w-5 flex-shrink-0" />
                    )}
                    {oppositeLabel}
                  </span>
                </Button>
              );
            })()}
          </span>
        )}
      </nav>
      <div
        className={cn(
          "border-border mt-auto border-t",
          collapsed ? "p-2" : "space-y-3 p-4"
        )}
      >
        {effectivePlan?.plan_code === "BASE" &&
          (collapsed ? (
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Link
                  href={appPath("/settings/plan/change")}
                  className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20 flex w-full items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors"
                >
                  <Rocket className="h-4 w-4 shrink-0" />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Mejorar plan</TooltipContent>
            </Tooltip>
          ) : (
            <Link
              href={appPath("/settings/plan/change")}
              className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20 mb-2 flex w-full items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors"
            >
              <Rocket className="h-4 w-4 shrink-0" />
              <span>Mejora tu plan</span>
            </Link>
          ))}
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
                    <div className="flex flex-col gap-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium">
                          {getDisplayName(user, profileFullName)}
                        </p>
                        {effectivePlan?.plan_code && (
                          <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs font-medium">
                            {PLAN_DISPLAY_NAMES[effectivePlan.plan_code] ??
                              effectivePlan.plan_code}
                          </span>
                        )}
                      </div>
                      <p className="text-muted-foreground text-xs">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={appPath("/settings")}>
                      <Settings className="mr-2 h-4 w-4" />
                      Configuración
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      const url = getReportBugUrl({
                        viewTitle:
                          typeof document !== "undefined" ? document.title : "",
                        viewUrl:
                          typeof window !== "undefined"
                            ? window.location.href
                            : "",
                      });
                      window.open(url, "_blank", "noopener,noreferrer");
                    }}
                    className="cursor-pointer"
                  >
                    <Bug className="mr-2 h-4 w-4" />
                    Reportar fallo
                  </DropdownMenuItem>
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
              {getDisplayName(user, profileFullName)}
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
                {getDisplayName(user, profileFullName)}
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
                  aria-label="Cuenta y personalización"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium">
                        {getDisplayName(user, profileFullName)}
                      </p>
                      {effectivePlan?.plan_code && (
                        <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs font-medium">
                          {PLAN_DISPLAY_NAMES[effectivePlan.plan_code] ??
                            effectivePlan.plan_code}
                        </span>
                      )}
                    </div>
                    <p className="text-muted-foreground text-xs">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={appPath("/settings")}>
                    <Settings className="mr-2 h-4 w-4" />
                    Configuración
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    const url = getReportBugUrl({
                      viewTitle:
                        typeof document !== "undefined" ? document.title : "",
                      viewUrl:
                        typeof window !== "undefined"
                          ? window.location.href
                          : "",
                    });
                    window.open(url, "_blank", "noopener,noreferrer");
                  }}
                  className="cursor-pointer"
                >
                  <Bug className="mr-2 h-4 w-4" />
                  Reportar fallo
                </DropdownMenuItem>
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

export default function AppLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profileFullName, effectivePlan, signOut, loading } = useAuth();
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (loading) {
    return (
      <div className="flex h-screen flex-col p-6">
        <AppLayoutSkeleton />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <a href="#main-content" className="skip-link">
        Saltar al contenido
      </a>
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
            profileFullName={profileFullName}
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
          <SheetContent
            side="left"
            className="border-border w-64 border-r p-0"
            closeLabel="Cerrar menú"
          >
            <SheetHeader className="sr-only">
              <SheetTitle>Menú de Navegación</SheetTitle>
              <SheetDescription>
                Navegación principal de la aplicación
              </SheetDescription>
            </SheetHeader>
            <SidebarContent
              collapsed={false}
              user={user}
              profileFullName={profileFullName}
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
          tabIndex={-1}
          className={cn(
            "flex-1 overflow-x-hidden p-4 transition-all duration-300 md:p-5 print:ml-0 print:p-0",
            isCollapsed ? "md:ml-16" : "md:ml-64"
          )}
        >
          <div className="animate-in fade-in slide-in-from-bottom-4 mx-auto max-w-7xl duration-500">
            {(pathname.includes("/settings") ||
              pathname === appPath("/customization")) && (
              <nav
                aria-label="Breadcrumb"
                className="text-muted-foreground mb-4 flex items-center gap-1.5 text-sm md:mb-5"
              >
                <ol className="flex flex-wrap items-center gap-1.5">
                  {getSettingsBreadcrumbs(pathname).map((item, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                      {i > 0 && (
                        <ChevronRight
                          className="h-4 w-4 shrink-0 opacity-60"
                          aria-hidden
                        />
                      )}
                      {item.href ? (
                        <Link
                          href={item.href}
                          className="hover:text-foreground transition-colors"
                        >
                          {item.label}
                        </Link>
                      ) : (
                        <span
                          className="text-foreground font-medium"
                          aria-current="page"
                        >
                          {item.label}
                        </span>
                      )}
                    </li>
                  ))}
                </ol>
              </nav>
            )}
            {children}
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
}
