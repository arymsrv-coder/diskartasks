/* Home page: categories, top-rated gigs, popular searches, testimonials carousel, calls to action. */
(function () {
  'use strict';

  Store.init();
  UI.mount({ page: 'home' });

  var esc = Util.esc;
  var user = Store.currentUser();

  // <span data-ico="name" data-size="20"> becomes the inline icon
  document.querySelectorAll('[data-ico]').forEach(function (el) {
    el.insertAdjacentHTML('afterbegin', Icons.svg(el.getAttribute('data-ico'), { size: Number(el.getAttribute('data-size')) || 24 }));
  });
  document.getElementById('ico-arrow').innerHTML = Icons.svg('arrow-right', { size: 20 });
  document.getElementById('how-play').innerHTML = Icons.svg('play', { size: 20 });

  // Hero collage and campus photo come from the image map (placeholders until real photos are dropped in images/)
  var frameAlts = { heroFrame1: 'Student working on a laptop', heroFrame2: 'Student smiling at the camera', heroFrame3: 'Student with a camera', heroFrame4: 'Student writing notes' };
  document.querySelectorAll('[data-frame]').forEach(function (el) {
    var key = el.getAttribute('data-frame');
    el.innerHTML = UI.tile(SEED.images[key], frameAlts[key]);
  });
  document.getElementById('campus-photo').insertAdjacentHTML('afterbegin', UI.tile(SEED.images.campus, 'The SLSU campus'));
  document.getElementById('how-media').insertAdjacentHTML('afterbegin', UI.tile(SEED.images.campusWalk, 'Students walking along a campus path'));

  // Proof row: a few real sellers and a count taken from the seed
  var reviews = Store.allGigs().reduce(function (n, g) { return n + g.ratingCount; }, 0);
  var proofUsers = ['paolo_d', 'bea_s', 'jaya_r'].map(Store.getUser).filter(Boolean);
  document.getElementById('hero-proof').innerHTML = '<span class="avatar-stack">' + proofUsers.map(function (u) { return UI.avatar(u, 28); }).join('') + '</span>' +
    '<span>' + (Math.floor(reviews / 100) * 100).toLocaleString('en-US') + '+ gigs completed, rated and reviewed</span>';

  // Popular Categories
  document.getElementById('categories').innerHTML = Store.categories().map(function (c) {
    return '<a class="cat-card cat-card--' + esc(c.id) + '" href="browse.html?cat=' + esc(c.id) + '">' + Icons.svg(c.icon, { size: 32 }) + '<span>' + esc(c.name) + '</span></a>';
  }).join('');

  // Top-Rated Gigs
  var topEl = document.getElementById('top-rated');
  topEl.innerHTML = Store.topRated(4).map(function (g) { return UI.gigCard(g); }).join('');
  UI.bindGigCards(topEl);

  // Popular right now: five sub-services from the header menu, with live counts
  var picks = [['design', 'Logo Design'], ['tech', 'Web Development'], ['writing', 'Thesis Proofreading'], ['tutoring', 'Math and Calculus'], ['admin', 'Data Entry']];
  document.getElementById('popular-now').innerHTML = picks.map(function (p) {
    var menu = SEED.navMenu.filter(function (m) { return m.cat === p[0]; })[0];
    var sub = menu && menu.subs.filter(function (s) { return s.label === p[1]; })[0];
    if (!sub) return '';
    var found = Store.listGigs({ cat: p[0], q: sub.q, perPage: 3 });
    var sellers = {};
    found.items.forEach(function (g) { sellers[g.sellerHandle] = true; });
    var stack = Object.keys(sellers).slice(0, 3).map(function (h) { return UI.avatar(Store.getUser(h), 28); }).join('');
    return '<a class="spec-card" href="browse.html?cat=' + esc(p[0]) + '&amp;q=' + encodeURIComponent(sub.q) + '"><span class="spec-card__title">' + esc(sub.label) + '</span>' +
      '<span class="spec-card__meta">' + found.total + (found.total === 1 ? ' gig' : ' gigs') + ' available<span class="avatar-stack">' + stack + '</span></span></a>';
  }).join('');

  // Video placeholder
  document.getElementById('how-play').addEventListener('click', function () {
    UI.modal({
      title: 'How Campus Gigs works',
      body: '<p>This demo has no video, so here is the whole story in three steps.</p><ol class="prose" style="list-style:decimal;padding-left:22px;margin-top:12px"><li><strong>Find</strong> a gig from a verified SLSU student.</li><li><strong>Connect</strong> by message and place your order.</li><li><strong>Get it done</strong> on campus, then leave a review.</li></ol>',
      actions: [{ label: 'Browse Gigs', variant: 'primary', onClick: function () { location.href = 'browse.html'; return false; } }, { label: 'Close' }]
    });
  });

  // Become a Seller: signed out -> sign up as a freelancer; buyer -> confirm, then post a gig; seller -> post a gig
  document.getElementById('become-seller').addEventListener('click', function () {
    var u = Store.currentUser();
    if (!u) { location.href = 'signup.html?role=seller'; return; }
    if (u.isSeller) { location.href = 'post-gig.html'; return; }
    UI.modal({
      title: 'Become a seller?',
      body: '<p>Your account will be able to post gigs and receive orders. You can still buy from other students as usual.</p>',
      actions: [
        { label: 'Not now' },
        { label: 'Become a seller', variant: 'primary', onClick: function () {
          var r = Store.becomeSeller(u.handle);
          if (r.ok) location.href = 'post-gig.html'; else UI.toast(r.error);
          return false;
        } }
      ]
    });
  });

  // Closing call to action
  if (user) {
    var cta = document.getElementById('cta-btn');
    cta.setAttribute('href', 'browse.html');
    cta.firstChild.textContent = 'Browse Gigs ';
    document.getElementById('cta-title').textContent = 'Ready for your next gig?';
  }

  // Testimonial carousel: dots, swipe, auto-advance that pauses on hover and focus and is off under reduced motion
  var tests = Store.testimonials();
  var colors = ['#2F5A66', '#C9855A', '#4F7C82', '#8E6C8A'];
  var slidesEl = document.getElementById('slides');
  var dotsEl = document.getElementById('dots');
  slidesEl.innerHTML = tests.map(function (t, i) {
    return '<figure class="slide" id="slide-' + i + '" role="group" aria-roledescription="slide" aria-label="' + (i + 1) + ' of ' + tests.length + '"' + (i ? ' hidden' : '') + '>' +
      Icons.svg('quote', { size: 32, cls: 'slide__quote' }) + '<blockquote>“' + esc(t.quote) + '”</blockquote>' +
      '<figcaption>' + UI.avatar({ name: t.name, avatarColor: colors[i % colors.length] }, 48) + '<span><strong>' + esc(t.name) + '</strong><br><span class="caption">' + esc(t.role) + '</span></span></figcaption></figure>';
  }).join('');
  dotsEl.innerHTML = tests.map(function (t, i) { return '<button type="button" class="dot" aria-label="Show testimonial ' + (i + 1) + '" data-i="' + i + '"></button>'; }).join('');

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // paused = pointer or focus is inside; userPaused = stopped by the button (and the starting state under reduced motion)
  var current = 0, timer = null, paused = false, userPaused = !!reduce;
  function show(i) {
    current = (i + tests.length) % tests.length;
    tests.forEach(function (t, n) { document.getElementById('slide-' + n).hidden = n !== current; });
    dotsEl.querySelectorAll('.dot').forEach(function (d, n) { d.setAttribute('aria-current', String(n === current)); });
  }
  var toggle = document.getElementById('carousel-toggle');
  // WCAG 2.2.2: moving content needs a way to stop it. While it rotates the region is silent; once stopped it announces changes.
  function syncToggle() {
    var running = !userPaused;
    toggle.innerHTML = Icons.svg(running ? 'pause' : 'play', { size: 18 });
    toggle.setAttribute('aria-label', running ? 'Pause testimonial rotation' : 'Play testimonial rotation');
    slidesEl.setAttribute('aria-live', running ? 'off' : 'polite');
  }
  toggle.addEventListener('click', function () { userPaused = !userPaused; syncToggle(); if (userPaused) stop(); else start(); });
  function start() { stop(); if (!paused && !userPaused) timer = setInterval(function () { show(current + 1); }, 6000); }
  function stop() { if (timer) { clearInterval(timer); timer = null; } }
  dotsEl.addEventListener('click', function (e) { var d = e.target.closest('.dot'); if (d) { show(Number(d.getAttribute('data-i'))); start(); } });
  var carousel = document.getElementById('carousel');
  ['mouseenter', 'focusin'].forEach(function (ev) { carousel.addEventListener(ev, function () { paused = true; stop(); }); });
  ['mouseleave', 'focusout'].forEach(function (ev) { carousel.addEventListener(ev, function () { paused = false; start(); }); });
  var x0 = null;
  carousel.addEventListener('pointerdown', function (e) { x0 = e.clientX; });
  carousel.addEventListener('pointerup', function (e) {
    if (x0 === null) return;
    var dx = e.clientX - x0; x0 = null;
    if (Math.abs(dx) > 40) { show(current + (dx < 0 ? 1 : -1)); start(); }
  });
  syncToggle();
  show(0);
  start();
})();
