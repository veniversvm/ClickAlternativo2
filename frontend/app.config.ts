// frontend/app.config.ts
import { defineConfig } from "@solidjs/start/config";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

// Esta es la alternativa moderna a __dirname
const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  vite: {
    resolve: {
      alias: {
        // Resolvemos la ruta absoluta a la carpeta src
        "~": resolve(__dirname, "./src"),
      },
    },
  },
  server: {
    preset: "bun",
  },
  ssr: true,
});