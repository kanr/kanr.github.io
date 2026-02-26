---
title: "Deploying Astro on Cloudflare Pages with the Official Integration"
description: "A practical guide to setting up the @astrojs/cloudflare adapter, enabling SSR, and taking advantage of Cloudflare's edge platform — KV, D1, R2, and more."
pubDate: 2026-02-25
author: "Kanr"
tags: ["astro", "cloudflare", "deployment", "ssr", "edge", "web development"]
---

This site runs on Cloudflare Pages, and getting Astro to play nicely with Cloudflare's edge runtime took a bit of exploration. The official `@astrojs/cloudflare` adapter makes most of it straightforward — but there are a handful of gotchas worth knowing before you start.

## Why Cloudflare?

Cloudflare Pages runs your code on the edge in 300+ locations worldwide. For a portfolio site that's mostly static that doesn't matter much, but the moment you add any dynamic behaviour — contact forms, server-rendered pages, API routes, database reads — having that logic execute close to your users makes a real difference. And at hobby scale the pricing is hard to argue with: the free tier is generous, and most personal sites never leave it.

## Installing the Adapter

```bash
npm run astro add cloudflare
```

The `astro add` command handles everything: installs the package, updates `astro.config.mjs`, and sets `output` to `"server"`. You can also do it manually:

```bash
npm install @astrojs/cloudflare
```

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  output: 'server',
  adapter: cloudflare(),
});
```

### Static vs. Hybrid vs. Server

| Mode | `output` value | What it means |
|---|---|---|
| Fully static | `"static"` | No adapter needed; deploy `/dist` as plain files |
| Hybrid | `"hybrid"` | Static by default; opt individual routes into SSR with `export const prerender = false` |
| Fully server-rendered | `"server"` | Every route is SSR by default; opt pages out with `export const prerender = true` |

For most portfolio sites `"hybrid"` is the sweet spot — static pages for content, dynamic routes for anything that needs live data.

```js
// astro.config.mjs
export default defineConfig({
  output: 'hybrid',   // 👈 best of both worlds
  adapter: cloudflare(),
});
```

## Configuring Wrangler

Cloudflare's local development CLI is `wrangler`. A minimal `wrangler.jsonc` for a Pages project looks like this:

```jsonc
{
  "name": "my-astro-site",
  "compatibility_date": "2025-01-01",
  "pages_build_output_dir": "./dist"
}
```

Run the local dev server through wrangler to get a faithful preview of the edge environment:

```bash
npx wrangler pages dev
```

This spins up a local Cloudflare Workers runtime — including bindings to any local KV namespaces, D1 databases, or R2 buckets you have configured.

## Accessing Cloudflare Bindings

The real power kicks in when you combine Astro's server-side rendering with Cloudflare's data platform. Bindings are exposed on `Astro.locals.runtime.env` inside `.astro` files, and on `context.locals.runtime.env` inside API routes.

### KV (Key–Value Store)

```astro
---
// src/pages/visits.astro
export const prerender = false;

const { env } = Astro.locals.runtime;
const count = parseInt(await env.VISIT_COUNTER.get('total') ?? '0', 10);
await env.VISIT_COUNTER.put('total', String(count + 1));
---
<p>This page has been visited {count} times.</p>
```

Declare the binding in `wrangler.jsonc`:

```jsonc
{
  "kv_namespaces": [
    { "binding": "VISIT_COUNTER", "id": "<your-kv-namespace-id>" }
  ]
}
```

### D1 (SQLite at the Edge)

D1 is Cloudflare's serverless SQLite offering. Create a database and bind it to your project:

```bash
npx wrangler d1 create my-db
```

```jsonc
{
  "d1_databases": [
    { "binding": "DB", "database_name": "my-db", "database_id": "<id>" }
  ]
}
```

Then query it from any server-rendered route:

```ts
// src/pages/api/posts.ts
import type { APIContext } from 'astro';

export async function GET({ locals }: APIContext) {
  const { env } = locals.runtime;
  const { results } = await env.DB.prepare('SELECT * FROM posts ORDER BY created_at DESC').all();
  return Response.json(results);
}
```

### R2 (Object Storage)

R2 is S3-compatible object storage with no egress fees. Useful for user-uploaded files or large assets you don't want in your git repository.

```jsonc
{
  "r2_buckets": [
    { "binding": "ASSETS", "bucket_name": "my-assets" }
  ]
}
```

```ts
// Upload an object
await env.ASSETS.put('avatar.png', imageBuffer, {
  httpMetadata: { contentType: 'image/png' },
});

// Retrieve an object
const object = await env.ASSETS.get('avatar.png');
const body = await object?.arrayBuffer();
```

## TypeScript Support

The adapter ships type definitions for the runtime locals. Add this to your `env.d.ts` to get full type safety:

```ts
/// <reference types="astro/client" />

type KVNamespace = import('@cloudflare/workers-types').KVNamespace;
type D1Database = import('@cloudflare/workers-types').D1Database;

interface Env {
  VISIT_COUNTER: KVNamespace;
  DB: D1Database;
}

declare namespace App {
  interface Locals {
    runtime: {
      env: Env;
    };
  }
}
```

Install the types package if you haven't already:

```bash
npm install --save-dev @cloudflare/workers-types
```

## Deploying to Cloudflare Pages

Connect your GitHub repository in the Cloudflare Pages dashboard:

1. **Build command**: `npm run build`
2. **Build output directory**: `dist`
3. **Node.js version**: set `NODE_VERSION=20` in environment variables

Or push directly with the CLI:

```bash
npx wrangler pages deploy dist
```

### Continuous Deployment

Every push to `main` triggers a production deployment automatically once your repo is connected. Pull requests get their own preview URL — handy for checking a post draft before it goes live.

## Gotchas

**`node:` module polyfilling** — Some Node.js built-ins aren't available in the Workers runtime. Enable the `nodejs_compat` compatibility flag in `wrangler.jsonc` if you hit errors about missing modules:

```jsonc
{
  "compatibility_flags": ["nodejs_compat"]
}
```

**`crypto` API** — Use `globalThis.crypto` rather than importing from `node:crypto`. The Web Crypto API is available natively.

**File system access** — The Workers runtime has no real file system. If you need to read files at runtime (not at build time), serve them from R2 or a KV namespace instead.

**Cold starts** — Cloudflare Workers don't have cold starts in the traditional serverless sense, but if you're used to running heavy Node.js initialisation code on startup, you'll need to rethink that pattern for the edge.

## Putting It Together

For this portfolio the setup ended up as:

- `output: "hybrid"` — blog posts and static pages pre-rendered, contact form server-rendered
- KV for simple counters and cache invalidation flags
- `wrangler pages dev` for local development so the runtime matches production exactly
- GitHub → Cloudflare Pages for automatic deploys on push

The combination of Astro's build-time static generation and Cloudflare's edge runtime covers a huge range of use cases without ever reaching for a traditional server. For personal projects it's close to ideal.

## Further Reading

- [Astro Cloudflare adapter docs](https://docs.astro.build/en/guides/integrations-guide/cloudflare/)
- [Cloudflare Pages documentation](https://developers.cloudflare.com/pages/)
- [Workers runtime APIs](https://developers.cloudflare.com/workers/runtime-apis/)
- [Wrangler CLI reference](https://developers.cloudflare.com/workers/wrangler/)
