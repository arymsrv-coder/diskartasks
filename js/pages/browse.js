/* Browse page. All state lives in the URL (?q=&cat=&price=u500,mid&sort=&page=) and the page re-renders from it. */
(function () {
  'use strict';

  Store.init();
  UI.mount({ page: 'browse', crumbs: [{ label: 'Browse Gigs' }] });

  var esc = Util.esc;
  var CATS = Store.categories();
  var PRICES = [['u500', 'Under ₱500'], ['mid', '₱500–₱1,000'], ['high', '₱1,000+']];
  var SORTS = [['recent', 'Most Recent'], ['low', 'Price: Low to High'], ['high', 'Price: High to Low'], ['top', 'Top Rated']];
  var PER_PAGE = 6;

  var $ = function (id) { return document.getElementById(id); };
  var user = Store.currentUser();

  // ---------- state <-> URL
  function readState() {
    var p = UI.query();
    var cat = p.get('cat');
    if (!CATS.some(function (c) { return c.id === cat; })) cat = '';
    var wanted = (p.get('price') || '').split(',');
    var price = PRICES.map(function (x) { return x[0]; }).filter(function (id) { return wanted.indexOf(id) >= 0; });
    var sort = SORTS.some(function (s) { return s[0] === p.get('sort'); }) ? p.get('sort') : 'recent';
    return { q: (p.get('q') || '').trim().slice(0, 100), cat: cat, price: price, sort: sort, page: Util.toInt(p.get('page'), 1, 1, 9999) };
  }

  function toUrl(s) {
    var parts = [];
    if (s.q) parts.push('q=' + encodeURIComponent(s.q));
    if (s.cat) parts.push('cat=' + encodeURIComponent(s.cat));
    if (s.price.length) parts.push('price=' + s.price.join(','));
    if (s.sort !== 'recent') parts.push('sort=' + s.sort);
    if (s.page > 1) parts.push('page=' + s.page);
    return 'browse.html' + (parts.length ? '?' + parts.join('&') : '');
  }

  // Changing a control updates the URL (so Back works) and re-renders. Filters send the visitor back to page 1.
  function update(patch, opts) {
    var s = readState();
    Object.keys(patch).forEach(function (k) { s[k] = patch[k]; });
    if (!('page' in patch)) s.page = 1;
    UI.setUrl(toUrl(s), !(opts && opts.replace));
    render(opts);
  }

  // ---------- filter controls (the same markup lives in the sidebar and in the phone drawer)
  function filtersHtml(prefix, s) {
    var cats = '<label class="radio"><input type="radio" name="cat-' + prefix + '" value=""' + (s.cat === '' ? ' checked' : '') + '><span class="radio__dot"></span>All Categories</label>' +
      CATS.map(function (c) { return '<label class="radio"><input type="radio" name="cat-' + prefix + '" value="' + esc(c.id) + '"' + (s.cat === c.id ? ' checked' : '') + '><span class="radio__dot"></span>' + esc(c.name) + '</label>'; }).join('');
    var prices = PRICES.map(function (p) { return '<label class="check"><input type="checkbox" name="price-' + prefix + '" value="' + p[0] + '"' + (s.price.indexOf(p[0]) >= 0 ? ' checked' : '') + '><span class="check__box"></span>' + esc(p[1]) + '</label>'; }).join('');
    return '<fieldset class="filter-group"><legend>Categories</legend>' + cats + '</fieldset><fieldset class="filter-group"><legend>Price Range</legend>' + prices + '</fieldset>';
  }

  function wireFilters(container, prefix) {
    container.addEventListener('change', function (e) {
      var t = e.target;
      if (t.name === 'cat-' + prefix) update({ cat: t.value });
      else if (t.name === 'price-' + prefix) {
        var on = Array.prototype.map.call(container.querySelectorAll('input[name="price-' + prefix + '"]:checked'), function (i) { return i.value; });
        update({ price: PRICES.map(function (x) { return x[0]; }).filter(function (id) { return on.indexOf(id) >= 0; }) });
      }
    });
  }

  // ---------- render
  function pageList(page, pages) {
    var out = [];
    for (var n = 1; n <= pages; n++) if (n === 1 || n === pages || Math.abs(n - page) <= 1) out.push(n);
    var withGaps = [];
    out.forEach(function (n, i) { if (i && n - out[i - 1] > 1) withGaps.push('gap'); withGaps.push(n); });
    return withGaps;
  }

  function renderPagination(res, s) {
    var nav = $('pagination');
    if (res.pages <= 1) { nav.innerHTML = ''; return; }
    var link = function (n) { return toUrl(Object.assign({}, s, { page: n })); };
    nav.innerHTML = '<a class="page page--arrow" aria-label="Previous page" data-page="' + (res.page - 1) + '" href="' + esc(link(Math.max(1, res.page - 1))) + '"' + (res.page === 1 ? ' aria-disabled="true"' : '') + '>' + Icons.svg('arrow-left', { size: 18 }) + '</a>' +
      pageList(res.page, res.pages).map(function (n) {
        return n === 'gap' ? '<span class="page" aria-hidden="true" style="border-color:transparent">…</span>'
          : '<a class="page" data-page="' + n + '" href="' + esc(link(n)) + '"' + (n === res.page ? ' aria-current="page"' : '') + '>' + n + '</a>';
      }).join('') +
      '<a class="page page--arrow" aria-label="Next page" data-page="' + (res.page + 1) + '" href="' + esc(link(Math.min(res.pages, res.page + 1))) + '"' + (res.page === res.pages ? ' aria-disabled="true"' : '') + '>' + Icons.svg('arrow-right', { size: 18 }) + '</a>';
  }

  function renderActive(s) {
    var chips = [];
    if (s.q) chips.push(['q', '“' + s.q + '”']);
    if (s.cat) chips.push(['cat', CATS.filter(function (c) { return c.id === s.cat; })[0].name]);
    s.price.forEach(function (id) { chips.push(['price:' + id, PRICES.filter(function (p) { return p[0] === id; })[0][1]]); });
    $('active-filters').innerHTML = chips.length
      ? chips.map(function (c) { return '<span class="chip chip--removable chip--static">' + esc(c[1]) + '<button class="chip__x" type="button" data-remove="' + esc(c[0]) + '" aria-label="Remove filter ' + esc(c[1]) + '">' + Icons.svg('x', { size: 16 }) + '</button></span>'; }).join('') +
        '<button class="btn btn--outline btn--sm" type="button" data-clear>Clear filters</button>'
      : '';
  }

  var rendered = false;
  function render(opts) {
    var s = readState();
    var res = Store.listGigs({ q: s.q, cat: s.cat, price: s.price, sort: s.sort, page: s.page, perPage: PER_PAGE });

    // keep the address bar honest when the URL asked for a page that does not exist
    if (res.page !== s.page) UI.setUrl(toUrl(Object.assign({}, s, { page: res.page })));

    // controls reflect the state (the sidebar is built once so keyboard focus survives a change)
    Array.prototype.forEach.call($('filters-desktop').querySelectorAll('input'), function (i) {
      i.checked = i.type === 'radio' ? i.value === s.cat : s.price.indexOf(i.value) >= 0;
    });
    if (document.activeElement !== $('q')) $('q').value = s.q;
    $('sort').value = s.sort;
    $('cat-tabs').querySelectorAll('.cat-tabs__tab').forEach(function (t) {
      var on = t.getAttribute('data-cat') === s.cat;
      t.classList.toggle('is-active', on);
      t.setAttribute('aria-selected', String(on));
    });
    renderActive(s);

    // results
    var grid = $('grid'), empty = $('empty');
    if (!res.total) {
      grid.hidden = true; empty.hidden = false;
      empty.innerHTML = '<div class="empty-state">' + Icons.svg('search', { size: 40 }) + '<h2>No gigs match your search</h2><p>Try a different word, or clear a filter or two.</p><button class="btn btn--primary" type="button" data-clear>Clear filters</button></div>';
      $('results-count').textContent = 'No gigs found';
    } else {
      grid.hidden = false; empty.hidden = true; empty.innerHTML = '';
      grid.innerHTML = res.items.map(function (g) { return UI.gigCard(g); }).join('');
      var from = (res.page - 1) * PER_PAGE + 1;
      $('results-count').textContent = 'Showing ' + from + '–' + (from + res.items.length - 1) + ' of ' + res.total + (res.total === 1 ? ' gig' : ' gigs');
    }
    renderPagination(res, Object.assign({}, s, { page: res.page }));
    if (rendered && opts && opts.scroll) $('results').scrollIntoView({ block: 'start' });
    rendered = true;
  }

  // ---------- static pieces
  $('browse-banner-img').innerHTML = UI.tile(SEED.images.banner, '');
  $('search-icon').outerHTML = Icons.svg('search', { size: 20 });
  $('open-filters').innerHTML = Icons.svg('sliders', { size: 22 });
  $('rec-arrow').innerHTML = Icons.svg('arrow-right', { size: 18 });
  $('sort').innerHTML = SORTS.map(function (s) { return '<option value="' + s[0] + '">' + esc(s[1]) + '</option>'; }).join('');
  $('cat-tabs').innerHTML = [{ id: '', name: 'All', icon: 'grid' }].concat(CATS).map(function (c) {
    return '<button class="cat-tabs__tab" type="button" role="tab" data-cat="' + esc(c.id) + '">' + Icons.svg(c.icon, { size: 22 }) + esc(c.name) + '</button>';
  }).join('');

  var topEl = $('recommended');
  topEl.innerHTML = Store.recommended(user ? user.handle : null, 4).map(function (g) { return UI.gigCard(g, { variant: 'compact' }); }).join('');

  var sellers = Store.allUsers().filter(function (u) { return u.isSeller && Store.gigsBySeller(u.handle).length; })
    .sort(function (a, b) { return b.rating * b.ratingCount - a.rating * a.ratingCount; }).slice(0, 3);
  $('top-sellers').innerHTML = sellers.map(UI.sellerCard).join('');

  var picks = [['design', 0], ['design', 1], ['tech', 0], ['tech', 2], ['writing', 0], ['tutoring', 0], ['admin', 1], ['others', 0]];
  $('popular-searches').innerHTML = picks.map(function (p) {
    var m = SEED.navMenu.filter(function (x) { return x.cat === p[0]; })[0].subs[p[1]];
    return '<a href="browse.html?cat=' + esc(p[0]) + '&amp;q=' + encodeURIComponent(m.q) + '">' + esc(m.label) + '</a>';
  }).join('');

  UI.bindGigCards($('results'));
  UI.bindGigCards(topEl);

  // ---------- events
  $('filters-desktop').innerHTML = filtersHtml('s', readState());
  wireFilters($('filters-desktop'), 's');

  $('cat-tabs').addEventListener('click', function (e) {
    var t = e.target.closest('.cat-tabs__tab');
    if (t) update({ cat: t.getAttribute('data-cat') });
  });

  var timer;
  $('q').addEventListener('input', function () {
    clearTimeout(timer);
    var v = this.value.trim().slice(0, 100);
    timer = setTimeout(function () { update({ q: v }, { replace: true }); }, 300);
  });
  $('q').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') { clearTimeout(timer); e.preventDefault(); update({ q: this.value.trim().slice(0, 100) }); }
  });

  $('sort').addEventListener('change', function () { update({ sort: this.value }); });

  $('pagination').addEventListener('click', function (e) {
    var a = e.target.closest('a.page');
    if (!a) return;
    e.preventDefault();
    if (a.getAttribute('aria-disabled') === 'true' || a.getAttribute('aria-current')) return;
    update({ page: Util.toInt(a.getAttribute('data-page'), 1, 1, 9999) }, { scroll: true });
    $('results').focus({ preventScroll: true });   // the clicked link was replaced; keep keyboard focus in the results
  });

  // A search typed a moment ago is still waiting on its 300 ms timer; clearing or removing a filter must cancel it,
  // otherwise it fires afterwards and puts the search back.
  function clearAll() { clearTimeout(timer); update({ q: '', cat: '', price: [], sort: readState().sort }); }
  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-clear]')) { clearAll(); return; }
    var rm = e.target.closest('[data-remove]');
    if (!rm) return;
    clearTimeout(timer);
    var k = rm.getAttribute('data-remove');
    if (k === 'q') update({ q: '' });
    else if (k === 'cat') update({ cat: '' });
    else update({ price: readState().price.filter(function (id) { return 'price:' + id !== k; }) });
  });

  // phones: the filters live in a drawer behind the filter bar button
  $('open-filters').addEventListener('click', function () {
    var s = readState();
    var d = UI.drawer({ title: 'Filters', body: filtersHtml('d', s) + '<button class="btn btn--primary btn--block" type="button" id="drawer-done">Show results</button><button class="btn btn--outline btn--block" type="button" id="drawer-clear">Clear filters</button>' });
    wireFilters(d.el, 'd');
    d.el.querySelector('#drawer-done').addEventListener('click', d.close);
    d.el.querySelector('#drawer-clear').addEventListener('click', function () { clearAll(); d.close(); });
  });

  window.addEventListener('popstate', function () { render(); });

  render();
  if (location.hash === '#search') $('q').focus();
  // The bottom nav's Search item links here while you are already on Browse: only the hash changes, so focus the box again.
  window.addEventListener('hashchange', function () { if (location.hash === '#search') $('q').focus(); });
})();
