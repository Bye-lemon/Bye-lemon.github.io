/* 独立搜索页：/search/ · 站内与站外引擎在输入框下方切换 */
(function () {
  'use strict';
  var input = document.getElementById('sp-input');
  if (!input) return;
  var body = document.getElementById('sp-body');
  var countEl = document.getElementById('sp-count');
  var tools = document.getElementById('sp-tools');
  var clearBtn = document.getElementById('sp-clear');
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.sp-tabs button'));
  var engineBtns = Array.prototype.slice.call(document.querySelectorAll('.sp-engines button'));

  var ENGINES = {
    local: { name: '站内', local: true },
    google: { name: 'Google', url: 'https://www.google.com/search?q=' },
    bing: { name: '必应', url: 'https://www.bing.com/search?q=' },
    baidu: { name: '百度', url: 'https://www.baidu.com/s?wd=' },
    yahoo: { name: 'Yahoo! JAPAN', url: 'https://search.yahoo.co.jp/search?p=' },
    arxiv: { name: 'arXiv', url: 'https://arxiv.org/search/?query=', suffix: '&searchtype=all' }
  };

  var engine = 'google';
  var scope = 'all';
  var index = null;
  var rows = [];
  var active = -1;

  try { engine = localStorage.getItem('studio-engine') || 'google'; } catch (e) {}
  if (!ENGINES[engine]) engine = 'google';

  function esc(v) {
    return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function absolute(u) {
    if (/^https?:/i.test(u)) return u;
    return '/' + String(u || '').replace(/^\/+/, '');
  }

  function host(u) {
    try { return new URL(u).host.replace(/^www\./, ''); } catch (e) { return ''; }
  }

  function score(item, q) {
    var title = (item.t || '').toLowerCase();
    var group = (item.g || '').toLowerCase();
    var extra = (item.x || '').toLowerCase();
    var hay = title + ' ' + group + ' ' + extra;
    var tokens = q.split(/\s+/).filter(Boolean);
    var total = 0;
    for (var i = 0; i < tokens.length; i++) {
      if (hay.indexOf(tokens[i]) === -1) return -1;
      if (title.indexOf(tokens[i]) > -1) total += 5;
      if (group.indexOf(tokens[i]) > -1) total += 3;
      total += 1;
    }
    if (title.indexOf(q) === 0) total += 4;
    if (title.indexOf(q) > -1) total += 2;
    return total;
  }

  function topTags(limit) {
    if (!index) return [];
    var freq = {};
    index.posts.forEach(function (p) {
      (p.g || '').split(/\s+/).filter(Boolean).forEach(function (t) { freq[t] = (freq[t] || 0) + 1; });
    });
    return Object.keys(freq).sort(function (a, b) { return freq[b] - freq[a]; }).slice(0, limit)
      .map(function (t) { return { t: t, n: freq[t] }; });
  }

  function posts() { return index ? index.posts : []; }
  function sites() { return index ? index.sites : []; }

  function filter(list, q) {
    if (!q) return list.slice(0, 40);
    var out = [];
    list.forEach(function (item) {
      var s = score(item, q);
      if (s >= 0) out.push({ item: item, s: s });
    });
    out.sort(function (a, b) { return b.s - a.s; });
    return out.map(function (x) { return x.item; });
  }

  function rowPost(p, i) {
    return '<a class="sp-row" data-i="' + i + '" href="' + esc(absolute(p.u)) + '">' +
      '<span class="sp-kind">文章</span>' +
      '<span class="sp-main"><span class="sp-t">' + esc(p.t) + '</span>' +
      (p.x ? '<span class="sp-x">' + esc(p.x) + '</span>' : '') + '</span>' +
      '<span class="sp-m">' + esc(p.d || '') + (p.g ? ' · ' + esc(p.g.split(' ').slice(0, 2).join(' · ')) : '') + '</span>' +
      '</a>';
  }

  function rowSite(s, i) {
    return '<a class="sp-row" data-i="' + i + '" href="' + esc(s.u) + '" target="_blank" rel="noopener">' +
      '<span class="sp-kind is-site">站点</span>' +
      '<span class="sp-main"><span class="sp-t">' + esc(s.t) + '</span>' +
      '<span class="sp-x">' + esc(s.x || host(s.u)) + '</span></span>' +
      '<span class="sp-m">' + esc(s.g || '') + '</span>' +
      '</a>';
  }

  function rowsHTML(items, kind) {
    var html = '';
    items.forEach(function (item) {
      var i = rows.length;
      rows.push({ kind: kind, href: kind === 'site' ? item.u : absolute(item.u) });
      html += kind === 'post' ? rowPost(item, i) : rowSite(item, i);
    });
    return html;
  }

  function emptyState() {
    var html = '';
    var recent = posts().slice(0, 5);
    if (recent.length) {
      html += '<section class="sp-block"><h2>最近更新 <span>さいきん</span></h2><div class="sp-rows">' + rowsHTML(recent, 'post') + '</div></section>';
    }
    var tags = topTags(12);
    if (tags.length) {
      html += '<section class="sp-block"><h2>热门标签</h2><div class="sp-chips">' +
        tags.map(function (t) { return '<button type="button" class="sp-chip" data-tag="' + esc(t.t) + '">' + esc(t.t) + '<b>' + t.n + '</b></button>'; }).join('') +
        '</div></section>';
    }
    var picks = sites().slice(0, 6);
    if (picks.length) {
      html += '<section class="sp-block"><h2>常用站点</h2><div class="sp-grid">' +
        picks.map(function (s) {
          return '<a class="sp-cell" href="' + esc(s.u) + '" target="_blank" rel="noopener"><span class="sp-t">' + esc(s.t) + '</span><span class="sp-m">' + esc(s.g || '') + '</span></a>';
        }).join('') +
        '</div></section>';
    }
    return html;
  }

  function renderExternal(q) {
    var e = ENGINES[engine];
    var href = e.url + encodeURIComponent(q) + (e.suffix || '');
    input.placeholder = '在 ' + e.name + ' 搜索';
    rows = [{ kind: 'engine', href: href }];
    body.innerHTML = '<div class="sp-out">' +
      '<div class="sp-out-line">在 <b>' + esc(e.name) + '</b> 搜索</div>' +
      '<div class="sp-out-q">' + (q ? esc(q) : '输入关键词后回车') + '</div>' +
      '<a class="sp-out-go" href="' + esc(href) + '" target="_blank" rel="noopener">打开 ' + esc(e.name) + ' ↗</a>' +
      '</div>';
    countEl.textContent = q ? '站外 · ' + e.name : '站外 · ' + e.name;
    bind();
  }

  function render() {
    rows = [];
    active = -1;
    var q = input.value.trim();
    var isLocal = ENGINES[engine].local;

    tools.style.display = isLocal ? '' : 'none';

    if (!isLocal) {
      renderExternal(q);
      return;
    }

    input.placeholder = '输入关键词：docker、Apollo、arxiv…';

    if (!index) {
      body.innerHTML = '<div class="sp-empty">正在加载索引…</div>';
      return;
    }

    if (!q) {
      body.innerHTML = emptyState();
      countEl.textContent = '索引：' + posts().length + ' 篇文章 · ' + sites().length + ' 个站点';
      bind();
      return;
    }

    var p = filter(posts(), q);
    var s = filter(sites(), q);
    var html = '';
    countEl.textContent = '找到 ' + (p.length + s.length) + ' 条';

    if (scope !== 'site' && p.length) {
      html += '<section class="sp-block"><h2>文章 <em>' + p.length + '</em></h2><div class="sp-rows">' + rowsHTML(p.slice(0, 12), 'post') + '</div></section>';
    }
    if (scope !== 'post' && s.length) {
      html += '<section class="sp-block"><h2>站点 <em>' + s.length + '</em></h2><div class="sp-rows">' + rowsHTML(s.slice(0, 12), 'site') + '</div></section>';
    }
    if (!p.length && !s.length) {
      html = '<div class="sp-empty">站内没有「' + esc(q) + '」。换个词，或在下方切到 Google、必应、百度。</div>';
    }
    body.innerHTML = html;
    bind();
  }

  function bind() {
    Array.prototype.forEach.call(body.querySelectorAll('.sp-row'), function (el) {
      el.addEventListener('mouseenter', function () { setActive(parseInt(el.getAttribute('data-i'), 10)); });
    });
    Array.prototype.forEach.call(body.querySelectorAll('.sp-chip'), function (el) {
      el.addEventListener('click', function () {
        input.value = el.getAttribute('data-tag');
        syncUrl();
        render();
        input.focus();
      });
    });
    setActive(-1);
  }

  function setActive(i) {
    active = i;
    Array.prototype.forEach.call(body.querySelectorAll('.sp-row'), function (el) {
      el.classList.toggle('is-active', parseInt(el.getAttribute('data-i'), 10) === i);
    });
    var el = body.querySelector('.sp-row.is-active');
    if (el && el.scrollIntoView) el.scrollIntoView({ block: 'nearest' });
  }

  function openActive() {
    if (engine !== 'local') {
      if (rows[0]) window.open(rows[0].href, '_blank', 'noopener');
      return;
    }
    if (active < 0 || !rows[active]) return;
    var row = rows[active];
    if (row.kind === 'site') window.open(row.href, '_blank', 'noopener');
    else window.location.href = row.href;
  }

  function syncUrl() {
    var q = input.value.trim();
    var next = '/search/' + (q ? '?q=' + encodeURIComponent(q) : '');
    try { history.replaceState(null, '', next); } catch (e) {}
  }

  function setScope(next) {
    scope = next;
    tabs.forEach(function (t) { t.classList.toggle('is-active', t.getAttribute('data-scope') === next); });
    render();
  }

  function setEngine(next) {
    engine = ENGINES[next] ? next : 'local';
    try { localStorage.setItem('studio-engine', engine); } catch (e) {}
    engineBtns.forEach(function (b) { b.classList.toggle('is-active', b.getAttribute('data-engine') === engine); });
    render();
  }

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () { setScope(tab.getAttribute('data-scope')); input.focus(); });
  });

  engineBtns.forEach(function (btn) {
    btn.addEventListener('click', function () { setEngine(btn.getAttribute('data-engine')); input.focus(); });
  });

  input.addEventListener('input', function () { syncUrl(); render(); });
  clearBtn.addEventListener('click', function () { input.value = ''; syncUrl(); render(); input.focus(); });

  input.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); if (rows.length) setActive((active + 1) % rows.length); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); if (rows.length) setActive((active - 1 + rows.length) % rows.length); }
    else if (e.key === 'Enter') { e.preventDefault(); openActive(); }
    else if (e.key === 'Escape') { input.value = ''; syncUrl(); render(); input.blur(); }
  });

  document.addEventListener('keydown', function (e) {
    var tag = (e.target && e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea') return;
    if (e.key === '/') { e.preventDefault(); input.focus(); input.select(); }
  });

  engineBtns.forEach(function (b) { b.classList.toggle('is-active', b.getAttribute('data-engine') === engine); });

  fetch('/search.json', { credentials: 'same-origin' })
    .then(function (r) { return r.json(); })
    .then(function (json) {
      index = { posts: json.posts || [], sites: json.sites || [] };
      var fromUrl = '';
      var engineParam = '';
      try {
        var params = new URLSearchParams(location.search);
        fromUrl = params.get('q') || '';
        engineParam = params.get('engine') || '';
      } catch (e) {}
      if (fromUrl) input.value = fromUrl;
      if (engineParam && ENGINES[engineParam]) setEngine(engineParam);
      else render();
      if (fromUrl) input.focus();
    })
    .catch(function () {
      body.innerHTML = '<div class="sp-empty">索引加载失败，请刷新重试。</div>';
    });
})();