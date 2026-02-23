# Astro Project Copilot Instructions

## Project Overview

This is a personal portfolio website built with **Astro 4.0**, a modern static site generator. The project uses TypeScript, file-based routing, and component-driven development.

## Project Structure

```
/
├── src/
│   ├── pages/        # File-based routing - each .astro file becomes a route
│   ├── layouts/      # Reusable layout templates
│   ├── components/   # Reusable Astro components
│   └── styles/       # Global and component styles
├── public/           # Static assets (images, fonts, favicon, etc.)
├── astro.config.mjs  # Astro configuration
└── tsconfig.json     # TypeScript configuration
```

## Important Files

- **`astro.config.mjs`** - Main Astro configuration
- **`package.json`** - Dependencies and scripts
- **`tsconfig.json`** - TypeScript compiler options
- **`.gitignore`** - Git ignore patterns

## Key Commands

```bash
npm run dev      # Start development server (localhost:3000)
npm run build    # Build for production
npm run preview  # Preview production build
npm run astro    # Access Astro CLI directly
```

## Astro Development Guidelines

### Pages and Routing

- **Location**: `src/pages/`
- **Pattern**: File-based routing - file structure maps to URL paths
  - `src/pages/index.astro` → `/`
  - `src/pages/about.astro` → `/about`
  - `src/pages/blog/post.astro` → `/blog/post`
- **Dynamic Routes**: Use `[param].astro` or `[...slug].astro` syntax

### Components

- **Location**: `src/components/`
- **File Extension**: `.astro`
- **Pattern**: Use TypeScript for type safety
- **Props**: Define props interface at the top of component
- **Slots**: Use `<slot />` for composition
- **Scoped Styles**: Use `<style>` tags for component-specific CSS

### Layouts

- **Location**: `src/layouts/`
- **Usage**: Wrap pages with layout templates
- **Example**: Create `Layout.astro` with `<slot />` for page content
- **Props**: Pass props from pages to layouts via `Astro.props`

### Styling

- **Global Styles**: Place in `src/styles/global.css` and import in layouts
- **Component Styles**: Use scoped `<style>` tags in `.astro` files
- **Scoped by Default**: Styles in Astro components are automatically scoped to that component
- **No CSS Framework Yet**: Consider adding Tailwind CSS if needed

## Code Patterns

### Basic Page Component

```astro
---
import Layout from '../layouts/Layout.astro';

interface Props {
  title: string;
}

const { title } = Astro.props;
---

<Layout title={title}>
  <main>
    <h1>{title}</h1>
    <!-- Page content -->
  </main>
</Layout>

<style>
  main {
    max-width: 960px;
    margin: 0 auto;
    padding: 2rem 1rem;
  }
</style>
```

### Basic Component

```astro
---
export interface Props {
  title: string;
  description?: string;
}

const { title, description } = Astro.props;
---

<div class="component">
  <h2>{title}</h2>
  {description && <p>{description}</p>}
  <slot />
</div>

<style>
  .component {
    padding: 1rem;
    border-radius: 8px;
  }
</style>
```

## TypeScript Best Practices

- **Always** use TypeScript in frontmatter (between `---` markers)
- **Define Props**: Create `Props` interface for all components
- **Type Everything**: Include return types and parameter types
- **Strict Mode**: `tsconfig.json` uses `"extends": "astro/tsconfigs/strict"`

## File Naming Conventions

- **Pages**: `PascalCase.astro` or `kebab-case.astro` (e.g., `about.astro`, `blog-post.astro`)
- **Components**: `PascalCase.astro` (e.g., `Card.astro`, `NavBar.astro`)
- **Layouts**: `PascalCase.astro` (e.g., `Layout.astro`, `BlogLayout.astro`)
- **Styles**: `kebab-case.css` (e.g., `global.css`, `header-styles.css`)

## GitHub Actions

Two workflows are configured:
- **Build and Deploy**: Automatically builds and deploys to GitHub Pages on push to main
- **Lint and Check**: Runs TypeScript checks on pull requests

## Best Practices

1. **Keep Components Small**: Break complex UI into smaller, reusable components
2. **Use Layouts**: Don't repeat common page structure - use layouts
3. **Static Generation**: Astro pre-renders pages at build time by default
4. **Optimize Images**: Use standard img tags or consider Astro's Image component
5. **SEO Friendly**: All pages are static HTML, great for SEO
6. **No JavaScript by Default**: Astro ships zero JavaScript to the browser by default

## Adding Integrations

When adding integrations (React, Vue, Tailwind, etc.):

```bash
npm run astro add <integration-name>
```

Common integrations:
- `@astrojs/react` - React support
- `@astrojs/tailwind` - Tailwind CSS
- `@astrojs/sitemap` - Sitemap generation
- `@astrojs/rss` - RSS feed generation

## Documentation References

- [Astro Docs](https://docs.astro.build)
- [Astro API Reference](https://docs.astro.build/en/reference/api-reference/)
- [Astro Integrations](https://docs.astro.build/en/guides/integrations-guide/)
- [Astro Community Discord](https://astro.build/chat)

## Development Tips

- Use `Astro.glob()` to import multiple files
- Use `getCollection()` for content management
- Implement dark mode with CSS custom properties
- Test locally with `npm run build && npm run preview`
- Check console for build warnings and errors


## Coauthoring Guidelines
- Always pull the latest changes before starting work
- Create feature branches for new work
- Write clear commit messages
- Use pull requests for code review and merging
- for commits that are assisted by copilot, include a co-author trailer:
```Co-authored-by: GitHub Copilot <copilot@github.com>```

