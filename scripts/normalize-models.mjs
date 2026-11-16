#!/usr/bin/env node
/**
 * 模型 frontmatter 归一化（幂等）。
 * 只处理 license / author / tags / updated，并按 taxonomy.fieldOrder 稳定排序；
 * 不会新增缺失字段，也不会重新引入已废弃的 type/arch。
 *
 * 用法:
 *   npm run models:normalize
 *   node scripts/normalize-models.mjs --dry-run
 *   node scripts/normalize-models.mjs --check   # CI 用，有改动则退出码 1
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import yaml from 'js-yaml';

const ROOT = path.resolve(import.meta.dirname, '..');
const DIR = path.join(ROOT, 'src', 'content', 'models');
const TAXONOMY = JSON.parse(await fs.readFile(path.join(ROOT, 'src', 'data', 'model-taxonomy.json'), 'utf8'));
const ORDER = TAXONOMY.fieldOrder || [];
const FIELDS = TAXONOMY.fields || {};
const LICENSE_ALIASES = TAXONOMY.licenses?.aliases || {};
const LICENSE_CANONICAL = new Set(TAXONOMY.licenses?.canonical || []);
const AUTHOR_ALIASES = TAXONOMY.authors?.aliases || {};

const argv = process.argv.slice(2);
const DRY = argv.includes('--dry-run') || argv.includes('--check');
const CHECK = argv.includes('--check');

const FM = /^---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*(\r?\n)?([\s\S]*)$/;
const collapse = (v) => String(v ?? '').replace(/[ \t\u00a0\u3000]+/g, ' ').trim();
const isValidDate = (v) => /^\d{4}-\d{2}-\d{2}$/.test(v) && new Date(v + 'T00:00:00Z').toISOString().slice(0, 10) === v;
const uniq = (a) => [...new Set(a.map(collapse).filter(Boolean))];

const stats = { files: 0, changed: 0, added: 0, fields: { license: 0, author: 0, tags: 0, updated: 0, enum: 0 }, warnings: [] };

function serialize(d) {
  const keys = [...ORDER.filter((k) => k in d), ...Object.keys(d).filter((k) => !ORDER.includes(k))];
  const lines = ['---'];
  for (const k of keys) {
    const v = d[k];
    if (Array.isArray(v)) lines.push(k + ': [' + v.map((x) => JSON.stringify(String(x))).join(', ') + ']');
    else if (typeof v === 'boolean') lines.push(k + ': ' + v);
    else if (typeof v === 'number') lines.push(k + ': ' + v);
    else if (v === '' || v == null) lines.push(k + ': ""');
    else lines.push(k + ': ' + JSON.stringify(String(v)));
  }
  lines.push('---');
  return lines.join('\n') + '\n';
}

for (const f of (await fs.readdir(DIR)).filter((x) => x.endsWith('.md')).sort()) {
  const p = path.join(DIR, f);
  const raw = await fs.readFile(p, 'utf8');
  const m = raw.match(FM);
  if (!m) { stats.warnings.push(f + ': 缺少 frontmatter'); continue; }
  const d = yaml.load(m[1]) || {};
  const body = m[3] || '';
  stats.files++;
  let changed = false;
  const touch = (k) => { stats.fields[k]++; changed = true; };

  // license
  let license = collapse(d.license);
  license = LICENSE_ALIASES[license] || license;
  if (license && !LICENSE_CANONICAL.has(license)) stats.warnings.push(f + ': license 不在 canonical: ' + license);
  if (license !== (d.license ?? '')) { d.license = license; touch('license'); }

  // author
  let author = collapse(d.author);
  author = AUTHOR_ALIASES[author] || author;
  if (author !== (d.author ?? '')) { d.author = author; touch('author'); }

  // tags
  const tags = uniq(Array.isArray(d.tags) ? d.tags : []);
  if (JSON.stringify(tags) !== JSON.stringify(d.tags || [])) { d.tags = tags; touch('tags'); }

  // updated
  const updated = collapse(d.updated);
  if (updated && !isValidDate(updated)) { stats.warnings.push(f + ': updated 非法: ' + updated); d.updated = ''; touch('updated'); }

  // 枚举校验（不改写，只告警）；open 字段只校验格式
  for (const [key, spec] of Object.entries(FIELDS)) {
    const val = d[key];
    if (val == null || val === '') continue;
    const vals = Array.isArray(val) ? val : [val];
    if (spec.open) {
      const re = new RegExp(spec.pattern);
      for (const v of vals) if (!re.test(v)) stats.warnings.push(f + ': ' + key + ' 格式不符: ' + v);
      continue;
    }
    const allowed = new Set(Object.keys(spec.values || {}));
    for (const v of vals) if (!allowed.has(v)) stats.warnings.push(f + ': ' + key + ' 未登记值: ' + v);
  }

  const out = serialize(d) + body;
  if (out !== raw) {
    stats.changed++;
    if (!DRY) await fs.writeFile(p, out, 'utf8');
  }
}

console.log('模式:', CHECK ? 'check' : DRY ? 'dry-run' : 'write');
console.log('文件:', stats.files, '| 改动:', stats.changed, '| 字段改动:', JSON.stringify(stats.fields));
if (stats.warnings.length) {
  console.log('告警(' + stats.warnings.length + '):');
  for (const w of stats.warnings.slice(0, 30)) console.log('  - ' + w);
  if (stats.warnings.length > 30) console.log('  …');
}
if (CHECK && stats.changed) process.exit(1);
