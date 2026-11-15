'use strict';
/**
 * 把 ```mermaid 代码块转成 <pre class="mermaid">，交给 Pele 渲染。
 * 取代已停止维护的 hexo-filter-mermaid-diagrams。
 */
hexo.extend.filter.register('before_post_render', function (data) {
  var enabled = !(this.config.mermaid && this.config.mermaid.enable === false);
  if (!enabled) return data;
  var source = String(data.source || '');
  if (/\.(js|css|html?|styl|json)$/i.test(source)) return data;
  data.content = String(data.content || '').replace(
    /(^|\n)([ \t]*)```mermaid[ \t]*\r?\n([\s\S]*?)\r?\n[ \t]*```/g,
    function (match, lead, indent, body) {
      return lead + indent + '<pre class="mermaid">' + body.trim() + '</pre>';
    }
  );
  return data;
}, 9);
