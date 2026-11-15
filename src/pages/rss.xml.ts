import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';
import { slugOf, dateOf } from '../lib/posts';

export async function GET(context: APIContext) {
  const posts = await getCollection('posts');
  return rss({
    title: '李英平',
    description: '自动驾驶、嵌入式与系统工具的开发笔记。',
    site: context.site!,
    items: posts.map((post) => ({
      title: String((post.data as any).title || slugOf(post)),
      pubDate: dateOf(post),
      link: `/posts/${slugOf(post)}/`,
      description: String((post.data as any).abstract || ''),
    })),
  });
}
