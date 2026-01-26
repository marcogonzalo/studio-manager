import type { Metadata } from 'next';
import { Users, Target, Heart, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Sobre Nosotros',
  description:
    'Conoce al equipo detrás de StudioManager, la plataforma diseñada para profesionales del diseño interior.',
};

const values = [
  {
    icon: Target,
    title: 'Simplicidad',
    description:
      'Creemos que las herramientas deben ser intuitivas y fáciles de usar, sin curvas de aprendizaje innecesarias.',
  },
  {
    icon: Heart,
    title: 'Pasión por el Diseño',
    description:
      'Entendemos las necesidades de los diseñadores porque compartimos su pasión por crear espacios únicos.',
  },
  {
    icon: Users,
    title: 'Comunidad',
    description:
      'Construimos StudioManager junto a nuestra comunidad de usuarios, escuchando sus necesidades.',
  },
  {
    icon: Award,
    title: 'Excelencia',
    description:
      'Nos comprometemos a ofrecer la mejor experiencia posible, mejorando constantemente nuestra plataforma.',
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
              Diseñado por diseñadores,{' '}
              <span className="text-primary">para diseñadores</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground md:text-xl">
              StudioManager nació de la necesidad real de simplificar la gestión
              de proyectos de diseño interior. Entendemos tus desafíos porque los
              hemos vivido.
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Nuestra Historia</h2>
              <div className="mt-6 space-y-4 text-muted-foreground">
                <p>
                  StudioManager comenzó como un proyecto interno para resolver los
                  desafíos diarios de gestionar un estudio de diseño interior.
                  Hojas de cálculo dispersas, presupuestos difíciles de rastrear y
                  comunicación fragmentada con proveedores eran problemas
                  constantes.
                </p>
                <p>
                  Después de meses de desarrollo y pruebas con diseñadores reales,
                  creamos una plataforma que realmente entiende las necesidades
                  específicas del sector. Desde la gestión de espacios hasta el
                  control de costos, cada característica fue diseñada pensando en
                  el flujo de trabajo real de un diseñador.
                </p>
                <p>
                  Hoy, StudioManager ayuda a estudios de diseño a ahorrar tiempo,
                  reducir errores y ofrecer un mejor servicio a sus clientes.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border border-border shadow-lg flex items-center justify-center">
                <div className="text-center p-8">
                  <Users className="h-20 w-20 text-primary mx-auto mb-4" />
                  <p className="text-lg font-medium">Nuestro Equipo</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Nuestros Valores
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Los principios que guían todo lo que hacemos.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {values.map((value) => (
              <Card
                key={value.title}
                className="border-none shadow-md hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <value.icon className="h-6 w-6 text-primary" />
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
      <section className="py-20 bg-primary/5">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Nuestra Misión
            </h2>
            <p className="mt-6 text-xl text-muted-foreground">
              Empoderar a los profesionales del diseño interior con herramientas
              que simplifiquen su trabajo, para que puedan dedicar más tiempo a lo
              que realmente importa: crear espacios que transforman vidas.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
