import path from 'node:path';
import { defineConfig } from 'vite';
import VueRouter from 'vue-router/vite';
import vueDevTools from 'vite-plugin-vue-devtools';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [VueRouter(), vue(), vueDevTools()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
    },
  },
});
