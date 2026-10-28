import sitemap from '@astrojs/sitemap';
import { defineConfig, fontProviders } from 'astro/config';

export default defineConfig({
  site: 'https://jjank.com',
  trailingSlash: 'never',
  build: {
    format: 'file',
  },
  integrations: [sitemap()],
  image: {
    domains: ['avatars.githubusercontent.com'],
  },
  fonts: [
    {
      provider: fontProviders.local(),
      name: 'Andika',
      cssVariable: '--font-andika',
      options: {
        variants: [
          { src: ['./src/assets/fonts/andika-400.woff2'], weight: 400 },
          { src: ['./src/assets/fonts/andika-700.woff2'], weight: 700 },
        ],
      },
    },
    {
      provider: fontProviders.local(),
      name: 'Satoshi',
      cssVariable: '--font-satoshi',
      options: {
        variants: [
          { src: ['./src/assets/fonts/satoshi-400.woff2'], weight: 400 },
          { src: ['./src/assets/fonts/satoshi-700.woff2'], weight: 700 },
          { src: ['./src/assets/fonts/satoshi-900.woff2'], weight: 900 },
        ],
      },
    },
    {
      provider: fontProviders.local(),
      name: 'Cherry Bomb One',
      cssVariable: '--font-cherry-bomb-one',
      options: {
        variants: [{ src: ['./src/assets/fonts/cherry-bomb-one-400.woff2'], weight: 400 }],
      },
    },
  ],
});
