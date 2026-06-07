"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { appPath } from "@/lib/app-paths";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Encabezado estándar de sección (título + acciones opcionales).
 * Altura mínima fija para que no cambie al mostrar/ocultar botones.
 * En detalle de proyecto, el título en móvil lo sustituye el Select de pestañas.
 */
export function TabSectionHeader({
  title,
  subtitle,
  children,
  hideTitleOnMobile = true,
}: {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  hideTitleOnMobile?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex min-h-[48px] flex-row flex-wrap items-center gap-3 sm:gap-4",
        hideTitleOnMobile && children == null && "hidden md:flex"
      )}
    >
      <div
        className={cn(
          "min-w-0 flex-1 space-y-1",
          hideTitleOnMobile && "hidden md:block"
        )}
      >
        <h3 className="text-lg font-medium">{title}</h3>
        {subtitle && (
          <p className="text-muted-foreground text-sm">{subtitle}</p>
        )}
      </div>
      {children != null && (
        <div className="ml-auto flex shrink-0 flex-wrap items-center justify-end gap-2">
          {children}
        </div>
      )}
    </div>
  );
}

/**
 * Wrapper estándar para el contenido de cada pestaña de proyecto.
 * - readOnly: no se pasa aquí; cada tab lo recibe en props y oculta edición. El dashboard
 *   combina `readOnly` con `disabled` del plan al llamar a este wrapper (`disabled || readOnly`).
 * - disabled: cuando la funcionalidad no está en el plan, muestra el contenido
 *   con overlay y mensaje "Mejora tu plan" (estilo vista de costos).
 * Ambos estados pueden darse a la vez.
 */
export function ProjectTabContent({
  disabled = false,
  disabledMessage,
  children,
}: {
  disabled?: boolean;
  disabledMessage?: string;
  children: React.ReactNode;
}) {
  const tTab = useTranslations("ProjectTabContent");
  const tNav = useTranslations("AppNav");
  const resolvedDisabledMessage =
    disabledMessage ?? tTab("disabledMessageDefault");

  if (!disabled) return <>{children}</>;

  return (
    <div className="relative">
      <div className="pointer-events-none opacity-90 select-none">
        {children}
      </div>
      <div
        className="bg-background/60 pointer-events-auto absolute inset-0 z-10 flex items-center justify-center rounded-lg"
        aria-hidden="true"
      >
        <div className="bg-card text-card-foreground border-border flex max-w-sm flex-col items-center gap-4 rounded-lg border px-5 py-4 shadow-md">
          <p className="text-muted-foreground text-center text-sm">
            {resolvedDisabledMessage}
          </p>
          <Button asChild size="sm" variant="secondary">
            <Link href={appPath("/settings/plan/change")}>
              {tNav("upgradePlanCta")}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
