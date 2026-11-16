import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({ pattern: '*.md', base: './source/_posts' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    tags: z.union([z.array(z.string()), z.string()]).nullish(),
    categories: z.union([z.array(z.string()), z.string()]).nullish(),
    abstract: z.string().nullish(),
    slug: z.string().nullish(),
  }).passthrough(),
});

const about = defineCollection({
  loader: glob({ pattern: 'index.md', base: './source/about' }),
  schema: z.object({
    title: z.string().optional(),
    profile: z.array(z.object({ k: z.string(), v: z.string() })).optional(),
    now: z.array(z.object({ title: z.string(), text: z.string() })).optional(),
    timeline: z.array(z.object({ when: z.string(), what: z.string(), where: z.string().optional() })).optional(),
  }).passthrough(),
});

const models = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/models' }),
  schema: z.object({
    name: z.string(),
    license: z.string().optional(),
    author: z.string().optional(),
    updated: z.coerce.string().optional(),
    base: z.string().optional(),
    published: z.string().optional(),
    paper: z.string().optional(),
    type: z.string().optional(),
    tags: z.array(z.string()).nullish().transform((v) => v ?? []),
    link: z.string().optional(),
    params: z.string().optional(),
    starred: z.boolean().default(false),
  }).passthrough(),
});

export const collections = { posts, about, models };
