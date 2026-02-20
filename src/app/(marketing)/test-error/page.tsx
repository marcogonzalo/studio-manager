"use client";

import { Button } from "@/components/ui/button";

/**
 * Página solo para desarrollo: el botón lanza un error en el cliente y muestra app/error.tsx.
 * No enlazar desde la UI en producción.
 */
export default function TestErrorPage() {
  const triggerError = () => {
    throw new Error("Error de prueba para comprobar la vista error.tsx");
  };

  return (
    <div className="container mx-auto max-w-md py-16 text-center">
      <p className="text-muted-foreground mb-4">
        Probar la vista de error de ruta (error.tsx).
      </p>
      <Button onClick={triggerError}>Provocar error</Button>
    </div>
  );
}
