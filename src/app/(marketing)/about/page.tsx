import type { Metadata } from "next";
import Link from "next/link";
import { Users, Target, Heart, Award, Linkedin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Sobre Nosotros",
  description:
    "Conoce al equipo detrás de Veta. Plataforma diseñada por diseñadores, para profesionales del diseño interior.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "Sobre Nosotros | Veta",
    description:
      "Conoce al equipo detrás de Veta. Diseñado por diseñadores, para diseñadores.",
    url: "/about",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sobre Nosotros | Veta",
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
      <section className="py-20 md:py-32">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="mx-auto max-w-3xl text-center">
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
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="bg-muted/30 py-20">
        <div className="container mx-auto max-w-7xl px-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              ¿Cómo surge Veta?
            </h2>
            <div className="text-muted-foreground mt-6 space-y-4">
              <p>
                <strong>Veta</strong> surge de la iniciativa de un novio
                programador buscando la forma de apoyar a su novia arquitecta de
                diseño interior desde la tecnología. La herramienta nace de la
                observación de los desafíos a los que arquitectas y diseñadores
                de interiores se enfrentaban en la gestión de proyectos de
                diseño de interior: hojas de cálculo dispersas, presupuestos
                difíciles de rastrear, catálogo sin organización, registros
                difíciles de buscar y comunicación fragmentada con proveedores
                como problemas constantes.
              </p>
              <p>
                Después de arduo trabajo, pruebas y validación con diseñadores y
                arquitectos reales, se crea <strong>Veta</strong>, una
                plataforma que aborda las principales necesidades específicas
                del sector de la arquitectura de diseño interior. Desde la
                gestión de espacios hasta el control de costes, cada
                característica fue diseñada pensando en el flujo de trabajo real
                de un profesional de la arquitectura de diseño interior.
              </p>
              <p>
                Hoy, <strong>Veta</strong> ayuda a estudios de diseño a ahorrar
                tiempo, reducir errores y ofrecer un mejor servicio a sus
                clientes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Nuestros Valores
            </h2>
            <p className="text-muted-foreground mt-4 text-lg">
              Los principios que guían todo lo que hacemos.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {values.map((value) => (
              <Card
                key={value.title}
                className="border-none shadow-md transition-shadow hover:shadow-lg"
              >
                <CardHeader>
                  <div className="bg-primary/10 mb-4 flex h-12 w-12 items-center justify-center rounded-lg">
                    <value.icon className="text-primary h-6 w-6" />
                  </div>
                  <CardTitle>{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="from-primary/20 via-primary/10 border-border border-y bg-gradient-to-br to-transparent py-20">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Nuestra Misión
            </h2>
            <p className="text-muted-foreground mt-6 text-xl">
              Veta quiere empoderar a los profesionales y estudios de
              arquitectura y diseño interior con herramientas que simplifiquen
              su trabajo, para que puedan dedicar más tiempo a lo que realmente
              importa: crear espacios que transforman vidas.
            </p>
          </div>
        </div>
      </section>

      {/* Creator Section - full width, same gradient background */}
      <section className="bg-primary/5 py-20">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="mx-auto flex max-w-2xl flex-col items-center justify-center text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              ¿Quién crea Veta?
            </h2>
            <h3 className="text-foreground mt-2 font-semibold">
              Marco Gonzalo Gómez Pérez
            </h3>
            <Link
              href="https://es.linkedin.com/in/marcogonzalo/"
              target="_blank"
              rel="noopener noreferrer"
              title="Perfil de Linkedin"
              className="text-primary mt-2 inline-flex items-center gap-2 text-sm font-medium hover:underline"
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
          </div>
        </div>
      </section>
    </>
  );
}
