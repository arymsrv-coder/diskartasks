/* Pricing (pricing.html?for=buyers|sellers). Everything shown is mock data from SEED.pricing; plan buttons lead to sign-up. */
(function () {
  'use strict';

  Store.init();
  UI.mount({ page: 'pricing', crumbs: [{ label: 'Pricing' }] });

  var $ = function (id) { return document.getElementById(id); };
  var esc = Util.esc;
  var P = SEED.pricing;
  var q = UI.query();
  var audience = q.get('for') === 'sellers' || location.hash === '#sellers' ? 'sellers' : 'buyers';   // anything else is Buyers

  function cell(v) {
    if (v === true) return '<td>' + Icons.svg('check-circle', { size: 22 }) + '<span class="sr-only">Included</span></td>';
    if (v === false) return '<td><span class="sr-only">Not included</span></td>';
    return '<td class="' + (/^\d|%/.test(v) ? 'is-strong' : 'is-text') + '">' + esc(v) + '</td>';
  }

  function render() {
    var a = P[audience];
    var role = audience === 'sellers' ? 'seller' : 'buyer';

    // toggle
    Array.prototype.forEach.call($('audience').children, function (b) {
      var on = b.getAttribute('data-audience') === audience;
      b.setAttribute('aria-pressed', String(on));
      b.classList.toggle('is-active', on);
    });
    $('switch-text').textContent = audience === 'sellers' ? 'Looking to hire?' : 'Looking to sell?';
    $('switch-btn').textContent = audience === 'sellers' ? 'Switch to Buyers' : 'Switch to Sellers';

    // two plan cards; the second is the popular one
    $('plans').innerHTML = a.plans.map(function (p, i) {
      var popular = i === 1;
      return '<article class="plan-card' + (popular ? ' plan-card--popular' : '') + '">' + (popular ? '<span class="badge badge--popular">Popular</span>' : '') +
        '<h3>' + esc(p.name) + '</h3><p class="plan-card__blurb">' + esc(p.blurb) + '</p>' +
        '<p class="plan-card__price">' + esc(p.price) + '</p><p class="caption">' + esc(p.fee) + '</p>' +
        '<a class="btn ' + (popular ? 'btn--primary' : 'btn--outline') + ' btn--block" href="signup.html?role=' + role + '">' + esc(p.cta) + '</a>' +
        '<ul class="plan-card__list">' + p.includes.map(function (t) { return '<li>' + Icons.svg('check-circle', { size: 20 }) + esc(t) + '</li>'; }).join('') + '</ul></article>';
    }).join('');

    // key features: the section id says which audience it is
    $('features').innerHTML = '<div class="table-scroll keytable-wrap" id="' + audience + '" role="region" aria-labelledby="features-title" tabindex="0"><table class="keytable">' +
      '<colgroup><col><col><col class="keytable__col--hl"></colgroup>' +
      '<thead><tr><th scope="col" style="text-align:left;font-size:28px;line-height:36px" id="features-title">Key Features</th>' +
      a.plans.map(function (p, i) {
        return '<th scope="col">' + esc(p.name) + '<small>' + esc(p.price) + '</small>' +
          '<a class="btn btn--sm ' + (i === 1 ? 'btn--primary' : 'btn--outline') + ' keytable__cta" href="signup.html?role=' + role + '" aria-label="Sign up for ' + esc(p.name) + '">Sign up</a></th>';
      }).join('') + '</tr></thead><tbody>' +
      a.features.map(function (g) {
        return '<tr class="keytable__group"><th scope="colgroup" colspan="3">' + esc(g.group) + '</th></tr>' +
          g.rows.map(function (r) { return '<tr><th scope="row">' + esc(r.label) + '</th>' + cell(r.a) + cell(r.b) + '</tr>'; }).join('');
      }).join('') + '</tbody></table></div>';

    $('stat').innerHTML = Icons.svg('trending-up', { size: 28 }) + '<p>' + (audience === 'sellers'
      ? 'Sellers who offer all three packages get ordered more often (demo figure).'
      : 'Students who compare three packages choose the right gig more often (demo figure).') + '</p>';
  }

  function setAudience(next) {
    audience = next;
    UI.setUrl('pricing.html' + (next === 'sellers' ? '?for=sellers' : ''));
    render();
  }
  $('audience').addEventListener('click', function (e) {
    var b = e.target.closest('[data-audience]');
    if (b) setAudience(b.getAttribute('data-audience'));
  });
  $('switch-btn').addEventListener('click', function () { setAudience(audience === 'sellers' ? 'buyers' : 'sellers'); });

  $('pricing-faq').innerHTML = P.faq.map(function (f, i) {
    return '<div class="acc__item"><h3><button class="acc__btn" type="button" id="pf' + i + 'b" aria-expanded="false" aria-controls="pf' + i + 'p">' + esc(f.q) + Icons.svg('chevron-down', { size: 20 }) + '</button></h3>' +
      '<div class="acc__panel" id="pf' + i + 'p" role="region" aria-labelledby="pf' + i + 'b" hidden>' + esc(f.a) + '</div></div>';
  }).join('');
  UI.accordion($('pricing-faq'));

  $('pricing-cta').innerHTML = UI.ctaBand({
    title: 'The talent your campus needs is ready when you are', text: 'Join DiskarTasks today and connect with fellow SLSU students.',
    label: Store.currentUser() ? 'Browse Gigs' : 'Get started for free', href: Store.currentUser() ? 'browse.html' : 'signup.html'
  });

  render();
  if (location.hash === '#sellers') { var el = $('sellers'); if (el) el.scrollIntoView(); }
})();
