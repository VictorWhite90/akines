import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Prototype copy is full of natural apostrophes.
  { rules: { "react/no-unescaped-entities": "off" } },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // The landing handoff is reference material; its port lives in components/landing and app/(landing).
    "akines-landing/**",
  ]),
]);

export default eslintConfig;
