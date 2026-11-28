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
    kind: z.enum(['paper', 'survey', 'report']).optional(),
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
    category: z.string().optional(),
    tasks: z.array(z.string()).nullish().transform((v) => v ?? []),
    modalities_in: z.array(z.string()).nullish().transform((v) => v ?? []),
    modalities_out: z.array(z.string()).nullish().transform((v) => v ?? []),
    languages: z.array(z.string()).nullish().transform((v) => v ?? []),
    domains: z.array(z.string()).nullish().transform((v) => v ?? []),
    role: z.string().optional(),
    architecture: z.string().optional(),
    training_stage: z.array(z.string()).nullish().transform((v) => v ?? []),
    access: z.string().optional(),
    status: z.string().optional(),
    size_class: z.string().optional(),
    params: z.string().optional(),
    context_length: z.union([z.number(), z.string()]).optional(),
    family: z.string().optional(),
    base: z.string().optional(),
    license: z.string().optional(),
    author: z.string().optional(),
    updated: z.coerce.string().optional(),
    published: z.string().optional(),
    paper: z.string().optional(),
    link: z.string().optional(),
    hf_id: z.string().optional(),
    hf_collection: z.string().optional(),
    collection_models: z.array(z.string()).nullish().transform((v) => v ?? []),
    hf_org: z.string().optional(),
    org_models: z.array(z.string()).nullish().transform((v) => v ?? []),
    downloads: z.union([z.number(), z.string()]).optional(),
    likes: z.union([z.number(), z.string()]).optional(),
    hf_last_modified: z.string().optional(),
    note: z.string().optional(),
    tags: z.array(z.string()).nullish().transform((v) => v ?? []),
    type: z.string().optional(),
    arch: z.string().optional(),
  }).passthrough(),
});

export const collections = { posts, about, models };
