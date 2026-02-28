import type { NextConfig } from "next";

const PRODUCTION_CSP =
  "https://*.supabase.co https://*.backblazeb2.com https://www.googletagmanager.com https://*.googletagmanager.com https://*.google-analytics.com https://*.analytics.google.com https://www.google.com https://va.vercel-scripts.com https://vercel.live";

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
              // GTM + GA4: script origins; unsafe-inline/unsafe-eval required for Next.js and GTM
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://*.googletagmanager.com https://va.vercel-scripts.com https://vercel.live",
              "style-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://fonts.googleapis.com", // Tailwind + GTM debug + Google Fonts
              "img-src 'self' data: https: blob:",
              "font-src 'self' data: https://fonts.gstatic.com",
              // connect-src: Supabase, Backblaze, GTM/GA4, Cookiebot; in dev add local Supabase + HMR
              process.env.NODE_ENV === "production"
                ? "connect-src 'self' " + PRODUCTION_CSP
                : "connect-src 'self' http://localhost:54321 http://127.0.0.1:54321 ws://localhost:3000 ws://127.0.0.1:3000 " +
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

export default nextConfig;
