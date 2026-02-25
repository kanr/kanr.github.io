import { defineConfig } from 'astro/config';

// Cloudflare adapter will be added once dependencies are installed
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
  integrations: [],
  vite: {
    ssr: {
      external: ['svgo'],
    },
  },
});
