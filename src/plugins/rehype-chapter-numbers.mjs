/** 给正文里的二级标题加章节序号（data-chapter），供 CSS 以边注形式渲染。
 *  跳过参考文献类小节，以及已经手动编号（一、/ 1. / Step 1）的标题；
 *  只有可编号的小节 ≥2 个时才编号，避免单小节文章出现孤零零的「1」。 */
const SKIP = /^(paper information|references?|参考文献|致谢|附录|appendix|传送门|相关链接)/i;
const MANUAL = /^(第[一二三四五六七八九十百]+[章节]|[一二三四五六七八九十]+、|(?:step|步骤)\s*\d+|\d+(?:\.\d+)*[.、．])/i;

export function isChapterHeading(text) {
  const t = String(text || '').trim();
  return !!t && !SKIP.test(t) && !MANUAL.test(t);
}

function textOf(node) {
  if (!node) return '';
  if (node.type === 'text') return node.value || '';
  if (!Array.isArray(node.children)) return '';
  return node.children.map(textOf).join('');
}

export default function rehypeChapterNumbers() {
  return (tree) => {
    const h2s = [];
    const walk = (node) => {
      if (!node || !Array.isArray(node.children)) return;
      for (const child of node.children) {
        if (child.type === 'element' && child.tagName === 'h2') h2s.push(child);
        else walk(child);
      }
    };
    walk(tree);

    const numbered = h2s.filter((node) => isChapterHeading(textOf(node)));
    if (numbered.length < 2) return;
    numbered.forEach((node, i) => {
      node.properties = node.properties || {};
      node.properties.dataChapter = String(i + 1);
    });
  };
}
