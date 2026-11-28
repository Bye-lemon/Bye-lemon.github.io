import type { CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'posts'>;

export function slugOf(post: Post): string {
  const any = post.data as any;
  return String(any.slug || post.id).replace(/\.md$/, '');
}

export function tagsOf(post: Post): string[] {
  const t = (post.data as any).tags;
  if (!t) return [];
  if (Array.isArray(t)) return t.map(String);
  return String(t).split(/[,，\s]+/).filter(Boolean);
}

export function categoriesOf(post: Post): string[] {
  const c = (post.data as any).categories;
  if (!c) return [];
  if (Array.isArray(c)) return c.map(String);
  return [String(c)];
}

export function dateOf(post: Post): Date {
  const d = (post.data as any).date;
  return d ? new Date(d) : new Date();
}

export function isPaper(post: Post): boolean {
  const kind = String((post.data as any).kind || '');
  if (kind === 'paper' || kind === 'survey' || kind === 'report') return true;
  return categoriesOf(post).includes('论文笔记');
}

export function sortByDate(list: Post[]): Post[] {
  return [...list].sort((a, b) => dateOf(b).getTime() - dateOf(a).getTime());
}
