import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  FolderKanban,
  Quote,
  ShoppingBag,
  Truck,
  BarChart3,
  FileText,
  Leaf,
  Users,
  Sparkles,
  Clock,
  Shield,
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
import {
  AnimatedSection,
  StaggerContainer,
  StaggerItem,
} from "@/components/ui/animated-section";
import { BenefitsList } from "./benefits-list";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { ProductMockup } from "@/components/product-mockup";

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

const stats = [
  {
    value: Infinity,
    suffix: "",
    label: "Proyectos gestionables",
    icon: FolderKanban,
  },
  {
    value: 65,
    suffix: "%",
    label: "Tiempo ahorrado en gestión",
    icon: Clock,
  },
  {
    value: 100,
    suffix: "%",
    label: "De tu proyecto en un solo lugar",
    icon: Shield,
  },
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
      <section className="relative overflow-hidden py-20 md:py-28">
        {/* Background effects */}
        <div className="from-primary/5 absolute inset-0 bg-gradient-to-br via-transparent to-transparent" />
        <div className="bg-primary/5 absolute top-1/2 left-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl" />

        <div className="relative container mx-auto max-w-7xl px-4">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Left: Copy */}
            <div className="text-center lg:text-left">
              <AnimatedSection delay={0} duration={0.5}>
                <div className="bg-primary/10 text-primary mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium">
                  <Leaf className="h-4 w-4" />
                  <span>Diseñado para profesionales del diseño interior</span>
                </div>
              </AnimatedSection>

              <AnimatedSection delay={0.1} duration={0.6}>
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                  Tus proyectos de interiorismo{" "}
                  <strong className="text-primary">sin complicaciones</strong>
                </h1>
              </AnimatedSection>

              <AnimatedSection delay={0.2} duration={0.6}>
                <p className="text-muted-foreground mt-6 text-lg md:text-xl">
                  La plataforma todo-en-uno para arquitectos y diseñadores.
                  Administra proyectos, clientes, proveedores y presupuestos
                  desde un solo lugar y toma el control.
                </p>
              </AnimatedSection>

              <AnimatedSection delay={0.3} duration={0.5}>
                <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start">
                  <Button
                    size="lg"
                    asChild
                    className="animate-glow w-full sm:w-auto"
                  >
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
              </AnimatedSection>
            </div>

            {/* Product Mockup: below on small screens, right on lg+ */}
            <AnimatedSection direction="right" delay={0.4} duration={0.8}>
              <ProductMockup />
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-border/40 bg-muted/20 border-y py-16">
        <div className="container mx-auto max-w-7xl px-4">
          <StaggerContainer
            className="grid gap-8 md:grid-cols-3"
            staggerDelay={0.15}
          >
            {stats.map((stat) => (
              <StaggerItem key={stat.label}>
                <div className="text-center">
                  <div className="bg-primary/10 text-primary mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl">
                    <stat.icon className="h-6 w-6" />
                  </div>
                  <div className="text-3xl font-bold tracking-tight sm:text-4xl">
                    <AnimatedCounter
                      target={stat.value}
                      suffix={stat.suffix}
                      duration={2.5}
                    />
                  </div>
                  <p className="text-muted-foreground mt-2 text-sm font-medium">
                    {stat.label}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-muted/30 py-20">
        <div className="container mx-auto max-w-7xl px-4">
          <AnimatedSection
            className="mx-auto mb-16 max-w-2xl text-center"
            triggerOnMount={false}
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Todo lo que necesitas{" "}
              <strong className="text-primary">para tu estudio</strong>
            </h2>
            <p className="text-muted-foreground mt-4 text-lg">
              Herramientas diseñadas específicamente para profesionales del
              diseño interior.
            </p>
          </AnimatedSection>

          <StaggerContainer
            className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
            staggerDelay={0.1}
            triggerOnMount={false}
          >
            {features.map((feature) => (
              <StaggerItem key={feature.title}>
                <Card className="border-none shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <CardHeader>
                    <div className="bg-primary/10 mb-4 flex h-12 w-12 items-center justify-center rounded-lg transition-transform duration-300 group-hover:scale-110">
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
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <AnimatedSection direction="left" triggerOnMount={false}>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                ¿Por qué <strong className="text-primary">elegir Veta</strong>?
              </h2>
              <p className="text-muted-foreground mt-4 text-lg">
                Simplificamos la gestión de tu estudio de interiorismo para que
                puedas enfocarte en lo que mejor sabes hacer: diseñar espacios
                increíbles.
              </p>

              <BenefitsList benefits={benefits} />

              <div className="mt-10">
                <Button size="lg" asChild className="animate-glow">
                  <Link href="/auth?mode=signup">
                    Prueba Gratis
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </AnimatedSection>

            <AnimatedSection
              direction="right"
              delay={0.2}
              triggerOnMount={false}
            >
              <ProductMockup />
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-muted/30 py-20">
        <div className="container mx-auto max-w-7xl px-4">
          <AnimatedSection
            className="mx-auto mb-12 max-w-2xl text-center"
            triggerOnMount={false}
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Lo que dicen de <strong className="text-primary">Veta</strong>
            </h2>
            <p className="text-muted-foreground mt-4 text-lg">
              Estudios y profesionales de arquitectura y diseño interior que ya
              confían en Veta.
            </p>
          </AnimatedSection>

          <StaggerContainer
            className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2 md:items-stretch"
            staggerDelay={0.2}
            triggerOnMount={false}
          >
            {testimonials.map((t) => (
              <StaggerItem key={t.author} className="h-full">
                <Card className="flex h-full flex-col border-none shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <CardContent className="flex flex-1 flex-col pt-6">
                    <Quote className="text-primary/60 mb-4 h-8 w-8 flex-shrink-0" />
                    <p className="text-foreground mb-6 flex-1 italic">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <div className="flex flex-shrink-0 items-center gap-3">
                      <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold">
                        {t.author.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold">{t.author}</p>
                        <p className="text-muted-foreground text-sm">
                          {t.role}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* CTA Section - before FAQ */}
      <section className="relative overflow-hidden py-20">
        <div className="from-primary/10 via-primary/5 absolute inset-0 bg-gradient-to-br to-transparent" />
        <div className="bg-primary/10 absolute top-0 right-0 h-96 w-96 translate-x-1/3 -translate-y-1/2 rounded-full blur-3xl" />
        <div className="bg-primary/5 absolute bottom-0 left-0 h-72 w-72 -translate-x-1/4 translate-y-1/3 rounded-full blur-3xl" />

        <div className="relative container mx-auto max-w-7xl px-4">
          <AnimatedSection
            className="mx-auto max-w-2xl text-center"
            triggerOnMount={false}
          >
            <div className="bg-primary/10 text-primary mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium">
              <Sparkles className="h-4 w-4" />
              <span>Empieza hoy mismo</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Comienza a{" "}
              <strong className="text-primary">gestionar tu estudio</strong> hoy
            </h2>
            <p className="text-muted-foreground mt-4 text-lg">
              Únete a diseñadores que ya confían en Veta para gestionar sus
              proyectos.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" asChild className="animate-glow">
                <Link href="/auth?mode=signup">
                  Crear Cuenta Gratis
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/pricing">Ver planes</Link>
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-muted/30 py-20">
        <div className="container mx-auto max-w-7xl px-4">
          <AnimatedSection
            className="mx-auto mb-12 max-w-2xl text-center"
            triggerOnMount={false}
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Preguntas Frecuentes
            </h2>
            <p className="text-muted-foreground mt-4 text-lg">
              Resolvemos las dudas más habituales sobre <strong>Veta</strong>.
            </p>
          </AnimatedSection>

          <StaggerContainer
            className="mx-auto max-w-3xl space-y-4"
            staggerDelay={0.1}
            triggerOnMount={false}
          >
            {homeFaqs.map((faq) => (
              <StaggerItem key={faq.question}>
                <Card className="border-none shadow-sm transition-all duration-300 hover:shadow-md">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-medium">
                      {faq.question}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* CTA Section - interiorismo */}
      <section className="relative overflow-hidden py-20">
        <div className="from-primary/10 via-primary/5 absolute inset-0 bg-gradient-to-tl to-transparent" />
        <div className="bg-primary/8 absolute right-0 bottom-0 h-80 w-80 translate-x-1/4 translate-y-1/4 rounded-full blur-3xl" />

        <div className="relative container mx-auto max-w-7xl px-4">
          <AnimatedSection
            className="mx-auto max-w-2xl text-center"
            triggerOnMount={false}
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              ¿Quieres empezar a mejorar la experiencia en tus{" "}
              <strong className="text-primary">
                proyectos de interiorismo
              </strong>
              ?
            </h2>
            <p className="text-muted-foreground mt-4 text-lg">
              Prueba <strong>Veta</strong> sin compromiso y descubre cómo
              centralizar toda la gestión de tus proyectos en un solo lugar.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" asChild className="animate-glow">
                <Link href="/auth?mode=signup">
                  Crear Cuenta Gratis
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/pricing">Ver planes</Link>
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
