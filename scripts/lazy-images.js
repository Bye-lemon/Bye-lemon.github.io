'use strict';
/** 给正文图片补上 loading="lazy" 与 decoding="async"，减少首屏开销。 */
hexo.extend.filter.register('after_post_render', function (data) {
  data.content = String(data.content || '').replace(/<img\b([^>]*)>/gi, function (tag, attrs) {
    if (/loading=/i.test(attrs)) return tag;
    return '<img' + attrs + ' loading="lazy" decoding="async">';
  });
  return data;
});
