import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      "react-hooks/set-state-in-effect": "off",
      // react-hook-form watch()/handleSubmit patterns are incompatible with React Compiler memoization heuristics
      "react-hooks/incompatible-library": "off",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      // Soft readability budget for agent context and reviews (legacy files warn only)
      "max-lines": [
        "warn",
        { max: 300, skipBlankLines: true, skipComments: true },
      ],
      "@next/next/no-img-element": "warn",
      "react/no-unescaped-entities": "off",
    },
  },
  {
    files: [
      "src/components/ui/**/*.{ts,tsx}",
      "src/i18n/messages/**/*.{ts,json}",
      "**/*.test.{ts,tsx}",
    ],
    rules: {
      "max-lines": "off",
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "dist/**",
    "next-env.d.ts",
    "node_modules/**",
    "coverage/**",
    "**/*.json",
    "*.config.js",
    "*.config.ts",
  ]),
]);

export default eslintConfig;
