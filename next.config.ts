import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,

  // Allow cross-origin requests from localhost for development
  allowedDevOrigins: ['http://127.0.0.1:3000', 'http://localhost:3000'],

  // Configure image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // Environment variables that should be available on the client
  env: {
    NEXT_PUBLIC_APP_NAME: 'StudioManager',
  },

  // Turbopack configuration for @react-pdf/renderer compatibility
  // Alias Node.js modules that aren't available in the browser
  turbopack: {
    resolveAlias: {
      canvas: './src/lib/empty-module.ts',
      encoding: './src/lib/empty-module.ts',
    },
  },

  // Enable experimental features if needed
  experimental: {
    // Enable server actions
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;
