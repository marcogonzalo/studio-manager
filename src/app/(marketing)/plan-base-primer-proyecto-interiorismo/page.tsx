import type { Metadata } from "next";
import Link from "next/link";
import {
  Check,
  Sparkles,
  Zap,
  Shield,
  ArrowRight,
  FileText,
  FolderKanban,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AnimatedSection,
  StaggerContainer,
  StaggerItem,
} from "@/components/ui/animated-section";
import {
  getCommercialFeatures,
  getPlanConfigForDisplay,
  COMPACT_FEATURE_KEYS,
} from "@/lib/plan-copy";

export const metadata: Metadata = {
  title: "Plan Base gratis | Gestión de proyectos de diseño interior sin pagar",
  description:
    "Plan Base de Veta: gestión de proyectos y gestión de presupuestos para interiorismo. 100% gratis para empezar en arquitectura de diseño interior. Un proyecto, presupuestos en PDF, notas. Ideal si aún no tienes flujo o quieres probar.",
  alternates: { canonical: "/plan-base-primer-proyecto-interiorismo" },
  openGraph: {
    title: "Plan Base - Gestión de proyectos de diseño interior gratis | Veta",
    description:
      "Prueba la gestión de proyectos de diseño interior sin pagar. Gestión de presupuestos básica, un proyecto, notas. Interiorismo sin compromiso.",
    url: "/plan-base-primer-proyecto-interiorismo",
  },
  twitter: {
    card: "summary_large_image",
    title: "Plan Base - Diseño interior y gestión de proyectos gratis | Veta",
    description:
      "Gestión de proyectos y presupuestos para diseño interior. Prueba gratis, ideal para interiorismo en solitario.",
  },
};

const pains = [
  {
    title: "No quiero pagar sin haber probado",
    description:
      "Entendemos la duda. Con el plan Base usas Veta gratis, sin tarjeta ni compromiso. Cuando veas el valor, decides si subir de plan.",
  },
  {
    title: "Apenas estoy empezando en interiorismo por mi cuenta",
    description:
      "Un solo proyecto activo es suficiente para ordenar tu primer encargo de diseño interior: clientes, proveedores, gestión de presupuestos en PDF y notas. Sin sobrecarga.",
  },
  {
    title: "Aún no tengo un flujo constante de proyectos",
    description:
      "No necesitas un plan caro para proyectos esporádicos. Base te deja hacer gestión de proyectos de punta a punta en un encargo y crecer cuando lleguen más.",
  },
];

const features = getCommercialFeatures(getPlanConfigForDisplay("BASE"), {
  include: COMPACT_FEATURE_KEYS,
});

const highlights = [
  {
    icon: FolderKanban,
    title: "Un proyecto activo",
    text: "Gestión de proyectos enfocada en un encargo de diseño interior. Ideal para arrancar en interiorismo o probar la herramienta.",
  },
  {
    icon: FileText,
    title: "Gestión de presupuestos en PDF",
    text: "Exporta presupuestos profesionales para tu cliente desde el primer día. Esencial en arquitectura de diseño interior.",
  },
  {
    icon: BarChart3,
    title: "Control de costes básico",
    text: "Visualiza gastos y mantén las cuentas claras sin complicaciones.",
  },
  {
    icon: Shield,
    title: "Sin sorpresas",
    text: "Cero coste, cero permanencia. Subes de plan solo cuando tú quieras.",
  },
];

export default function PlanBasePage() {
  return (
    <>
      {/* Hero */}
      <section className="hero-pattern-overlay relative overflow-hidden py-20 md:py-32">
        <div className="from-primary/5 absolute inset-0 bg-gradient-to-br via-transparent to-transparent" />
        <div className="bg-primary/5 absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl" />
        <div className="noise-overlay" aria-hidden />

        <div className="relative container mx-auto max-w-7xl px-4">
          <AnimatedSection className="mx-auto max-w-3xl text-center">
            <div className="text-primary border-primary/30 bg-primary/10 mb-4 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium">
              <Zap className="h-4 w-4" />
              Plan Base · Gratis para siempre
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Prueba sin pagar.{" "}
              <span className="text-primary">Decide cuando quieras crecer</span>
            </h1>
            <p className="text-muted-foreground mt-6 text-lg md:text-xl">
              Pensado para quien prefiere probar antes de invertir y crecer
              cuando tenga más proyectos.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Button size="lg" className="animate-glow" asChild>
                <Link href="/sign-up">
                  Crear cuenta gratis
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/pricing">Ver todos los planes</Link>
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <div
        className="via-primary/40 h-1 w-full bg-gradient-to-r from-transparent to-transparent"
        aria-hidden
      />

      {/* Pains → Solución */}
      <section className="bg-muted/30 py-20">
        <div className="container mx-auto max-w-7xl px-4">
          <AnimatedSection className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Si te suena esto, el plan Base encaja
            </h2>
            <p className="text-muted-foreground mt-4 text-lg">
              Si estás empezando en arquitectura o diseño interior en solitario,
              aún no tienes un flujo estable de proyectos o quieres conocer la
              gestión de proyectos de interiorismo en Veta sin compromiso, el
              plan Base es para ti. Un proyecto con su gestión de presupuestos y
              control de gastos: todo gratis.
            </p>
          </AnimatedSection>

          <StaggerContainer
            className="mx-auto grid max-w-4xl gap-8 sm:grid-cols-1 md:grid-cols-3"
            staggerDelay={0.1}
          >
            {pains.map((pain) => (
              <StaggerItem key={pain.title}>
                <Card className="h-full border-none shadow-sm transition-all duration-300 hover:shadow-md">
                  <CardHeader>
                    <CardTitle className="text-lg">{pain.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{pain.description}</p>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Qué incluye */}
      <section className="py-20">
        <div className="container mx-auto max-w-7xl px-4">
          <AnimatedSection className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Todo para arrancar en diseño interior
            </h2>
            <p className="text-muted-foreground mt-4 text-lg">
              Gestión de proyectos en un encargo: clientes, catálogo, gestión de
              presupuestos y documentos.
            </p>
          </AnimatedSection>

          <div className="mx-auto grid max-w-5xl gap-8 sm:grid-cols-2">
            {highlights.map((item) => (
              <AnimatedSection key={item.title} className="flex gap-4">
                <div className="bg-primary/10 text-primary flex h-12 w-12 shrink-0 items-center justify-center rounded-lg">
                  <item.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="text-muted-foreground mt-1">{item.text}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>

          <AnimatedSection className="mx-auto mt-16 max-w-xl">
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Check className="text-primary h-5 w-5" />
                  Incluido en Base
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-muted-foreground space-y-2">
                  {features.map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <Check className="text-primary h-4 w-4 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </AnimatedSection>
        </div>
      </section>

      {/* CTA final */}
      <section className="relative overflow-hidden py-20">
        <div className="from-primary/10 via-primary/5 absolute inset-0 bg-gradient-to-br to-transparent" />
        <div className="bg-primary/10 absolute top-0 right-0 h-96 w-96 translate-x-1/3 -translate-y-1/2 rounded-full blur-3xl" />

        <div className="relative container mx-auto max-w-7xl px-4">
          <AnimatedSection className="mx-auto max-w-2xl text-center">
            <div className="text-primary mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium">
              <Sparkles className="h-4 w-4" />
              Sin tarjeta · Sin compromiso
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Empieza hoy. Paga cuando decidas crecer.
            </h2>
            <p className="text-muted-foreground mt-4 text-lg">
              Crea tu cuenta en un minuto y empieza con la gestión de proyectos
              y gestión de presupuestos para diseño interior sin coste. Cuando
              tengas más encargos de interiorismo, puedes pasar al plan Pro.
            </p>
            <div className="mt-8">
              <Button size="lg" className="animate-glow" asChild>
                <Link href="/sign-up">
                  Crear cuenta gratis
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
