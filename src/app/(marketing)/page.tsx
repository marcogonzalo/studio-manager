import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  FolderKanban,
  Users,
  ShoppingBag,
  Truck,
  BarChart3,
  FileText,
  Leaf,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Inicio",
  description:
    "Gestiona tus proyectos de diseño interior sin complicaciones. Plataforma todo-en-uno: clientes, proveedores, catálogos y presupuestos.",
  openGraph: {
    title: "Veta - Gestión de Proyectos de Diseño Interior",
    description:
      "Gestiona tus proyectos de diseño interior sin complicaciones. Plataforma todo-en-uno.",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Veta - Gestión de Proyectos de Diseño Interior",
    description:
      "Gestiona tus proyectos de diseño interior sin complicaciones.",
  },
};

const features = [
  {
    icon: FolderKanban,
    title: "Gestión de Proyectos",
    description:
      "Organiza tus proyectos de diseño interior con espacios, presupuestos y seguimiento de fases.",
  },
  {
    icon: Users,
    title: "Clientes",
    description:
      "Mantén toda la información de tus clientes organizada y accesible en un solo lugar.",
  },
  {
    icon: ShoppingBag,
    title: "Catálogo de Productos",
    description:
      "Gestiona tu catálogo de productos con imágenes, precios y referencias de proveedores.",
  },
  {
    icon: Truck,
    title: "Proveedores",
    description:
      "Administra tus proveedores y mantén un historial de compras y pedidos.",
  },
  {
    icon: BarChart3,
    title: "Control de Costos",
    description:
      "Visualiza gastos, ingresos y márgenes de cada proyecto en tiempo real.",
  },
  {
    icon: FileText,
    title: "Documentos PDF",
    description:
      "Genera presupuestos y documentos profesionales para tus clientes.",
  },
];

const benefits = [
  "Interfaz intuitiva diseñada para diseñadores",
  "Acceso desde cualquier dispositivo",
  "Datos seguros con cifrado de extremo a extremo",
  "Actualizaciones constantes sin costo adicional",
  "Soporte técnico personalizado",
  "Sin comisiones por transacciones",
];

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="from-primary/5 absolute inset-0 bg-gradient-to-br via-transparent to-transparent" />
        <div className="relative container mx-auto max-w-7xl px-4">
          <div className="mx-auto max-w-3xl text-center">
            <div className="bg-primary/10 text-primary mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium">
              <Leaf className="h-4 w-4" />
              <span>Diseñado para profesionales del diseño interior</span>
            </div>

            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Gestiona tus proyectos de diseño{" "}
              <span className="text-primary">sin complicaciones</span>
            </h1>

            <p className="text-muted-foreground mt-6 text-lg md:text-xl">
              La plataforma todo-en-uno para diseñadores de interiores.
              Administra proyectos, clientes, proveedores y presupuestos desde
              un solo lugar y toma el control.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" asChild className="w-full sm:w-auto">
                <Link href="/auth?mode=signup">
                  Comenzar Gratis
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="w-full sm:w-auto"
              >
                <Link href="#features">Ver Características</Link>
              </Button>
            </div>

            <p className="text-muted-foreground mt-4 text-sm">
              30 días de prueba gratis. Sin tarjeta, sin compromiso. Cancela cuando quieras.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-muted/30 py-20">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Todo lo que necesitas para tu estudio
            </h2>
            <p className="text-muted-foreground mt-4 text-lg">
              Herramientas diseñadas específicamente para profesionales del
              diseño interior.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card
                key={feature.title}
                className="border-none shadow-md transition-shadow hover:shadow-lg"
              >
                <CardHeader>
                  <div className="bg-primary/10 mb-4 flex h-12 w-12 items-center justify-center rounded-lg">
                    <feature.icon className="text-primary h-6 w-6" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                ¿Por qué elegir Veta?
              </h2>
              <p className="text-muted-foreground mt-4 text-lg">
                Simplificamos la gestión de tu estudio para que puedas enfocarte
                en lo que mejor sabes hacer: diseñar espacios increíbles.
              </p>

              <ul className="mt-8 space-y-4">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-center gap-3">
                    <CheckCircle2 className="text-primary h-5 w-5 flex-shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-10">
                <Button size="lg" asChild>
                  <Link href="/auth?mode=signup">
                    Prueba Gratis
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="relative">
              <div className="from-primary/20 via-primary/10 border-border flex aspect-video items-center justify-center rounded-xl border bg-gradient-to-br to-transparent shadow-2xl">
                <div className="p-8 text-center">
                  <FolderKanban className="text-primary mx-auto mb-4 h-16 w-16" />
                  <p className="text-muted-foreground text-lg font-medium">
                    Vista previa del dashboard
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary/5 py-20">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Comienza a gestionar tu estudio hoy
            </h2>
            <p className="text-muted-foreground mt-4 text-lg">
              Únete a diseñadores que ya confían en Veta para gestionar sus
              proyectos.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/auth?mode=signup">
                  Crear Cuenta Gratis
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/contact">Contactar Ventas</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
