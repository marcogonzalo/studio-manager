"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AnimatedSection,
  StaggerContainer,
  StaggerItem,
} from "@/components/ui/animated-section";

export function HomeFaqSection() {
  const t = useTranslations("Faq");

  const homeFaqs = [
    {
      question: t("question1"),
      answer: t("answer1"),
    },
    {
      question: t("question2"),
      answer: t("answer2"),
    },
    {
      question: t("question3"),
      answer: t("answer3"),
    },
    {
      question: t("question4"),
      answer: t("answer4"),
    },
  ];

  return (
    <section className="bg-muted/30 py-20">
      <div className="container mx-auto max-w-7xl px-4">
        <AnimatedSection
          className="mx-auto mb-12 max-w-2xl text-center"
          triggerOnMount={false}
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {t("sectionTitle")}{" "}
            <strong className="text-primary">
              {t("sectionTitleHighlight")}
            </strong>
          </h2>
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
