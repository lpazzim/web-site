import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default defineConfig([
  globalIgnores(["dist", "node_modules/.tmp", "playwright-report", "test-results"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [js.configs.recommended, tseslint.configs.recommended],
    rules: {
      // TypeScript's noUnusedLocals/noUnusedParameters already cover this.
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
  {
    // Browser app. react-hooks "recommended-latest" includes the React Compiler rules.
    files: ["src/**/*.{ts,tsx}"],
    extends: [reactHooks.configs.flat["recommended-latest"], reactRefresh.configs.vite],
    languageOptions: { globals: globals.browser },
  },
  {
    // Serverless functions and build tooling run on Node.
    files: ["api/**/*.ts", "vite-plugins/**/*.ts", "e2e/**/*.ts", "*.config.ts"],
    languageOptions: { globals: globals.node },
  },
]);
