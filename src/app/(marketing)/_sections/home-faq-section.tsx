"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AnimatedSection,
  StaggerContainer,
  StaggerItem,
} from "@/components/ui/animated-section";

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

export function HomeFaqSection() {
  return (
    <section className="bg-muted/30 py-20">
      <div className="container mx-auto max-w-7xl px-4">
        <AnimatedSection
          className="mx-auto mb-12 max-w-2xl text-center"
          triggerOnMount={false}
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Preguntas Frecuentes
          </h2>
          <p className="text-muted-foreground mt-4 text-lg">
            Resolvemos las dudas más habituales sobre <strong>Veta</strong>.
          </p>
        </AnimatedSection>

        <StaggerContainer
          className="mx-auto max-w-3xl space-y-4"
          staggerDelay={0.1}
          triggerOnMount={false}
        >
          {homeFaqs.map((faq) => (
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
  );
}
