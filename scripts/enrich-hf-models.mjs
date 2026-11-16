#!/usr/bin/env node
/**
 * 从 Hugging Face 官方 API 富化模型条目（公开仓库，无需 token）。
 * 只补空缺，不覆盖人工值；结果缓存到 .cache/hf-models/。
 *
 * 用法:
 *   node scripts/enrich-hf-models.mjs --dry-run
 *   node scripts/enrich-hf-models.mjs --write
 *   node scripts/enrich-hf-models.mjs --write --only-missing --limit 20
 *   node scripts/enrich-hf-models.mjs --write --refresh
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import yaml from 'js-yaml';

const ROOT = path.resolve(import.meta.dirname, '..');
const MODELS = path.join(ROOT, 'src', 'content', 'models');
const CACHE = path.join(ROOT, '.cache', 'hf-models');
const TAXONOMY = JSON.parse(await fs.readFile(path.join(ROOT, 'src', 'data', 'model-taxonomy.json'), 'utf8'));
const ORDER = TAXONOMY.fieldOrder;
const PIPELINE = TAXONOMY.hf.pipeline_tags;
const LICENSE = TAXONOMY.hf.license_map;

const argv = process.argv.slice(2);
const has = (f) => argv.includes(f);
const opt = (f) => { const i = argv.indexOf(f); return i > -1 ? argv[i + 1] : undefined; };
const WRITE = has('--write');
const ONLY_MISSING = has('--only-missing');
const REFRESH = has('--refresh');
const LIMIT = Number(opt('--limit') || 0);
const DELAY = Number(opt('--delay') || 120);

const uniq = (a) => [...new Set(a.filter(Boolean))];

function hfIdOf(md) {
  if (md.hf_id) return md.hf_id;
  try {
    const u = new URL(md.link || '');
    if (!/(^|\.)(huggingface\.co|hf-mirror\.com)$/.test(u.hostname)) return '';
    const p = u.pathname.split('/').filter(Boolean);
    if (['collections', 'datasets', 'spaces'].includes(p[0])) return '';
    return p.length >= 2 ? p[0] + '/' + p[1] : '';
  } catch { return ''; }
}

function collectionSlug(link) {
  try {
    const u = new URL(link || '');
    if (!/(^|\.)huggingface\.co$/.test(u.hostname)) return '';
    const m = u.pathname.match(/^\/collections\/([^/]+)\/([^/]+)/);
    return m ? m[1] + '/' + m[2] : '';
  } catch { return ''; }
}

function orgSlug(link) {
  try {
    const u = new URL(link || '');
    if (!/(^|\.)huggingface\.co$/.test(u.hostname)) return '';
    const m = u.pathname.match(/^\/([^/]+)\/?$/);
    if (!m || ['collections', 'datasets', 'spaces', 'models', 'papers', 'docs'].includes(m[1])) return '';
    return m[1];
  } catch { return ''; }
}

async function fetchCached(url, cacheFile, refresh) {
  if (!refresh) { try { return JSON.parse(await fs.readFile(cacheFile, 'utf8')); } catch {} }
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'lml-models-sync/1.0' } });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const json = await res.json();
      await fs.mkdir(path.dirname(cacheFile), { recursive: true });
      await fs.writeFile(cacheFile, JSON.stringify(json), 'utf8');
      return json;
    } catch (e) {
      if (attempt === 2) return { __error: String(e.message || e) };
      await new Promise((r) => setTimeout(r, 800 * (attempt + 1)));
    }
  }
}

async function fetchCollection(slug) {
  const data = await fetchCached('https://huggingface.co/api/collections/' + slug, path.join(CACHE, 'collections', slug.replace('/', '__') + '.json'), REFRESH);
  if (!data || data.__error) return null;
  return (data.items || []).filter((x) => x.type === 'model' && x.id).map((x) => x.id);
}

async function fetchOrgModels(org) {
  const data = await fetchCached('https://huggingface.co/api/models?author=' + encodeURIComponent(org) + '&limit=200', path.join(CACHE, 'orgs', org + '.json'), REFRESH);
  if (!Array.isArray(data)) return null;
  return data.map((x) => x.id).filter(Boolean);
}

function archOf(md, info) {
  const s = JSON.stringify(info.tags || []).toLowerCase();
  if (/moe|mixture-of-experts/.test(s)) return 'moe';
  if (/diffusion/.test(s)) return 'diffusion';
  if (/mamba|ssm/.test(s)) return 'ssm';
  const cfg = (info.config?.architectures || []).join(' ').toLowerCase();
  if (cfg) return 'transformer';
  return '';
}

async function fetchInfo(id) {
  const cacheFile = path.join(CACHE, id.replace('/', '__') + '.json');
  if (!REFRESH) {
    try { return JSON.parse(await fs.readFile(cacheFile, 'utf8')); } catch {}
  }
  const url = 'https://huggingface.co/api/models/' + id;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'lml-models-sync/1.0' } });
      if (res.status === 404) return { __notFound: true };
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const json = await res.json();
      await fs.mkdir(CACHE, { recursive: true });
      await fs.writeFile(cacheFile, JSON.stringify(json), 'utf8');
      return json;
    } catch (e) {
      if (attempt === 2) return { __error: String(e.message || e) };
      await new Promise((r) => setTimeout(r, 800 * (attempt + 1)));
    }
  }
}

function merge(info, md, hfId) {
  const out = { ...md };
  const get = (k) => out[k] ?? '';
  const tags = info.tags || [];
  const card = info.cardData || {};

  const pipelineTasks = PIPELINE[info.pipeline_tag] || [];
  out.tasks = uniq([...(Array.isArray(md.tasks) ? md.tasks : []), ...pipelineTasks]);
  const pm = (TAXONOMY.hf.pipeline_modalities || {})[info.pipeline_tag];
  if (pm) {
    if (!(md.modalities_in || []).length) out.modalities_in = pm.in || [];
    if (!(md.modalities_out || []).length) out.modalities_out = pm.out || [];
  }

  const langs = [];
  for (const t of tags) { const m = /^language:(.+)$/.exec(t); if (m) langs.push(m[1].toLowerCase()); }
  for (const l of [].concat(card.language || [])) if (l) langs.push(String(l).toLowerCase());
  out.languages = uniq([...(Array.isArray(md.languages) ? md.languages : []), ...langs]);

  const licTag = tags.map((t) => t.match(/^license:(.+)$/)).find(Boolean);
  const rawLicense = card.license || (licTag ? licTag[1] : '');
  if (rawLicense && rawLicense !== 'other') out.license = LICENSE[rawLicense] || rawLicense;

  // 参数量：非系列条目用 safetensors.total 精确值覆盖粗区间
  const total = info.safetensors?.total;
  if (typeof total === 'number' && total > 0 && !/series/i.test(String(md.name || ''))) {
    const ours = String(md.params || '');
    const m = ours.match(/([0-9.]+)\s*([bmt])/i);
    const oursNum = m ? Number(m[1]) * ({ b: 1, m: 1e3, t: 1e6 }[m[2].toLowerCase()] || 1) * 1e9 : 0;
    if (!oursNum || ours.includes('~') || Math.abs(total - oursNum) / total > 0.1) {
      const b = total / 1e9;
      out.params = b >= 1000 ? (b / 1000).toFixed(1).replace(/\.0$/, '') + 'T' : b >= 1 ? b.toFixed(1).replace(/\.0$/, '') + 'B' : Math.round(total / 1e6) + 'M';
      out.size_class = b >= 1000 ? '>1T' : b >= 100 ? '100B-1T' : b >= 10 ? '10-100B' : b >= 1 ? '1-10B' : '<1B';
    }
  }

  // 类别：只有明显被旧 type 归到 language 的视觉/语音模型才改判
  const pipe = info.pipeline_tag || '';
  const catByPipe = /image-text-to-text|any-to-any|video-text-to-text/.test(pipe) ? 'multimodal'
    : /text-to-speech|audio-to-audio|automatic-speech-recognition|voice-activity-detection|audio-classification/.test(pipe) ? 'speech'
    : /text-to-image|image-to-image|text-to-video|text-to-3d/.test(pipe) ? 'generation'
    : '';
  if (catByPipe && (!md.category || md.category === 'language')) out.category = catByPipe;

  if (!get('architecture')) out.architecture = archOf(md, info);

  if (!get('access')) out.access = info.gated ? 'gated' : 'open-weights';

  const baseTag = tags.find((t) => t.startsWith('base_model:'));
  if (!get('base') && baseTag) out.base = baseTag.replace('base_model:', '');

  const arxiv = tags.find((t) => t.startsWith('arxiv:'));
  if (!get('paper') && arxiv) out.paper = 'https://arxiv.org/abs/' + arxiv.replace('arxiv:', '');

  out.hf_id = hfId;
  out.downloads = info.downloads ?? get('downloads');
  out.likes = info.likes ?? get('likes');
  out.hf_last_modified = info.lastModified || get('hf_last_modified');
  return out;
}

function serialize(d) {
  const lines = ['---'];
  for (const key of ORDER) {
    if (!(key in d)) continue;
    const v = d[key];
    if (Array.isArray(v)) lines.push(key + ': [' + v.map((x) => JSON.stringify(x)).join(', ') + ']');
    else if (typeof v === 'boolean') lines.push(key + ': ' + v);
    else if (typeof v === 'number') lines.push(key + ': ' + v);
    else if (v === '' || v == null) lines.push(key + ': ""');
    else lines.push(key + ': ' + JSON.stringify(String(v)));
  }
  lines.push('---');
  return lines.join('\n') + '\n';
}

const files = (await fs.readdir(MODELS)).filter((f) => f.endsWith('.md')).sort();
const report = { total: 0, hf: 0, updated: 0, notFound: [], errors: [], skipped: 0 };
let processed = 0;

for (const f of files) {
  if (LIMIT && processed >= LIMIT) break;
  const p = path.join(MODELS, f);
  const raw = await fs.readFile(p, 'utf8');
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) continue;
  const md = yaml.load(m[1]) || {};
  const body = m[2] || '';
  report.total++;
  if (md.link && /^https?:\/\/hf-mirror\.com\//.test(md.link)) {
    md.link = md.link.replace(/^https?:\/\/hf-mirror\.com\//, 'https://huggingface.co/');
  }
  const id = hfIdOf(md);

  // 集合 / 组织页：没有单个 repo，就列出全部模型
  if (!id) {
    const col = collectionSlug(md.link);
    const org = orgSlug(md.link);
    if (col) {
      const list = await fetchCollection(col);
      if (list) {
        md.hf_collection = col;
        md.collection_models = list;
        const out = serialize(md) + body;
        if (out !== raw) { report.updated++; if (WRITE) await fs.writeFile(p, out, 'utf8'); }
        report.collections = (report.collections || 0) + 1;
      } else { report.errors.push('collection ' + col); }
      await new Promise((r) => setTimeout(r, DELAY));
      continue;
    }
    if (org) {
      const list = await fetchOrgModels(org);
      if (list) {
        md.hf_org = org;
        md.org_models = list;
        const out = serialize(md) + body;
        if (out !== raw) { report.updated++; if (WRITE) await fs.writeFile(p, out, 'utf8'); }
        report.orgs = (report.orgs || 0) + 1;
      } else { report.errors.push('org ' + org); }
      await new Promise((r) => setTimeout(r, DELAY));
      continue;
    }
    report.skipped++;
    continue;
  }

  if (ONLY_MISSING && md.hf_last_modified) { report.skipped++; continue; }
  report.hf++; processed++;
  const info = await fetchInfo(id);
  if (info.__notFound) { report.notFound.push(id); continue; }
  if (info.__error) { report.errors.push(id + ': ' + info.__error); continue; }
  const next = merge(info, md, id);
  const out = serialize(next) + body;
  if (out !== raw) {
    report.updated++;
    if (WRITE) await fs.writeFile(p, out, 'utf8');
  }
  await new Promise((r) => setTimeout(r, DELAY));
}

console.log(WRITE ? '模式: write' : '模式: dry-run（加 --write 才写入）');
console.log('扫描:', report.total, '| HF 仓库:', report.hf, '| 集合:', report.collections || 0, '| 组织:', report.orgs || 0, '| 更新:', report.updated, '| 跳过:', report.skipped);
if (report.notFound.length) console.log('404:', report.notFound.slice(0, 10).join(', '), report.notFound.length > 10 ? '…' : '');
if (report.errors.length) console.log('错误:', report.errors.slice(0, 5).join(' | '));
