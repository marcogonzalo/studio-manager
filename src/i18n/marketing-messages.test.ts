import { describe, expect, it } from "vitest";
import enMarketing from "@/i18n/messages/en/marketing";
import esMarketing from "@/i18n/messages/es/marketing";

const EXPECTED_NAMESPACES = [
  "About",
  "Benefits",
  "Blog",
  "Breadcrumbs",
  "Contact",
  "ContactForm",
  "CookieConsent",
  "CtaBeforeFaq",
  "Demo",
  "DemoCta",
  "DemoRequestForm",
  "Faq",
  "FeaturePages",
  "Features",
  "Footer",
  "Header",
  "HomePage",
  "HomeSolutions",
  "Legal",
  "PlanBase",
  "PlanCopy",
  "PlanPro",
  "PlanStudio",
  "Pricing",
  "PricingCards",
  "PricingSecondary",
  "SoftwareArquitectura",
  "SoftwareInteriorismo",
  "Stats",
  "SupportForm",
  "Testimonials",
] as const;

describe("marketing message parts", () => {
  it("exposes the same namespaces in ES and EN", () => {
    expect(Object.keys(enMarketing).sort()).toEqual(
      [...EXPECTED_NAMESPACES].sort()
    );
    expect(Object.keys(esMarketing).sort()).toEqual(
      Object.keys(enMarketing).sort()
    );
  });
});
