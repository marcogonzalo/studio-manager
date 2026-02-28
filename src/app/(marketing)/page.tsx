import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { ArrowRight, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JsonLd, faqPageJsonLd } from "@/components/json-ld";
import { AnimatedSection } from "@/components/ui/animated-section";
import { ProductMockup } from "@/components/product-mockup";
import { SmoothScrollLink } from "@/components/smooth-scroll-link";
import { TrackedCtaLink } from "@/components/gtm";

/** Below-the-fold sections lazy-loaded to reduce initial JS bundle (framer-motion, etc.). */
const HomeStatsSection = dynamic(
  () =>
    import("./_sections/home-stats-section").then((m) => m.HomeStatsSection),
  { ssr: true }
);
const HomeFeaturesSection = dynamic(
  () =>
    import("./_sections/home-features-section").then(
      (m) => m.HomeFeaturesSection
    ),
  { ssr: true }
);
const HomeBenefitsSection = dynamic(
  () =>
    import("./_sections/home-benefits-section").then(
      (m) => m.HomeBenefitsSection
    ),
  { ssr: true }
);
const HomeTestimonialsSection = dynamic(
  () =>
    import("./_sections/home-testimonials-section").then(
      (m) => m.HomeTestimonialsSection
    ),
  { ssr: true }
);
const HomeCtaBeforeFaqSection = dynamic(
  () =>
    import("./_sections/home-cta-before-faq-section").then(
      (m) => m.HomeCtaBeforeFaqSection
    ),
  { ssr: true }
);
const HomeFaqSection = dynamic(
  () => import("./_sections/home-faq-section").then((m) => m.HomeFaqSection),
  { ssr: true }
);
const HomeCtaFinalSection = dynamic(
  () =>
    import("./_sections/home-cta-final-section").then(
      (m) => m.HomeCtaFinalSection
    ),
  { ssr: true }
);

export const metadata: Metadata = {
  title: {
    absolute: "Veta - Gestión de proyectos de diseño interior",
  },
  description:
    "Plataforma todo-en-uno para estudios de diseño interior: gestiona proyectos, clientes, proveedores, catálogos y presupuestos desde un solo lugar. Prueba gratis.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Veta - Gestión de proyectos de diseño interior",
    description:
      "Plataforma todo-en-uno para estudios de diseño interior: proyectos, clientes, proveedores y presupuestos. Prueba gratis.",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Veta - Gestión de proyectos de diseño interior",
    description:
      "Plataforma todo-en-uno para estudios de diseño interior. Prueba gratis.",
  },
};

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

export default function HomePage() {
  return (
    <>
      <JsonLd data={faqPageJsonLd(homeFaqs, baseUrl)} />

      {/* Hero Section – momento hero: badge → título → subtítulo → CTAs con delays escalonados */}
      <section className="hero-pattern-overlay relative overflow-hidden py-20 md:py-28">
        {/* Background effects */}
        <div className="from-primary/5 absolute inset-0 bg-gradient-to-br via-transparent to-transparent" />
        <div className="bg-primary/5 absolute top-1/2 left-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl" />
        <div className="noise-overlay" aria-hidden />

        <div className="relative container mx-auto max-w-7xl px-4">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Left: Copy */}
            <div className="text-center lg:text-left">
              <AnimatedSection delay={0} duration={0.5} triggerOnMount>
                <div className="bg-primary/10 text-primary mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium">
                  <Leaf className="h-4 w-4" />
                  <span>Diseñado para profesionales del diseño interior</span>
                </div>
              </AnimatedSection>

              <AnimatedSection delay={0.1} duration={0.5} triggerOnMount>
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                  Tus proyectos de interiorismo{" "}
                  <strong className="text-primary">sin complicaciones</strong>
                </h1>
              </AnimatedSection>

              <AnimatedSection delay={0.2} duration={0.5} triggerOnMount>
                <p className="text-muted-foreground mt-6 text-lg md:text-xl">
                  La plataforma todo-en-uno para arquitectos e interioristas.
                  Administra proyectos, clientes, proveedores y presupuestos
                  desde un solo lugar y toma el control.
                </p>
              </AnimatedSection>

              <AnimatedSection delay={0.3} duration={0.5} triggerOnMount>
                <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start">
                  <Button
                    size="lg"
                    asChild
                    className="animate-glow w-full sm:w-auto"
                  >
                    <TrackedCtaLink
                      href="/sign-up"
                      ctaLocation="hero"
                      ctaText="Comenzar Gratis"
                    >
                      Comenzar Gratis
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </TrackedCtaLink>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    asChild
                    className="w-full sm:w-auto"
                  >
                    <SmoothScrollLink href="#features">
                      Ver Características
                    </SmoothScrollLink>
                  </Button>
                </div>

                <p className="text-muted-foreground mt-4 text-sm">
                  30 días de prueba gratis. Sin tarjeta, sin compromiso. Cancela
                  cuando quieras.
                </p>
              </AnimatedSection>
            </div>

            {/* Product Mockup: below on small screens, right on lg+ */}
            <AnimatedSection
              direction="right"
              delay={0.4}
              duration={0.6}
              triggerOnMount
            >
              <ProductMockup />
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Franja decorativa (como la del footer) entre hero y contenido */}
      <div
        className="via-primary/40 h-1 w-full bg-gradient-to-r from-transparent to-transparent"
        aria-hidden
      />

      <div className="below-the-fold">
        <HomeStatsSection />
        <HomeFeaturesSection />
        <HomeBenefitsSection />
        <HomeTestimonialsSection />
        <HomeCtaBeforeFaqSection />
        <HomeFaqSection />
        <HomeCtaFinalSection />
      </div>
    </>
  );
}
