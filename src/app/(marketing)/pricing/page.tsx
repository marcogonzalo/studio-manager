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
  title: "Precios",
  description:
    "Planes flexibles para estudios de diseño interior. Base, Pro y Studio. Sin sorpresas ni costos ocultos.",
  alternates: { canonical: "/pricing" },
  openGraph: {
    title: "Precios | Veta",
    description:
      "Planes flexibles para estudios de diseño interior. Comienza gratis.",
    url: "/pricing",
  },
  twitter: {
    card: "summary_large_image",
    title: "Precios | Veta",
    description:
      "Planes flexibles para estudios de diseño interior. Comienza gratis.",
  },
};

const plans = [
  {
    name: "Base",
    planCode: "BASE" as const,
    description: "Plan limitado y con funcionalidades básicas",
    price: "Gratis",
    priceNote: "/siempre",
    annualPrice: null as string | null,
    annualNote: null as string | null,
    currency: null as string | null,
    features: [
      "Hasta 3 proyectos",
      "10 clientes",
      "10 proveedores",
      "50 productos en catálogo",
      "Exportación PDF básica",
      "Notas y resumen",
      "Sin selección de moneda",
      "Sin órdenes de compra",
      "Sin control de costes ni pagos",
      "Sin subida de renders ni documentos",
    ],
    cta: "Comenzar Gratis",
    ctaVariant: "outline" as const,
    popular: false,
  },
  {
    name: "Pro",
    planCode: "PRO" as const,
    description: "Plan profesional con más recursos y funcionalidades",
    price: "25",
    priceNote: "/mes",
    annualPrice: "250",
    annualNote: "2 meses gratis",
    currency: PRICING_CURRENCY,
    features: [
      "Todas las características base",
      "Hasta 10 proyectos",
      "50 clientes",
      "50 proveedores",
      "500 productos en catálogo",
      "Exportación PDF personalizada",
      "Selección de moneda por proyecto",
      "Órdenes de compra",
      "Control de costes",
      "Gestión de pagos",
      "Subida de renders y documentos, notas y resumen",
    ],
    cta: "Prueba 30 días gratis",
    ctaVariant: "default" as const,
    popular: true,
  },
  {
    name: "Studio",
    planCode: "STUDIO" as const,
    description: "Plan ilimitado para estudios",
    price: "75",
    priceNote: "/mes",
    annualPrice: "750",
    annualNote: "2 meses gratis",
    currency: PRICING_CURRENCY,
    features: [
      "Todas las funcionalidades Pro",
      "Proyectos ilimitados",
      "Clientes ilimitados",
      "Proveedores ilimitados",
      "Catálogo ilimitado",
    ],
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
      "Sí, ofrecemos un 20% de descuento en todos los planes al pagar anualmente. Esto equivale a 2 meses gratis.",
  },
  {
    question: "¿Qué pasa con mis datos si cancelo?",
    answer:
      "Tu plan se mantiene hasta el final del período. Al finalizar el plan, tus datos permanecen accesibles pero tu actividad queda limitada a lo estipulado en el plan base.",
  },
];

export default function PricingPage() {
  const pricingUrl = `${baseUrl}/pricing`;
  return (
    <>
      <JsonLd data={faqPageJsonLd(faqs, pricingUrl)} />
      <JsonLd data={softwareApplicationPricingJsonLd(pricingUrl)} />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="from-primary/5 absolute inset-0 bg-gradient-to-br via-transparent to-transparent" />
        <div className="bg-primary/5 absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl" />

        <div className="relative container mx-auto max-w-7xl px-4">
          <AnimatedSection className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Planes simples,{" "}
              <span className="text-primary">precios transparentes</span>
            </h1>
            <p className="text-muted-foreground mt-6 text-lg md:text-xl">
              Elige el plan que mejor se adapte a tu estudio. Sin sorpresas, sin
              costos ocultos.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Pricing Cards */}
      <PricingCardsClient plans={plans} />

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
              Contáctanos para crear un plan a medida para tu estudio.
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
