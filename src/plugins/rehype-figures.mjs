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

function captionNode(text) {
  const clean = text.replace(/\$([^$]*)\$/g, '$1').trim();
  const m = clean.match(LABEL);
  const children = [];
  if (m) {
    children.push({ type: 'element', tagName: 'span', properties: { className: ['fig-label'] }, children: [{ type: 'text', value: m[1] }] });
    const rest = clean.slice(m[0].length).trim();
    if (rest) children.push({ type: 'text', value: ' ' + rest });
  } else {
    children.push({ type: 'text', value: clean });
  }
  return { type: 'element', tagName: 'figcaption', properties: {}, children };
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
      const next = children[i + 1];
      const nextText = next && next.type === 'element' && next.tagName === 'p' ? textOf(next).trim() : '';

      let caption = '';
      if (alt.length >= 40 || CAPTION.test(alt)) {
        caption = alt;
        if (img.properties) img.properties.alt = '';
      } else if (nextText && CAPTION.test(nextText)) {
        caption = nextText;
        i += 1;
      }

      const figure = { type: 'element', tagName: 'figure', properties: {}, children: [node] };
      if (caption) figure.children.push(captionNode(caption));
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
