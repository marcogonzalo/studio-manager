import Link from 'next/link';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const features = [
  {
    icon: FolderKanban,
    title: 'Gestión de Proyectos',
    description:
      'Organiza tus proyectos de diseño interior con espacios, presupuestos y seguimiento de fases.',
  },
  {
    icon: Users,
    title: 'Clientes',
    description:
      'Mantén toda la información de tus clientes organizada y accesible en un solo lugar.',
  },
  {
    icon: ShoppingBag,
    title: 'Catálogo de Productos',
    description:
      'Gestiona tu catálogo de productos con imágenes, precios y referencias de proveedores.',
  },
  {
    icon: Truck,
    title: 'Proveedores',
    description:
      'Administra tus proveedores y mantén un historial de compras y pedidos.',
  },
  {
    icon: BarChart3,
    title: 'Control de Costos',
    description:
      'Visualiza gastos, ingresos y márgenes de cada proyecto en tiempo real.',
  },
  {
    icon: FileText,
    title: 'Documentos PDF',
    description:
      'Genera presupuestos y documentos profesionales para tus clientes.',
  },
];

const benefits = [
  'Interfaz intuitiva diseñada para diseñadores',
  'Acceso desde cualquier dispositivo',
  'Datos seguros con cifrado de extremo a extremo',
  'Actualizaciones constantes sin costo adicional',
  'Soporte técnico personalizado',
  'Sin comisiones por transacciones',
];

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
        <div className="container mx-auto max-w-7xl px-4 relative">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6">
              <Leaf className="h-4 w-4" />
              <span>Diseñado para profesionales del diseño interior</span>
            </div>

            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Gestiona tu estudio de diseño{' '}
              <span className="text-primary">sin complicaciones</span>
            </h1>

            <p className="mt-6 text-lg text-muted-foreground md:text-xl">
              La plataforma todo-en-uno para diseñadores de interiores. Administra
              proyectos, clientes, proveedores y presupuestos desde un solo lugar.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" asChild className="w-full sm:w-auto">
                <Link href="/auth?mode=signup">
                  Comenzar Gratis
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="w-full sm:w-auto">
                <Link href="#features">Ver Características</Link>
              </Button>
            </div>

            <p className="mt-4 text-sm text-muted-foreground">
              Sin tarjeta de crédito. Prueba gratis por 14 días.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Todo lo que necesitas para tu estudio
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Herramientas diseñadas específicamente para profesionales del diseño
              interior.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card
                key={feature.title}
                className="border-none shadow-md hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
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
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                ¿Por qué elegir StudioManager?
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Simplificamos la gestión de tu estudio para que puedas enfocarte en
                lo que mejor sabes hacer: diseñar espacios increíbles.
              </p>

              <ul className="mt-8 space-y-4">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
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
              <div className="aspect-video rounded-xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border border-border shadow-2xl flex items-center justify-center">
                <div className="text-center p-8">
                  <FolderKanban className="h-16 w-16 text-primary mx-auto mb-4" />
                  <p className="text-lg font-medium text-muted-foreground">
                    Vista previa del dashboard
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary/5">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Comienza a gestionar tu estudio hoy
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Únete a diseñadores que ya confían en StudioManager para gestionar
              sus proyectos.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
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
