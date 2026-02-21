import type { Metadata } from "next";
import Link from "next/link";
import { Users, Target, Heart, Award, Linkedin, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AnimatedSection,
  StaggerContainer,
  StaggerItem,
} from "@/components/ui/animated-section";

export const metadata: Metadata = {
  title: "Sobre nosotros y el equipo",
  description:
    "Conoce al equipo detrás de Veta: plataforma de gestión de proyectos de diseño interior creada para profesionales del interiorismo. Nuestra historia y valores.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "Sobre nosotros - Equipo e historia | Veta",
    description:
      "Conoce al equipo detrás de Veta. Plataforma diseñada por y para profesionales del diseño interior.",
    url: "/about",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sobre nosotros - Equipo e historia | Veta",
    description:
      "Conoce al equipo detrás de Veta. Plataforma para profesionales del diseño interior.",
  },
};

const values = [
  {
    icon: Target,
    title: "Simplicidad",
    description:
      "Creemos que las herramientas deben ser intuitivas y fáciles de usar, sin curvas de aprendizaje innecesarias.",
  },
  {
    icon: Heart,
    title: "Pasión por el Diseño",
    description:
      "Entendemos las necesidades de los diseñadores porque compartimos su pasión por crear espacios únicos.",
  },
  {
    icon: Users,
    title: "Comunidad",
    description:
      "Construimos Veta junto a nuestra comunidad de usuarios, escuchando sus necesidades.",
  },
  {
    icon: Award,
    title: "Excelencia",
    description:
      "Nos comprometemos a ofrecer la mejor experiencia posible, mejorando constantemente nuestra plataforma.",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="hero-pattern-overlay relative overflow-hidden py-20 md:py-32">
        <div className="from-primary/5 absolute inset-0 bg-gradient-to-br via-transparent to-transparent" />
        <div className="bg-primary/5 absolute top-1/2 left-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl" />
        <div className="noise-overlay" aria-hidden />

        <div className="relative container mx-auto max-w-7xl px-4">
          <AnimatedSection className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Diseñada para ayudar a crear{" "}
              <span className="text-primary">
                espacios que transforman vidas
              </span>
            </h1>
            <p className="text-muted-foreground mt-6 text-lg md:text-xl">
              Veta nace de la necesidad real de simplificar la gestión de
              proyectos de diseño interior para que arquitectas y diseñadores
              puedan hacer lo que mejor saben hacer: crear espacios que
              transforman vidas.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Franja decorativa (como la del footer) entre hero y contenido */}
      <div
        className="via-primary/40 h-1 w-full bg-gradient-to-r from-transparent to-transparent"
        aria-hidden
      />

      {/* Story Section */}
      <section className="bg-muted/30 py-20">
        <div className="container mx-auto max-w-7xl px-4">
          <AnimatedSection>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              ¿Cómo surge Veta?
            </h2>
            <div className="text-muted-foreground mt-6 space-y-4">
              <p>
                <strong>Veta</strong> surge de la iniciativa de un novio
                programador buscando la forma de apoyar a su novia arquitecta de
                diseño interior desde la tecnología. La herramienta nace de la
                observación de los desafíos a los que arquitectas y diseñadores
                de interiores se enfrentan en la gestión de proyectos de
                interiorismo: hojas de cálculo dispersas, presupuestos difíciles
                de rastrear, catálogo sin organización, registros difíciles de
                buscar y comunicación fragmentada con proveedores como problemas
                constantes.
              </p>
              <p>
                Después de arduo trabajo, pruebas y validación con diseñadores y
                arquitectos reales, se crea <strong>Veta</strong>, una
                plataforma que aborda las principales necesidades específicas
                del sector de la arquitectura de diseño interior. Desde la
                gestión de espacios hasta el control de costes, cada
                característica fue diseñada pensando en el flujo de trabajo real
                de un profesional del interiorismo.
              </p>
              <p>
                Hoy, <strong>Veta</strong> ayuda a estudios de diseño a ahorrar
                tiempo, reducir errores y ofrecer un mejor servicio a sus
                clientes.
              </p>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20">
        <div className="container mx-auto max-w-7xl px-4">
          <AnimatedSection className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Nuestros Valores
            </h2>
            <p className="text-muted-foreground mt-4 text-lg">
              Los principios que guían todo lo que hacemos.
            </p>
          </AnimatedSection>

          <StaggerContainer
            className="grid gap-8 md:grid-cols-2"
            staggerDelay={0.1}
          >
            {values.map((value) => (
              <StaggerItem key={value.title}>
                <Card className="border-none shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <CardHeader>
                    <div className="bg-primary/10 mb-4 flex h-12 w-12 items-center justify-center rounded-lg transition-transform duration-300 group-hover:scale-110">
                      <value.icon className="text-primary h-6 w-6" />
                    </div>
                    <CardTitle>{value.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Mission Section */}
      <section className="border-border relative overflow-hidden border-y py-20">
        <div className="from-primary/20 via-primary/10 absolute inset-0 bg-gradient-to-br to-transparent" />
        <div className="bg-primary/10 absolute top-0 right-0 h-96 w-96 translate-x-1/3 -translate-y-1/2 rounded-full blur-3xl" />
        <div className="bg-primary/5 absolute bottom-0 left-0 h-72 w-72 -translate-x-1/4 translate-y-1/3 rounded-full blur-3xl" />

        <div className="relative container mx-auto max-w-7xl px-4">
          <AnimatedSection className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Nuestra Misión
            </h2>
            <p className="text-muted-foreground mt-6 text-xl">
              Veta quiere empoderar a los profesionales y estudios de
              arquitectura y diseño interior con herramientas que simplifiquen
              su trabajo, para que puedan dedicar más tiempo a lo que realmente
              importa: crear espacios que transforman vidas.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Creator Section */}
      <section className="bg-primary/5 relative overflow-hidden py-20">
        <div className="bg-primary/8 absolute top-0 right-0 h-80 w-80 translate-x-1/4 -translate-y-1/4 rounded-full blur-3xl" />
        <div className="bg-primary/5 absolute bottom-0 left-0 h-64 w-64 -translate-x-1/4 translate-y-1/4 rounded-full blur-3xl" />

        <div className="relative container mx-auto max-w-7xl px-4">
          <AnimatedSection className="mx-auto flex max-w-2xl flex-col items-center justify-center text-center">
            <div className="bg-primary/10 text-primary mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium">
              <Sparkles className="h-4 w-4" />
              <span>El creador</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              ¿Quién crea Veta?
            </h2>
            <h3 className="text-foreground mt-2 font-semibold">
              Marco Gonzalo Gómez Pérez
            </h3>
            <Link
              href="https://www.linkedin.com/in/marcogonzalo"
              target="_blank"
              rel="noopener noreferrer"
              title="Perfil de Marco Gonzalo Gómez Pérez, creador de Veta, en Linkedin"
              className="text-primary mt-2 inline-flex items-center gap-2 text-sm font-medium transition-colors hover:underline"
            >
              <Linkedin className="h-5 w-5" />
            </Link>
            <p className="text-muted-foreground mt-4">
              Desarrollador full-stack con experiencia en productos digitales,
              APIs y aplicaciones web. Ha trabajado en equipos de producto y
              tecnología en distintos sectores, desde startups hasta empresas
              consolidadas. Cuenta con historia emprendedora en Venezuela y en
              España, con reconocimientos de premios de emprendimiento y
              excelencia en ambos países.
            </p>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
