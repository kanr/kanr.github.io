# Agent Guidelines — kanr.github.io

Personal portfolio website for kanr, built with Astro and Svelte, deployed to GitHub Pages.

## Tech Stack

- **Framework**: Astro 5 (static site generation)
- **UI Components**: Svelte 5 (interactive islands)
- **Language**: TypeScript
- **Styling**: Plain CSS (no Tailwind or CSS-in-JS)
- **Deployment**: GitHub Pages (static) via GitHub Actions
- **Alt deployment**: Cloudflare Pages (adapter present but disabled)

## Development Commands

```bash
npm run dev       # Start local dev server (http://localhost:4321)
npm run build     # Build for production → dist/
npm run preview   # Preview the production build locally
```

## Project Structure

```
src/
  components/     # Reusable UI components (.astro and .svelte)
  layouts/        # Page layout wrappers
  pages/          # File-based routing (index, about, blog, projects, etc.)
  posts/          # Markdown blog posts
  styles/         # Global CSS
public/           # Static assets (images, fonts, etc.)
```

## Key Conventions

- **Astro files** (`.astro`) for pages and layout — prefer these for static content.
- **Svelte files** (`.svelte`) for interactive islands only (e.g. Counter, ThemeToggle, BlogSearch).
- Components are imported and used directly; no component registry or barrel exports.
- Dark mode is handled via a CSS class toggled by `ThemeToggle.svelte` — always check dark mode compatibility when styling.
- Blog posts live in `src/posts/` as Markdown files with frontmatter.

## Deployment

The site deploys automatically to `https://kanr.github.io` via GitHub Actions on push to `main`. Build output is `dist/`. Do **not** commit the `dist/` directory.

## Notes

- The Cloudflare adapter (`@astrojs/cloudflare`) is installed but disabled. Do not enable it unless explicitly requested.
- `wrangler.jsonc` is present for potential Cloudflare Workers use but is not active in the default deployment.
- No test suite is currently configured.
