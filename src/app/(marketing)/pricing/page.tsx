import type { Metadata } from "next";
import Link from "next/link";
import { Check, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Precios",
  description:
    "Planes flexibles para estudios de diseño interior de todos los tamaños. Comienza gratis y escala según tus necesidades.",
};

const plans = [
  {
    name: "Prueba",
    planCode: "BASE" as const,
    description: "Plan de prueba con límites básicos",
    price: "Gratis",
    priceNote: "/siempre",
    features: [
      "Hasta 3 proyectos",
      "10 clientes",
      "10 proveedores",
      "50 productos en catálogo",
      "Exportación PDF básica",
      "Notas y resumen",
      "Solo una moneda por defecto",
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
    price: "€25",
    priceNote: "/mes",
    features: [
      "Hasta 10 proyectos",
      "50 clientes",
      "50 proveedores",
      "500 productos en catálogo",
      "Exportación PDF personalizada",
      "Cambio de moneda por proyecto",
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
    price: "€75",
    priceNote: "/mes",
    features: [
      "Todas las funcionalidades Pro",
      "Proyectos ilimitados",
      "Clientes ilimitados",
      "Proveedores ilimitados",
      "Catálogo ilimitado",
    ],
    cta: "Contratar",
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
  return (
    <>
      {/* Hero Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Planes simples,{" "}
              <span className="text-primary">precios transparentes</span>
            </h1>
            <p className="text-muted-foreground mt-6 text-lg md:text-xl">
              Elige el plan que mejor se adapte a tu estudio. Sin sorpresas, sin
              costos ocultos.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="grid gap-8 md:grid-cols-3">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={`relative flex flex-col ${
                  plan.popular
                    ? "border-primary scale-105 shadow-lg"
                    : "border-border shadow-md"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground rounded-full px-3 py-1 text-xs font-semibold">
                      Recomendado
                    </span>
                  </div>
                )}
                <CardHeader className="pb-2 text-center">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="mb-6 text-center">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">
                      {plan.priceNote}
                    </span>
                  </div>
                  <ul className="space-y-3">
                    {plan.features.map((feature) => {
                      const isRestriction = feature.startsWith("Sin ");
                      return (
                        <li key={feature} className="flex items-start gap-3">
                          {isRestriction ? (
                            <X className="text-destructive mt-0.5 h-5 w-5 flex-shrink-0" />
                          ) : (
                            <Check className="text-primary mt-0.5 h-5 w-5 flex-shrink-0" />
                          )}
                          <span className="text-sm">{feature}</span>
                        </li>
                      );
                    })}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" variant={plan.ctaVariant} asChild>
                    <Link
                      href={`/auth?mode=signup&plan=${plan.planCode}`}
                    >
                      {plan.cta}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-muted/30 py-20">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Preguntas Frecuentes
            </h2>
            <p className="text-muted-foreground mt-4 text-lg">
              ¿Tienes dudas? Aquí respondemos las más comunes.
            </p>
          </div>

          <div className="mx-auto max-w-3xl">
            <div className="space-y-6">
              {faqs.map((faq) => (
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
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              ¿Necesitas algo personalizado?
            </h2>
            <p className="text-muted-foreground mt-4 text-lg">
              Contáctanos para crear un plan a medida para tu estudio.
            </p>
            <div className="mt-8">
              <Button size="lg" variant="outline" asChild>
                <Link href="/contact">Hablar con Ventas</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
