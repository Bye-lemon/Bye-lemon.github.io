'use strict';

/**
 * 生成站内搜索索引：/search.json
 * - posts: 文章标题、链接、日期、标签、摘要
 * - sites: 任意门里的全部站点
 */
hexo.extend.generator.register('studio_search_index', function (locals) {
  const strip = (html) => String(html || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-zA-Z#0-9]+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const posts = locals.posts.sort('-date').toArray().map((post) => ({
    t: post.title || '',
    u: post.path,
    d: post.date ? post.date.format('YYYY.MM.DD') : '',
    g: post.tags ? post.tags.toArray().map((tag) => tag.name).join(' ') : '',
    x: strip(post.excerpt || post.content || '').slice(0, 120)
  }));

  const sites = [];
  const pushLinks = (links, groupName) => {
    (links || []).forEach((link) => {
      if (!link || !link.url) return;
      sites.push({
        t: link.title || link.url,
        u: link.url,
        g: groupName,
        x: link.description || ''
      });
    });
  };
  (locals.data.nav || []).forEach((group) => {
    if (Array.isArray(group.list)) {
      group.list.forEach((sub) => pushLinks(sub.links, group.taxonomy + (sub.term ? ' · ' + sub.term : '')));
    }
    pushLinks(group.links, group.taxonomy);
  });

  return {
    path: 'search.json',
    data: JSON.stringify({ posts: posts, sites: sites })
  };
});
