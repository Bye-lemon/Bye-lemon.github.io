import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';
import { slugOf, dateOf, sortByDate, tagsOf } from '../lib/posts';

export async function GET(context: APIContext) {
  const posts = sortByDate(await getCollection('posts'));
  const now = new Date().toUTCString();
  return rss({
    title: '李英平',
    description: '自动驾驶、嵌入式与系统工具的开发笔记。',
    site: context.site!,
    customData: `<language>zh-CN</language><lastBuildDate>${now}</lastBuildDate><ttl>60</ttl>`,
    items: posts.map((post) => ({
      title: String((post.data as any).title || slugOf(post)),
      pubDate: dateOf(post),
      link: `/posts/${slugOf(post)}/`,
      description: String((post.data as any).abstract || ''),
      categories: tagsOf(post),
      author: '李英平',
    })),
  });
}
