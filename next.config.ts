import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const PRODUCTION_CSP =
  "https://*.supabase.co https://*.backblazeb2.com https://www.googletagmanager.com https://*.googletagmanager.com https://*.google-analytics.com https://*.analytics.google.com https://www.google.com https://fonts.gstatic.com https://va.vercel-scripts.com https://vercel.live";

const nextConfig: NextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,

  // Security headers to protect against common attacks
  async headers() {
    // CORS configuration (A05): Explicitly define allowed origins
    // Currently same-origin only; add origins via ALLOWED_CORS_ORIGINS env var if needed
    const corsHeaders = [];
    const allowedOrigins =
      process.env.ALLOWED_CORS_ORIGINS?.split(",").filter(Boolean) || [];

    if (allowedOrigins.length > 0) {
      corsHeaders.push({
        key: "Access-Control-Allow-Origin",
        value: allowedOrigins[0], // CORS spec allows only one origin per response
      });
      corsHeaders.push({
        key: "Access-Control-Allow-Methods",
        value: "GET, POST, PUT, DELETE, OPTIONS",
      });
      corsHeaders.push({
        key: "Access-Control-Allow-Headers",
        value: "Content-Type, Authorization",
      });
      corsHeaders.push({
        key: "Access-Control-Max-Age",
        value: "86400", // 24 hours
      });
    }

    return [
      {
        // Long cache for hashed static assets (Lighthouse: efficient cache lifetimes)
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=43800, immutable",
          },
        ],
      },
      {
        // Apply to all routes
        source: "/:path*",
        headers: [
          ...corsHeaders,
          {
            // Prevent clickjacking - don't allow page to be loaded in iframes
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            // Prevent MIME type sniffing - browser must respect Content-Type
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            // Control what referrer information is sent
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            // Content Security Policy - control what resources can be loaded
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // GTM + GA4: script origins (unsafe-inline/unsafe-eval required for Next.js and GTM)
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://*.googletagmanager.com https://va.vercel-scripts.com https://vercel.live",
              "style-src 'self' 'unsafe-inline'", // unsafe-inline needed for Tailwind
              "img-src 'self' data: https: blob:",
              "font-src 'self' data: https://fonts.gstatic.com",
              // connect-src: Supabase, Backblaze, GTM/GA4, PDF fonts; blob: para react-pdf
              process.env.NODE_ENV === "production"
                ? "connect-src 'self' blob: " + PRODUCTION_CSP
                : "connect-src 'self' blob: http://localhost:54321 http://127.0.0.1:54321 ws://localhost:3000 ws://127.0.0.1:3000 " +
                  PRODUCTION_CSP,
              "frame-src 'self' https://www.googletagmanager.com",
              "frame-ancestors 'none'",
            ].join("; "),
          },
          {
            // Prevent automatic MIME type detection
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            // Control which browser features can be used
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },

  // Explicit rewrites map localized URL slugs to the internal Next.js filesystem
  // paths under src/app/[locale]/. The proxy/middleware (next-intl) runs first
  // and handles these rewrites internally; these afterFiles entries act as a
  // reliable fallback in case the middleware rewrite does not apply (e.g. dev
  // mode Turbopack inconsistencies).
  async rewrites() {
    return [
      // ES: map localized slugs to internal [locale] filesystem paths.
      { source: "/precios", destination: "/es/pricing" },
      { source: "/sobre-veta", destination: "/es/about" },
      { source: "/contacto", destination: "/es/contact" },
      { source: "/demo", destination: "/es/demo" },
      { source: "/legal", destination: "/es/legal" },
      { source: "/sign-in", destination: "/es/sign-in" },
      { source: "/sign-up", destination: "/es/sign-up" },
      { source: "/auth/complete", destination: "/es/auth/complete" },
      {
        source: "/plan-base-primer-proyecto-interiorismo",
        destination: "/es/plan-base",
      },
      {
        source: "/plan-pro-independientes-diseno-interior",
        destination: "/es/plan-pro",
      },
      {
        source: "/plan-studio-empresas-arquitectura-diseno-interior",
        destination: "/es/plan-studio",
      },
      // EN: about-veta localized URL -> internal `/en/about` directory
      { source: "/en/about-veta", destination: "/en/about" },
      // EN: map plan landing slugs to internal plan directory names.
      {
        source: "/en/base-plan-first-interior-design-project",
        destination: "/en/plan-base",
      },
      {
        source: "/en/pro-plan-for-independent-interior-designers",
        destination: "/en/plan-pro",
      },
      {
        source: "/en/studio-plan-for-architecture-and-interior-design-firms",
        destination: "/en/plan-studio",
      },
    ];
  },

  // Redirect legacy Spanish view-project routes to English
  async redirects() {
    return [
      // i18n: remove legacy "/es" prefix duplicates (ES default without prefix)
      { source: "/es", destination: "/", permanent: true },
      // next-intl "as-needed" locale switches may generate localized-but-redundant
      // ES slugs like "/es/precios". Redirect them to the canonical default-locale
      // paths without the "/es" prefix.
      { source: "/es/precios", destination: "/precios", permanent: true },
      {
        source: "/es/sobre-veta",
        destination: "/sobre-veta",
        permanent: true,
      },
      { source: "/es/contacto", destination: "/contacto", permanent: true },
      { source: "/es/demo", destination: "/demo", permanent: true },
      { source: "/es/legal", destination: "/legal", permanent: true },
      { source: "/es/about", destination: "/sobre-veta", permanent: true },
      { source: "/es/contact", destination: "/contacto", permanent: true },
      {
        source: "/es/plan-base-primer-proyecto-interiorismo",
        destination: "/plan-base-primer-proyecto-interiorismo",
        permanent: true,
      },
      {
        source: "/es/plan-pro-independientes-diseno-interior",
        destination: "/plan-pro-independientes-diseno-interior",
        permanent: true,
      },
      {
        source: "/es/plan-studio-empresas-arquitectura-diseno-interior",
        destination: "/plan-studio-empresas-arquitectura-diseno-interior",
        permanent: true,
      },

      // i18n: legacy no-locale Spanish slugs (keep ES as canonical default)
      { source: "/pricing", destination: "/precios", permanent: true },
      { source: "/about", destination: "/sobre-veta", permanent: true },
      { source: "/contact", destination: "/contacto", permanent: true },

      // i18n: EN about canonicalization
      { source: "/en/about", destination: "/en/about-veta", permanent: true },

      // i18n: legacy English plan slugs were Spanish; redirect to translated slugs
      {
        source: "/en/plan-base-primer-proyecto-interiorismo",
        destination: "/en/base-plan-first-interior-design-project",
        permanent: true,
      },
      {
        source: "/en/plan-pro-independientes-diseno-interior",
        destination: "/en/pro-plan-for-independent-interior-designers",
        permanent: true,
      },
      {
        source: "/en/plan-studio-empresas-arquitectura-diseno-interior",
        destination:
          "/en/studio-plan-for-architecture-and-interior-design-firms",
        permanent: true,
      },

      {
        source: "/view-project/:token/productos",
        destination: "/view-project/:token/products",
        permanent: true,
      },
      {
        source: "/view-project/:token/costes",
        destination: "/view-project/:token/costs",
        permanent: true,
      },
      {
        source: "/view-project/:token/pagos",
        destination: "/view-project/:token/payments",
        permanent: true,
      },
    ];
  },

  // Restrict image optimization to trusted origins (A05); no hostname: "**"
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "**.backblazeb2.com",
        pathname: "/**",
      },
    ],
  },

  // Environment variables that should be available on the client
  env: {
    NEXT_PUBLIC_APP_NAME: "Veta",
  },

  // Turbopack configuration for @react-pdf/renderer compatibility
  // Alias Node.js modules that aren't available in the browser
  turbopack: {
    resolveAlias: {
      canvas: "./src/lib/empty-module.ts",
      encoding: "./src/lib/empty-module.ts",
    },
  },

  // Enable experimental features if needed
  experimental: {
    // Enable server actions
    serverActions: {
      bodySizeLimit: "2mb",
    },
    // Tree-shake barrel exports (lucide-react: only icons in use; smaller JS bundle)
    optimizePackageImports: ["lucide-react"],
  },
};

export default withNextIntl(nextConfig);
