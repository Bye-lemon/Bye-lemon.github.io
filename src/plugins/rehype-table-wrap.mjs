/** 给 Markdown 表格套一层可横向滚动的容器，避免窄栏溢出。 */
function walk(node) {
  if (!node || !Array.isArray(node.children)) return;
  for (let i = 0; i < node.children.length; i++) {
    const child = node.children[i];
    if (child && child.type === 'element' && child.tagName === 'table') {
      node.children[i] = {
        type: 'element',
        tagName: 'div',
        properties: { className: ['table-wrap'] },
        children: [child],
      };
      continue;
    }
    walk(child);
  }
}

export default function rehypeTableWrap() {
  return (tree) => { walk(tree); };
}
