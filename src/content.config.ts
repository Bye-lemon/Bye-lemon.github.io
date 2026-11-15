import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({ pattern: '*.md', base: './source/_posts' }),
});

const about = defineCollection({
  loader: glob({ pattern: 'index.md', base: './source/about' }),
});

const models = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/models' }),
});

export const collections = { posts, about, models };
