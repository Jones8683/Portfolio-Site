import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { defineConfig } from 'vite';
import VueRouter from 'vue-router/vite';
import vueDevTools from 'vite-plugin-vue-devtools';
import vue from '@vitejs/plugin-vue';

const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).trim();

export default defineConfig({
  plugins: [VueRouter(), vue(), vueDevTools()],
  define: {
    'import.meta.env.VITE_BUILD_HASH': JSON.stringify(git('rev-parse', '--short', 'HEAD')),
    'import.meta.env.VITE_BUILD_DATE': JSON.stringify(git('log', '-1', '--format=%cI')),
  },
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
    },
  },
});
