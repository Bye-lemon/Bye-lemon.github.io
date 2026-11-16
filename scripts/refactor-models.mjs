#!/usr/bin/env node
/**
 * 把旧版模型条目（type + tags）重构为分面字段，并按 taxonomy.fieldOrder 重写 frontmatter。
 * 幂等：已有新字段会保留，只补缺失。
 *
 * 用法:
 *   node scripts/refactor-models.mjs --dry-run
 *   node scripts/refactor-models.mjs --write
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import yaml from 'js-yaml';

const ROOT = path.resolve(import.meta.dirname, '..');
const MODELS = path.join(ROOT, 'src', 'content', 'models');
const TAXONOMY = JSON.parse(await fs.readFile(path.join(ROOT, 'src', 'data', 'model-taxonomy.json'), 'utf8'));
const write = process.argv.includes('--write');

const LEGACY = TAXONOMY.legacy;
const ORDER = TAXONOMY.fieldOrder;
const uniq = (arr) => [...new Set(arr.filter(Boolean))];

function parseParams(raw) {
  const s = String(raw || '').toLowerCase().replace(/,/g, '');
  const nums = [...s.matchAll(/([0-9.]+)\s*([bmt])/g)].map((m) => Number(m[1]) * ({ b: 1, m: 1e3, t: 1e6 }[m[2]] || 1));
  if (!nums.length) return undefined;
  const max = Math.max(...nums);
  if (max < 1) return '<1B';
  if (max < 10) return '1-10B';
  if (max < 100) return '10-100B';
  if (max < 1000) return '100B-1T';
  return '>1T';
}

function hfId(link) {
  try {
    const u = new URL(link);
    if (!/(^|\.)huggingface\.co$/.test(u.hostname)) return '';
    const parts = u.pathname.split('/').filter(Boolean);
    if (parts[0] === 'collections' || parts[0] === 'datasets' || parts[0] === 'spaces') return '';
    return parts.length >= 2 ? parts[0] + '/' + parts[1] : '';
  } catch { return ''; }
}

function normalizeArch(raw) {
  const s = String(raw || '').toLowerCase();
  if (s.includes('moe')) return 'moe';
  if (s.includes('diffusion')) return 'diffusion';
  if (s.includes('mamba') || s.includes('ssm')) return 'ssm';
  if (s.includes('dense')) return 'dense';
  if (s.includes('transformer')) return 'transformer';
  return '';
}

const stats = { files: 0, changed: 0, legacyTags: new Map(), unknownTags: new Set(), types: new Map() };
const files = (await fs.readdir(MODELS)).filter((f) => f.endsWith('.md')).sort();

for (const f of files) {
  const p = path.join(MODELS, f);
  const raw = await fs.readFile(p, 'utf8');
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) continue;
  const old = yaml.load(m[1]) || {};
  const body = m[2] || '';
  stats.files++;

  const typeMap = LEGACY.types[old.type] || {};
  const tagMaps = (old.tags || []).map((t) => ({ tag: t, map: LEGACY.tags[t] }));
  const known = tagMaps.filter((x) => x.map);
  const unknown = tagMaps.filter((x) => !x.map).map((x) => x.tag);

  const d = {
    name: old.name,
    category: old.category || typeMap.category || '',
    tasks: uniq([...(old.tasks || []), ...known.flatMap((x) => x.map.tasks || [])]),
    modalities_in: uniq([...(old.modalities_in || []), ...known.flatMap((x) => x.map.modalities_in || [])]),
    modalities_out: uniq([...(old.modalities_out || []), ...known.flatMap((x) => x.map.modalities_out || [])]),
    languages: uniq([...(old.languages || []), ...known.flatMap((x) => x.map.languages || [])]),
    domains: uniq([...(old.domains || []), ...known.flatMap((x) => x.map.domains || [])]),
    role: old.role || typeMap.role || known.map((x) => x.map.role).find(Boolean) || '',
    architecture: old.architecture || normalizeArch(old.arch),
    training_stage: old.training_stage || [],
    access: old.access || '',
    status: old.status || '',
    size_class: old.size_class || parseParams(old.params) || '',
    params: old.params || '',
    context_length: old.context_length || '',
    family: old.family || known.map((x) => x.map.family).find(Boolean) || '',
    base: old.base || '',
    license: old.license || '',
    author: old.author || '',
    updated: old.updated || '',
    published: old.published || '',
    paper: old.paper || '',
    link: old.link || '',
    hf_id: old.hf_id || hfId(old.link || ''),
    downloads: old.downloads ?? '',
    likes: old.likes ?? '',
    hf_last_modified: old.hf_last_modified || '',
    note: old.note || '',
    tags: uniq([...(old.tags || []).filter((t) => !LEGACY.tags[t]), ...unknown]),
  };

  // 保留未在 fieldOrder 中列出的额外字段
  for (const k of Object.keys(old)) if (!(k in d) && k !== 'type' && k !== 'arch') d[k] = old[k];

  const lines = ['---'];
  for (const key of ORDER) {
    if (!(key in d)) continue;
    const v = d[key];
    if (Array.isArray(v)) lines.push(key + ': [' + v.map((x) => JSON.stringify(x)).join(', ') + ']');
    else if (typeof v === 'boolean') lines.push(key + ': ' + v);
    else if (typeof v === 'number') lines.push(key + ': ' + v);
    else if (v === '' || v === undefined || v === null) lines.push(key + ': ""');
    else lines.push(key + ': ' + JSON.stringify(String(v)));
  }
  lines.push('---');
  const out = lines.join('\n') + '\n' + (body ? body : '');

  if (/^type:/m.test(m[1])) stats.types.set(old.type, (stats.types.get(old.type) || 0) + 1);
  for (const t of old.tags || []) stats.legacyTags.set(t, (stats.legacyTags.get(t) || 0) + 1);
  for (const t of unknown) stats.unknownTags.add(t);

  if (out !== raw) {
    stats.changed++;
    if (write) await fs.writeFile(p, out, 'utf8');
  }
}

console.log(write ? '模式: write' : '模式: dry-run（加 --write 才写入）');
console.log('文件:', stats.files, '| 需要改写:', stats.changed);
console.log('旧 tag 出现次数:', [...stats.legacyTags.entries()].sort((a, b) => b[1] - a[1]).map(([k, v]) => k + ':' + v).join(', '));
console.log('未映射 tag:', [...stats.unknownTags].join(', ') || '无');
if (!write) console.log('提示：先跑 --dry-run 检查，再 --write。');
