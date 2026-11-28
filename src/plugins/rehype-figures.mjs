/** 把独占一段的图片包成 <figure>，并把说明转成 <figcaption>。
 *  说明来源：alt（较长或以 Figure/图/表 开头），或紧跟图片、以 Figure/图/表 + 编号 开头的段落。
 *  同时给图片补 loading="lazy" 与 decoding="async"。 */
const CAPTION = /^(figure|fig\.?|图|表|table)\s*\d+/i;
const LABEL = /^((?:figure|fig\.?|图|表|table)\s*\d+)\s*[:：.、]?\s*/i;

function textOf(node) {
  if (!node) return '';
  if (node.type === 'text') return node.value || '';
  if (!Array.isArray(node.children)) return '';
  return node.children.map(textOf).join('');
}

function findImage(node) {
  if (!node || !Array.isArray(node.children)) return null;
  for (const child of node.children) {
    if (child.type === 'element' && child.tagName === 'img') return child;
    if (child.type === 'element' && child.tagName === 'a') {
      const inner = findImage(child);
      if (inner) return inner;
    }
  }
  return null;
}

function isImageParagraph(node) {
  if (!node || node.type !== 'element' || node.tagName !== 'p') return false;
  const meaningful = (node.children || []).filter((c) => !(c.type === 'text' && !String(c.value || '').trim()));
  if (meaningful.length === 0) return false;
  const allowed = meaningful.every((c) => c.type === 'element' && (c.tagName === 'img' || c.tagName === 'a'));
  return allowed && !!findImage(node);
}

function mathSpan(tex) {
  return { type: 'element', tagName: 'span', properties: { className: ['math', 'math-inline'] }, children: [{ type: 'text', value: tex.trim() }] };
}

/** 纯文本 → 节点；$...$ 变成 math-inline，交给后面的 rehype-katex 渲染。 */
function nodesFromText(text) {
  const out = [];
  const re = /\$([^$]+)\$/g;
  let last = 0;
  let m;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push({ type: 'text', value: text.slice(last, m.index) });
    out.push(mathSpan(m[1]));
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push({ type: 'text', value: text.slice(last) });
  return out;
}

function labelSpan(label) {
  return { type: 'element', tagName: 'span', properties: { className: ['fig-label'] }, children: [{ type: 'text', value: label }] };
}

function captionFromText(text) {
  const clean = String(text || '').trim();
  const m = clean.match(LABEL);
  const children = [];
  if (m) {
    children.push(labelSpan(m[1]));
    const rest = clean.slice(m[0].length).trim();
    if (rest) {
      children.push({ type: 'text', value: ' ' });
      children.push(...nodesFromText(rest));
    }
  } else {
    children.push(...nodesFromText(clean));
  }
  return { type: 'element', tagName: 'figcaption', properties: {}, children };
}

/** 图注段落 → 复用它的子节点（行内公式、代码、链接都在），只把开头的「图 1：」抽成标签。 */
function captionFromParagraph(paragraph) {
  const children = (paragraph.children || []).map((child) => ({ ...child }));
  let label = '';
  const first = children[0];
  if (first && first.type === 'text') {
    const m = String(first.value || '').match(LABEL);
    if (m) {
      label = m[1];
      const rest = String(first.value).slice(m[0].length).replace(/^\s+/, '');
      if (rest) first.value = rest;
      else children.shift();
    }
  }
  const out = [];
  if (label) out.push(labelSpan(label), { type: 'text', value: ' ' });
  out.push(...children);
  return { type: 'element', tagName: 'figcaption', properties: {}, children: out };
}

function walk(parent) {
  const children = parent.children || [];
  const out = [];
  for (let i = 0; i < children.length; i++) {
    const node = children[i];
    if (isImageParagraph(node)) {
      const img = findImage(node);
      if (img && img.properties) {
        img.properties.loading = 'lazy';
        img.properties.decoding = 'async';
      }

      const alt = String((img && img.properties && img.properties.alt) || '').trim();

      // 跳过图片段落与图注段落之间的空白文本节点
      let j = i + 1;
      while (j < children.length && children[j].type === 'text' && !String(children[j].value || '').trim()) j += 1;
      const next = children[j];
      const nextText = next && next.type === 'element' && next.tagName === 'p' ? textOf(next).trim() : '';

      let caption = null;
      if (nextText && CAPTION.test(nextText) && next.type === 'element' && next.tagName === 'p') {
        caption = captionFromParagraph(next);
        i = j;
      } else if (alt.length >= 40 || CAPTION.test(alt)) {
        caption = captionFromText(alt);
        if (img.properties) img.properties.alt = '';
      }

      const figure = { type: 'element', tagName: 'figure', properties: {}, children: [node] };
      if (caption) figure.children.push(caption);
      out.push(figure);
      continue;
    }
    if (node && Array.isArray(node.children) && node.type === 'element' && node.tagName !== 'figure') walk(node);
    out.push(node);
  }
  parent.children = out;
}

export default function rehypeFigures() {
  return (tree) => { walk(tree); };
}
