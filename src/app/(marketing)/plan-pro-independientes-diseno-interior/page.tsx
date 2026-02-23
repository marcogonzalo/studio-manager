import type { Metadata } from "next";
import Link from "next/link";
import {
  Check,
  Sparkles,
  ArrowRight,
  Layers,
  Wallet,
  FileText,
  BarChart3,
  Receipt,
  Globe,
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
  title:
    "Plan Pro | Gestión de proyectos de diseño interior con varios encargos",
  description:
    "Plan Pro de Veta: gestión de proyectos e interiorismo a escala. 5 proyectos activos, gestión de presupuestos personalizada, control de costes, pedidos y pagos. Para arquitectura de diseño interior con cartera de proyectos.",
  alternates: { canonical: "/plan-pro-independientes-diseno-interior" },
  openGraph: {
    title:
      "Plan Pro - Gestión de proyectos de diseño interior | Varios encargos | Veta",
    description:
      "Gestión de proyectos y gestión de presupuestos para profesionales de diseño interior. 5 proyectos activos, control de costes y pagos.",
    url: "/plan-pro-independientes-diseno-interior",
  },
  twitter: {
    card: "summary_large_image",
    title: "Plan Pro - Diseño interior con varios proyectos | Veta",
    description:
      "Gestión de proyectos de diseño interior con gestión de presupuestos, costes y pagos. Interiorismo profesional.",
  },
};

const pains = [
  {
    title:
      "Varios proyectos de diseño interior a la vez y se me escapa el control",
    description:
      "Con Pro tienes hasta 5 proyectos activos en paralelo. Gestión de proyectos y gestión de presupuestos por encargo: costes y pagos. Una sola herramienta para tu interiorismo, todo bajo control.",
  },
  {
    title: "Proyectos más grandes y no sé si estoy ganando o perdiendo",
    description:
      "Control de costes y márgenes por proyecto: ves en tiempo real gastos, ingresos y margen. Pedidos de compra y seguimiento de pagos. Esencial en arquitectura de diseño interior con encargos grandes.",
  },
  {
    title: "Necesito profesionalizar la gestión del dinero",
    description:
      "Gestión de presupuestos personalizada, moneda e impuesto por proyecto, control de pagos y pedidos a proveedores. Todo lo que un profesional de diseño interior con cartera necesita para facturar y cobrar con tranquilidad.",
  },
];

const features = getCommercialFeatures(getPlanConfigForDisplay("PRO"), {
  include: COMPACT_FEATURE_KEYS,
});

const highlights = [
  {
    icon: Layers,
    title: "5 proyectos activos",
    text: "Gestión de proyectos de diseño interior con varios encargos en paralelo sin cambiar de herramienta ni de contexto.",
  },
  {
    icon: BarChart3,
    title: "Costes y márgenes",
    text: "Sabe en todo momento cuánto gastas, cuánto facturas y cuánto ganas por proyecto.",
  },
  {
    icon: Receipt,
    title: "Pedidos de compra y pagos",
    text: "Registra pedidos a proveedores y el estado de pagos para no perder el hilo.",
  },
  {
    icon: Globe,
    title: "Moneda e impuesto por proyecto",
    text: "Trabaja con clientes en distintas monedas o regímenes fiscales sin mezclar números.",
  },
  {
    icon: FileText,
    title: "Gestión de presupuestos personalizada",
    text: "Exporta presupuestos adaptados a cada proyecto y cliente. Clave en interiorismo profesional.",
  },
  {
    icon: Wallet,
    title: "10 GB de almacenamiento",
    text: "Sube renders, documentos y archivos sin quedarte corto.",
  },
];

export default function PlanProPage() {
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
              Plan Pro · El más elegido
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Varios proyectos, un solo control.{" "}
              <span className="text-primary">
                Sin perder el norte del dinero
              </span>
            </h1>
            <p className="text-muted-foreground mt-6 text-lg md:text-xl">
              Si ya tienes una cartera de proyectos de diseño interior al año,
              varios a la vez o encargos más grandes que exigen gestión de
              proyectos y seguimiento serio de costes y pagos, el plan Pro está
              pensado para ti. Hasta 5 proyectos activos, gestión de
              presupuestos personalizada, control de márgenes, pedidos y pagos:
              la herramienta de interiorismo que necesitas para no volver a
              preguntarte "¿en este proyecto gano o pierdo?".
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Button size="lg" className="animate-glow" asChild>
                <Link href="/auth/signup">
                  Prueba Pro 30 días gratis
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
              Si te identificas con esto, Pro es tu plan
            </h2>
            <p className="text-muted-foreground mt-4 text-lg">
              Para profesionales de diseño interior e interiorismo que ya
              facturan y quieren gestión de proyectos y gestión de presupuestos
              con control total del flujo de dinero.
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
              Gestión de proyectos y de presupuestos en un solo sitio
            </h2>
            <p className="text-muted-foreground mt-4 text-lg">
              Costes, márgenes, pedidos, pagos y gestión de presupuestos para
              diseño interior. Todo para dominar la economía de tus proyectos.
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
                  Incluido en Pro
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
              30 días gratis · Sin permanencia
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Gestión de proyectos de diseño interior sin improvisar.
            </h2>
            <p className="text-muted-foreground mt-4 text-lg">
              Prueba el plan Pro 30 días sin coste. Si encaja con tu ritmo de
              interiorismo y gestión de presupuestos, te quedas. Si no, sin
              compromiso.
            </p>
            <div className="mt-8">
              <Button size="lg" className="animate-glow" asChild>
                <Link href="/auth/signup">
                  Probar Pro 30 días gratis
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
