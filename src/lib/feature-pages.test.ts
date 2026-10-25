import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  getFeaturePageContent,
  listMissingFeatureMarkdown,
  resolveFeatureLocaleSwitchPath,
} from "@/lib/feature-pages";

describe("feature-pages", () => {
  it("resolves locale switch between ES and EN feature paths", () => {
    expect(
      resolveFeatureLocaleSwitchPath(
        "es",
        "en",
        "/control-costes-rentabilidad-interiorismo"
      )
    ).toBe("/en/cost-control-profitability-interior-design");

    expect(resolveFeatureLocaleSwitchPath("en", "es", "/features")).toBe(
      "/funcionalidades"
    );

    expect(
      resolveFeatureLocaleSwitchPath("es", "en", "/blog/something")
    ).toBeNull();
  });

  it("loads markdown content for a feature page", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "veta-features-"));
    await mkdir(path.join(root, "es"), { recursive: true });
    await writeFile(
      path.join(root, "es", "control-costes.md"),
      `---
title: "Control de costes test"
excerpt: "Excerpt de prueba"
faq:
  - question: "Q?"
    answer: "A."
---

## Sección

Texto de prueba.
`,
      "utf8"
    );

    const content = await getFeaturePageContent("es", "control-costes", {
      featuresRoot: root,
    });
    expect(content).not.toBeNull();
    expect(content?.title).toBe("Control de costes test");
    expect(content?.contentHtml).toContain("Sección");
    expect(content?.faq?.[0]?.question).toBe("Q?");
    expect(content?.canonicalPath).toBe(
      "/control-costes-rentabilidad-interiorismo"
    );
  });

  it("reports missing markdown for hasMarkdown pages", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "veta-features-empty-"));
    await mkdir(path.join(root, "es"), { recursive: true });
    await mkdir(path.join(root, "en"), { recursive: true });
    const missing = await listMissingFeatureMarkdown({ featuresRoot: root });
    expect(missing.length).toBeGreaterThan(0);
    expect(missing.some((m) => m.pageId === "control-costes")).toBe(true);
  });
});
