#!/usr/bin/env node
/**
 * 审计模型数据与 Hugging Face API 的一致性，生成 docs/model-audit.md。只读。
 * 用法: node scripts/audit-models.mjs
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import yaml from 'js-yaml';

const ROOT = path.resolve(import.meta.dirname, '..');
const DIR = path.join(ROOT, 'src', 'content', 'models');
const CACHE = path.join(ROOT, '.cache', 'hf-models');
const OUT = path.join(ROOT, 'docs', 'model-audit.md');
const norm = (x) => String(x || '').toLowerCase().replace(/[^a-z0-9]/g, '');
const host = (u) => { try { return new URL(u).host.replace(/^www\./, ''); } catch { return '?'; } };

const rows = [];
for (const f of (await fs.readdir(DIR)).filter((x) => x.endsWith('.md')).sort()) {
  const raw = await fs.readFile(path.join(DIR, f), 'utf8');
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (m) { try { rows.push({ file: f, ...yaml.load(m[1]) }); } catch {} }
}
const hf = rows.filter((r) => r.hf_id);
const noHf = rows.filter((r) => !r.hf_id);
const issues = { license: [], params: [], category: [], author: [] };

for (const r of hf) {
  let info;
  try { info = JSON.parse(await fs.readFile(path.join(CACHE, r.hf_id.replace('/', '__') + '.json'), 'utf8')); } catch { continue; }
  const tags = info.tags || [];
  const card = info.cardData || {};
  const lic = card.license || (tags.map((t) => t.match(/^license:(.+)$/)).find(Boolean) || [])[1] || '';
  if (lic && lic !== 'other' && norm(r.license) !== norm(lic)) issues.license.push({ name: r.name, ours: r.license, hf: lic });
  const total = info.safetensors && info.safetensors.total;
  if (typeof total === 'number' && total > 0) {
    const m = String(r.params || '').match(/([0-9.]+)\s*([bmt])/i);
    if (m) {
      const ours = Number(m[1]) * ({ b: 1e9, m: 1e6, t: 1e12 }[m[2].toLowerCase()] || 1);
      if (Math.abs(total - ours) / total > 0.25) issues.params.push({ name: r.name, ours: r.params, hf: (total / 1e9).toFixed(2) + 'B', series: /series/i.test(r.name) });
    }
  }
  const pipe = info.pipeline_tag || '';
  const cat = /image-text-to-text|any-to-any|video-text-to-text/.test(pipe) ? 'multimodal'
    : /text-to-speech|audio-to-audio|automatic-speech-recognition|voice-activity-detection|audio-classification/.test(pipe) ? 'speech'
    : /text-to-image|image-to-image|text-to-video|text-to-3d/.test(pipe) ? 'generation' : '';
  if (cat && r.category === 'language') issues.category.push({ name: r.name, pipeline: pipe, cat });
  const org = String(r.hf_id).split('/')[0];
  if (r.author && norm(r.author) !== norm(org) && !norm(r.author).includes(norm(org)) && !norm(org).includes(norm(r.author))) {
    issues.author.push({ name: r.name, ours: r.author, org });
  }
}

const out = ['# 模型库数据审计', '', '> 由 scripts/audit-models.mjs 生成，只读。', '',
  '- 条目：' + rows.length, '- 有 HF 仓库：' + hf.length, '- 无 HF 仓库（集合/组织页/论文/镜像）：' + noHf.length,
  '- 许可与 HF 不一致：' + issues.license.length, '- 参数量与 safetensors 偏差 >25%：' + issues.params.length,
  '- 类别仍可能是旧值：' + issues.category.length, '- 作者与 HF org 不同：' + issues.author.length, '', '## 无 HF 仓库的条目', ''];
const groups = new Map();
for (const r of noHf) {
  const k = /collections/.test(r.link || '') ? 'HF 集合（Series）' : /hf-mirror/.test(r.link || '') ? 'HF 镜像' : /arxiv/.test(r.link || '') ? '论文' : host(r.link || '');
  groups.set(k, (groups.get(k) || []).concat(r));
}
for (const [k, list] of groups) {
  out.push('### ' + k + '（' + list.length + '）', '');
  for (const r of list) out.push('- ' + r.name + ' — ' + r.link);
  out.push('');
}
out.push('## 许可不一致', '');
for (const x of issues.license) out.push('- ' + x.name + ': 库中 ' + x.ours + ' / HF ' + x.hf);
if (!issues.license.length) out.push('- 无');
out.push('', '## 参数量偏差', '');
for (const x of issues.params) out.push('- ' + x.name + ': ' + x.ours + '（HF ' + x.hf + '）' + (x.series ? ' [Series]' : ''));
if (!issues.params.length) out.push('- 无');
out.push('', '## 类别可疑', '');
for (const x of issues.category) out.push('- ' + x.name + ': ' + x.cat + ' (' + x.pipeline + ')');
if (!issues.category.length) out.push('- 无');
out.push('', '## 作者与 HF org 不同', '');
for (const x of issues.author) out.push('- ' + x.name + ': ' + x.ours + ' / ' + x.org);
if (!issues.author.length) out.push('- 无');

await fs.mkdir(path.dirname(OUT), { recursive: true });
await fs.writeFile(OUT, out.join('\n') + '\n', 'utf8');
console.log('条目', rows.length, '| HF', hf.length, '| 无 HF', noHf.length, '| license', issues.license.length, '| params', issues.params.length, '| category', issues.category.length, '| author', issues.author.length);
console.log('写入', path.relative(ROOT, OUT));
