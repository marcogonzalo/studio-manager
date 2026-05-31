/**
 * Playwright performance audit — FCP, LCP, TTFB, CLS, resource waterfall.
 * Run against production server: pnpm build && pnpm start, then:
 *   pnpm perf:audit
 */
import { chromium, type Page } from "playwright";
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const BASE_URL = process.env.PERF_BASE_URL ?? "http://127.0.0.1:3000";
const ROUTES = ["/", "/en", "/pricing", "/en/pricing"] as const;
const OUTPUT_DIR = join(process.cwd(), ".perf-audit");
const BLOCK_THIRD_PARTY = process.env.PERF_BLOCK_3P !== "0";
const THROTTLE = process.env.PERF_THROTTLE === "1";

type WebVitals = {
  fcp: number | null;
  lcp: number | null;
  cls: number;
  ttfb: number | null;
  domContentLoaded: number | null;
  load: number | null;
  lcpElement: string | null;
};

type ResourceRow = {
  url: string;
  type: string;
  sizeKb: number;
  durationMs: number;
  renderBlocking: boolean;
};

type RouteReport = {
  route: string;
  vitals: WebVitals;
  navigationMs: number;
  jsTransferKb: number;
  cssTransferKb: number;
  thirdPartyKb: number;
  requestCount: number;
  topResources: ResourceRow[];
  renderBlocking: ResourceRow[];
  recommendations: string[];
};

async function collectVitals(page: Page): Promise<WebVitals> {
  await page.waitForTimeout(THROTTLE ? 8000 : 5000);
  return page.evaluate(() => {
    const nav = performance.getEntriesByType("navigation")[0] as
      | PerformanceNavigationTiming
      | undefined;

    const paint = performance.getEntriesByType("paint");
    const fcpEntry = paint.find((e) => e.name === "first-contentful-paint");

    const lcpEntries = performance.getEntriesByType(
      "largest-contentful-paint"
    ) as (PerformanceEntry & { element?: Element })[];
    const lastLcp = lcpEntries[lcpEntries.length - 1];

    let lcpElement: string | null = null;
    if (lastLcp?.element) {
      const el = lastLcp.element;
      const tag = el.tagName.toLowerCase();
      const id = el.id ? `#${el.id}` : "";
      const cn =
        typeof el.className === "string" && el.className
          ? `.${String(el.className).split(/\s+/).slice(0, 2).join(".")}`
          : "";
      lcpElement = `${tag}${id}${cn}`;
    }

    let cls = 0;
    const layoutShifts = performance.getEntriesByType("layout-shift") as {
      value?: number;
      hadRecentInput?: boolean;
    }[];
    for (const entry of layoutShifts) {
      if (!entry.hadRecentInput && typeof entry.value === "number") {
        cls += entry.value;
      }
    }

    return {
      fcp: fcpEntry ? fcpEntry.startTime : null,
      lcp: lastLcp ? lastLcp.startTime : null,
      cls,
      ttfb: nav ? nav.responseStart - nav.requestStart : null,
      domContentLoaded: nav ? nav.domContentLoadedEventEnd : null,
      load: nav ? nav.loadEventEnd : null,
      lcpElement,
    };
  });
}

function analyzeResources(
  resources: ResourceRow[],
  vitals: WebVitals
): string[] {
  const recs: string[] = [];
  const js = resources.filter((r) => r.type === "script");
  const jsTotal = js.reduce((s, r) => s + r.sizeKb, 0);
  if (jsTotal > 300) {
    recs.push(
      `JS transfer ~${Math.round(jsTotal)} KB — defer/lazy-load below-fold (framer-motion, Radix sheets).`
    );
  }

  const blocking = resources.filter((r) => r.renderBlocking);
  if (blocking.length > 0) {
    recs.push(
      `${blocking.length} render-blocking resource(s) — preload critical CSS/fonts or inline critical CSS.`
    );
  }

  const slow = resources.filter((r) => r.durationMs > 200).slice(0, 3);
  if (slow.length) {
    recs.push(
      `Slow resources: ${slow.map((r) => `${shortUrl(r.url)} (${Math.round(r.durationMs)}ms)`).join(", ")}.`
    );
  }

  if (vitals.fcp != null && vitals.fcp > 1800) {
    recs.push(
      `FCP ${Math.round(vitals.fcp)}ms > 1.8s — reduce head scripts, avoid opacity:0 hero until hydration, prioritize LCP text.`
    );
  }
  if (vitals.lcp != null && vitals.lcp > 2500) {
    recs.push(
      `LCP ${Math.round(vitals.lcp)}ms > 2.5s — check LCP element (${vitals.lcpElement ?? "unknown"}); remove animation delay on hero/mockup.`
    );
  }
  if (
    vitals.lcpElement?.includes("motion") ||
    vitals.lcpElement?.includes("h1")
  ) {
    recs.push(
      "LCP likely text/hero — keep h1 visible on first paint (no framer initial opacity:0)."
    );
  }

  const thirdParty = resources.filter(
    (r) =>
      r.url.includes("googletagmanager") ||
      r.url.includes("google-analytics") ||
      r.url.includes("vercel")
  );
  if (thirdParty.reduce((s, r) => s + r.sizeKb, 0) > 100) {
    recs.push(
      "Third-party > 100 KB — keep GTM lazyOnload; audit consent + analytics bundle."
    );
  }

  return recs;
}

function shortUrl(url: string): string {
  try {
    const u = new URL(url);
    return u.pathname.length > 48 ? `${u.pathname.slice(0, 45)}…` : u.pathname;
  } catch {
    return url.slice(0, 48);
  }
}

async function auditRoute(page: Page, route: string): Promise<RouteReport> {
  const resources: ResourceRow[] = [];
  const navStart = Date.now();

  await page.addInitScript(() => {
    try {
      new PerformanceObserver(() => {}).observe({
        type: "largest-contentful-paint",
        buffered: true,
      });
      new PerformanceObserver(() => {}).observe({
        type: "layout-shift",
        buffered: true,
      });
    } catch {
      /* unsupported */
    }
  });

  page.on("response", async (response) => {
    const req = response.request();
    const url = response.url();
    const type = req.resourceType();
    let sizeKb = 0;
    try {
      const body = await response.body();
      sizeKb = body.length / 1024;
    } catch {
      sizeKb = Number(response.headers()["content-length"] ?? 0) / 1024;
    }
    const timing = response.request().timing();
    const durationMs = timing ? timing.responseEnd - timing.requestStart : 0;
    const renderBlocking =
      type === "stylesheet" ||
      (type === "script" &&
        !url.includes("_next/static") &&
        response.headers()["defer"] !== "true");

    resources.push({
      url,
      type,
      sizeKb: Math.round(sizeKb * 10) / 10,
      durationMs: Math.max(0, durationMs),
      renderBlocking,
    });
  });

  await page.goto(`${BASE_URL}${route}`, {
    waitUntil: "load",
    timeout: 60_000,
  });

  const vitals = await collectVitals(page);
  const navigationMs = Date.now() - navStart;

  resources.sort((a, b) => b.sizeKb - a.sizeKb);
  const topResources = resources.slice(0, 15);

  const jsTransferKb = Math.round(
    resources
      .filter((r) => r.type === "script")
      .reduce((s, r) => s + r.sizeKb, 0)
  );
  const cssTransferKb = Math.round(
    resources
      .filter((r) => r.type === "stylesheet")
      .reduce((s, r) => s + r.sizeKb, 0)
  );
  const thirdPartyKb = Math.round(
    resources
      .filter(
        (r) =>
          !r.url.startsWith(BASE_URL) &&
          !r.url.includes("127.0.0.1") &&
          r.type !== "document"
      )
      .reduce((s, r) => s + r.sizeKb, 0)
  );

  const renderBlocking = resources.filter(
    (r) => r.renderBlocking && r.sizeKb > 1
  );

  const recommendations = [...new Set(analyzeResources(resources, vitals))];

  return {
    route,
    vitals,
    navigationMs,
    jsTransferKb,
    cssTransferKb,
    thirdPartyKb,
    requestCount: resources.length,
    topResources,
    renderBlocking,
    recommendations,
  };
}

function formatMs(ms: number | null): string {
  return ms == null ? "n/a" : `${Math.round(ms)} ms`;
}

function printReport(reports: RouteReport[]) {
  console.log("\n=== Veta Playwright Performance Audit ===\n");
  console.log(`Base URL: ${BASE_URL}`);
  console.log(
    `Mode: ${process.env.PERF_VIEWPORT === "desktop" ? "desktop" : "mobile"} | 3p blocked: ${BLOCK_THIRD_PARTY} | throttle: ${THROTTLE}\n`
  );

  for (const r of reports) {
    console.log(`--- ${r.route} ---`);
    console.log(`  FCP:  ${formatMs(r.vitals.fcp)}`);
    console.log(
      `  LCP:  ${formatMs(r.vitals.lcp)}  (${r.vitals.lcpElement ?? "element unknown"})`
    );
    console.log(`  TTFB: ${formatMs(r.vitals.ttfb)}`);
    console.log(`  CLS:  ${r.vitals.cls.toFixed(3)}`);
    console.log(`  DCL:  ${formatMs(r.vitals.domContentLoaded)}`);
    console.log(`  Load: ${formatMs(r.vitals.load)}`);
    console.log(
      `  Transfer: JS ${r.jsTransferKb} KB | CSS ${r.cssTransferKb} KB | 3rd ${r.thirdPartyKb} KB | ${r.requestCount} reqs`
    );
    console.log("  Top resources (KB):");
    for (const res of r.topResources.slice(0, 8)) {
      console.log(
        `    ${res.sizeKb.toString().padStart(7)}  ${res.type.padEnd(10)} ${shortUrl(res.url)}`
      );
    }
    if (r.recommendations.length) {
      console.log("  Recommendations:");
      for (const rec of r.recommendations) {
        console.log(`    • ${rec}`);
      }
    }
    console.log("");
  }
}

async function main() {
  mkdirSync(OUTPUT_DIR, { recursive: true });

  const browser = await chromium.launch({
    headless: true,
    args: ["--disable-dev-shm-usage"],
  });

  const viewport =
    process.env.PERF_VIEWPORT === "desktop"
      ? { width: 1366, height: 768 }
      : { width: 390, height: 844 };

  const context = await browser.newContext({
    viewport,
    userAgent:
      process.env.PERF_VIEWPORT === "desktop"
        ? "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36"
        : "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36",
    locale: "es-ES",
    colorScheme: "dark",
  });

  if (BLOCK_THIRD_PARTY) {
    await context.route("**/*", (route) => {
      const url = route.request().url();
      if (
        url.includes("googletagmanager.com") ||
        url.includes("google-analytics.com") ||
        url.includes("analytics.google.com") ||
        url.includes("va.vercel-scripts.com")
      ) {
        return route.abort();
      }
      return route.continue();
    });
  }

  const reports: RouteReport[] = [];

  for (const route of ROUTES) {
    const page = await context.newPage();
    if (THROTTLE) {
      const cdp = await context.newCDPSession(page);
      await cdp.send("Network.enable");
      await cdp.send("Network.emulateNetworkConditions", {
        offline: false,
        downloadThroughput: (1.5 * 1024 * 1024) / 8,
        uploadThroughput: (750 * 1024) / 8,
        latency: 150,
      });
      await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
    }
    try {
      reports.push(await auditRoute(page, route));
    } catch (err) {
      console.error(`Failed ${route}:`, err);
    } finally {
      await page.close();
    }
  }

  await context.close();
  await browser.close();

  printReport(reports);

  const outPath = join(OUTPUT_DIR, `report-${Date.now()}.json`);
  writeFileSync(
    outPath,
    JSON.stringify({ baseUrl: BASE_URL, reports }, null, 2)
  );
  console.log(`Full JSON: ${outPath}\n`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
