// frontend/app.config.ts
import { defineConfig } from "@solidjs/start/config";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  vite: {
    // Quitamos el bloque server/hmr manual para que Vite lo autogestione
    resolve: {
      alias: {
        "~": resolve(__dirname, "./src"),
      },
    },
  },
  server: {
    preset: "bun",
  },
  ssr: true,
});