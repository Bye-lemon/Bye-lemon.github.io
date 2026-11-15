'use strict';
/**
 * 保护 $...$ / $$...$$ 数学公式，避免被 Markdown 渲染器当成强调语法改写。
 * 渲染完成后再还原原始 TeX，交给 MathJax 3 处理。
 */
var store = {};
var counter = 0;

hexo.extend.filter.register('before_post_render', function (data) {
  var source = String(data.content || '');
  if (source.indexOf('$') === -1) return data;
  var map = [];
  data.content = source.replace(/\$\$([\s\S]+?)\$\$|\$([^$\n]+?)\$/g, function (match) {
    var token = '@@MATH' + (counter++) + '@@';
    map.push({ token: token, tex: match });
    return token;
  });
  if (map.length) {
    data.__mathTokens = map;
  }
  return data;
}, 20);

hexo.extend.filter.register('after_post_render', function (data) {
  var map = data.__mathTokens;
  if (!map || !map.length) return data;
  var out = String(data.content || '');
  for (var i = 0; i < map.length; i++) {
    out = out.split(map[i].token).join(map[i].tex);
  }
  data.content = out;
  delete data.__mathTokens;
  return data;
});
