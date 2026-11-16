import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { slugOf, dateOf } from '../lib/posts';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import yaml from 'js-yaml';

const require = createRequire(import.meta.url);

/** 领域词典：jieba 默认词典没有这些词。 */
const EXTRA_WORDS = ['重识别', '行人重识别', '车辆重识别', '小目标', '目标检测', '自监督', '对抗样本', '行人搜索', '目标跟踪', '语义分割', '模型库'];

function stripMarkdown(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\$\$[\s\S]*?\$\$/g, ' ')
    .replace(/\$[^$]*\$/g, ' ')
    .replace(/[#>*_`~]/g, ' ')
    .replace(/^\s*[-|]{3,}.*$/gm, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function loadJieba() {
  const jieba = require('jieba-wasm') as any;
  for (const w of EXTRA_WORDS) jieba.add_word(w, 100000, 'n');
  return jieba;
}

const clean = (arr: string[]) => arr.map((t) => t.trim()).filter((t) => t && !/^[\s\p{P}]+$/u.test(t));
const cjk = /[\u4e00-\u9fff]/;

export const GET: APIRoute = async () => {
  const jieba = loadJieba();
  const posts = await getCollection('posts');
  const models = await getCollection('models');
  const docs = [
    ...posts.map((p) => {
      const d = p.data as any;
      return {
        id: 'p:' + p.id,
        url: '/posts/' + slugOf(p) + '/',
        title: String(d.title || slugOf(p)),
        kind: '文章',
        date: dateOf(p).toISOString().slice(0, 10),
        description: String(d.abstract || ''),
        text: stripMarkdown(p.body || '').slice(0, 8000),
      };
    }),
    ...models.map((m) => {
      const d = m.data as any;
      return {
        id: 'm:' + m.id,
        url: '/models/' + m.id + '/',
        title: String(d.name),
        kind: '模型',
        date: String(d.updated || ''),
        description: String(d.author || ''),
        text: stripMarkdown(m.body || '') + ' ' + [d.type, ...(d.tags || []), d.license, d.author].filter(Boolean).join(' '),
      };
    }),
  ];

  // 导航（友链）条目
  const navRaw = fs.readFileSync('src/data/nav.yml', 'utf8');
  const navGroups = (yaml.load(navRaw) as any[]) || [];
  const navLinks: any[] = [];
  for (const g of navGroups) {
    for (const l of g.links || []) navLinks.push(l);
    for (const sub of g.list || []) for (const l of sub.links || []) navLinks.push(l);
  }
  for (const l of navLinks) {
    docs.push({
      id: 'n:' + l.url,
      url: String(l.url),
      title: String(l.title),
      kind: '导航',
      date: '',
      description: String(l.description || ''),
      text: [l.title, l.description || '', l.url].join(' '),
    });
  }

  const dict = new Set<string>(EXTRA_WORDS);
  const payload = docs.map((doc) => {
    const body = [doc.title, doc.description, doc.text].join(' ');
    const tokens = [...new Set([...clean(jieba.cut(body, true)), ...clean(jieba.cut_for_search(body, true))])];
    for (const t of tokens) if (t.length >= 2 && cjk.test(t)) dict.add(t);
    return { ...doc, tokens: tokens.join(' ') };
  });

  return new Response(JSON.stringify({ docs: payload, dict: [...dict].sort() }), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
