---
title: "Getting Started with Astro"
description: "Learn how to set up your first Astro project and build blazing-fast websites."
pubDate: new Date("2024-02-20")
author: "Kanr"
tags: ["astro", "web development", "tutorial"]
---

## Why Astro?

Astro is a modern static site generator that allows you to build fast, content-focused websites with a better developer experience. It ships zero JavaScript by default, making your sites incredibly fast.

## Key Features

- **Zero JavaScript by Default**: Astro only sends the HTML and CSS your users need
- **Partial Hydration**: Load interactive components only when needed
- **Multi-Framework Support**: Use React, Vue, Svelte, and more in the same project
- **File-Based Routing**: Your file structure becomes your routing structure
- **Built-in Optimization**: Images, CSS, and scripts are optimized automatically

## Getting Started

To create a new Astro project, run:

```bash
npm create astro@latest
```

This will walk you through setting up a new project with all the necessary files and dependencies.

## Your First Page

Create a new file in `src/pages/about.astro`:

```astro
---
import Layout from '../layouts/Layout.astro';
---

<Layout title="About Me">
  <h1>About Me</h1>
  <p>Welcome to my site!</p>
</Layout>
```

That's it! Your site now has an `/about` route.

## Next Steps

- Read the [official Astro documentation](https://docs.astro.build)
- Explore [Astro integrations](https://astro.build/integrations/)
- Join the [Astro Discord community](https://astro.build/chat)

Happy building! 🚀
