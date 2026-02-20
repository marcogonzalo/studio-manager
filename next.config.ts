import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,

  // Allow cross-origin requests from localhost for development
  allowedDevOrigins: ["http://127.0.0.1:3000", "http://localhost:3000"],

  // Security headers to protect against common attacks
  async headers() {
    return [
      {
        // Apply to all routes
        source: "/:path*",
        headers: [
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
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // unsafe-inline/unsafe-eval needed for Next.js
              "style-src 'self' 'unsafe-inline'", // unsafe-inline needed for Tailwind
              "img-src 'self' data: https: blob:",
              "font-src 'self' data:",
              // Allow HTTPS connections in production, HTTP (localhost) in other environments
              process.env.NODE_ENV === "production"
                ? "connect-src 'self' https://*.supabase.co https://*.backblazeb2.com"
                : "connect-src 'self' http://localhost:54321 http://127.0.0.1:54321 https://*.backblazeb2.com ws://localhost:3000 ws://127.0.0.1:3000", // Supabase local (54321) + Next.js HMR (3000)
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
  },
};

export default nextConfig;
