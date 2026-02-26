import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import svelte from '@astrojs/svelte';
// Cloudflare adapter disabled for GitHub Pages (static hosting only)
// Uncomment for Cloudflare deployment:
// import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  site: 'https://kanr.github.io',
  // adapter: cloudflare({
  //   imageService: 'cloudflare',
  //   platformProxy: {
  //     enabled: true,
  //   },
  // }),
  integrations: [sitemap(), svelte()],
  vite: {
    ssr: {
      external: ['svgo'],
    },
  },
});
