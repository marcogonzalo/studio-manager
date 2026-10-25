import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import {
  AnimatedSection,
  StaggerContainer,
  StaggerItem,
} from "@/components/ui/animated-section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type HubCard = {
  titleKey: string;
  descKey: string;
  href:
    | "/feature/presupuestos"
    | "/feature/plantilla-pdf"
    | "/feature/control-costes"
    | "/feature/pedidos"
    | "/feature/empiezas-por-tu-cuenta"
    | "/feature/app-freelance"
    | "/feature/estudios-con-equipo"
    | "/feature/alternativas-excel"
    | "/feature/veta-vs-programa"
    | "/feature/veta-vs-monday-notion"
    | "/feature/veta-vs-houzz-pro"
    | "/software-interior-design"
    | "/software-architecture"
    | null;
  comingSoon?: boolean;
};

const FEATURE_CARDS: HubCard[] = [
  {
    titleKey: "cardPresupuestosTitle",
    descKey: "cardPresupuestosDesc",
    href: "/feature/presupuestos",
  },
  {
    titleKey: "cardPlantillaTitle",
    descKey: "cardPlantillaDesc",
    href: "/feature/plantilla-pdf",
  },
  {
    titleKey: "cardCostesTitle",
    descKey: "cardCostesDesc",
    href: "/feature/control-costes",
  },
  {
    titleKey: "cardPedidosTitle",
    descKey: "cardPedidosDesc",
    href: "/feature/pedidos",
  },
  {
    titleKey: "clientViewStubTitle",
    descKey: "clientViewStubDesc",
    href: null,
    comingSoon: true,
  },
];

const AUDIENCE_CARDS: HubCard[] = [
  {
    titleKey: "cardStartingOutTitle",
    descKey: "cardStartingOutDesc",
    href: "/feature/empiezas-por-tu-cuenta",
  },
  {
    titleKey: "cardFreelanceTitle",
    descKey: "cardFreelanceDesc",
    href: "/feature/app-freelance",
  },
  {
    titleKey: "cardStudiosTitle",
    descKey: "cardStudiosDesc",
    href: "/feature/estudios-con-equipo",
  },
];

const SPECIALTY_CARDS: HubCard[] = [
  {
    titleKey: "cardInteriorTitle",
    descKey: "cardInteriorDesc",
    href: "/software-interior-design",
  },
  {
    titleKey: "cardArchTitle",
    descKey: "cardArchDesc",
    href: "/software-architecture",
  },
];

const COMPARATIVA_CARDS: HubCard[] = [
  {
    titleKey: "cardExcelTitle",
    descKey: "cardExcelDesc",
    href: "/feature/alternativas-excel",
  },
  {
    titleKey: "stubProgramaTitle",
    descKey: "comingSoonDesc",
    href: "/feature/veta-vs-programa",
    comingSoon: true,
  },
  {
    titleKey: "stubMondayTitle",
    descKey: "comingSoonDesc",
    href: "/feature/veta-vs-monday-notion",
    comingSoon: true,
  },
  {
    titleKey: "stubHouzzTitle",
    descKey: "comingSoonDesc",
    href: "/feature/veta-vs-houzz-pro",
    comingSoon: true,
  },
];

function HubCardGrid({ cards }: { cards: HubCard[] }) {
  return (
    <StaggerContainer className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => (
        <StaggerItem key={card.titleKey}>
          <HubCardItem card={card} />
        </StaggerItem>
      ))}
    </StaggerContainer>
  );
}

async function HubCardItem({ card }: { card: HubCard }) {
  const t = await getTranslations("FeaturePages");
  const inner = (
    <Card className="border-border/60 h-full transition-shadow hover:shadow-md">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-xl">{t(card.titleKey)}</CardTitle>
          {card.comingSoon ? (
            <span className="bg-muted text-muted-foreground shrink-0 rounded-md px-2 py-0.5 text-xs font-medium">
              {t("comingSoon")}
            </span>
          ) : null}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {t(card.descKey)}
        </p>
      </CardContent>
    </Card>
  );

  if (!card.href) {
    return <div className="h-full opacity-90">{inner}</div>;
  }

  return (
    <Link href={card.href} className="block h-full">
      {inner}
    </Link>
  );
}

export async function FeaturesHubLanding() {
  const t = await getTranslations("FeaturePages");

  return (
    <>
      <section className="border-border/60 relative overflow-hidden border-b">
        <div className="from-primary/5 absolute inset-0 bg-gradient-to-br via-transparent to-transparent" />
        <div className="relative container mx-auto max-w-7xl px-4 py-16 md:py-24">
          <AnimatedSection delay={0} duration={0.45} triggerOnMount>
            <p className="text-primary mb-4 text-sm font-semibold tracking-wide uppercase">
              {t("hubBadge")}
            </p>
          </AnimatedSection>
          <AnimatedSection delay={0.08} duration={0.55} triggerOnMount>
            <h1 className="max-w-3xl text-4xl font-bold tracking-tight md:text-5xl">
              {t("hubTitle")}{" "}
              <strong className="text-primary">{t("hubTitleHighlight")}</strong>
            </h1>
          </AnimatedSection>
          <AnimatedSection delay={0.16} duration={0.55} triggerOnMount>
            <p className="text-muted-foreground mt-6 max-w-2xl text-lg md:text-xl">
              {t("hubSubtitle")}
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section className="container mx-auto max-w-7xl space-y-16 px-4 py-16 md:py-20">
        <div>
          <h2 className="mb-8 text-2xl font-bold tracking-tight">
            {t("hubGroupFeatures")}
          </h2>
          <HubCardGrid cards={FEATURE_CARDS} />
        </div>
        <div>
          <h2 className="mb-8 text-2xl font-bold tracking-tight">
            {t("hubGroupAudience")}
          </h2>
          <HubCardGrid cards={AUDIENCE_CARDS} />
        </div>
        <div>
          <h2 className="mb-8 text-2xl font-bold tracking-tight">
            {t("hubGroupSpecialty")}
          </h2>
          <HubCardGrid cards={SPECIALTY_CARDS} />
        </div>
        <div>
          <h2 className="mb-8 text-2xl font-bold tracking-tight">
            {t("hubGroupComparativas")}
          </h2>
          <HubCardGrid cards={COMPARATIVA_CARDS} />
        </div>
      </section>
    </>
  );
}
