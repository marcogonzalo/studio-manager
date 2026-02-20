"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Home, Construction, ArrowLeft } from "lucide-react";

export default function NotFound() {
  const { user } = useAuth();
  const router = useRouter();

  const handleGoHome = () => {
    router.push(user ? "/dashboard" : "/");
  };

  return (
    <div className="not-found-pattern bg-background from-primary/5 via-background to-primary/5 relative flex min-h-screen items-center justify-center bg-gradient-to-br p-4">
      <Card className="border-border w-full max-w-2xl border-2 border-dashed">
        <CardHeader className="space-y-4 pb-4 text-center">
          <div className="bg-primary/10 mx-auto flex h-24 w-24 items-center justify-center rounded-full">
            <Construction className="text-primary h-12 w-12" aria-hidden />
          </div>
          <div>
            <p className="text-muted-foreground mb-1 text-sm font-medium">
              Página no encontrada
            </p>
            <CardTitle className="text-foreground mb-2 pt-8 pb-8 text-6xl font-bold">
              Error 404
            </CardTitle>
            <CardDescription className="text-muted-foreground text-xl font-semibold">
              Parece que esta vista no estaba en los planos originales. 😅
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-muted-foreground text-base">
            Por favor, intenta volver a la página anterior o ir al inicio.
          </p>
          <div className="space-y-2 pt-4">
            <p className="text-muted-foreground text-sm italic">
              En arquitectura, cada error es una lección. En la vida, una
              oportunidad de mejorar.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col justify-center gap-3 pt-4 sm:flex-row">
          <Button
            variant="outline"
            size="lg"
            onClick={() => router.back()}
            className="w-full sm:w-auto"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver atrás
          </Button>
          <Button onClick={handleGoHome} size="lg" className="w-full sm:w-auto">
            <Home className="mr-2 h-4 w-4" />
            {user ? "Volver al Dashboard" : "Ir al Inicio"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
