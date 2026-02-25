import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  site: 'https://kanr.github.io',
  adapter: cloudflare({
    imageService: 'cloudflare', // Use Cloudflare Image Resizing
    platformProxy: {
      enabled: true, // Emulate Cloudflare runtime in dev
    },
  }),
  integrations: [],
  vite: {
    ssr: {
      external: ['svgo'],
    },
  },
});
