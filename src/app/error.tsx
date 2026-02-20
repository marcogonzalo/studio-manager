"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="not-found-pattern bg-background from-primary/5 via-background to-primary/5 relative flex min-h-screen items-center justify-center bg-gradient-to-br p-4">
      <Card className="border-border w-full max-w-2xl border-2 border-dashed">
        <CardHeader className="space-y-4 pt-8 pb-4 text-center">
          <div className="bg-destructive/10 mx-auto flex h-24 w-24 items-center justify-center rounded-full">
            <AlertTriangle className="text-destructive h-12 w-12" aria-hidden />
          </div>
          <div>
            <p className="text-muted-foreground mb-1 text-sm font-medium">
              Algo ha fallado
              {error.digest && (
                <span
                  className="ml-2 font-mono text-xs"
                  title="Código de error"
                >
                  (código {error.digest})
                </span>
              )}
            </p>
            <CardTitle className="text-foreground mb-2 pt-8 pb-8 text-3xl font-bold sm:text-4xl">
              Error inesperado
            </CardTitle>
            <CardDescription className="text-muted-foreground text-lg font-semibold">
              Ha ocurrido un problema al cargar esta vista.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-muted-foreground text-base">
            {error.message || "Vuelve a intentar o regresa al inicio."}
          </p>
          <p className="text-muted-foreground text-sm">
            Si el problema continúa, contacta con soporte.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col justify-center gap-3 pt-4 sm:flex-row">
          <Button
            size="lg"
            onClick={() => reset()}
            className="w-full sm:w-auto"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Reintentar
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
