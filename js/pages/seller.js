/* Seller profile (seller.html?u=handle): a long stacked page like the buyer profile. Visitors see Message and Follow;
   the owner sees Edit profile, Post a gig, edit/delete on their gigs, and an Orders received section. */
(function () {
  'use strict';

  Store.init();
  UI.mount({ page: 'seller' });

  var $ = function (id) { return document.getElementById(id); };
  var esc = Util.esc;
  var rootEl = $('seller-root');
  var q = UI.query();
  var handle = q.get('u');
  var seller = handle ? Store.getUser(handle) : undefined;
  if (!seller || !seller.isSeller) {           // unknown, missing or not a seller
    rootEl.innerHTML = '<div class="container section"></div>';
    UI.notFound(rootEl.firstChild, 'seller');
    return;
  }

  var viewer = Store.currentUser();
  var owner = !!viewer && viewer.handle === seller.handle;
  var me = function () { return Store.getUser(seller.handle) || seller; };
  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  function here() { return 'seller.html?u=' + encodeURIComponent(seller.handle); }
  function toSignIn() { location.href = 'signin.html?next=' + encodeURIComponent(here()); }
  function fmtDate(iso) { return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
  function pill(status) {
    return status === 'completed'
      ? '<span class="pill pill--done">' + Icons.svg('check', { size: 14 }) + 'Completed</span>'
      : '<span class="pill pill--progress">' + Icons.svg('clock', { size: 14 }) + 'In Progress</span>';
  }
  function starRow(n) {
    var out = '';
    for (var i = 1; i <= 5; i++) out += Icons.svg(i <= n ? 'star-fill' : 'star', { size: 18, cls: i <= n ? '' : 'is-off' });
    return '<span class="stars stars--five" role="img" aria-label="' + n + ' out of 5 stars">' + out + '</span>';
  }

  document.title = seller.name + ' (@' + seller.handle + ') | DiskarTasks';
  $('pf-arrow').innerHTML = Icons.svg('arrow-right', { size: 18 });
  $('gigs-title').textContent = owner ? 'My Gigs' : 'Gigs';
  if (owner) $('orders').hidden = false;

  // ---------- header
  function renderHead() {
    var u = me();
    var parts = u.joined.split('-');
    var joined = 'Joined ' + MONTHS[Number(parts[1]) - 1] + ' ' + parts[0];
    $('profile-cover').innerHTML = UI.tile(SEED.images.banner, '');
    $('p-avatar').innerHTML = UI.avatar(u, 120);
    $('p-handle').textContent = '@' + u.handle;
    $('p-headline').textContent = u.headline;
    var rating = u.ratingCount > 0 ? Icons.svg('star-fill', { size: 16, cls: 'text-star' }) + '<strong>' + Number(u.rating).toFixed(1) + '</strong> (' + esc(u.ratingCount) + (u.ratingCount === 1 ? ' review)' : ' reviews)') : 'No reviews yet';
    $('p-meta').innerHTML = '<span>' + rating + '</span><span>' + Icons.svg('clock', { size: 16 }) + esc(joined) + '</span><span id="follower-count">' + Icons.svg('users', { size: 16 }) + Store.followerCount(u.handle) + ' followers</span>';

    if (owner) {
      $('p-actions').innerHTML = '<button class="btn btn--outline" type="button" id="btn-edit">Edit profile</button><a class="btn btn--primary" href="post-gig.html">Post a gig</a>';
      $('btn-edit').addEventListener('click', function () { SettingsDrawer.open(me(), function () { renderHead(); renderAbout(); }); });
    } else {
      var following = !!viewer && Store.isFollowing(viewer.handle, u.handle);
      $('p-actions').innerHTML = '<button class="btn btn--primary" type="button" id="btn-message">Message</button>' +
        '<button class="btn btn--outline" type="button" id="btn-follow" aria-pressed="' + following + '">' + (following ? 'Following' : 'Follow') + '</button>';
      $('btn-message').addEventListener('click', function () {
        if (!viewer) toSignIn(); else location.href = 'messages.html?with=' + encodeURIComponent(u.handle);
      });
      $('btn-follow').addEventListener('click', function () {
        if (!viewer) { toSignIn(); return; }
        var on = Store.toggleFollow(viewer.handle, u.handle);
        this.setAttribute('aria-pressed', String(on));
        this.textContent = on ? 'Following' : 'Follow';
        $('follower-count').lastChild.textContent = Store.followerCount(u.handle) + ' followers';
        UI.toast(on ? 'You are now following @' + u.handle : 'Unfollowed @' + u.handle);
      });
    }
  }

  // ---------- nav and tab bar (anchor links, Settings and Log Out for the owner only)
  function renderNav() {
    var items = [['user', 'Profile', '#profile', 'profile'], ['briefcase', owner ? 'My Gigs' : 'Gigs', '#gigs', 'gigs'], ['image', 'Portfolio', '#portfolio', 'portfolio']];
    if (owner) items.push(['clock', 'Orders received', '#orders', 'orders']);
    $('profile-nav').innerHTML = items.map(function (it) {
      return '<li><a href="' + it[2] + '" data-section="' + it[3] + '">' + Icons.svg(it[0], { size: 20 }) + it[1] + '</a></li>';
    }).join('') + (owner
      ? '<li><button type="button" id="nav-settings">' + Icons.svg('settings', { size: 20 }) + 'Settings</button></li><li><button type="button" id="nav-logout">' + Icons.svg('logout', { size: 20 }) + 'Log Out</button></li>'
      : '');
    if (owner) {
      $('nav-settings').addEventListener('click', function () { SettingsDrawer.open(me(), function () { renderHead(); renderAbout(); }); });
      $('nav-logout').addEventListener('click', function () { Store.signOut(); location.href = 'index.html'; });
    }
    var tabs = [['About Me', 'about'], [owner ? 'My Gigs' : 'Gigs', 'gigs'], ['Reviews', 'reviews']];
    if (owner) tabs.push(['Orders', 'orders']);
    $('tabbar').innerHTML = tabs.map(function (t) { return '<a href="#' + t[1] + '" data-section="' + t[1] + '">' + t[0] + '</a>'; }).join('');
  }

  // ---------- about, portfolio
  function renderAbout() {
    var u = me();
    $('about-bio').textContent = u.bio || (owner ? 'You have not written a bio yet. Use Edit profile to add one.' : 'This seller has not written a bio yet.');
    $('about-skills').innerHTML = (u.skills || []).map(function (s) { return '<span class="chip chip--static">' + esc(s) + '</span>'; }).join('');
  }

  var showAllPortfolio = false;
  var pressed = {};
  function renderPortfolio() {
    var items = me().portfolio || [];
    var list = showAllPortfolio ? items : items.slice(0, 4);
    $('portfolio-grid').innerHTML = items.length ? list.map(function (p, i) {
      return '<figure class="portfolio-item">' + UI.tile(p.cover, '') +
        '<button class="gig-card__fav" type="button" data-pf="' + i + '" aria-pressed="' + !!pressed[i] + '" aria-label="Like ' + esc(p.title) + '">' + Icons.svg(pressed[i] ? 'heart-fill' : 'heart', { size: 20 }) + '</button>' +
        '<figcaption>' + esc(p.title) + '</figcaption></figure>';
    }).join('') : '<div class="empty-state">' + Icons.svg('image', { size: 40 }) + '<h3>No portfolio yet</h3><p>' + (owner ? 'Samples of your work will appear here.' : 'This seller has not added samples yet.') + '</p></div>';
    $('portfolio-more').hidden = items.length <= 4;
    $('portfolio-more').firstChild.textContent = showAllPortfolio ? 'Show less ' : 'See all ';
  }
  $('portfolio-more').addEventListener('click', function () { showAllPortfolio = !showAllPortfolio; renderPortfolio(); });
  $('portfolio-grid').addEventListener('click', function (e) {
    var b = e.target.closest('[data-pf]');
    if (!b) return;
    var i = b.getAttribute('data-pf');
    pressed[i] = !pressed[i];                       // portfolio samples are not gigs, so this heart is a demo-only toggle
    renderPortfolio();
    UI.toast(pressed[i] ? 'Liked (demo: portfolio likes are not saved)' : 'Like removed');
  });

  // ---------- gigs
  function renderGigs() {
    var gigs = Store.gigsBySeller(seller.handle);
    $('gig-rows').innerHTML = gigs.length ? gigs.map(function (g) {
      return '<div class="gig-row" data-gig="' + g.id + '">' + UI.gigCard(g, { variant: 'row' }) +
        (owner ? '<div class="gig-row__owner"><a class="btn btn--outline btn--sm" href="post-gig.html?edit=' + g.id + '" aria-label="Edit ' + esc(g.title) + '">' + Icons.svg('pencil', { size: 16 }) + 'Edit</a><button class="btn btn--outline btn--sm gig-row__delete" type="button" data-delete="' + g.id + '" aria-label="Delete ' + esc(g.title) + '">' + Icons.svg('trash', { size: 16 }) + 'Delete</button></div>' : '') + '</div>';
    }).join('') : '<div class="empty-state">' + Icons.svg('briefcase', { size: 40 }) + '<h3>No gigs yet</h3><p>' + (owner ? 'Post your first gig and start getting orders.' : 'This seller has not posted a gig yet.') + '</p>' + (owner ? '<a class="btn btn--primary" href="post-gig.html">Post a gig</a>' : '') + '</div>';
  }
  UI.bindGigCards($('gig-rows'));
  $('gig-rows').addEventListener('click', function (e) {
    var b = e.target.closest('[data-delete]');
    if (!b) return;
    var g = Store.getGig(Util.toInt(b.getAttribute('data-delete'), 0));
    if (!g) return;
    UI.modal({
      title: 'Delete this gig?',
      body: '<p>“' + esc(g.title) + '” will be removed from Browse. Orders already placed keep their record.</p>',
      actions: [
        { label: 'Cancel' },
        { label: 'Delete gig', variant: 'primary', onClick: function () {
          var r = Store.deleteGig(g.id, seller.handle);
          if (!r.ok) { UI.toast(r.error); return; }
          renderGigs(); renderHead(); UI.toast('Gig deleted');
        } }
      ]
    });
  });

  // ---------- reviews
  function renderReviews() {
    var list = Store.reviewsForSeller(seller.handle);
    $('review-list').innerHTML = list.length ? list.map(function (r) {
      var buyer = Store.getUser(r.buyer), gig = Store.getGig(r.gigId);
      return '<article class="review-item"><div class="review-item__who">' + UI.avatar(buyer, 36) + '<strong>' + esc(buyer ? buyer.name : 'Former student') + '</strong>' + starRow(r.stars) + '</div>' +
        '<p class="review-item__text">' + esc(r.text) + '</p><p class="caption">' + (gig ? '<a href="gig.html?id=' + gig.id + '">' + esc(gig.title) + '</a>' : 'A gig that is no longer listed') + ' · ' + esc(fmtDate(r.createdAt)) + '</p></article>';
    }).join('') : '<div class="empty-state">' + Icons.svg('star', { size: 40 }) + '<h3>No reviews yet</h3><p>Reviews appear here after buyers complete an order.</p></div>';
  }

  // ---------- orders received (owner)
  function orderRow(o) {
    var buyer = Store.getUser(o.buyer);
    return '<article class="order-row" data-order="' + esc(o.id) + '">' + UI.avatar(buyer, 56) +
      '<div class="order-row__main"><h3>' + esc(o.gigTitle) + '</h3><p class="caption">' + esc(Util.formatPeso(o.total)) + ' · ' + esc(o.pkg) + (o.qty > 1 ? ' × ' + o.qty : '') + ' · ' + esc(o.date) + ' ' + esc(o.time) + ' · from @' + esc(o.buyer) + '</p></div>' + pill(o.status) +
      (o.status === 'in_progress' ? '<button class="btn btn--primary btn--sm" type="button" data-complete="' + esc(o.id) + '" aria-label="Mark as completed: ' + esc(o.gigTitle) + ', order ' + esc(o.id) + '">Mark as completed</button>' : '<span></span>') + '</article>';
  }
  function renderOrders() {
    if (!owner) return;
    var list = Store.ordersReceived(seller.handle);
    $('order-list').innerHTML = list.length ? list.map(orderRow).join('') : '<div class="empty-state">' + Icons.svg('briefcase', { size: 40 }) + '<h3>No orders yet</h3><p>Orders from buyers will show up here.</p></div>';
  }
  $('order-list').addEventListener('click', function (e) {
    var b = e.target.closest('[data-complete]');
    if (!b) return;
    b.disabled = true;
    var r = Store.completeOrder(b.getAttribute('data-complete'), seller.handle);
    if (!r.ok) { b.disabled = false; UI.toast(r.error); return; }
    var row = b.closest('.order-row');
    row.outerHTML = orderRow(Store.getOrder(b.getAttribute('data-complete')));          // updated in place
    UI.toast('Order marked as completed');
  });

  // ---------- welcome banner
  if (owner && q.get('welcome') === '1') {
    $('welcome-slot').innerHTML = '<div class="welcome-banner" role="status"><div><h2>Welcome to DiskarTasks!</h2><p>Your seller page is ready. Post your first gig so students can find you.</p></div><a class="btn btn--primary" href="post-gig.html">Post your first gig</a></div>';
  }

  // ---------- follow the scroll
  function updateCurrent() {
    var ids = ['about', 'portfolio', 'gigs', 'reviews'].concat(owner ? ['orders'] : []);
    var line = Math.min(window.innerHeight * 0.4, 360), current = 'profile';
    ids.forEach(function (id) { if ($(id).getBoundingClientRect().top <= line) current = id; });
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4 && window.scrollY > 0) current = ids[ids.length - 1];
    Array.prototype.forEach.call(document.querySelectorAll('#profile-nav [data-section]'), function (a) {
      if (a.getAttribute('data-section') === current) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
    var tabCurrent = current === 'profile' || current === 'portfolio' ? 'about' : current;
    Array.prototype.forEach.call(document.querySelectorAll('#tabbar [data-section]'), function (a) {
      if (a.getAttribute('data-section') === tabCurrent) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
  }
  window.addEventListener('scroll', updateCurrent, { passive: true });
  window.addEventListener('hashchange', updateCurrent);

  renderHead();
  renderNav();
  renderAbout();
  renderPortfolio();
  renderGigs();
  renderReviews();
  renderOrders();
  updateCurrent();
})();
