import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  getBlogPostBySlug,
  getBlogPostSummaries,
  getBlogStaticParams,
} from "@/lib/blog";

const tempDirectories: string[] = [];

async function createTempBlogContent() {
  const root = await mkdtemp(path.join(tmpdir(), "veta-blog-"));
  tempDirectories.push(root);

  const esDir = path.join(root, "es");
  const enDir = path.join(root, "en");

  await mkdir(esDir, { recursive: true });
  await mkdir(enDir, { recursive: true });

  await writeFile(
    path.join(esDir, "tendencias-2026.md"),
    `---
entryId: tendencias-2026
title: Tendencias de interiorismo 2026
date: 2026-01-20
excerpt: Claves para diseñar espacios contemporáneos.
coverImage: /img/blog/tendencias-2026.jpg
slug: tendencias-2026
---
Contenido en **español**.
`,
    "utf8"
  );

  await writeFile(
    path.join(esDir, "iluminacion.md"),
    `---
entryId: iluminacion
title: Iluminación para vivienda
date: 2025-12-12
excerpt: Cómo iluminar por capas.
slug: iluminacion
---
Texto de iluminación.
`,
    "utf8"
  );

  await writeFile(
    path.join(enDir, "interior-trends-2026.md"),
    `---
entryId: tendencias-2026
title: Interior design trends 2026
date: 2026-01-20
excerpt: Keys to design contemporary spaces.
slug: interior-trends-2026
---
English article content.
`,
    "utf8"
  );

  return root;
}

afterEach(async () => {
  await Promise.all(
    tempDirectories.map((directory) =>
      rm(directory, { recursive: true, force: true })
    )
  );
  tempDirectories.length = 0;
});

describe("blog content module", () => {
  it("returns summaries ordered by recent date first", async () => {
    const blogRoot = await createTempBlogContent();

    const posts = await getBlogPostSummaries("es", { blogRoot });

    expect(posts).toHaveLength(2);
    expect(posts[0]?.slug).toBe("tendencias-2026");
    expect(posts[1]?.slug).toBe("iluminacion");
  });

  it("returns a post in html and resolves translated slug", async () => {
    const blogRoot = await createTempBlogContent();

    const post = await getBlogPostBySlug("es", "tendencias-2026", { blogRoot });

    expect(post).not.toBeNull();
    expect(post?.contentHtml).toContain(
      "<p>Contenido en <strong>español</strong>.</p>"
    );
    expect(post?.translations.en).toBe("interior-trends-2026");
  });

  it("generates static params across locales and slugs", async () => {
    const blogRoot = await createTempBlogContent();

    const params = await getBlogStaticParams({ blogRoot });

    expect(params).toEqual(
      expect.arrayContaining([
        { locale: "es", slug: "tendencias-2026" },
        { locale: "es", slug: "iluminacion" },
        { locale: "en", slug: "interior-trends-2026" },
      ])
    );
  });
});
