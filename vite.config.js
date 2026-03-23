import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vueDevTools from "vite-plugin-vue-devtools";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vueDevTools(), vue()],
  css: {
    lightningcss: {
      targets: {
        chrome: 112 << 16,
        firefox: 113 << 16,
        safari: (16 << 16) | (4 << 8),
      },
    },
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
