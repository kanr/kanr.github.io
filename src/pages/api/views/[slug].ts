export const prerender = false;

import type { APIContext } from 'astro';

function kvKey(slug: string) {
  return `views:${slug}`;
}

async function getViews(env: App.Locals['runtime']['env'], slug: string): Promise<number> {
  const raw = await env.VISIT_COUNTER.get(kvKey(slug));
  return parseInt(raw ?? '0', 10);
}

/** GET /api/views/:slug — read current count without incrementing */
export async function GET({ params, locals }: APIContext) {
  const { slug } = params;
  if (!slug) return new Response('Bad Request', { status: 400 });

  const env = locals?.runtime?.env;
  if (!env?.VISIT_COUNTER) return Response.json({ views: 0 });

  return Response.json({ views: await getViews(env, slug) });
}

/** POST /api/views/:slug — increment then return new count */
export async function POST({ params, locals }: APIContext) {
  const { slug } = params;
  if (!slug) return new Response('Bad Request', { status: 400 });

  const env = locals?.runtime?.env;
  if (!env?.VISIT_COUNTER) return Response.json({ views: 0 });

  const next = (await getViews(env, slug)) + 1;
  await env.VISIT_COUNTER.put(kvKey(slug), String(next));

  return Response.json({ views: next });
}
