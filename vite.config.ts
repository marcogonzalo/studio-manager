import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig(async () => {
  // Dynamic import to avoid ESM resolution issues in Vite 7
  const { NodeGlobalsPolyfillPlugin } = await import("@esbuild-plugins/node-globals-polyfill")
  const { NodeModulesPolyfillPlugin } = await import("@esbuild-plugins/node-modules-polyfill")

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    optimizeDeps: {
      include: ["@react-pdf/renderer"],
      exclude: [],
      esbuildOptions: {
        plugins: [
          NodeGlobalsPolyfillPlugin({
            process: true,
            buffer: true,
          }),
          NodeModulesPolyfillPlugin(),
        ],
      },
    },
    build: {
      commonjsOptions: {
        include: [/node_modules/],
        transformMixedEsModules: true,
      },
    },
    define: {
      global: 'globalThis',
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      css: true,
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        exclude: [
          'node_modules/',
          'src/test/',
          '**/*.d.ts',
          '**/*.config.*',
          '**/mockData',
          '**/*.test.*',
          '**/*.spec.*',
        ],
      },
    },
  }
})
