import type { Metadata } from 'next';
import { Mail, MessageSquare, MapPin } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Contacto',
  description:
    'Ponte en contacto con el equipo de StudioManager. Estamos aquí para ayudarte.',
};

const contactMethods = [
  {
    icon: Mail,
    title: 'Email',
    description: 'Envíanos un correo y te respondemos en menos de 24 horas.',
    value: 'hola@studiomanager.app',
    href: 'mailto:hola@studiomanager.app',
  },
  {
    icon: MessageSquare,
    title: 'Chat en Vivo',
    description: 'Habla con nuestro equipo de soporte en tiempo real.',
    value: 'Disponible L-V, 9am-6pm',
    href: '#chat',
  },
  {
    icon: MapPin,
    title: 'Oficina',
    description: 'Visítanos en nuestra oficina en Madrid.',
    value: 'Madrid, España',
    href: '#',
  },
];

export default function ContactPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              ¿Cómo podemos <span className="text-primary">ayudarte</span>?
            </h1>
            <p className="mt-6 text-lg text-muted-foreground md:text-xl">
              Nuestro equipo está listo para responder tus preguntas y ayudarte a
              sacar el máximo provecho de StudioManager.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="pb-20">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="grid gap-8 md:grid-cols-3">
            {contactMethods.map((method) => (
              <Card
                key={method.title}
                className="border-none shadow-md hover:shadow-lg transition-shadow text-center"
              >
                <CardHeader>
                  <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <method.icon className="h-7 w-7 text-primary" />
                  </div>
                  <CardTitle>{method.title}</CardTitle>
                  <CardDescription>{method.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <a
                    href={method.href}
                    className="text-lg font-medium text-primary hover:underline"
                  >
                    {method.value}
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="mx-auto max-w-2xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight">
                Envíanos un mensaje
              </h2>
              <p className="mt-4 text-muted-foreground">
                Completa el formulario y nos pondremos en contacto contigo lo
                antes posible.
              </p>
            </div>

            <Card className="border-none shadow-lg">
              <CardContent className="pt-6">
                <form className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <label
                        htmlFor="name"
                        className="text-sm font-medium leading-none"
                      >
                        Nombre
                      </label>
                      <input
                        id="name"
                        type="text"
                        placeholder="Tu nombre"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="email"
                        className="text-sm font-medium leading-none"
                      >
                        Email
                      </label>
                      <input
                        id="email"
                        type="email"
                        placeholder="tu@email.com"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="subject"
                      className="text-sm font-medium leading-none"
                    >
                      Asunto
                    </label>
                    <input
                      id="subject"
                      type="text"
                      placeholder="¿En qué podemos ayudarte?"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="message"
                      className="text-sm font-medium leading-none"
                    >
                      Mensaje
                    </label>
                    <textarea
                      id="message"
                      rows={5}
                      placeholder="Cuéntanos más detalles..."
                      className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    Enviar Mensaje
                  </button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </>
  );
}
