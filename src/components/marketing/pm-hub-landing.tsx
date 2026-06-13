import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  Check,
  Sparkles,
  FolderKanban,
  Users,
  Receipt,
  BarChart3,
  Building2,
  ClipboardList,
} from "lucide-react";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AnimatedSection,
  StaggerContainer,
  StaggerItem,
} from "@/components/ui/animated-section";

const featureIcons = [
  FolderKanban,
  Users,
  Receipt,
  BarChart3,
  ClipboardList,
  Building2,
] as const;

type PlanCard = {
  title: string;
  description: string;
  href: "/plan-base" | "/plan-pro" | "/plan-studio";
  cta: string;
};

export type PmHubLandingContent = {
  badge: string;
  heroTitle: string;
  heroTitleHighlight: string;
  heroSubtitle: string;
  primaryCta: string;
  secondaryCta: string;
  painsTitle: string;
  painsSubtitle: string;
  pains: Array<{ title: string; description: string }>;
  featuresTitle: string;
  featuresSubtitle: string;
  features: Array<{ title: string; text: string }>;
  plansTitle: string;
  plansSubtitle: string;
  plans: PlanCard[];
  siblingHubTitle: string;
  siblingHubDescription: string;
  siblingHubCta: string;
  siblingHubHref: "/software-interior-design" | "/software-architecture";
  ctaBadge: string;
  ctaTitle: string;
  ctaSubtitle: string;
  ctaButton: string;
};

export function PmHubLanding({ content }: { content: PmHubLandingContent }) {
  const featuresWithIcons = content.features.map((item, i) => ({
    ...item,
    icon: featureIcons[i] as LucideIcon,
  }));

  return (
    <>
      <section className="hero-pattern-overlay relative overflow-hidden py-20 md:py-32">
        <div className="from-primary/5 absolute inset-0 bg-gradient-to-br via-transparent to-transparent" />
        <div className="bg-primary/5 absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl" />
        <div className="noise-overlay" aria-hidden />

        <div className="relative container mx-auto max-w-7xl px-4">
          <AnimatedSection className="mx-auto max-w-3xl text-center">
            <div className="text-primary border-primary/30 bg-primary/10 mb-4 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium">
              <Sparkles className="h-4 w-4" />
              {content.badge}
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              {content.heroTitle}{" "}
              <span className="text-primary">{content.heroTitleHighlight}</span>
            </h1>
            <p className="text-muted-foreground mt-6 text-lg md:text-xl">
              {content.heroSubtitle}
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Button size="lg" className="animate-glow" asChild>
                <Link href="/sign-up">
                  {content.primaryCta}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/pricing">{content.secondaryCta}</Link>
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <div
        className="via-primary/40 h-1 w-full bg-gradient-to-r from-transparent to-transparent"
        aria-hidden
      />

      <section className="bg-muted/30 py-20">
        <div className="container mx-auto max-w-7xl px-4">
          <AnimatedSection className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {content.painsTitle}
            </h2>
            <p className="text-muted-foreground mt-4 text-lg">
              {content.painsSubtitle}
            </p>
          </AnimatedSection>

          <StaggerContainer
            className="mx-auto grid max-w-4xl gap-8 sm:grid-cols-1 md:grid-cols-3"
            staggerDelay={0.1}
          >
            {content.pains.map((pain) => (
              <StaggerItem key={pain.title}>
                <Card className="h-full border-none shadow-sm transition-all duration-300 hover:shadow-md">
                  <CardHeader>
                    <CardTitle className="text-lg">{pain.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{pain.description}</p>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto max-w-7xl px-4">
          <AnimatedSection className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {content.featuresTitle}
            </h2>
            <p className="text-muted-foreground mt-4 text-lg">
              {content.featuresSubtitle}
            </p>
          </AnimatedSection>

          <div className="mx-auto grid max-w-5xl gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {featuresWithIcons.map((item) => (
              <AnimatedSection key={item.title} className="flex gap-4">
                <div className="bg-primary/10 text-primary flex h-12 w-12 shrink-0 items-center justify-center rounded-lg">
                  <item.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {item.text}
                  </p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-muted/30 py-20">
        <div className="container mx-auto max-w-7xl px-4">
          <AnimatedSection className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {content.plansTitle}
            </h2>
            <p className="text-muted-foreground mt-4 text-lg">
              {content.plansSubtitle}
            </p>
          </AnimatedSection>

          <StaggerContainer
            className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3"
            staggerDelay={0.1}
          >
            {content.plans.map((plan) => (
              <StaggerItem key={plan.title}>
                <Card className="border-primary/10 flex h-full flex-col shadow-sm transition-all duration-300 hover:shadow-md">
                  <CardHeader>
                    <CardTitle className="text-lg">{plan.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col">
                    <p className="text-muted-foreground flex-1 text-sm">
                      {plan.description}
                    </p>
                    <Button className="mt-6 w-full" variant="outline" asChild>
                      <Link href={plan.href}>
                        {plan.cta}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto max-w-7xl px-4">
          <AnimatedSection className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {content.siblingHubTitle}
            </h2>
            <p className="text-muted-foreground mt-4">
              {content.siblingHubDescription}
            </p>
            <Button className="mt-6" variant="link" asChild>
              <Link href={content.siblingHubHref}>
                {content.siblingHubCta}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </AnimatedSection>
        </div>
      </section>

      <section className="relative overflow-hidden py-20">
        <div className="from-primary/10 via-primary/5 absolute inset-0 bg-gradient-to-br to-transparent" />
        <div className="bg-primary/10 absolute top-0 right-0 h-96 w-96 translate-x-1/3 -translate-y-1/2 rounded-full blur-3xl" />

        <div className="relative container mx-auto max-w-7xl px-4">
          <AnimatedSection className="mx-auto max-w-2xl text-center">
            <div className="text-primary mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium">
              <Check className="h-4 w-4" />
              {content.ctaBadge}
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {content.ctaTitle}
            </h2>
            <p className="text-muted-foreground mt-4 text-lg">
              {content.ctaSubtitle}
            </p>
            <div className="mt-8">
              <Button size="lg" className="animate-glow" asChild>
                <Link href="/sign-up">
                  {content.ctaButton}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
