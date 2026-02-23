"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

/**
 * Wrapper estándar para el contenido de cada pestaña de proyecto.
 * - readOnly: no se usa aquí; cada tab oculta botones de edición cuando readOnly.
 * - disabled: cuando la funcionalidad no está en el plan, muestra el contenido
 *   con overlay y mensaje "Mejora tu plan" (estilo vista de costos).
 * Ambos estados pueden darse a la vez.
 */
export function ProjectTabContent({
  disabled = false,
  disabledMessage = "Esta sección no está incluida en tu plan actual.",
  children,
}: {
  disabled?: boolean;
  disabledMessage?: string;
  children: React.ReactNode;
}) {
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
            {disabledMessage}
          </p>
          <Button asChild size="sm" variant="secondary">
            <Link href="/settings/plan/change">Mejora tu plan</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
