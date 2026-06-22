import { fileURLToPath } from "node:url";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { devApiPlugin } from "./vite-plugins/devApi";

export default defineConfig(({ mode }) => {
  // Vite only injects VITE_-prefixed vars into import.meta.env for the client bundle.
  // oracle-backend/_env.ts reads server-only vars (OG_COMPUTE_*) off plain process.env, so
  // .env needs to be loaded into this Node process too — loadEnv with prefix "" loads everything.
  Object.assign(process.env, loadEnv(mode, process.cwd(), ""));

  return {
    root: "oracle-frontend",
    plugins: [react(), tailwindcss(), devApiPlugin()],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./oracle-frontend/src", import.meta.url)),
      },
    },
    build: {
      outDir: "../dist",
    },
  };
});
