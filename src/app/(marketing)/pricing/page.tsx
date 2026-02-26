import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  JsonLd,
  faqPageJsonLd,
  softwareApplicationPricingJsonLd,
} from "@/components/json-ld";
import { PricingCardsClient } from "@/app/(marketing)/pricing/pricing-cards-client";
import {
  COMPACT_FEATURE_KEYS,
  getCommercialFeatures,
  getPlanConfigForDisplay,
} from "@/lib/plan-copy";
import {
  AnimatedSection,
  StaggerContainer,
  StaggerItem,
} from "@/components/ui/animated-section";

const baseUrl =
  process.env.NEXT_PUBLIC_APP_URL ??
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "https://veta.pro");

const PRICING_CURRENCY = "EUR";

export const metadata: Metadata = {
  title: "Precios y planes Base, Pro y Studio",
  description:
    "Planes flexibles para estudios de diseño interior: Base gratis, Pro y Studio con más capacidad. Precio fijo, sin costes ocultos. Prueba 30 días gratis.",
  alternates: { canonical: "/pricing" },
  openGraph: {
    title: "Precios - Planes Base, Pro y Studio | Veta",
    description:
      "Planes flexibles para estudios de diseño interior. Comienza gratis, escala cuando lo necesites.",
    url: "/pricing",
  },
  twitter: {
    card: "summary_large_image",
    title: "Precios - Planes para diseño interior | Veta",
    description:
      "Planes flexibles para estudios de diseño interior. Comienza gratis.",
  },
};

const plans = [
  {
    name: "Base",
    planCode: "BASE" as const,
    description: "Plan gratuito con límites básicos",
    price: "Gratis",
    priceNote: "/siempre",
    annualPrice: null as string | null,
    annualNote: null as string | null,
    currency: null as string | null,
    features: getCommercialFeatures(getPlanConfigForDisplay("BASE"), {
      include: COMPACT_FEATURE_KEYS,
    }),
    cta: "Comenzar Gratis",
    ctaVariant: "outline" as const,
    popular: false,
  },
  {
    name: "Pro",
    planCode: "PRO" as const,
    description: "Plan para profesionales independientes",
    price: "25",
    priceNote: "/mes",
    annualPrice: "250",
    annualNote: "2 meses gratis",
    currency: PRICING_CURRENCY,
    features: getCommercialFeatures(getPlanConfigForDisplay("PRO"), {
      include: COMPACT_FEATURE_KEYS,
    }),
    cta: "Prueba 30 días gratis",
    ctaVariant: "default" as const,
    popular: true,
  },
  {
    name: "Studio",
    planCode: "STUDIO" as const,
    description: "Plan para estudios de arquitectura",
    price: "75",
    priceNote: "/mes",
    annualPrice: "750",
    annualNote: "2 meses gratis",
    currency: PRICING_CURRENCY,
    features: getCommercialFeatures(getPlanConfigForDisplay("STUDIO"), {
      include: COMPACT_FEATURE_KEYS,
    }),
    cta: "Prueba 30 días gratis",
    ctaVariant: "outline" as const,
    popular: false,
  },
];

const faqs = [
  {
    question: "¿Puedo cambiar de plan en cualquier momento?",
    answer:
      "Sí, puedes actualizar o degradar tu plan en cualquier momento. Los cambios se aplican inmediatamente. El plan anterior perderá vigencia automáticamente.",
  },
  {
    question: "¿Qué métodos de pago aceptan?",
    answer:
      "Aceptamos todas las tarjetas de crédito y débito principales (Visa, Mastercard, American Express), así como transferencias bancarias para planes anuales.",
  },
  {
    question: "¿Hay descuento por pago anual?",
    answer:
      "Sí, ofrecemos un 17% de descuento en todos los planes al pagar anualmente. Esto equivale a un ahorro de 2 meses de costes.",
  },
  {
    question: "¿Qué pasa con mis datos si cancelo?",
    answer:
      "Los planes se mantienen hasta el final del período. Al finalizar el plan, tus datos permanecen accesibles pero tu actividad queda limitada a lo estipulado en el plan base.",
  },
];

export default function PricingPage() {
  const pricingUrl = `${baseUrl}/pricing`;
  return (
    <>
      <JsonLd data={faqPageJsonLd(faqs, pricingUrl)} />
      <JsonLd data={softwareApplicationPricingJsonLd(pricingUrl)} />

      {/* Hero Section */}
      <section className="hero-pattern-overlay relative overflow-hidden py-20 md:py-32">
        <div className="from-primary/5 absolute inset-0 bg-gradient-to-br via-transparent to-transparent" />
        <div className="bg-primary/5 absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl" />
        <div className="noise-overlay" aria-hidden />

        <div className="relative container mx-auto max-w-7xl px-4">
          <AnimatedSection className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Planes simples,{" "}
              <span className="text-primary">precios transparentes</span>
            </h1>
            <p className="text-muted-foreground mt-6 text-lg md:text-xl">
              Elige el plan que mejor se adapte a tu momento profesional. Sin
              sorpresas, sin costes ocultos.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Franja decorativa (como la del footer) entre hero y contenido */}
      <div
        className="via-primary/40 h-1 w-full bg-gradient-to-r from-transparent to-transparent"
        aria-hidden
      />

      {/* Pricing Cards */}
      <PricingCardsClient plans={plans} />

      {/* Conocer mejor los planes */}
      <section className="py-20">
        <div className="container mx-auto max-w-7xl px-4">
          <AnimatedSection className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Conocer mejor los planes y encuentra el que mejor se adapta a ti
            </h2>
            <p className="text-muted-foreground mt-4 text-lg">
              Cada plan está pensado para un perfil distinto. Descubre ventajas,
              límites y para quién está recomendado.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button variant="outline" size="lg" asChild>
                <Link href="/plan-base-primer-proyecto-interiorismo">
                  Plan Base
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/plan-pro-independientes-diseno-interior">
                  Plan Pro
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/plan-studio-empresas-arquitectura-diseno-interior">
                  Plan Studio
                </Link>
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-muted/30 py-20">
        <div className="container mx-auto max-w-7xl px-4">
          <AnimatedSection className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Preguntas Frecuentes
            </h2>
            <p className="text-muted-foreground mt-4 text-lg">
              ¿Tienes dudas? Aquí respondemos las más comunes.
            </p>
          </AnimatedSection>

          <StaggerContainer
            className="mx-auto max-w-3xl space-y-6"
            staggerDelay={0.1}
          >
            {faqs.map((faq) => (
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

      {/* CTA Section */}
      <section className="relative overflow-hidden py-20">
        <div className="from-primary/10 via-primary/5 absolute inset-0 bg-gradient-to-br to-transparent" />
        <div className="bg-primary/10 absolute top-0 right-0 h-96 w-96 translate-x-1/3 -translate-y-1/2 rounded-full blur-3xl" />
        <div className="bg-primary/5 absolute bottom-0 left-0 h-72 w-72 -translate-x-1/4 translate-y-1/3 rounded-full blur-3xl" />

        <div className="relative container mx-auto max-w-7xl px-4">
          <AnimatedSection className="mx-auto max-w-2xl text-center">
            <div className="bg-primary/10 text-primary mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium">
              <Sparkles className="h-4 w-4" />
              <span>¿Necesitas algo personalizado?</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              ¿Necesitas algo personalizado?
            </h2>
            <p className="text-muted-foreground mt-4 text-lg">
              Contáctanos para crear planes a medida para tu estudio.
            </p>
            <div className="mt-8">
              <Button
                size="lg"
                variant="outline"
                asChild
                className="animate-glow"
              >
                <Link href="/contact">Hablar con Ventas</Link>
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
