import rss from '@astrojs/rss';
import type { APIContext } from 'astro';

interface PostModule {
  frontmatter: {
    title: string;
    description: string;
    pubDate: Date | string;
    author?: string;
    tags?: string[];
  };
}

export async function GET(context: APIContext) {
  const postModules = import.meta.glob<PostModule>('../posts/*.md', { eager: true });
  
  const items = Object.entries(postModules)
    .map(([path, post]) => {
      const slug = path.split('/').pop()?.replace('.md', '');
      const pubDate = post.frontmatter.pubDate;
      return {
        title: post.frontmatter.title,
        description: post.frontmatter.description,
        pubDate: typeof pubDate === 'string' ? new Date(pubDate) : pubDate,
        link: `/blog/${slug}/`,
      };
    })
    .filter(item => item.title && item.description) // Ensure required fields exist
    .sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());

  return rss({
    title: 'kanr - Blog',
    description: 'Personal blog about web development, programming, and technology',
    site: context.site || 'https://kanr.github.io',
    items,
    customData: `<language>en-us</language>`,
  });
}
