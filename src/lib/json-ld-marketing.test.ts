import { describe, expect, it } from "vitest";
import {
  aboutPageJsonLd,
  blogPostingJsonLd,
  breadcrumbListJsonLd,
  organizationJsonLd,
  planOfferJsonLd,
  serializeJsonLd,
  softwareApplicationJsonLd,
  softwareApplicationPricingJsonLd,
  websiteJsonLd,
} from "@/components/json-ld";

describe("marketing JSON-LD helpers", () => {
  it("builds BreadcrumbList with absolute item URLs", () => {
    const data = breadcrumbListJsonLd([
      { name: "Inicio", path: "/" },
      { name: "Blog", path: "/blog" },
    ]);

    expect(data["@type"]).toBe("BreadcrumbList");
    expect(data.itemListElement).toHaveLength(2);
    expect(data.itemListElement[0]).toMatchObject({
      position: 1,
      name: "Inicio",
      item: "https://veta.pro/",
    });
    expect(data.itemListElement[1]?.item).toBe("https://veta.pro/blog");
  });

  it("builds BlogPosting with Person author", () => {
    const data = blogPostingJsonLd({
      title: "Test post",
      description: "Summary",
      path: "/blog/test-post",
      datePublished: "2026-01-01",
      author: {
        name: "Marco Gonzalo Gómez Pérez",
        url: "https://www.linkedin.com/in/marcogonzalo",
      },
    });

    expect(data["@type"]).toBe("BlogPosting");
    expect(data.author).toMatchObject({
      "@type": "Person",
      name: "Marco Gonzalo Gómez Pérez",
      url: "https://www.linkedin.com/in/marcogonzalo",
    });
    expect(data.publisher).toMatchObject({
      "@type": "Organization",
      name: "Veta",
    });
  });

  it("serializes JSON-LD escaping < so script tags stay closed", () => {
    expect(serializeJsonLd({ text: "</script><b>x" })).toContain("\\u003c");
    expect(serializeJsonLd({ text: "</script><b>x" })).not.toContain(
      "</script>"
    );
  });

  it("localizes Organization / SoftwareApplication / WebSite for en", () => {
    const org = organizationJsonLd("en");
    expect(org.contactPoint.availableLanguage).toEqual(["es", "en"]);
    expect(org.contactPoint.areaServed).toBe("Worldwide");
    expect(org.description).toMatch(/interior design/i);

    const app = softwareApplicationJsonLd("en");
    expect(app.description).toMatch(/interior design/i);
    expect(app.inLanguage).toEqual(["es", "en"]);

    const site = websiteJsonLd("en");
    expect(site.description).toMatch(/interior design/i);
    expect(site.inLanguage).toEqual(["es", "en"]);
  });

  it("keeps AggregateOffer prices aligned with /pricing", () => {
    const data = softwareApplicationPricingJsonLd(
      "https://veta.pro/precios",
      "es"
    );
    expect(data.offers.lowPrice).toBe("0");
    expect(data.offers.highPrice).toBe("750");
    const names = data.offers.priceSpecification.map(
      (spec: { name: string; price: string }) => `${spec.name}:${spec.price}`
    );
    expect(names).toContain("Pro (anual):250");
    expect(names).toContain("Studio (anual):750");
  });

  it("builds per-plan SoftwareApplication Offer", () => {
    const pro = planOfferJsonLd({
      plan: "PRO",
      pageUrl: "https://veta.pro/plan-pro-independientes-diseno-interior",
      locale: "es",
    });
    expect(pro["@type"]).toBe("SoftwareApplication");
    expect(pro.offers).toMatchObject({
      "@type": "Offer",
      price: "25",
      priceCurrency: "EUR",
    });

    const base = planOfferJsonLd({
      plan: "BASE",
      pageUrl: "https://veta.pro/plan-base-primer-proyecto-interiorismo",
      locale: "en",
    });
    expect(base.offers.price).toBe("0");
    expect(base.isAccessibleForFree).toBe(true);
  });

  it("builds AboutPage schema", () => {
    const data = aboutPageJsonLd({
      pageUrl: "https://veta.pro/sobre-veta",
      name: "Sobre Veta",
      description: "Historia y equipo",
    });
    expect(data["@type"]).toBe("AboutPage");
    expect(data.url).toBe("https://veta.pro/sobre-veta");
    expect(data.mainEntity).toMatchObject({
      "@type": "Organization",
      name: "Veta",
    });
  });
});
