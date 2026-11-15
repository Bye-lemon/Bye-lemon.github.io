'use strict';
/**
 * 首页分页生成器：排除「论文笔记」分类。
 * 取代 hexo-generator-index2 与 hexo-generator-index-pin-top（两者均已停更）。
 */
hexo.extend.generator.register('home_index', function (locals) {
  var perPage = 10;
  var cfg = this.config.index_generator;
  if (cfg && typeof cfg.per_page === 'number' && cfg.per_page > 0) perPage = cfg.per_page;

  var exclude = (this.config.home_exclude_categories || ['论文笔记']);
  var posts = locals.posts.filter(function (post) {
    var cats = post.categories ? post.categories.toArray() : [];
    return !cats.some(function (c) { return exclude.indexOf(c.name) > -1; });
  }).sort('-date');

  var total = posts.length;
  var pages = Math.max(1, Math.ceil(total / perPage));
  var routes = [];
  for (var i = 0; i < pages; i++) {
    var current = i + 1;
    var prev = current > 1 ? current - 1 : 0;
    var next = current < pages ? current + 1 : 0;
    var link = function (n) { return n <= 1 ? '/' : '/page/' + n + '/'; };
    routes.push({
      path: current === 1 ? 'index.html' : 'page/' + current + '/index.html',
      layout: ['index', 'archive'],
      data: {
        posts: posts.slice(i * perPage, (i + 1) * perPage),
        current: current,
        total: pages,
        per_page: perPage,
        prev: prev,
        next: next,
        prev_link: prev ? link(prev) : '',
        next_link: next ? link(next) : '',
        base: ''
      }
    });
  }
  return routes;
});
