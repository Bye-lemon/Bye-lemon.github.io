import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const prerender = true;

/**
 * Static JSON endpoint for /models/.
 * The page renders an empty shell and lets Tabulator own the rows, so the
 * document stays lean instead of shipping all entries as HTML.
 */
export const GET: APIRoute = async () => {
  const entries = await getCollection('models');

  const models = entries.map((entry) => {
    const d = entry.data as any;
    return {
      id: entry.id,
      url: `/models/${entry.id}/`,
      name: d.name ?? '',
      category: d.category ?? '',
      tasks: Array.isArray(d.tasks) ? d.tasks : [],
      modalities_in: Array.isArray(d.modalities_in) ? d.modalities_in : [],
      modalities_out: Array.isArray(d.modalities_out) ? d.modalities_out : [],
      languages: Array.isArray(d.languages) ? d.languages : [],
      domains: Array.isArray(d.domains) ? d.domains : [],
      role: d.role ?? '',
      architecture: d.architecture ?? d.arch ?? '',
      training_stage: Array.isArray(d.training_stage) ? d.training_stage : [],
      access: d.access ?? '',
      status: d.status ?? '',
      size_class: d.size_class ?? '',
      family: d.family ?? '',
      base: d.base ?? '',
      params: d.params ?? '',
      context_length: d.context_length ?? '',
      hf_id: d.hf_id ?? '',
      downloads: Number(d.downloads) || 0,
      likes: Number(d.likes) || 0,
      hf_last_modified: d.hf_last_modified ?? '',
      license: d.license ?? '',
      author: d.author ?? '',
      updated: d.updated ?? '',
      published: d.published ?? '',
      paper: d.paper ?? '',
      link: d.link ?? '',
      note: d.note ?? '',
      tags: Array.isArray(d.tags) ? d.tags : [],
    };
  });

  return new Response(JSON.stringify(models), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
  });
};
