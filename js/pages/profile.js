/* Buyer profile: one long page (orders, favorites, reviews). The left nav and the tab bar are anchor links that scroll to their
   sections and follow the scroll; Settings opens the slide-in drawer. Also holds the review modal. */
(function () {
  'use strict';

  Store.init();
  var viewer = Auth.require();            // signed out (or a stale session) goes to sign-in and comes back here
  if (!viewer) return;
  UI.mount({ page: 'profile' });

  var $ = function (id) { return document.getElementById(id); };
  var esc = Util.esc;
  var handle = viewer.handle;
  var me = function () { return Store.getUser(handle) || viewer; };
  var statusFilter = '';
  var showAllReviews = false;

  function fmtDate(iso) { return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
  function pill(status) {
    return status === 'completed'
      ? '<span class="pill pill--done">' + Icons.svg('check', { size: 14 }) + 'Completed</span>'
      : '<span class="pill pill--progress">' + Icons.svg('clock', { size: 14 }) + 'In Progress</span>';
  }
  function emptyState(icon, title, text, withBrowse) {
    return '<div class="empty-state">' + Icons.svg(icon, { size: 40 }) + '<h3>' + esc(title) + '</h3><p>' + esc(text) + '</p>' + (withBrowse ? '<a class="btn btn--primary" href="browse.html">Browse Gigs</a>' : '') + '</div>';
  }

  // ---------- header and nav
  function renderHead() {
    var u = me();
    $('profile-cover').innerHTML = UI.tile(SEED.images.banner, '');
    $('p-avatar').innerHTML = UI.avatar(u, 120);
    $('p-handle').textContent = '@' + u.handle;
    $('p-headline').textContent = u.name + ' · ' + u.headline;
  }

  function renderNav() {
    var u = me(), h = encodeURIComponent(u.handle);
    var items = [
      ['user', 'Profile', '#profile', 'profile'], ['briefcase', 'My Orders', '#orders', 'orders'], ['heart', 'Favorites', '#favorites', 'favorites']
    ];
    if (u.isSeller) items.push(['tag', 'Seller page', 'seller.html?u=' + h, null], ['clock', 'Orders received', 'seller.html?u=' + h + '#orders', null]);
    $('profile-nav').innerHTML = items.map(function (it) {
      return '<li><a href="' + esc(it[2]) + '"' + (it[3] ? ' data-section="' + it[3] + '"' : '') + '>' + Icons.svg(it[0], { size: 20 }) + it[1] + '</a></li>';
    }).join('') +
      '<li><button type="button" id="nav-settings">' + Icons.svg('settings', { size: 20 }) + 'Settings</button></li>' +
      '<li><button type="button" id="nav-logout">' + Icons.svg('logout', { size: 20 }) + 'Log Out</button></li>';
    $('nav-settings').addEventListener('click', openSettings);
    $('nav-logout').addEventListener('click', function () { Store.signOut(); location.href = 'index.html'; });
  }

  function openSettings() { SettingsDrawer.open(me(), function () { renderHead(); renderNav(); }); }
  $('p-edit').addEventListener('click', openSettings);

  // ---------- orders
  function orderRow(o) {
    var seller = Store.getUser(o.seller);
    return '<article class="order-row" data-order="' + esc(o.id) + '">' + UI.avatar(seller, 56) +
      '<div class="order-row__main"><h3>' + esc(o.gigTitle) + '</h3><p class="caption">' + esc(Util.formatPeso(o.total)) + ' · by @' + esc(o.seller) + '</p></div>' +
      pill(o.status) +
      '<div class="order-row__actions">' +
      (o.status === 'completed' && !o.reviewed ? '<button class="btn btn--primary btn--sm" type="button" data-review="' + esc(o.id) + '" aria-label="Leave a review for ' + esc(o.gigTitle) + '">Leave a review</button>' : '') +
      '<button class="btn btn--outline btn--sm" type="button" data-details="' + esc(o.id) + '" aria-label="View details for ' + esc(o.gigTitle) + '">View Details ' + Icons.svg('arrow-right', { size: 16 }) + '</button></div></article>';
  }

  function renderOrders() {
    var all = Store.ordersOf(handle);
    var list = statusFilter ? all.filter(function (o) { return o.status === statusFilter; }) : all;
    $('order-list').innerHTML = !all.length ? emptyState('briefcase', 'No orders yet', 'When you order a gig it will show up here.', true)
      : !list.length ? emptyState('briefcase', 'Nothing here', 'You have no ' + (statusFilter === 'completed' ? 'completed' : 'in-progress') + ' orders right now.', false)
      : list.map(orderRow).join('');
  }

  $('order-chips').addEventListener('click', function (e) {
    var c = e.target.closest('.chip');
    if (!c) return;
    statusFilter = c.getAttribute('data-status');
    Array.prototype.forEach.call($('order-chips').querySelectorAll('.chip'), function (x) {
      var on = x === c;
      x.setAttribute('aria-pressed', String(on));
      x.classList.toggle('chip--active', on);
    });
    renderOrders();
  });

  $('order-list').addEventListener('click', function (e) {
    var r = e.target.closest('[data-review]');
    if (r) { openReviewModal(r.getAttribute('data-review'), refreshAll); return; }
    var b = e.target.closest('[data-details]');
    if (b) openDetails(b.getAttribute('data-details'));
  });

  function openDetails(orderId) {
    var o = Store.getOrder(orderId);
    if (!o) return;
    var gig = Store.getGig(o.gigId);
    var rows = [
      ['Order number', o.id], ['Seller', '@' + o.seller], ['Package', o.pkg + (o.qty > 1 ? ' × ' + o.qty : '')],
      ['Date', o.date], ['Time', o.time], ['Payment', o.payment], ['Notes', o.notes || 'None'], ['Total', Util.formatPeso(o.total)]
    ];
    var actions = [{ label: 'Close' }];
    if (gig) actions.unshift({ label: 'View gig', onClick: function () { location.href = 'gig.html?id=' + gig.id; return false; } });
    if (o.status === 'completed' && !o.reviewed) actions.push({ label: 'Leave a review', variant: 'primary', onClick: function () { setTimeout(function () { openReviewModal(o.id, refreshAll); }, 0); } });
    UI.modal({
      title: o.gigTitle,
      body: '<p style="margin-bottom:12px">' + pill(o.status) + '</p><dl class="detail-list">' + rows.map(function (r) { return '<dt>' + esc(r[0]) + '</dt><dd>' + esc(r[1]) + '</dd>'; }).join('') + '</dl>',
      actions: actions
    });
  }

  // ---------- review modal
  function openReviewModal(orderId, onDone) {
    var o = Store.getOrder(orderId);
    if (!o) return;
    var stars = [5, 4, 3, 2, 1].map(function (n) {
      return '<input type="radio" name="stars" id="rs' + n + '" value="' + n + '"><label for="rs' + n + '" title="' + n + (n === 1 ? ' star' : ' stars') + '"><span class="sr-only">' + n + (n === 1 ? ' star' : ' stars') + '</span>' + Icons.svg('star', { size: 32 }) + '</label>';
    }).join('');
    var m = UI.modal({
      title: 'Leave a review',
      body: '<form class="review-form" novalidate><p>How was “' + esc(o.gigTitle) + '”?</p>' +
        '<fieldset class="field"><legend class="field__label">Your rating</legend><div class="rating-input">' + stars + '</div></fieldset>' +
        '<div class="field"><label for="rv-text">Your review</label><textarea class="input textarea" id="rv-text" maxlength="500" placeholder="Share what went well"></textarea></div>' +
        '<p class="field__error" id="rv-error" role="alert" hidden></p>' +
        '<div class="modal__actions"><button class="btn btn--outline" type="button" id="rv-cancel">Cancel</button><button class="btn btn--primary" type="submit" id="rv-submit">Submit review</button></div></form>',
      actions: []
    });
    var form = m.el.querySelector('.review-form');
    var saving = false;
    // The radios sit in reverse DOM order (5..1) so the CSS can fill stars up to the chosen one, which would make the
    // arrow keys run backwards: Right/Up must raise the rating and Left/Down lower it, as the stars read left to right.
    form.addEventListener('keydown', function (e) {
      var up = e.key === 'ArrowRight' || e.key === 'ArrowUp', down = e.key === 'ArrowLeft' || e.key === 'ArrowDown';
      if ((!up && !down) || !e.target.matches || !e.target.matches('input[name="stars"]')) return;
      e.preventDefault();
      var now = Number(e.target.value);
      var next = form.querySelector('#rs' + Math.max(1, Math.min(5, now + (up ? 1 : -1))));
      next.checked = true;
      next.focus();
    });
    m.el.querySelector('#rv-cancel').addEventListener('click', m.close);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (saving) return;
      saving = true;
      var btn = m.el.querySelector('#rv-submit');
      btn.disabled = true;
      var checked = form.querySelector('input[name="stars"]:checked');
      var r = Store.addReview({ orderId: orderId, buyer: handle, stars: checked ? checked.value : '', text: form.querySelector('#rv-text').value });
      if (!r.ok) {
        var err = m.el.querySelector('#rv-error');
        err.innerHTML = Icons.svg('x-circle', { size: 18 }) + '<span>' + esc(r.error) + '</span>';
        err.hidden = false;
        if (/already reviewed/i.test(r.error)) { onDone && onDone(); return; }   // stays disabled: there is nothing to retry
        saving = false;
        btn.disabled = false;
        return;
      }
      m.close();
      UI.toast('Thanks for your review!');
      if (onDone) onDone();
    });
  }

  // ---------- favorites
  function renderFavorites() {
    var favs = Store.favoritesOf(handle);
    $('fav-grid').classList.toggle('fav-grid--empty', !favs.length);
    $('fav-grid').innerHTML = favs.length ? favs.map(function (g) {
      return '<div class="fav-thumb" data-gig-id="' + g.id + '"><a class="fav-thumb__img" href="gig.html?id=' + g.id + '">' + UI.tile(g.cover, g.title) + '</a>' +
        '<button class="gig-card__fav" type="button" data-unfav="' + g.id + '" aria-pressed="true" aria-label="Remove ' + esc(g.title) + ' from favorites">' + Icons.svg('heart-fill', { size: 20 }) + '</button>' +
        '<p class="fav-thumb__title">' + esc(g.title) + '</p></div>';
    }).join('') : emptyState('heart', 'No favorites yet', 'Tap the heart on any gig to save it here.', true);
  }

  $('fav-grid').addEventListener('click', function (e) {
    var b = e.target.closest('[data-unfav]');
    if (!b) return;
    var id = Util.toInt(b.getAttribute('data-unfav'), 0);
    Store.toggleFavorite(handle, id);
    renderFavorites();
    UI.toast('Removed from favorites', { actionLabel: 'Undo', onAction: function () { Store.toggleFavorite(handle, id); renderFavorites(); } });
  });

  // ---------- reviews
  function starRow(n) {
    var out = '';
    for (var i = 1; i <= 5; i++) out += Icons.svg(i <= n ? 'star-fill' : 'star', { size: 18, cls: i <= n ? '' : 'is-off' });
    return '<span class="stars stars--five" role="img" aria-label="' + n + ' out of 5 stars">' + out + '</span>';
  }

  function renderReviews() {
    var all = Store.reviewsBy(handle);
    var list = showAllReviews ? all : all.slice(0, 3);
    $('review-list').innerHTML = !all.length ? emptyState('star', 'No reviews yet', 'After an order is completed you can leave a review here.', false)
      : list.map(function (r) {
        var gig = Store.getGig(r.gigId);
        return '<article class="review-item">' + starRow(r.stars) + '<p class="review-item__text">' + esc(r.text) + '</p><p class="caption">' +
          (gig ? '<a href="gig.html?id=' + gig.id + '">' + esc(gig.title) + '</a>' : 'A gig that is no longer listed') + ' · ' + esc(fmtDate(r.createdAt)) + '</p></article>';
      }).join('');
    var more = $('see-all-reviews');
    more.hidden = all.length <= 3;
    more.firstChild.textContent = showAllReviews ? 'Show less ' : 'See all ';
  }
  $('rev-arrow').innerHTML = Icons.svg('arrow-right', { size: 18 });
  $('see-all-reviews').addEventListener('click', function () { showAllReviews = !showAllReviews; renderReviews(); });

  function refreshAll() { renderOrders(); renderReviews(); }

  // ---------- follow the scroll: highlight the section in view in the nav and the tab bar
  function updateCurrent() {
    // the section under a reading line 40% down the viewport is current; the bottom of the page counts as the last section
    var line = Math.min(window.innerHeight * 0.4, 360), current = 'profile';
    ['orders', 'favorites', 'reviews'].forEach(function (id) { if ($(id).getBoundingClientRect().top <= line) current = id; });
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4 && window.scrollY > 0) current = 'reviews';
    var tabCurrent = current === 'profile' ? 'orders' : current;
    Array.prototype.forEach.call(document.querySelectorAll('#profile-nav [data-section]'), function (a) {
      if (a.getAttribute('data-section') === current) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
    Array.prototype.forEach.call(document.querySelectorAll('#tabbar [data-section]'), function (a) {
      if (a.getAttribute('data-section') === tabCurrent) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
  }
  // three rectangle reads per scroll event: cheap enough to run on every event, and it stays correct when timers are throttled
  window.addEventListener('scroll', updateCurrent, { passive: true });
  window.addEventListener('hashchange', updateCurrent);

  renderHead();
  renderNav();
  renderOrders();
  renderFavorites();
  renderReviews();
  updateCurrent();
})();
