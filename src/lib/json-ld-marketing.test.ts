import { describe, expect, it } from "vitest";
import { blogPostingJsonLd, breadcrumbListJsonLd } from "@/components/json-ld";

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
});
