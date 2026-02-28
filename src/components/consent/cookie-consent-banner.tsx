"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  CONSENT_STORAGE_KEY,
  DEFAULT_STATE,
  loadStoredConsent,
  consentStateToGtmPayload,
  getDefaultGtmConsent,
  pushConsentDefault,
  pushConsentUpdate,
  type ConsentState,
} from "@/lib/consent";
import { cn } from "@/lib/utils";

function saveConsent(state: ConsentState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(state));
}

export function CookieConsentBanner() {
  const [visible, setVisible] = React.useState(false);
  const [customOpen, setCustomOpen] = React.useState(false);
  const [customState, setCustomState] =
    React.useState<ConsentState>(DEFAULT_STATE);

  React.useEffect(() => {
    const stored = loadStoredConsent();
    if (stored) {
      pushConsentUpdate(consentStateToGtmPayload(stored));
      setVisible(false);
    } else {
      pushConsentDefault(getDefaultGtmConsent(true));
      setVisible(true);
      setCustomState(DEFAULT_STATE);
    }
  }, []);

  const applyAndClose = React.useCallback((state: ConsentState) => {
    saveConsent(state);
    pushConsentUpdate(consentStateToGtmPayload(state));
    setVisible(false);
    setCustomOpen(false);
  }, []);

  const handleAcceptAll = () => {
    const state: ConsentState = {
      necessary: true,
      analytics: true,
      marketing: true,
      personalization: true,
    };
    applyAndClose(state);
  };

  const handleRejectAll = () => {
    applyAndClose(DEFAULT_STATE);
  };

  const handleCustomizeSave = () => {
    applyAndClose(customState);
  };

  if (!visible) return null;

  return (
    <>
      <div
        role="dialog"
        aria-label="Preferencias de cookies"
        className={cn(
          "border-border bg-card text-card-foreground fixed right-0 bottom-0 left-0 z-50 border-t shadow-lg",
          "animate-in slide-in-from-bottom duration-300"
        )}
      >
        <div className="container mx-auto max-w-4xl px-4 py-4 text-right">
          <p className="text-muted-foreground mb-4 text-sm">
            Usamos cookies para analítica, publicidad y mejorar la experiencia.
            Puedes aceptar todas, rechazarlas o personalizar.
          </p>
          <div className="flex flex-col flex-wrap items-stretch justify-end gap-3 sm:flex-row sm:items-center">
            <Button
              onClick={() => setCustomOpen(true)}
              variant="ghost"
              size="sm"
              className="h-10 w-full sm:h-8 sm:w-auto"
            >
              Personalizar
            </Button>
            <Button
              onClick={handleRejectAll}
              variant="outline"
              size="sm"
              className="h-10 w-full sm:h-8 sm:w-auto"
            >
              Rechazar todo
            </Button>
            <Button
              onClick={handleAcceptAll}
              size="sm"
              className="h-10 w-full sm:h-8 sm:w-auto"
            >
              Aceptar todo
            </Button>
          </div>
        </div>
      </div>

      <Sheet open={customOpen} onOpenChange={setCustomOpen}>
        <SheetContent
          side="bottom"
          className="rounded-t-2xl"
          closeLabel="Cerrar"
        >
          <SheetHeader>
            <SheetTitle>Preferencias de cookies</SheetTitle>
            <SheetDescription>
              Elige qué categorías de cookies quieres permitir. Las necesarias
              son siempre activas.
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-4 py-6">
            <label className="border-border bg-muted/30 flex items-center gap-3 rounded-lg border px-4 py-3">
              <Checkbox checked disabled />
              <div>
                <span className="font-medium">Necesarias</span>
                <p className="text-muted-foreground text-xs">
                  Sesión, seguridad y funcionamiento básico. Siempre activas.
                </p>
              </div>
            </label>
            <label className="border-border hover:bg-muted/30 flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition-colors">
              <Checkbox
                checked={customState.analytics}
                onCheckedChange={(v) =>
                  setCustomState((s) => ({ ...s, analytics: v === true }))
                }
              />
              <div>
                <span className="font-medium">Analítica</span>
                <p className="text-muted-foreground text-xs">
                  Nos ayudan a entender cómo usas la web (p. ej. visitas,
                  páginas).
                </p>
              </div>
            </label>
            <label className="border-border hover:bg-muted/30 flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition-colors">
              <Checkbox
                checked={customState.marketing}
                onCheckedChange={(v) =>
                  setCustomState((s) => ({ ...s, marketing: v === true }))
                }
              />
              <div>
                <span className="font-medium">Marketing</span>
                <p className="text-muted-foreground text-xs">
                  Publicidad y medición de campañas (Google Ads, etc.).
                </p>
              </div>
            </label>
            <label className="border-border hover:bg-muted/30 flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition-colors">
              <Checkbox
                checked={customState.personalization}
                onCheckedChange={(v) =>
                  setCustomState((s) => ({ ...s, personalization: v === true }))
                }
              />
              <div>
                <span className="font-medium">Personalización</span>
                <p className="text-muted-foreground text-xs">
                  Contenido y recomendaciones adaptados a ti.
                </p>
              </div>
            </label>
          </div>
          <SheetFooter>
            <Button variant="outline" onClick={() => setCustomOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCustomizeSave}>Guardar preferencias</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
