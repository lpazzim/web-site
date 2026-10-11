/// <reference types="vitest/config" />
import { fileURLToPath, URL } from "node:url";
import { defineConfig, loadEnv } from "vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import { vercelApi } from "./vite-plugins/vercel-api.ts";

export default defineConfig(({ mode }) => {
  // Expose server-only secrets (NOTION_*) to the API handlers in dev. They are
  // never prefixed with VITE_, so they stay out of the client bundle.
  Object.assign(process.env, loadEnv(mode, process.cwd(), "NOTION_"));

  return {
    server: { port: 5000 },
    plugins: [react(), babel({ presets: [reactCompilerPreset()] }), tailwindcss(), vercelApi()],
    resolve: {
      alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
    },
    test: {
      projects: [
        {
          extends: true,
          test: {
            name: "app",
            environment: "jsdom",
            include: ["src/**/*.test.{ts,tsx}"],
            setupFiles: ["./src/test/setup.ts"],
          },
        },
        {
          extends: true,
          test: { name: "api", environment: "node", include: ["api/**/*.test.ts"] },
        },
      ],
      coverage: { include: ["src/**/*.{ts,tsx}", "api/**/*.ts"], exclude: ["**/*.test.*", "src/test/**"] },
    },
  };
});
