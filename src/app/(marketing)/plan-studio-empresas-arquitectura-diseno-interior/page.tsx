import type { Metadata } from "next";
import Link from "next/link";
import {
  Check,
  Sparkles,
  ArrowRight,
  Building2,
  Users,
  Infinity,
  Headphones,
  FileText,
  Shield,
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
  title: "Plan Studio | Gestión de proyectos para estudios de diseño interior",
  description:
    "Plan Studio de Veta: gestión de proyectos e interiorismo a escala. Hasta 50 proyectos activos, gestión de presupuestos con tu marca (white label), soporte prioritario. Para estudios de arquitectura de diseño interior con equipo y ritmo continuo.",
  alternates: {
    canonical: "/plan-studio-empresas-arquitectura-diseno-interior",
  },
  openGraph: {
    title: "Plan Studio - Estudios de arquitectura de diseño interior | Veta",
    description:
      "Gestión de proyectos y gestión de presupuestos para estudios de diseño interior. 50 proyectos, marca propia, soporte prioritario, 100 GB.",
    url: "/plan-studio-empresas-arquitectura-diseno-interior",
  },
  twitter: {
    card: "summary_large_image",
    title: "Plan Studio - Interiorismo y estudios | Veta",
    description:
      "Gestión de proyectos de diseño interior para estudios: múltiples proyectos, equipo, gestión de presupuestos con tu marca.",
  },
};

const pains = [
  {
    title: "El ritmo no para: cierro un proyecto y entro en otro",
    description:
      "Con Studio la gestión de proyectos de diseño interior escala: hasta 50 proyectos activos. Misma herramienta para todo el equipo: gestión de presupuestos, costes, pagos y documentos. Interiorismo sin cuellos de botella.",
  },
  {
    title: "Somos varios y necesitamos una sola fuente de verdad",
    description:
      "Un único espacio para proyectos, clientes, proveedores y gestión de presupuestos. Estudios de arquitectura de diseño interior con el equipo alineado, sin duplicar datos ni perder el hilo.",
  },
  {
    title: "Queremos presupuestos con nuestra marca y soporte de verdad",
    description:
      "Gestión de presupuestos con tu marca (white label), moneda e impuesto por proyecto y soporte prioritario. Para estudios de diseño interior e interiorismo que no pueden parar.",
  },
];

const features = getCommercialFeatures(getPlanConfigForDisplay("STUDIO"), {
  include: COMPACT_FEATURE_KEYS,
});

const highlights = [
  {
    icon: Building2,
    title: "Hasta 50 proyectos activos",
    text: "Gestión de proyectos de diseño interior a ritmo alto: múltiples proyectos en paralelo para estudios de interiorismo con flujo constante.",
  },
  {
    icon: FileText,
    title: "Gestión de presupuestos con tu marca",
    text: "White label: exporta presupuestos con tu identidad. Esencial en arquitectura de diseño interior con equipo.",
  },
  {
    icon: Infinity,
    title: "100 GB de almacenamiento",
    text: "Renders, documentos y archivos de muchos proyectos sin preocuparte por el espacio.",
  },
  {
    icon: Headphones,
    title: "Soporte prioritario",
    text: "Atención prioritaria cuando lo necesites. Tu estudio no puede esperar.",
  },
  {
    icon: Users,
    title: "Para todo el equipo",
    text: "Una cuenta, todos los proyectos. Colaboración y visibilidad compartida.",
  },
  {
    icon: Shield,
    title: "Control total: costes, pagos, pedidos",
    text: "Todo lo del plan Pro, a escala: pedidos de compra, pagos y moneda por proyecto.",
  },
];

export default function PlanStudioPage() {
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
              <Sparkles className="h-4 w-4" />
              Plan Studio · Para estudios consolidados
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Estudio que no para.{" "}
              <span className="text-primary">Una herramienta que acompaña</span>
            </h1>
            <p className="text-muted-foreground mt-6 text-lg md:text-xl">
              Si tienes un estudio de arquitectura de diseño interior
              consolidado, con equipo y un ritmo donde cerras un proyecto y ya
              empieza otro, el plan Studio está pensado para vosotros. Gestión
              de proyectos a escala: hasta 50 proyectos activos, gestión de
              presupuestos con tu marca, soporte prioritario y 100 GB. La
              plataforma de interiorismo que escala con tu estudio.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Button size="lg" className="animate-glow" asChild>
                <Link href="/auth/signup">
                  Prueba Studio 30 días gratis
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/pricing">Ver precios y comparativa</Link>
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
              Si tu estudio vive esto, Studio es vuestro plan
            </h2>
            <p className="text-muted-foreground mt-4 text-lg">
              Para equipos y estudios de diseño interior e interiorismo con
              múltiples proyectos, gestión de presupuestos seria y soporte de
              nivel profesional.
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
              Gestión de proyectos y presupuestos para el estudio completo
            </h2>
            <p className="text-muted-foreground mt-4 text-lg">
              Estudios de diseño interior: más proyectos, gestión de
              presupuestos con tu marca, más almacenamiento y soporte
              prioritario.
            </p>
          </AnimatedSection>

          <div className="mx-auto grid max-w-5xl gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {highlights.map((item) => (
              <AnimatedSection key={item.title} className="flex gap-4">
                <div className="bg-primary/10 text-primary flex h-12 w-12 shrink-0 items-center justify-center rounded-lg">
                  <item.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {item.text}
                  </p>
                </div>
              </AnimatedSection>
            ))}
          </div>

          <AnimatedSection className="mx-auto mt-16 max-w-xl">
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Check className="text-primary h-5 w-5" />
                  Incluido en Studio
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
              30 días gratis · Soporte prioritario
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Escala con tu estudio. Nosotros te acompañamos.
            </h2>
            <p className="text-muted-foreground mt-4 text-lg">
              Prueba el plan Studio 30 días sin coste. Gestión de proyectos y
              gestión de presupuestos para estudios de diseño interior e
              interiorismo. Si necesitas condiciones específicas, hablamos.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button size="lg" className="animate-glow" asChild>
                <Link href="/auth/signup">
                  Probar Studio 30 días gratis
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/contact">Hablar con ventas</Link>
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
