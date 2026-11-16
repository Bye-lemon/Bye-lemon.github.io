import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { slugOf, dateOf } from '../lib/posts';

function stripMarkdown(md: string): string {
  return md
    .replace(/```[sS]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\$\$[\s\S]*?\$\$/g, ' ')
    .replace(/\$[^$]*\$/g, ' ')
    .replace(/[#>*_`~]/g, ' ')
    .replace(/^\s*[-|]{3,}.*$/gm, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export const GET: APIRoute = async () => {
  const posts = await getCollection('posts');
  const models = await getCollection('models');
  const docs = [
    ...posts.map((p) => {
      const d = p.data as any;
      return {
        id: 'p:' + p.id,
        url: '/posts/' + slugOf(p) + '/',
        title: String(d.title || slugOf(p)),
        kind: '文章',
        date: dateOf(p).toISOString().slice(0, 10),
        description: String(d.abstract || ''),
        text: stripMarkdown(p.body || '').slice(0, 8000),
      };
    }),
    ...models.map((m) => {
      const d = m.data as any;
      return {
        id: 'm:' + m.id,
        url: '/models/' + m.id + '/',
        title: String(d.name),
        kind: '模型',
        date: String(d.updated || ''),
        description: String(d.author || ''),
        text: stripMarkdown(m.body || '') + ' ' + [d.type, ...(d.tags || []), d.license, d.author].filter(Boolean).join(' '),
      };
    }),
  ];
  return new Response(JSON.stringify(docs), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
};
