/* Gig detail (gig.html?id=): gallery, seller, package selector, reviews and more from the seller. */
(function () {
  'use strict';

  Store.init();
  UI.mount({ page: 'gig' });

  var $ = function (id) { return document.getElementById(id); };
  var esc = Util.esc;
  var q = UI.query();
  var id = Util.toId(q.get('id'));
  var gig = id ? Store.getGig(id) : undefined;
  var rootEl = $('gig-root');
  if (!gig) { rootEl.innerHTML = '<section class="section"></section>'; UI.notFound(rootEl.firstChild, 'gig'); return; }

  var viewer = Store.currentUser();
  var seller = Store.getUser(gig.sellerHandle);
  var owner = !!viewer && viewer.handle === gig.sellerHandle;
  var cat = Store.categories().filter(function (c) { return c.id === gig.category; })[0];
  var perHour = gig.unit === 'hour';
  document.title = gig.title + ' | Campus Gigs';

  // coming from Post a gig: confirm the save once, then tidy the address bar
  if (q.get('posted') === '1' || q.get('saved') === '1') {
    UI.toast(q.get('posted') === '1' ? 'Your gig is live!' : 'Changes saved');
    UI.setUrl('gig.html?id=' + gig.id + (q.get('pkg') ? '&pkg=' + encodeURIComponent(q.get('pkg')) : ''));
  }

  function fmtDate(iso) { return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
  function starRow(n) {
    var out = '';
    for (var i = 1; i <= 5; i++) out += Icons.svg(i <= n ? 'star-fill' : 'star', { size: 18, cls: i <= n ? '' : 'is-off' });
    return '<span class="stars stars--five" role="img" aria-label="' + n + ' out of 5 stars">' + out + '</span>';
  }
  function priceText(p) { return Util.formatPeso(p.price) + (perHour ? '/hr' : ''); }

  // ---------- breadcrumb: Home > Browse Gigs > category > title
  $('gig-crumbs').innerHTML = UI.breadcrumb([
    { label: 'Browse Gigs', href: 'browse.html' },
    { label: cat ? cat.name : 'Gig', href: 'browse.html?cat=' + encodeURIComponent(gig.category) },
    { label: gig.title }
  ]);

  // ---------- gallery: the cover plus two supporting pictures (click a thumbnail to show it).
  // Supporting pictures are photos of the seller's portfolio, then other gigs in the same category; any gap is a placeholder tile.
  var ids = SEED.categories.map(function (c) { return c.id; });
  var i0 = ids.indexOf(gig.category);
  var views = [gig.cover];
  function addView(c) { if (views.length < 3 && /^img:/.test(String(c)) && views.indexOf(c) < 0) views.push(c); }
  ((seller && seller.portfolio) || []).forEach(function (p) { addView(p.cover); });
  Store.allGigs().filter(function (g) { return g.category === gig.category && g.id !== gig.id; }).forEach(function (g) { addView(g.cover); });
  for (var k = 1; views.length < 3; k++) views.push('tile:' + ids[(i0 + k) % ids.length]);
  function renderGallery(active) {
    var fav = !!viewer && Store.isFavorite(viewer.handle, gig.id);   // read at draw time: the heart may have been toggled since the page loaded
    $('gallery').innerHTML = '<div class="gallery__main">' + UI.tile(views[active], null) +
      '<button class="gig-card__fav" type="button" data-fav="' + gig.id + '" aria-pressed="' + fav + '" aria-label="Save ' + esc(gig.title) + ' to favorites">' + Icons.svg(fav ? 'heart-fill' : 'heart', { size: 20 }) + '</button></div>' +
      '<div class="gallery__thumbs">' + views.map(function (v, i) {
        return '<button type="button" class="gallery__thumb" data-view="' + i + '" aria-pressed="' + (i === active) + '" aria-label="Show picture ' + (i + 1) + ' of 3">' + UI.tile(v, '') + '</button>';
      }).join('') + '</div>';
  }
  renderGallery(0);
  $('gallery').addEventListener('click', function (e) {
    var t = e.target.closest('[data-view]');
    if (t) renderGallery(Util.toInt(t.getAttribute('data-view'), 0, 0, 2));
  });
  UI.bindGigCards($('gallery'));

  // ---------- title, seller, description
  $('gig-title').textContent = gig.title;
  var sellerLink = seller ? 'seller.html?u=' + encodeURIComponent(seller.handle) : '';
  $('seller-strip').innerHTML = seller
    ? UI.avatar(seller, 56) + '<div class="seller-strip__who"><a class="seller-strip__name" href="' + sellerLink + '">' + esc(seller.name) + '</a>' +
      '<div class="seller-strip__meta">' + UI.stars(seller.rating, seller.ratingCount) + '<span class="caption">' + esc(seller.headline) + '</span></div></div>' +
      '<div class="seller-strip__actions"><a class="btn btn--outline btn--sm" href="' + sellerLink + '">View profile</a>' +
      (owner ? '' : '<button class="btn btn--outline btn--sm" type="button" id="msg-btn">' + Icons.svg('message', { size: 16 }) + 'Message</button>') + '</div>'
    : UI.avatar(null, 56) + '<div class="seller-strip__who"><strong>Former student</strong><span class="caption">This seller’s account is no longer active.</span></div>';
  var msg = $('msg-btn');
  if (msg) msg.addEventListener('click', function () {
    if (!viewer) location.href = 'signin.html?next=' + encodeURIComponent('gig.html?id=' + gig.id);
    else location.href = 'messages.html?with=' + encodeURIComponent(gig.sellerHandle);
  });
  $('gig-desc').textContent = gig.description;
  $('gig-skills').innerHTML = gig.skills.map(function (s) { return '<span class="chip chip--static">' + esc(s) + '</span>'; }).join('');

  // ---------- packages
  var pkgs = gig.packages;
  var wanted = q.get('pkg');
  var current = pkgs.filter(function (p) { return p.name === wanted; })[0] || pkgs[0];

  function orderUrl(p) { return 'order.html?gig=' + gig.id + '&pkg=' + encodeURIComponent(p.name); }
  function ctaHtml(p) {
    if (owner) return '<a class="btn btn--primary btn--block" href="post-gig.html?edit=' + gig.id + '">' + Icons.svg('pencil', { size: 18 }) + 'Edit gig</a>';
    return '<a class="btn btn--primary btn--block" id="continue-btn" href="' + esc(orderUrl(p)) + '">Continue (' + esc(priceText(p)) + ')</a>';
  }
  function renderPackage() {
    $('pkg-tabs').innerHTML = pkgs.map(function (p) {
      return '<button type="button" data-pkg="' + esc(p.name) + '" aria-pressed="' + (p === current) + '"' + (p === current ? ' class="is-active"' : '') + '>' + esc(p.name) + '</button>';
    }).join('');
    $('pkg-panel').innerHTML = '<p class="package-price">' + esc(priceText(current)) + '</p>' +
      '<ul class="package-facts">' +
      (perHour ? '<li>' + Icons.svg('clock', { size: 18 }) + 'Billed per hour</li>' :
        '<li>' + Icons.svg('clock', { size: 18 }) + current.days + (current.days === 1 ? ' day' : ' days') + ' delivery</li><li>' + Icons.svg('pencil', { size: 18 }) + current.revisions + (current.revisions === 1 ? ' revision' : ' revisions') + '</li>') +
      '</ul>' + (current.includes.length ? '<h3 class="package-h">What’s included</h3><ul class="plan-card__list">' + current.includes.map(function (t) { return '<li>' + Icons.svg('check-circle', { size: 20 }) + esc(t) + '</li>'; }).join('') + '</ul>' : '');
    $('pkg-cta').innerHTML = ctaHtml(current);
    $('gig-sticky').innerHTML = '<div><span class="caption">' + esc(current.name) + '</span><strong>' + esc(priceText(current)) + '</strong></div>' + ctaHtml(current).replace(' id="continue-btn"', '').replace('btn--block', '');
    $('pay-note').hidden = owner;
  }
  $('pkg-tabs').addEventListener('click', function (e) {
    var b = e.target.closest('[data-pkg]');
    if (!b) return;
    current = pkgs.filter(function (p) { return p.name === b.getAttribute('data-pkg'); })[0] || current;
    renderPackage();
  });
  // a signed-out visitor goes to sign-in first and comes straight back to this order
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="order.html"]');
    if (a && !Store.currentUser()) { e.preventDefault(); location.href = 'signin.html?next=' + encodeURIComponent(a.getAttribute('href')); }
  });
  renderPackage();
  $('gig-sticky').hidden = false;
  document.body.classList.add('has-sticky-bar');

  // ---------- reviews
  var reviews = Store.reviewsForGig(gig.id);
  $('rating-line').innerHTML = gig.ratingCount > 0
    ? starRow(Math.round(gig.rating)) + '<span class="rating-line__score">' + Number(gig.rating).toFixed(1) + '/5</span><span class="rating-line__note">Based on ' + esc(gig.ratingCount) + (gig.ratingCount === 1 ? ' review' : ' reviews') + '</span>'
    : '<span class="rating-line__note">No reviews yet</span>';
  $('review-list').innerHTML = reviews.length ? reviews.map(function (r) {
    var buyer = Store.getUser(r.buyer);
    return '<article class="review-item"><div class="review-item__who">' + UI.avatar(buyer, 36) + '<strong>' + esc(buyer ? buyer.name : 'Former student') + '</strong>' + starRow(r.stars) + '</div>' +
      '<p class="review-item__text">' + esc(r.text) + '</p><p class="caption">' + esc(fmtDate(r.createdAt)) + '</p></article>';
  }).join('') : '<p class="caption" style="margin-top:12px">Be the first to order and review this gig.</p>';

  // ---------- more from this seller
  var more = Store.gigsBySeller(gig.sellerHandle).filter(function (g) { return g.id !== gig.id; }).slice(0, 3);
  if (more.length) {
    $('more').hidden = false;
    $('more-grid').innerHTML = more.map(function (g) { return UI.gigCard(g, { variant: 'compact' }); }).join('');
    UI.bindGigCards($('more-grid'));
  }
})();
