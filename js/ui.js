/* UI: the shared page shell (header, mega menu, app bar, bottom navigation, footer), pop-ups (modal, drawer, toast,
   avatar menu, mega menu) and the small components every page uses. Needs the DOM; domain logic stays in Store.
   Static links are written as literal href attributes (never built from pieces) so tests/site.test.js can check their targets. */
(function (root) {
  'use strict';

  var doc = root.document;
  var Store = root.Store, Auth = root.Auth, Util = root.Util, Icons = root.Icons, SEED = root.SEED;

  var esc = Util.esc;
  function icon(name, size, cls) { return Icons.svg(name, { size: size || 20, cls: cls }); }
  function node(html) { var t = doc.createElement('template'); t.innerHTML = html.trim(); return t.content.firstChild; }
  function all(sel, scope) { return Array.prototype.slice.call((scope || doc).querySelectorAll(sel)); }
  function currentPage() { return (String(root.location.pathname || '').split('/').pop() || 'index.html') + (root.location.search || ''); }
  function signInUrl(next) { return 'signin.html?next=' + encodeURIComponent(next); }
  function go(url) { root.location.href = url; }

  var FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]):not([type="hidden"]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
  function focusables(el) { return all(FOCUSABLE, el).filter(function (n) { return n.offsetParent !== null || n === doc.activeElement; }); }

  // ------------------------------------------------------------------ popovers: only one open at a time
  var openPop = null;
  function openPopover(id, closeFn) {
    if (openPop && openPop.id !== id) { var prev = openPop; openPop = null; prev.close(); }
    openPop = { id: id, close: closeFn };
  }
  function popoverClosed(id) { if (openPop && openPop.id === id) openPop = null; }
  function closePopovers() { if (openPop) { var p = openPop; openPop = null; p.close(); } }

  // ------------------------------------------------------------------ modal and drawer (shared overlay stack)
  var stack = [];
  var uid = 0;

  function addOverlay(overlay, dialog) {
    closePopovers();
    var rec = { overlay: overlay, dialog: dialog, opener: doc.activeElement };
    stack.push(rec);
    doc.body.appendChild(overlay);
    doc.body.classList.add('is-locked');
    overlay.addEventListener('click', function (e) { if (e.target === overlay) closeOverlay(rec); });
    return rec;
  }

  function closeOverlay(rec) {
    var i = stack.indexOf(rec);
    if (i < 0) return;
    stack.splice(i, 1);
    rec.overlay.remove();
    if (!stack.length) doc.body.classList.remove('is-locked');
    if (rec.opener && doc.contains(rec.opener) && typeof rec.opener.focus === 'function') rec.opener.focus();
  }

  doc.addEventListener('keydown', function (e) {
    if (!stack.length) return;
    var top = stack[stack.length - 1];
    if (e.key === 'Escape') { e.preventDefault(); closeOverlay(top); return; }
    if (e.key !== 'Tab') return;
    var f = focusables(top.dialog);
    if (!f.length) { e.preventDefault(); top.dialog.focus(); return; }
    var first = f[0], last = f[f.length - 1];
    if (doc.activeElement === top.dialog || !top.dialog.contains(doc.activeElement)) { e.preventDefault(); (e.shiftKey ? last : first).focus(); }
    else if (e.shiftKey && doc.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && doc.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  // The first control inside `root` matching `selector` that is actually on screen. A hidden control (for example the
  // category menu that phones do not show) silently ignores focus(), which would leave focus behind the dialog.
  function firstVisible(root, selector, noFallback) {
    var list = root.querySelectorAll(selector);
    for (var i = 0; i < list.length; i++) if (list[i].getClientRects().length) return list[i];
    return noFallback ? null : root.querySelector('.modal__close');
  }

  function modal(opts) {
    var id = 'modal-title-' + (++uid);
    var overlay = node('<div class="overlay"><div class="modal" role="dialog" aria-modal="true" aria-labelledby="' + id + '" tabindex="-1">' +
      '<div class="modal__head"><h2 class="modal__title" id="' + id + '"></h2><button class="modal__close" type="button" aria-label="Close">' + icon('x', 20) + '</button></div>' +
      '<div class="modal__body"></div><div class="modal__actions"></div></div></div>');
    var dialog = overlay.firstChild;
    dialog.querySelector('.modal__title').textContent = opts.title || '';
    var body = dialog.querySelector('.modal__body');
    if (opts.body && opts.body.nodeType) body.appendChild(opts.body); else body.innerHTML = opts.body || '';
    var rec = addOverlay(overlay, dialog);
    var api = { el: dialog, close: function () { closeOverlay(rec); } };
    dialog.querySelector('.modal__close').addEventListener('click', api.close);
    var actions = dialog.querySelector(':scope > .modal__actions');   // the dialog's own bar, not a .modal__actions inside the body
    (opts.actions || []).forEach(function (a) {
      var b = doc.createElement('button');
      b.type = 'button';
      b.className = 'btn btn--' + (a.variant || 'outline');
      b.textContent = a.label;
      b.addEventListener('click', function () { if (!a.onClick || a.onClick() !== false) api.close(); });
      actions.appendChild(b);
    });
    if (!actions.children.length) actions.remove();
    var start = firstVisible(dialog, '.modal__body input, .modal__body select, .modal__body textarea, .modal__body button, .modal__body a[href]', true) ||
      dialog.querySelector('.modal__actions .btn:last-child') || dialog.querySelector('.modal__close');
    start.focus();
    return api;
  }

  function drawer(opts) {
    var id = 'drawer-title-' + (++uid);
    var overlay = node('<div class="overlay overlay--drawer"><aside class="drawer' + (opts.side === 'left' ? ' drawer--left' : '') + '" role="dialog" aria-modal="true" aria-labelledby="' + id + '" tabindex="-1">' +
      '<div class="drawer__head"><h2 class="drawer__title" id="' + id + '"></h2><button class="modal__close" type="button" aria-label="Close">' + icon('x', 20) + '</button></div>' +
      '<div class="drawer__body"></div></aside></div>');
    var dialog = overlay.firstChild;
    dialog.querySelector('.drawer__title').textContent = opts.title || '';
    var body = dialog.querySelector('.drawer__body');
    if (opts.body && opts.body.nodeType) body.appendChild(opts.body); else body.innerHTML = opts.body || '';
    var rec = addOverlay(overlay, dialog);
    var api = { el: dialog, close: function () { closeOverlay(rec); } };
    dialog.querySelector('.modal__close').addEventListener('click', api.close);
    firstVisible(dialog, '.drawer__body input, .drawer__body select, .drawer__body textarea, .drawer__body button, .drawer__body a[href]').focus();
    return api;
  }

  // ------------------------------------------------------------------ toast
  function toast(message, opts) {
    opts = opts || {};
    var host = doc.querySelector('.toast-host');
    if (!host) {
      host = doc.createElement('div');
      host.className = 'toast-host';
      host.setAttribute('role', 'status');
      host.setAttribute('aria-live', 'polite');
      doc.body.appendChild(host);
    }
    var el = doc.createElement('div');
    el.className = 'toast';
    var span = doc.createElement('span');
    span.textContent = message;
    el.appendChild(span);
    var timer;
    function remove() { clearTimeout(timer); if (el.parentNode) el.remove(); }
    if (opts.actionLabel) {
      var b = doc.createElement('button');
      b.type = 'button';
      b.textContent = opts.actionLabel;
      b.addEventListener('click', function () { remove(); if (opts.onAction) opts.onAction(); });
      el.appendChild(b);
    }
    host.appendChild(el);
    while (host.children.length > 3) host.removeChild(host.firstChild);
    timer = setTimeout(remove, opts.actionLabel ? 6000 : 4000);
    return { close: remove };
  }

  // ------------------------------------------------------------------ small components
  function hexLuminance(hex) {
    var c = [1, 3, 5].map(function (i) { var v = parseInt(hex.substr(i, 2), 16) / 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  }

  // Initials on a colour; the text colour is whichever of Ivory or Deep Teal has more contrast.
  function avatar(user, size) {
    var px = Number(size) > 0 ? Number(size) : 40;
    if (!user) return '<span class="avatar" aria-hidden="true" style="--size:' + px + 'px;background:#E9E4B8;color:#0B1D22">?</span>';
    var bg = /^#[0-9a-f]{6}$/i.test(user.avatarColor || '') ? user.avatarColor : '#2F5A66';
    var L = hexLuminance(bg);
    var NAVY_L = 0.0203;   // luminance of #082743
    var fg = (1.0 + 0.05) / (L + 0.05) >= (L + 0.05) / (NAVY_L + 0.05) ? '#FFFFFF' : '#082743';
    return '<span class="avatar" aria-hidden="true" style="--size:' + px + 'px;background:' + bg + ';color:' + fg + '">' + esc(Util.initials(user.name)) + '</span>';
  }

  function stars(rating, count) {
    if (count === 0 || !rating) return '<span class="stars"><span class="stars__count">New</span></span>';
    return '<span class="stars" aria-label="Rated ' + Number(rating).toFixed(1) + ' out of 5">' + icon('star-fill', 16) + '<span class="stars__val">' + Number(rating).toFixed(1) + '</span>' +
      (count !== undefined ? '<span class="stars__count">(' + esc(count) + ')</span>' : '') + '</span>';
  }

  function categoryOf(id) {
    for (var i = 0; i < SEED.categories.length; i++) if (SEED.categories[i].id === id) return SEED.categories[i];
    return SEED.categories[SEED.categories.length - 1];
  }

  function tileHtml(catId, alt) {
    var cat = categoryOf(catId);
    // Empty alt = decorative (the card or page already says what it is): hide it instead of an unnamed role=img.
    return '<div class="tile tile--' + esc(cat.id) + '"' + (alt ? ' role="img" aria-label="' + esc(alt) + '"' : ' aria-hidden="true"') + '>' + icon(cat.icon, 40) + '</div>';
  }

  // 'tile:<categoryId>' draws a placeholder; 'img:<file>' uses images/<file>; a data URL is used as is. Anything else, or a missing file, becomes a tile.
  function tile(coverKey, alt) {
    var key = String(coverKey === undefined || coverKey === null ? '' : coverKey);
    // alt === null asks for the photo's own description from SEED.photoAlt (used where the picture is content, not decoration).
    if (alt === null) alt = (/^img:/.test(key) && SEED.photoAlt && SEED.photoAlt[key.slice(4)]) || '';
    var m = /^tile:(\w+)$/.exec(key);
    if (m) return tileHtml(m[1], alt);
    // A photo carries the .tile class too, so every rule that sizes or positions a placeholder tile also fits a photo.
    if (/^img:[\w.\-]+$/.test(key)) return '<img class="tile tile--photo" src="images/' + esc(key.slice(4)) + '" alt="' + esc(alt) + '" loading="lazy" decoding="async" data-fallback="others">';
    if (/^data:image\/(png|jpe?g|webp);base64,[A-Za-z0-9+\/=]+$/.test(key)) return '<img class="tile tile--photo" src="' + esc(key) + '" alt="' + esc(alt) + '" data-fallback="others">';
    return tileHtml('others', alt);
  }

  doc.addEventListener('error', function (e) {
    var img = e.target;
    if (img && img.tagName === 'IMG' && img.getAttribute('data-fallback')) {
      var t = node(tileHtml(img.getAttribute('data-fallback'), img.getAttribute('alt') || ''));
      if (img.parentNode) img.parentNode.replaceChild(t, img);
    }
  }, true);

  function gigCard(gig, opts) {
    var variant = (opts && opts.variant) || 'grid';
    var user = Store.currentUser();
    var seller = Store.getUser(gig.sellerHandle);
    var fav = user ? Store.isFavorite(user.handle, gig.id) : false;
    var cls = 'gig-card' + (variant === 'compact' ? ' gig-card--compact' : variant === 'row' ? ' gig-card--row' : '');
    var sellerName = seller ? seller.name : 'Former student';
    var sellerLine = variant === 'compact' ? '' :
      variant === 'row' ? '<p class="gig-card__seller">by ' + esc(sellerName) + '</p>' :
      '<p class="gig-card__seller">' + avatar(seller, 22) + esc(sellerName) + '</p>';
    var actions = variant === 'row' ? '<div class="gig-card__actions"><a class="link-arrow" href="gig.html?id=' + gig.id + '" aria-label="View Gig: ' + esc(gig.title) + '">View Gig ' + icon('arrow-right', 18) + '</a></div>' : '';
    return '<article class="' + cls + '" data-gig-id="' + gig.id + '">' +
      '<div class="gig-card__media">' + tile(gig.cover, '') +
      '<button class="gig-card__fav" type="button" data-fav="' + gig.id + '" aria-pressed="' + fav + '" aria-label="Save ' + esc(gig.title) + ' to favorites">' + icon(fav ? 'heart-fill' : 'heart', 20) + '</button></div>' +
      '<div class="gig-card__body"><h3 class="gig-card__title"><a href="gig.html?id=' + gig.id + '">' + esc(gig.title) + '</a></h3>' + sellerLine +
      '<div class="gig-card__foot">' + stars(gig.rating, gig.ratingCount) + '<span class="gig-card__price">' + esc(Store.priceLabel(gig)) + '</span></div>' + actions + '</div></article>';
  }

  // One delegated listener per root: the heart toggles favorites (signed-out visitors go to sign-in and come back).
  // Everything else on a card is the stretched title link. Fires `cg:favorite` ({gigId, on}) on the card for pages that need it.
  function bindGigCards(rootEl) {
    if (!rootEl || rootEl.getAttribute('data-cards-bound')) return;
    rootEl.setAttribute('data-cards-bound', '1');
    rootEl.addEventListener('click', function (e) {
      var btn = e.target.closest ? e.target.closest('[data-fav]') : null;
      if (!btn || !rootEl.contains(btn)) return;
      e.preventDefault();
      var user = Store.currentUser();
      if (!user) { go(signInUrl(currentPage())); return; }
      var id = Util.toInt(btn.getAttribute('data-fav'), 0);
      if (!Store.getGig(id)) { toast('That gig is no longer available.'); return; }
      var on = Store.toggleFavorite(user.handle, id);
      btn.setAttribute('aria-pressed', String(on));
      btn.innerHTML = icon(on ? 'heart-fill' : 'heart', 20);
      toast(on ? 'Added to favorites' : 'Removed from favorites');
      var card = btn.closest('.gig-card');
      if (card) card.dispatchEvent(new root.CustomEvent('cg:favorite', { bubbles: true, detail: { gigId: id, on: on } }));
    });
  }

  function query() { return new root.URLSearchParams(root.location.search); }
  // The address bar is cosmetic. Some browsers throw a SecurityError from the History API on file:// pages, which must
  // never stop a filter, tab or thread from working, so every page goes through this instead of calling history directly.
  // Links (on=true) or unlinks an error message from the field it describes, keeping any hint already attached.
  function describe(el, id, on) {
    if (!el) return;
    var ids = (el.getAttribute('aria-describedby') || '').split(/\s+/).filter(function (x) { return x && x !== id; });
    if (on) ids.push(id);
    if (ids.length) el.setAttribute('aria-describedby', ids.join(' ')); else el.removeAttribute('aria-describedby');
  }
  function setUrl(url, push) { try { root.history[push ? 'pushState' : 'replaceState'](null, '', url); } catch (e) { /* leave the address bar as it is */ } }

  function notFound(rootEl, what) {
    rootEl.innerHTML = '<div class="empty-state">' + icon('search', 40) + '<h1>We couldn’t find that ' + esc(what) + '</h1>' +
      '<p>The link may be old, or the ' + esc(what) + ' may have been removed.</p><a class="btn btn--primary" href="browse.html">Browse Gigs</a></div>';
  }

  function breadcrumb(items) {
    var html = '<nav class="breadcrumb" aria-label="Breadcrumb"><ol><li><a href="index.html" aria-label="Home">' + icon('home', 18) + '</a></li>';
    (items || []).forEach(function (it, i) {
      var last = i === items.length - 1;
      html += '<li>' + icon('chevron-right', 16) + (last || !it.href ? '<span' + (last ? ' aria-current="page"' : '') + '>' + esc(it.label) + '</span>' : '<a href="' + esc(it.href) + '">' + esc(it.label) + '</a>') + '</li>';
    });
    return html + '</ol></nav>';
  }

  function ctaBand(o) {
    return '<section class="cta-band' + (o.variant === 'card' ? ' cta-band--card' : '') + ' on-dark"><h2>' + esc(o.title) + '</h2>' +
      (o.text ? '<p>' + esc(o.text) + '</p>' : '') + '<a class="btn btn--light" href="' + esc(o.href) + '">' + esc(o.label) + '</a></section>';
  }

  function sellerCard(user) {
    var gigs = Store.gigsBySeller(user.handle);
    var from = gigs.length ? 'from ' + Util.formatPeso(Math.min.apply(null, gigs.map(Store.minPrice))) : '';
    var rating = user.ratingCount > 0 ? '<span>' + icon('star-fill', 16, 'text-star') + Number(user.rating).toFixed(1) + ' (' + esc(user.ratingCount) + ')</span>' : '<span>New seller</span>';
    return '<article class="seller-card"><div class="seller-card__top">' + avatar(user, 56) + '<div><div class="seller-card__name">' + esc(user.name) +
      ' <span class="badge badge--verified">' + icon('shield-check', 16) + 'SLSU verified</span></div><p class="seller-card__headline">' + esc(user.headline) + '</p></div></div>' +
      '<div class="seller-card__meta"><span>' + icon('pin', 16) + 'SLSU Main Campus</span>' + rating + '<span>' + icon('briefcase', 16) + gigs.length + (gigs.length === 1 ? ' gig' : ' gigs') + '</span>' + (from ? '<span>' + esc(from) + '</span>' : '') + '</div>' +
      '<div class="seller-card__chips">' + (user.skills || []).slice(0, 3).map(function (s) { return '<span class="chip chip--static">' + esc(s) + '</span>'; }).join('') + '</div>' +
      (user.bio ? '<p class="seller-card__bio">' + esc(user.bio) + '</p>' : '') +
      '<a class="btn btn--primary btn--sm" style="justify-self:start" href="seller.html?u=' + encodeURIComponent(user.handle) + '" aria-label="View profile of ' + esc(user.name) + '">View profile</a></article>';
  }

  // Wires every .acc inside root: header buttons toggle aria-expanded and the panel's hidden attribute; arrow keys move between headers.
  function accordion(rootEl, opts) {
    var single = !(opts && opts.single === false);
    var lists = all('.acc', rootEl);
    if (rootEl.classList && rootEl.classList.contains('acc')) lists.push(rootEl);
    lists.forEach(function (acc) {
      if (acc.getAttribute('data-acc-ready')) return;
      acc.setAttribute('data-acc-ready', '1');
      var buttons = function () { return all('.acc__btn', acc); };
      function set(btn, open) {
        btn.setAttribute('aria-expanded', String(open));
        var panel = doc.getElementById(btn.getAttribute('aria-controls'));
        if (panel) panel.hidden = !open;
      }
      acc.addEventListener('click', function (e) {
        var btn = e.target.closest('.acc__btn');
        if (!btn || !acc.contains(btn)) return;
        var open = btn.getAttribute('aria-expanded') !== 'true';
        if (open && single) buttons().forEach(function (b) { if (b !== btn) set(b, false); });
        set(btn, open);
      });
      acc.addEventListener('keydown', function (e) {
        var btn = e.target.closest('.acc__btn');
        if (!btn) return;
        var list = buttons(), i = list.indexOf(btn), to = -1;
        if (e.key === 'ArrowDown') to = (i + 1) % list.length;
        else if (e.key === 'ArrowUp') to = (i - 1 + list.length) % list.length;
        else if (e.key === 'Home') to = 0;
        else if (e.key === 'End') to = list.length - 1;
        if (to >= 0) { e.preventDefault(); list[to].focus(); }
      });
    });
  }

  // ------------------------------------------------------------------ placeholder policy modals
  var POLICIES = {
    privacy: ['Privacy Policy (demo)', '<div class="prose"><p>DiskarTasks is a course project. Everything you enter stays in this browser: nothing is sent to a server, sold or shared.</p><h2>What is stored</h2><ul><li>Your demo account, orders, messages and favorites, in your browser’s storage.</li><li>Nothing else. You can erase it any time with Reset demo data in Settings.</li></ul></div>'],
    terms: ['Terms of Service (demo)', '<div class="prose"><p>This is a demo for a UI/UX course, so there is no real contract and no real payment.</p><ul><li>Be kind and honest with fellow students.</li><li>Do not enter a real password. Accounts here are not secure.</li><li>Orders are marked “Pay on meet-up (demo)” and no money moves.</li></ul></div>'],
    accessibility: ['Accessibility', '<div class="prose"><p>DiskarTasks is built to be used with a keyboard, a screen reader and at any screen size.</p><ul><li>Every control has a visible focus ring and a text label.</li><li>Pop-ups trap focus and close with Esc.</li><li>Text meets a 4.5:1 contrast ratio, including text on photos, and the pages reflow to a 320 px wide screen without side-scrolling.</li><li>Photos have descriptions for screen readers, and form errors are read out with the field they belong to.</li><li>A light/dark switch in the header changes the palette; both palettes keep text above 4.5:1.</li><li>The testimonial carousel has a Pause button, and it stays still if your system asks for reduced motion.</li></ul><p>Found a problem? Write to us through the <a href="about.html#contact">contact form</a>.</p></div>'],
    guidelines: ['Seller guidelines (demo)', '<div class="prose"><p>A few habits that earn five-star reviews.</p><ul><li>Describe each package honestly and keep delivery days realistic.</li><li>Reply to messages within a day.</li><li>Meet buyers in public campus spaces.</li><li>Mark an order completed once the buyer has your work.</li></ul></div>'],
    sitemap: ['Sitemap', '<ul class="prose" style="list-style:none;padding:0"><li><a href="index.html">Home</a></li><li><a href="browse.html">Browse Gigs</a></li><li><a href="pricing.html">Pricing</a></li><li><a href="about.html">About &amp; Contact</a></li><li><a href="signin.html">Sign In</a></li><li><a href="signup.html">Sign Up</a></li><li><a href="profile.html">My Profile</a></li><li><a href="messages.html">Messages</a></li><li><a href="post-gig.html">Post a gig</a></li></ul>']
  };

  function policy(kind) {
    var p = POLICIES[kind];
    if (!p) return;
    modal({ title: p[0], body: p[1], actions: [{ label: 'Close', variant: 'primary' }] });
  }

  // ------------------------------------------------------------------ shell: header, mega menu, avatar menu
  function becomeSellerHref(user) { return user ? 'post-gig.html' : 'signup.html?role=seller'; }

  function navLink(href, label, page, current) {
    return '<a class="nav__link" href="' + href + '"' + (page === current ? ' aria-current="page"' : '') + '>' + label + '</a>';
  }

  function scopeOptions() {
    return '<option value="">All categories</option>' + SEED.categories.map(function (c) { return '<option value="' + esc(c.id) + '">' + esc(c.name) + '</option>'; }).join('');
  }

  function megaHtml(user) {
    var cats = SEED.categories;
    var tabs = '', panels = '';
    cats.forEach(function (c, i) {
      var menu = SEED.navMenu.filter(function (m) { return m.cat === c.id; })[0] || { subs: [] };
      tabs += '<button class="mega__cat" type="button" role="tab" id="mega-tab-' + c.id + '" aria-controls="mega-panel-' + c.id + '" aria-selected="' + (i === 0) + '" tabindex="' + (i === 0 ? 0 : -1) + '" data-cat="' + c.id + '"><span>' + esc(c.name) + '</span>' + icon('chevron-right', 18) + '</button>';
      panels += '<div class="mega__grid" role="tabpanel" id="mega-panel-' + c.id + '" aria-labelledby="mega-tab-' + c.id + '"' + (i === 0 ? '' : ' hidden') + '>' +
        '<a class="mega__link mega__link--all" href="browse.html?cat=' + esc(c.id) + '"><strong>All ' + esc(c.name) + '</strong><span>See every gig in this category</span></a>' +
        menu.subs.map(function (s) { return '<a class="mega__link" href="browse.html?cat=' + esc(c.id) + '&amp;q=' + encodeURIComponent(s.q) + '"><strong>' + esc(s.label) + '</strong><span>' + esc(s.desc) + '</span></a>'; }).join('') + '</div>';
    });
    return '<div class="container mega__inner"><div class="mega__cats" role="tablist" aria-orientation="vertical" aria-label="Categories">' + tabs + '</div><div class="mega__subs">' + panels + '</div>' +
      '<div class="mega__foot"><a href="browse.html">See all gigs ' + icon('arrow-right', 16) + '</a><a href="' + becomeSellerHref(user) + '">Become a seller ' + icon('arrow-right', 16) + '</a><a href="pricing.html">Pricing ' + icon('arrow-right', 16) + '</a></div></div>';
  }

  function accountItems(user) {
    var items = [['user', 'My Profile', 'profile.html'], ['briefcase', 'My Orders', 'profile.html#orders'], ['message', 'Messages', 'messages.html']];
    if (user.isSeller) {
      var h = encodeURIComponent(user.handle);
      items.push(['tag', 'My Seller Page', 'seller.html?u=' + h], ['clock', 'Orders received', 'seller.html?u=' + h + '#orders'], ['plus', 'Post a gig', 'post-gig.html']);
    }
    return items;
  }

  function headerHtml(user, page) {
    var actions;
    if (user) {
      actions = (user.isSeller ? '<a class="btn btn--primary btn--sm" href="post-gig.html">Post a gig</a>' : '') +
        '<a class="icon-btn" href="profile.html#favorites" aria-label="Favorites">' + icon('heart', 22) + '</a>' +
        '<a class="icon-btn" href="messages.html" data-msg-link aria-label="Messages">' + icon('message', 22) + '<span class="badge-dot" data-unread hidden></span></a>' +
        '<div class="menu-wrap"><button class="avatar-btn" type="button" id="avatar-btn" aria-haspopup="menu" aria-expanded="false" aria-controls="avatar-menu" aria-label="Account menu for ' + esc(user.name) + '">' + avatar(user, 40) + '</button>' +
        '<div class="menu" id="avatar-menu" role="menu" aria-labelledby="avatar-btn" hidden><div class="menu__head"><strong>' + esc(user.name) + '</strong><span>@' + esc(user.handle) + '</span></div>' +
        accountItems(user).map(function (it) { return '<a class="menu__item" role="menuitem" href="' + esc(it[2]) + '">' + icon(it[0], 20) + it[1] + '</a>'; }).join('') +
        '<div class="menu__sep" role="separator"></div><button class="menu__item" type="button" role="menuitem" data-logout>' + icon('logout', 20) + 'Log out</button></div></div>';
    } else {
      actions = '<a class="btn btn--outline btn--sm" href="signin.html">Sign In</a><a class="btn btn--amber btn--sm" href="signup.html">Sign Up</a>';
    }
    return '<header class="site-header" id="site-header"><div class="container site-header__inner">' +
      '<a class="logo" href="index.html" aria-label="DiskarTasks home">' + Icons.logo(48) + '</a>' +
      '<nav class="nav" aria-label="Primary"><div class="nav__item" id="nav-browse"><a class="nav__link" href="browse.html"' + (page === 'browse' ? ' aria-current="page"' : '') + '>Browse Gigs</a>' +
      '<button class="nav__chev" type="button" id="mega-btn" aria-expanded="false" aria-controls="mega" aria-label="Browse categories">' + icon('chevron-down', 18) + '</button></div>' +
      navLink('pricing.html', 'Pricing', 'pricing', page) + navLink('about.html', 'About &amp; Contact', 'about', page) + '</nav>' +
      '<form class="search" role="search" data-search action="browse.html" method="get"><label class="sr-only" for="hdr-cat">Search in</label><select class="search__scope" id="hdr-cat" name="cat">' + scopeOptions() + '</select>' +
      '<label class="sr-only" for="hdr-q">Search gigs</label><input class="search__input" id="hdr-q" name="q" type="search" placeholder="Search gigs..." autocomplete="off">' +
      '<button class="search__btn" type="submit" aria-label="Search">' + icon('search', 20) + '</button></form>' +
      '<div class="site-header__actions">' + themeButtonHtml() + actions + '</div></div>' +
      '<div class="mega" id="mega" hidden>' + megaHtml(user) + '</div></header>';
  }

  // ---------- light / dark mode: the colourful palette is the default; the choice is remembered in this browser
  var THEME_KEY = 'campusgigs.v1.theme';
  function currentTheme() { return doc.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'; }
  function setTheme(t) {
    if (t === 'dark') doc.documentElement.setAttribute('data-theme', 'dark'); else doc.documentElement.removeAttribute('data-theme');
    try { root.localStorage.setItem(THEME_KEY, t); } catch (e) { /* the choice just will not be remembered */ }
    all('[data-theme-toggle]').forEach(syncThemeButton);
  }
  function syncThemeButton(b) {
    var dark = currentTheme() === 'dark';
    b.setAttribute('aria-pressed', String(dark));
    b.innerHTML = icon(dark ? 'sun' : 'moon', 22);
    b.setAttribute('title', dark ? 'Switch to light mode' : 'Switch to dark mode');
  }
  function themeButtonHtml() { return '<button class="icon-btn theme-toggle" type="button" data-theme-toggle aria-label="Dark mode" aria-pressed="false"></button>'; }

  function appBarHtml() {
    return '<div class="appbar" id="appbar"><div class="container appbar__inner"><a class="logo logo--sm" href="index.html" aria-label="DiskarTasks home">' + Icons.logo(38) + '</a>' +
      '<div class="appbar__actions">' + themeButtonHtml() + '<button class="icon-btn" type="button" data-open-menu="search" aria-label="Search gigs">' + icon('search', 22) + '</button>' +
      '<button class="icon-btn" type="button" data-open-menu aria-label="Open menu" aria-haspopup="dialog">' + icon('menu', 24) + '</button></div></div></div>';
  }

  function bottomNavHtml(user, page) {
    function item(href, ic, label, key, extra) {
      var on = page === key;
      return '<li><a class="bottomnav__item" href="' + href + '"' + (on ? ' aria-current="page"' : '') + '>' + icon(on && ic === 'home' ? 'home-fill' : ic, 24) + '<span>' + label + '</span>' + (extra || '') + '</a></li>';
    }
    var plusHref = user ? 'post-gig.html' : 'signup.html';
    return '<nav class="bottomnav" aria-label="Mobile">' + '<ul class="bottomnav__list">' +
      item('index.html', 'home', 'Home', 'home') + item('browse.html#search', 'search', 'Search', 'browse') +
      '<li><a class="bottomnav__plus" href="' + plusHref + '" aria-label="' + (user && user.isSeller ? 'Post a gig' : user ? 'Post a gig' : 'Sign up') + '">' + icon('plus', 26) + '</a></li>' +
      item('messages.html', 'message', 'Messages', 'messages', '<span class="badge-dot" data-unread hidden></span>') +
      item(user ? 'profile.html' : 'signin.html', 'user', 'Profile', 'profile') + '</ul></nav>';
  }

  function footerHtml(user) {
    var group = function (title, links) {
      return '<nav class="site-footer__group" aria-label="' + title + '"><h2 class="site-footer__h">' + title + '</h2><ul>' + links.map(function (l) {
        return '<li>' + (l.policy ? '<button type="button" data-policy="' + l.policy + '">' + l.label + '</button>' : '<a href="' + l.href + '">' + l.label + '</a>') + '</li>';
      }).join('') + '</ul></nav>';
    };
    var social = [['facebook', 'Facebook'], ['instagram', 'Instagram'], ['x-social', 'X'], ['youtube', 'YouTube']].map(function (s) {
      return '<button class="social" type="button" data-social="' + s[1] + '" aria-label="' + s[1] + '">' + icon(s[0], 20) + '</button>';
    }).join('');
    return '<footer class="site-footer on-dark"><div class="container">' +
      '<div class="site-footer__top"><div class="site-footer__brand"><a class="logo logo--light" href="index.html" aria-label="DiskarTasks home">' + Icons.logo(56) + '</a>' +
      '<p class="site-footer__tag">Aral sa Umaga, Diskarte All Day—The Free-Yuyan Way.</p><div class="site-footer__follow"><span>Follow Us</span><div class="socials">' + social + '</div></div></div>' +
      '<form class="newsletter" novalidate><label class="newsletter__label" for="nl-email">Get the latest updates</label><p class="newsletter__hint">Stay in the loop with DiskarTasks.</p>' +
      '<div class="newsletter__row"><input class="input" id="nl-email" type="email" placeholder="Enter your email" autocomplete="email"><button class="btn btn--light btn--icon" type="submit" aria-label="Subscribe">' + icon('arrow-right', 22) + '</button></div>' +
      '<p class="newsletter__msg" role="status" aria-live="polite"></p></form></div>' +
      '<div class="site-footer__cols">' +
      group('For Buyers', [{ href: 'browse.html', label: 'Browse Gigs' }, { href: 'about.html#how', label: 'How it works' }, { href: 'pricing.html', label: 'Pricing' }, { href: 'profile.html#orders', label: 'My Orders' }]) +
      group('For Sellers', [{ href: becomeSellerHref(user), label: 'Become a Seller' }, { href: 'post-gig.html', label: 'Post a gig' }, { href: 'pricing.html?for=sellers', label: 'Seller fees' }, { policy: 'guidelines', label: 'Seller guidelines' }]) +
      group('Resources', [{ href: 'about.html#contact', label: 'Help &amp; support' }, { href: 'about.html#faq', label: 'FAQ' }, { href: 'index.html#community', label: 'Success stories' }]) +
      group('Company', [{ href: 'about.html', label: 'About Us' }, { href: 'about.html#contact', label: 'Contact Us' }]) + '</div>' +
      '<div class="site-footer__legal"><p>© 2026 DiskarTasks. All rights reserved.</p><div><button type="button" data-policy="privacy">Privacy Policy</button><button type="button" data-policy="terms">Terms of Service</button>' +
      '<button type="button" data-policy="accessibility">Accessibility</button><button type="button" data-policy="sitemap">Sitemap</button><a href="images/CREDITS.txt">Photo credits</a></div></div></div></footer>';
  }

  function storageNotice(mode) {
    if (mode === 'window-name') return '<div class="storage-notice" role="status">Your browser keeps this demo’s data only while this tab stays open. Open the site in Chrome, Edge or Safari to keep it between visits.</div>';
    if (mode === 'none') return '<div class="storage-notice storage-notice--warn" role="status">Storage is blocked in this browser, so nothing you do is saved from page to page. Try Chrome, Edge or Safari.</div>';
    return '';
  }

  // ---- behaviours
  function wireSearch(form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var q = form.querySelector('[name="q"]').value.trim();
      var catEl = form.querySelector('[name="cat"]');
      var parts = [];
      if (q) parts.push('q=' + encodeURIComponent(q));
      if (catEl && catEl.value) parts.push('cat=' + encodeURIComponent(catEl.value));
      go('browse.html' + (parts.length ? '?' + parts.join('&') : ''));
    });
  }

  function wireMega() {
    var item = doc.getElementById('nav-browse'), btn = doc.getElementById('mega-btn'), mega = doc.getElementById('mega');
    if (!item || !btn || !mega) return;
    var openTimer, closeTimer;
    var hoverOpened = false;   // true while the menu is open only because the pointer rested on it
    var tabs = all('.mega__cat', mega);

    function showCat(tab) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        var panel = doc.getElementById(t.getAttribute('aria-controls'));
        if (panel) panel.hidden = !on;
      });
    }
    function open() {
      clearTimeout(closeTimer);
      if (!mega.hidden) return;
      openPopover('mega', close);
      mega.hidden = false;
      btn.setAttribute('aria-expanded', 'true');
    }
    function close() {
      clearTimeout(openTimer);
      hoverOpened = false;
      if (mega.hidden) return;
      mega.hidden = true;
      btn.setAttribute('aria-expanded', 'false');
      popoverClosed('mega');
    }
    item.addEventListener('mouseenter', function () {
      clearTimeout(closeTimer);
      openTimer = setTimeout(function () { var was = mega.hidden; open(); if (was) hoverOpened = true; }, 120);
    });
    item.addEventListener('mouseleave', function () { clearTimeout(openTimer); closeTimer = setTimeout(close, 200); });
    mega.addEventListener('mouseenter', function () { clearTimeout(closeTimer); });
    mega.addEventListener('mouseleave', function () { clearTimeout(openTimer); closeTimer = setTimeout(close, 200); });
    btn.addEventListener('click', function (e) {
      // A click right after the pointer opened the menu means "keep it open", not "close it again".
      if (!mega.hidden) { if (hoverOpened) { hoverOpened = false; return; } close(); return; }
      hoverOpened = false;
      open();
      if (e.detail === 0) (tabs.filter(function (t) { return t.tabIndex === 0; })[0] || tabs[0]).focus();   // Enter or Space: land inside the menu
    });
    function leaving(e) { var to = e.relatedTarget; if (!mega.hidden && to && !item.contains(to) && !mega.contains(to)) close(); }
    item.addEventListener('focusout', leaving);
    mega.addEventListener('focusout', leaving);
    btn.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); open(); (tabs.filter(function (t) { return t.tabIndex === 0; })[0] || tabs[0]).focus(); }
    });
    tabs.forEach(function (t) {
      t.addEventListener('mouseenter', function () { showCat(t); });
      t.addEventListener('focus', function () { showCat(t); });
      t.addEventListener('click', function () { showCat(t); });
    });
    mega.addEventListener('keydown', function (e) {
      var t = e.target.closest ? e.target.closest('.mega__cat') : null;
      if (t) {
        var i = tabs.indexOf(t), to = -1;
        if (e.key === 'ArrowDown') to = (i + 1) % tabs.length;
        else if (e.key === 'ArrowUp') to = (i - 1 + tabs.length) % tabs.length;
        if (to >= 0) { e.preventDefault(); tabs[to].focus(); }
        else if (e.key === 'ArrowRight') { var link = doc.querySelector('#' + t.getAttribute('aria-controls') + ' a'); if (link) { e.preventDefault(); link.focus(); } }
      } else if (e.key === 'ArrowLeft') {
        var panel = e.target.closest('.mega__grid');
        var tab = panel && doc.getElementById(panel.getAttribute('aria-labelledby'));
        if (tab) { e.preventDefault(); tab.focus(); }
      }
    });
    doc.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape' || mega.hidden || stack.length) return;
      var inside = mega.contains(doc.activeElement) || doc.activeElement === btn;
      close();
      if (inside) btn.focus();
    });
    doc.addEventListener('click', function (e) { if (!mega.hidden && !item.contains(e.target) && !mega.contains(e.target)) close(); });
  }

  function wireAvatarMenu() {
    var btn = doc.getElementById('avatar-btn'), menu = doc.getElementById('avatar-menu');
    if (!btn || !menu) return;
    function items() { return all('.menu__item', menu); }
    function open() {
      openPopover('avatar', close);
      menu.hidden = false;
      btn.setAttribute('aria-expanded', 'true');
    }
    function close() {
      if (menu.hidden) return;
      menu.hidden = true;
      btn.setAttribute('aria-expanded', 'false');
      popoverClosed('avatar');
    }
    btn.addEventListener('click', function () { if (menu.hidden) { open(); items()[0].focus(); } else close(); });
    btn.addEventListener('keydown', function (e) { if (e.key === 'ArrowDown') { e.preventDefault(); if (menu.hidden) open(); items()[0].focus(); } });
    menu.addEventListener('keydown', function (e) {
      var list = items(), i = list.indexOf(doc.activeElement), to = -1;
      if (e.key === 'ArrowDown') to = (i + 1) % list.length;
      else if (e.key === 'ArrowUp') to = (i - 1 + list.length) % list.length;
      else if (e.key === 'Home') to = 0;
      else if (e.key === 'End') to = list.length - 1;
      if (to >= 0) { e.preventDefault(); list[to].focus(); }
    });
    doc.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !menu.hidden && !stack.length) { close(); btn.focus(); } });
    doc.addEventListener('click', function (e) { if (!menu.hidden && !menu.contains(e.target) && !btn.contains(e.target)) close(); });
    menu.addEventListener('focusout', function (e) { if (!menu.hidden && e.relatedTarget && !menu.contains(e.relatedTarget) && e.relatedTarget !== btn) close(); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a[href]')) close(); });
    var out = menu.querySelector('[data-logout]');
    if (out) out.addEventListener('click', function () { Store.signOut(); go('index.html'); });
  }

  function menuDrawerBody(user) {
    var cats = SEED.categories.map(function (c, i) {
      var m = SEED.navMenu.filter(function (x) { return x.cat === c.id; })[0] || { subs: [] };
      return '<div class="acc__item"><h3><button class="acc__btn" type="button" id="dm-b' + i + '" aria-expanded="false" aria-controls="dm-p' + i + '">' + esc(c.name) + icon('chevron-down', 20) + '</button></h3>' +
        '<div class="acc__panel menu-links" id="dm-p' + i + '" role="region" aria-labelledby="dm-b' + i + '" hidden><a href="browse.html?cat=' + esc(c.id) + '">All ' + esc(c.name) + '</a>' +
        m.subs.map(function (s) { return '<a href="browse.html?cat=' + esc(c.id) + '&amp;q=' + encodeURIComponent(s.q) + '">' + esc(s.label) + '</a>'; }).join('') + '</div></div>';
    }).join('');
    var account = user
      ? '<p class="menu-label">Signed in as @' + esc(user.handle) + '</p><div class="menu-links">' + accountItems(user).map(function (it) { return '<a href="' + esc(it[2]) + '">' + esc(it[1]) + '</a>'; }).join('') + '<button type="button" data-logout>Log out</button></div>'
      : '<div class="menu-actions"><a class="btn btn--outline btn--block" href="signin.html">Sign In</a><a class="btn btn--amber btn--block" href="signup.html">Sign Up</a></div>';
    return '<form class="search search--drawer" role="search" data-search action="browse.html" method="get"><label class="sr-only" for="dm-cat">Search in</label><select class="search__scope" id="dm-cat" name="cat">' + scopeOptions() + '</select>' +
      '<label class="sr-only" for="dm-q">Search gigs</label><input class="search__input" id="dm-q" name="q" type="search" placeholder="Search gigs..." autocomplete="off"><button class="search__btn" type="submit" aria-label="Search">' + icon('search', 20) + '</button></form>' +
      '<p class="menu-label">Browse Gigs</p><div class="acc">' + cats + '</div>' +
      '<div class="menu-links menu-links--main"><a href="pricing.html">Pricing</a><a href="about.html">About &amp; Contact</a></div>' + account +
      '<div class="menu-legal"><button type="button" data-policy="privacy">Privacy Policy</button><button type="button" data-policy="terms">Terms of Service</button><button type="button" data-policy="accessibility">Accessibility</button><button type="button" data-policy="sitemap">Sitemap</button></div>';
  }

  function openMenuDrawer(focusSearch) {
    var user = Store.currentUser();
    var d = drawer({ title: 'Menu', side: 'left', body: menuDrawerBody(user) });
    accordion(d.el);
    d.el.addEventListener('click', function (e) { if (e.target.closest('a[href]')) d.close(); });
    wireSearch(d.el.querySelector('[data-search]'));
    all('[data-policy]', d.el).forEach(function (b) { b.addEventListener('click', function () { policy(b.getAttribute('data-policy')); }); });
    var out = d.el.querySelector('[data-logout]');
    if (out) out.addEventListener('click', function () { Store.signOut(); go('index.html'); });
    if (focusSearch) d.el.querySelector('.search__input').focus();
    return d;
  }

  function wireFooter() {
    all('[data-policy]', doc.querySelector('.site-footer')).forEach(function (b) { b.addEventListener('click', function () { policy(b.getAttribute('data-policy')); }); });
    all('[data-social]').forEach(function (b) { b.addEventListener('click', function () { toast('Demo: placeholder link'); }); });
    var form = doc.querySelector('.newsletter');
    var msg = form.querySelector('.newsletter__msg'), input = form.querySelector('input');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var r = Store.subscribeNewsletter(input.value);
      msg.className = 'newsletter__msg' + (r.ok ? '' : ' is-error');
      if (r.ok) { msg.textContent = r.already ? 'You’re already on the list.' : 'Thanks, you’re on the list.'; input.value = ''; input.removeAttribute('aria-invalid'); }
      else { msg.textContent = r.error; input.setAttribute('aria-invalid', 'true'); }
    });
  }

  // Re-reads the unread count and updates every Messages badge (header, bottom navigation).
  function refreshBadges() {
    var user = Store.currentUser();
    var n = user ? Store.unreadCount(user.handle) : 0;
    all('[data-unread]').forEach(function (b) {
      b.hidden = n === 0;
      b.textContent = n > 99 ? '99+' : String(n);
    });
    all('[data-msg-link]').forEach(function (a) { a.setAttribute('aria-label', n ? 'Messages, ' + n + ' unread' : 'Messages'); });
  }

  // Re-draws the signed-in user's avatar, name and handle in the header and its account menu (after Settings saves a new name).
  function refreshAccount() {
    var user = Store.currentUser();
    var btn = doc.getElementById('avatar-btn');
    if (!user || !btn) return;
    btn.innerHTML = avatar(user, 40);
    btn.setAttribute('aria-label', 'Account menu for ' + user.name);
    var head = doc.querySelector('#avatar-menu .menu__head');
    if (head) head.innerHTML = '<strong></strong><span></span>';
    if (head) { head.firstChild.textContent = user.name; head.lastChild.textContent = '@' + user.handle; }
  }

  function mount(opts) {
    opts = opts || {};
    if (doc.getElementById('site-header')) return;
    if (!Store.storageMode()) Store.init();   // a page may have called Store.init() already
    var user = Store.currentUser();
    var page = opts.page;

    doc.body.insertAdjacentHTML('afterbegin',
      '<a class="skip-link" href="#main">Skip to content</a>' + storageNotice(Store.storageMode()) + headerHtml(user, page) + appBarHtml());
    var main = doc.getElementById('main');
    if (opts.crumbs && opts.crumbs.length && main) {
      main.insertAdjacentHTML('afterend', '<div class="breadcrumb-strip"><div class="container">' + breadcrumb(opts.crumbs) + '</div></div>');
    }
    if (!opts.hideFooter) doc.body.insertAdjacentHTML('beforeend', footerHtml(user));
    doc.body.insertAdjacentHTML('beforeend', bottomNavHtml(user, page));
    if (!doc.querySelector('.toast-host')) doc.body.insertAdjacentHTML('beforeend', '<div class="toast-host" role="status" aria-live="polite"></div>');

    // Coming back to a page with the browser's Back button can restore it from the back/forward cache exactly as it was
    // left (signed in after logging out, a Publish button still disabled). Reload so it reflects the stored state.
    root.addEventListener('pageshow', function (e) { if (e.persisted) root.location.reload(); });

    all('[data-search]').forEach(wireSearch);
    wireMega();
    wireAvatarMenu();
    if (!opts.hideFooter) wireFooter();
    all('[data-theme-toggle]').forEach(function (b) { syncThemeButton(b); b.addEventListener('click', function () { setTheme(currentTheme() === 'dark' ? 'light' : 'dark'); }); });
    all('[data-open-menu]', doc.getElementById('appbar')).forEach(function (b) {
      b.addEventListener('click', function () { openMenuDrawer(b.getAttribute('data-open-menu') === 'search'); });
    });

    var bars = [doc.getElementById('site-header'), doc.getElementById('appbar')];
    function onScroll() { var y = root.scrollY || doc.documentElement.scrollTop; bars.forEach(function (b) { b.classList.toggle('is-scrolled', y > 8); }); }
    root.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    refreshBadges();
  }

  root.UI = {
    mount: mount, toast: toast, modal: modal, drawer: drawer, policy: policy, accordion: accordion,
    breadcrumb: breadcrumb, ctaBand: ctaBand, sellerCard: sellerCard, avatar: avatar, stars: stars, tile: tile,
    gigCard: gigCard, bindGigCards: bindGigCards, query: query, setUrl: setUrl, describe: describe, setTheme: setTheme, theme: currentTheme, notFound: notFound, refreshBadges: refreshBadges,
    refreshAccount: refreshAccount
  };
})(typeof window !== 'undefined' ? window : this);
