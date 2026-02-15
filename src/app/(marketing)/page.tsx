import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  FolderKanban,
  Quote,
  ShoppingBag,
  Truck,
  BarChart3,
  FileText,
  Leaf,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { JsonLd, faqPageJsonLd } from "@/components/json-ld";

export const metadata: Metadata = {
  title: "Inicio",
  description:
    "Gestiona tus proyectos de diseño interior sin complicaciones. Plataforma todo-en-uno: clientes, proveedores, catálogos y presupuestos.",
  alternates: { canonical: "/" },
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
  "Interfaz pensada para arquitectos y diseñadores de interior",
  "Acceso en todo momento desde cualquier dispositivo",
  "Tus datos almacenados de forma segura (HTTPS, normativa RGPD)",
  "Mejoras y actualizaciones sin coste adicional",
  "Escucha activa para responder a tus necesidades",
  "Planes con precio fijo, sin comisiones por uso",
];

const baseUrl =
  process.env.NEXT_PUBLIC_APP_URL ??
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "https://veta.pro");

const homeFaqs = [
  {
    question: "¿Qué es Veta?",
    answer:
      "Veta es un software de gestión de proyectos de interiorismo diseñado para centralizar toda tu operativa en un solo lugar. Con nuestra plataforma, puedes gestionar la relación con clientes y proveedores, además de crear un catálogo de productos digital reutilizable para agilizar tus diseños. Veta te permite mantener presupuestos de interiorismo actualizados en tiempo real ante cualquier cambio, facilitando el control de órdenes de compra, costes y pagos, y el seguimiento financiero de cada obra. Al optimizar las tareas administrativas, con Veta ganas tiempo para lo que de verdad importa: aportar valor creativo a tus proyectos de arquitectura de interiores.",
  },
  {
    question: "¿Para quién es Veta?",
    answer:
      "Veta es una herramienta digital diseñada específicamente para profesionales del sector Contract y Residencial: interioristas, estudios y diseñadores freelance que buscan profesionalizar su gestión y dejar de usar hojas de cálculo dispersas; estudios de diseño de interiores que necesitan centralizar la comunicación, delegar tareas y controlar la rentabilidad de varios proyectos simultáneos; arquitectos de interiores que requieren un control técnico y financiero riguroso sobre las compras a proveedores y presupuestos de obra; y project managers de diseño, especialistas en la ejecución que demandan una herramienta ágil para gestionar órdenes de compra y pagos.",
  },
  {
    question: "¿Cómo empiezo?",
    answer:
      "Comenzar a optimizar tus proyectos de interiorismo es muy sencillo y no requiere compromiso inicial: regístrate gratis y crea tu cuenta base en segundos sin necesidad de introducir tu tarjeta de crédito; explora las herramientas configurando tus primeros clientes y creando tu catálogo de productos; y elige tu ritmo manteniéndote en el plan gratuito el tiempo que necesites o escalando a los planes Pro o Studio cuando tu volumen de proyectos y equipo lo requieran.",
  },
  {
    question: "¿Mis datos están seguros?",
    answer:
      "La seguridad de tu información es nuestra prioridad. En Veta implementamos protocolos de protección de datos de nivel bancario para que tu estudio de interiorismo opere con total tranquilidad: cumplimos estrictamente con el Reglamento General de Protección de Datos (RGPD), garantizando la privacidad de tu base de datos en todo momento; solo tú y las personas autorizadas de tu equipo tenéis acceso a la plataforma mediante credenciales protegidas; y como titular puedes ejercer tus derechos de acceso, rectificación o supresión de datos de forma sencilla y directa.",
  },
];

const testimonials = [
  {
    quote:
      "La gestión de clientes, proveedores y catálogo en un solo sitio ha simplificado mucho el trabajo en los proyectos de diseño interior. Recomendable para independientes o estudios que quieren profesionalizar la parte de gestión.",
    author: "FH Interiorismo",
    role: "Estudio de arquitectura interior",
  },
  {
    quote:
      "Con Veta hemos dejado de perder horas en hojas de cálculo. Los presupuestos por espacios y el control de costes nos permiten organizarnos y enfocarnos en el diseño.",
    author: "EM Estilo Creativo",
    role: "Diseño de interiores y estilismo",
  },
];

export default function HomePage() {
  return (
    <>
      <JsonLd data={faqPageJsonLd(homeFaqs, baseUrl)} />
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
              Gestiona tus proyectos de interiorismo{" "}
              <span className="text-primary">sin complicaciones</span>
            </h1>

            <p className="text-muted-foreground mt-6 text-lg md:text-xl">
              La plataforma todo-en-uno para arquitectos y diseñadores.
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
              30 días de prueba gratis. Sin tarjeta, sin compromiso. Cancela
              cuando quieras.
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
                Simplificamos la gestión de tu estudio de interiorismo para que
                puedas enfocarte en lo que mejor sabes hacer: diseñar espacios
                increíbles.
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

      {/* Testimonials Section */}
      <section className="bg-muted/30 py-20">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Lo que dicen de Veta
            </h2>
            <p className="text-muted-foreground mt-4 text-lg">
              Estudios y profesionales de arquitectura y diseño interior que ya
              confían en Veta.
            </p>
          </div>
          <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
            {testimonials.map((t) => (
              <Card
                key={t.author}
                className="border-none shadow-md transition-shadow hover:shadow-lg"
              >
                <CardContent className="pt-6">
                  <Quote className="text-primary/60 mb-4 h-8 w-8" />
                  <p className="text-foreground mb-6 italic">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <p className="font-semibold">{t.author}</p>
                  <p className="text-muted-foreground text-sm">{t.role}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - before FAQ */}
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
                <Link href="/pricing">Ver planes</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-muted/30 py-20">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Preguntas Frecuentes
            </h2>
            <p className="text-muted-foreground mt-4 text-lg">
              Resolvemos las dudas más habituales sobre Veta.
            </p>
          </div>
          <div className="mx-auto max-w-3xl space-y-4">
            {homeFaqs.map((faq) => (
              <Card key={faq.question} className="border-none shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium">
                    {faq.question}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - interiorismo */}
      <section className="bg-primary/5 py-20">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              ¿Quieres empezar a mejorar la experiencia en tus proyectos de
              interiorismo?
            </h2>
            <p className="text-muted-foreground mt-4 text-lg">
              Prueba Veta sin compromiso y descubre cómo centralizar toda la
              gestión de tus proyectos en un solo lugar.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/auth?mode=signup">
                  Crear Cuenta Gratis
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/pricing">Ver planes</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
