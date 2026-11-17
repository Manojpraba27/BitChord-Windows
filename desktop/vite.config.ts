import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";
export default defineConfig({
  root: "renderer",
  base: "/",
  plugins: [react(), tailwindcss()],
  define: { DEV_EXTENSION_ID: JSON.stringify("desktop") },
  resolve: {
    alias: { "@": fileURLToPath(new URL("./renderer/src", import.meta.url)) },
  },
  build: { outDir: "../dist", emptyOutDir: true },
  optimizeDeps: { exclude: ["essentia.js"] },
  worker: { format: "es" },
  test: { include: ["src/**/*.test.ts"], environment: "happy-dom" },
});
