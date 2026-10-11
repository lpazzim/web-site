import { fileURLToPath, URL } from "node:url";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { vercelApi } from "./vite-plugins/vercel-api";

export default defineConfig(({ mode }) => {
  // Expose server-only secrets (NOTION_*) to the API handlers in dev. They are
  // never prefixed with VITE_, so they stay out of the client bundle.
  Object.assign(process.env, loadEnv(mode, process.cwd(), "NOTION_"));

  return {
    server: { port: 5000 },
    plugins: [react(), vercelApi()],
    resolve: {
      alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
    },
  };
});
