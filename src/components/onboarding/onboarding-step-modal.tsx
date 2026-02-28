"use client";

import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { appPath } from "@/lib/app-paths";
import type { OnboardingStepId } from "@/lib/onboarding";

const WELCOME_COPY = {
  title: "¡Bienvenid@!",
  lines: [
    "¡Qué alegría que hayas llegado hasta aquí!",
    "Veta ha sido desarrollada con mucho cariño y dedicación y espero que sea de tu agrado.",
    "Ahora, vamos a realizar unos primeros pasos de configuración...",
  ],
  cta: "Continuar",
};

function buildOnboardingUrl(href: string, stepId: OnboardingStepId): string {
  const base = href.startsWith("/") ? href : appPath(href);
  const separator = base.includes("?") ? "&" : "?";
  return `${base}${separator}onboarding=${stepId}`;
}

export interface OnboardingStepModalProps {
  stepId: OnboardingStepId;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOmitir: () => void;
  onWelcomeComplete: () => Promise<void>;
}

export function OnboardingStepModal({
  stepId,
  open,
  onOpenChange,
  onOmitir,
  onWelcomeComplete,
}: OnboardingStepModalProps) {
  const handleOmitir = () => {
    onOmitir();
    onOpenChange(false);
  };

  if (stepId === "welcome") {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="max-w-md"
          aria-describedby="onboarding-welcome-desc"
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-2xl">{WELCOME_COPY.title}</DialogTitle>
            <div
              id="onboarding-welcome-desc"
              className="text-muted-foreground mt-2 space-y-2 text-sm"
            >
              {WELCOME_COPY.lines.map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          </DialogHeader>
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button
              className="w-full sm:w-auto"
              onClick={async () => {
                await onWelcomeComplete();
                // No cerrar: el siguiente paso (config) se mostrará al actualizar firstPendingStepId
              }}
            >
              {WELCOME_COPY.cta}
            </Button>
            <Button
              variant="ghost"
              className="w-full sm:w-auto"
              onClick={handleOmitir}
            >
              Más tarde
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  const stepConfig: Record<
    Exclude<OnboardingStepId, "welcome">,
    {
      title: string;
      description: string;
      primaryHref: string;
      primaryLabel: string;
      secondaryHref?: string;
      secondaryLabel?: string;
    }
  > = {
    config: {
      title: "Configurar cuenta y personalización",
      description:
        "Completa tu perfil, moneda e impuesto por defecto para usar Veta con comodidad.",
      primaryHref: appPath("/settings/account"),
      primaryLabel: "Ir a Cuenta",
      secondaryHref: appPath("/settings/customization"),
      secondaryLabel: "Ir a Personalización",
    },
    client: {
      title: "Añadir un cliente",
      description: "Crea tu primer cliente para asociarlo a proyectos.",
      primaryHref: appPath("/clients"),
      primaryLabel: "Ir a Clientes",
    },
    project: {
      title: "Crear un proyecto",
      description:
        "Crea tu primer proyecto para organizar espacios y presupuestos.",
      primaryHref: appPath("/projects"),
      primaryLabel: "Ir a Proyectos",
    },
    "public-profile": {
      title: "Nombre público y correo público",
      description:
        "Configura cómo quieres que aparezcan tu nombre y correo en los presupuestos.",
      primaryHref: appPath("/settings/customization"),
      primaryLabel: "Ir a Personalización",
    },
  };

  const config = stepConfig[stepId];
  if (!config) return null;

  const primaryUrl = buildOnboardingUrl(config.primaryHref, stepId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-md"
        aria-describedby={`onboarding-step-desc-${stepId}`}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>{config.title}</DialogTitle>
          <DialogDescription id={`onboarding-step-desc-${stepId}`}>
            {config.description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button asChild className="w-full sm:w-auto">
            <Link href={primaryUrl} onClick={() => onOpenChange(false)}>
              {config.primaryLabel}
            </Link>
          </Button>
          {config.secondaryHref && config.secondaryLabel && (
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link
                href={buildOnboardingUrl(config.secondaryHref, stepId)}
                onClick={() => onOpenChange(false)}
              >
                {config.secondaryLabel}
              </Link>
            </Button>
          )}
          <Button
            variant="ghost"
            className="w-full sm:w-auto"
            onClick={handleOmitir}
          >
            Más tarde
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
