import type { Metadata } from 'next';
import Link from 'next/link';
import { Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Precios',
  description:
    'Planes flexibles para estudios de diseño interior de todos los tamaños. Comienza gratis y escala según tus necesidades.',
};

const plans = [
  {
    name: 'Starter',
    description: 'Perfecto para diseñadores independientes',
    price: 'Gratis',
    priceNote: 'Para siempre',
    features: [
      'Hasta 3 proyectos activos',
      '10 clientes',
      'Catálogo de 50 productos',
      'Generación de PDFs básica',
      'Soporte por email',
    ],
    cta: 'Comenzar Gratis',
    ctaVariant: 'outline' as const,
    popular: false,
  },
  {
    name: 'Professional',
    description: 'Para estudios en crecimiento',
    price: '€29',
    priceNote: '/mes',
    features: [
      'Proyectos ilimitados',
      'Clientes ilimitados',
      'Catálogo ilimitado',
      'Control de costos avanzado',
      'Documentos personalizados',
      'Exportación de datos',
      'Soporte prioritario',
    ],
    cta: 'Prueba 14 días gratis',
    ctaVariant: 'default' as const,
    popular: true,
  },
  {
    name: 'Studio',
    description: 'Para equipos y estudios grandes',
    price: '€79',
    priceNote: '/mes',
    features: [
      'Todo en Professional',
      'Hasta 5 usuarios',
      'Permisos por rol',
      'Reportes avanzados',
      'API de integración',
      'Onboarding personalizado',
      'Soporte dedicado 24/7',
    ],
    cta: 'Contactar Ventas',
    ctaVariant: 'outline' as const,
    popular: false,
  },
];

const faqs = [
  {
    question: '¿Puedo cambiar de plan en cualquier momento?',
    answer:
      'Sí, puedes actualizar o degradar tu plan en cualquier momento. Los cambios se aplican inmediatamente y ajustamos el cobro de forma proporcional.',
  },
  {
    question: '¿Qué métodos de pago aceptan?',
    answer:
      'Aceptamos todas las tarjetas de crédito y débito principales (Visa, Mastercard, American Express), así como transferencias bancarias para planes anuales.',
  },
  {
    question: '¿Hay descuento por pago anual?',
    answer:
      'Sí, ofrecemos un 20% de descuento en todos los planes al pagar anualmente. Esto equivale a 2 meses gratis.',
  },
  {
    question: '¿Qué pasa con mis datos si cancelo?',
    answer:
      'Tus datos permanecen accesibles durante 30 días después de la cancelación. Puedes exportar toda tu información en cualquier momento antes de ese periodo.',
  },
  {
    question: '¿Ofrecen descuentos para estudiantes?',
    answer:
      'Sí, ofrecemos un 50% de descuento para estudiantes de diseño con una cuenta de correo educativo válida.',
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
              Planes simples,{' '}
              <span className="text-primary">precios transparentes</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground md:text-xl">
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
                    ? 'border-primary shadow-lg scale-105'
                    : 'border-border shadow-md'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                      Más Popular
                    </span>
                  </div>
                )}
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="text-center mb-6">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.priceNote}</span>
                  </div>
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    variant={plan.ctaVariant}
                    asChild
                  >
                    <Link href="/auth?mode=signup">
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
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Preguntas Frecuentes
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
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
            <p className="mt-4 text-lg text-muted-foreground">
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
