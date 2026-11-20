/* Order page (order.html?gig=<id>&pkg=<name>). Needs sign-in. One order per click: Place order disables itself first. */
(function () {
  'use strict';

  Store.init();
  var viewer = Auth.require();               // signed out goes to sign-in and comes back to this exact order URL
  if (!viewer) return;
  UI.mount({ page: 'order' });

  var $ = function (id) { return document.getElementById(id); };
  var esc = Util.esc;
  var q = UI.query();
  var gig = Store.getGig(Util.toId(q.get('gig')));
  var rootEl = $('order-root');
  if (!gig) { rootEl.innerHTML = '<section class="section"></section>'; UI.notFound(rootEl.firstChild, 'gig'); return; }

  var seller = Store.getUser(gig.sellerHandle);
  var perHour = gig.unit === 'hour';
  var pkg = gig.packages.filter(function (p) { return p.name === q.get('pkg'); })[0] || gig.packages[0];   // an unknown package falls back to the first
  var qty = 1;
  document.title = 'Order: ' + gig.title + ' | Campus Gigs';

  $('order-crumbs').innerHTML = UI.breadcrumb([
    { label: 'Browse Gigs', href: 'browse.html' },
    { label: gig.title, href: 'gig.html?id=' + gig.id },
    { label: 'Order' }
  ]);

  // a seller cannot order their own gig
  if (viewer.handle === gig.sellerHandle) {
    document.querySelector('.order-layout').innerHTML = '<div class="empty-state">' + Icons.svg('x-circle', { size: 40 }) +
      '<h2>You can’t order your own gig.</h2><p>Share the link with a classmate instead, or manage this gig from your seller page.</p>' +
      '<a class="btn btn--primary" href="gig.html?id=' + gig.id + '">Back to the gig</a></div>';
    document.querySelector('.order-title').hidden = true;
    return;
  }

  // ---------- summary
  function total() { return pkg.price * qty; }
  function renderSummary() {
    $('summary-cover').innerHTML = UI.tile(gig.cover, '');
    $('summary-title').textContent = gig.title;
    $('summary-seller').innerHTML = seller ? UI.avatar(seller, 28) + '<span>by <a href="seller.html?u=' + encodeURIComponent(seller.handle) + '">' + esc(seller.name) + '</a></span>' : 'by a former student';
    var rows = [['Package', pkg.name], [perHour ? 'Rate' : 'Price', Util.formatPeso(pkg.price) + (perHour ? ' per hour' : '')]];
    if (perHour) rows.push(['Hours', String(qty)]);
    else rows.push(['Delivery', pkg.days + (pkg.days === 1 ? ' day' : ' days')]);
    $('summary-list').innerHTML = rows.map(function (r) { return '<dt>' + esc(r[0]) + '</dt><dd>' + esc(r[1]) + '</dd>'; }).join('');
    $('summary-total').textContent = Util.formatPeso(total());
  }
  renderSummary();

  // ---------- form controls
  $('ico-cal').outerHTML = Icons.svg('calendar', { size: 20 });
  $('ico-clock').outerHTML = Icons.svg('clock', { size: 20 });
  $('qty-minus').innerHTML = Icons.svg('minus', { size: 18 });
  $('qty-plus').innerHTML = Icons.svg('plus', { size: 18 });

  // hours stepper only for hourly gigs
  if (perHour) {
    $('f-qty').hidden = false;
    var setQty = function (n) {
      qty = Util.clamp(n, 1, 20);
      $('qty-out').textContent = String(qty);
      $('qty-minus').disabled = qty <= 1;
      $('qty-plus').disabled = qty >= 20;
      $('e-qty').hidden = true;
      renderSummary();
    };
    $('qty-minus').addEventListener('click', function () { setQty(qty - 1); });
    $('qty-plus').addEventListener('click', function () { setQty(qty + 1); });
    setQty(1);
  }

  // date cannot be in the past
  var now = Store.now();
  var pad = function (n) { return (n < 10 ? '0' : '') + n; };
  $('date').min = now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate());

  $('notes').addEventListener('input', function () { $('notes-count').textContent = this.value.length + ' / 500'; });
  ['date', 'time'].forEach(function (id) { $(id).addEventListener('input', function () { $('e-when').hidden = true; $('f-date').classList.remove('field--error'); $('f-time').classList.remove('field--error'); $('date').removeAttribute('aria-invalid'); $('time').removeAttribute('aria-invalid'); UI.describe($('date'), 'e-when', false); UI.describe($('time'), 'e-when', false); }); });

  function showError(el, message, field) {
    el.innerHTML = Icons.svg('x-circle', { size: 18 }) + '<span>' + esc(message) + '</span>';
    el.hidden = false;
    if (field) { field.focus(); }
  }

  // ---------- place the order
  var placing = false;
  $('order-form').addEventListener('submit', function (e) {
    e.preventDefault();
    if (placing) return;                       // a double click makes exactly one order
    placing = true;
    $('place').disabled = true;
    $('form-error').hidden = true;
    var r = Store.placeOrder({ buyer: viewer.handle, gigId: gig.id, pkg: pkg.name, qty: qty, date: $('date').value, time: $('time').value, notes: $('notes').value });
    if (!r.ok) {
      placing = false;
      $('place').disabled = false;
      if (/date|time/i.test(r.error)) {
        $('f-date').classList.add('field--error'); $('f-time').classList.add('field--error');
        $('date').setAttribute('aria-invalid', 'true'); $('time').setAttribute('aria-invalid', 'true'); UI.describe($('date'), 'e-when', true); UI.describe($('time'), 'e-when', true);
        showError($('e-when'), r.error, $('date').value ? $('time') : $('date'));
      } else if (/quantity/i.test(r.error)) showError($('e-qty'), r.error);
      else showError($('form-error'), r.error);
      return;
    }
    showSuccess(r.order);
  });

  function showSuccess(o) {
    var rows = [['Order number', o.id], ['Package', o.pkg + (o.qty > 1 ? ' × ' + o.qty + ' hours' : '')], ['When', o.date + ' at ' + o.time], ['Payment', o.payment], ['Total', Util.formatPeso(o.total)]];
    $('order-form-col').innerHTML = '<div class="card card--pad order-success" role="status">' + Icons.svg('check-circle', { size: 56 }) +
      '<h2>Order placed!</h2><p>Your order is In Progress. Message the seller to agree on where to meet.</p>' +
      '<dl class="detail-list">' + rows.map(function (r) { return '<dt>' + esc(r[0]) + '</dt><dd>' + esc(r[1]) + '</dd>'; }).join('') + '</dl>' +
      '<div class="order-success__actions"><a class="btn btn--primary" href="profile.html#orders">View my orders</a>' +
      '<a class="btn btn--outline" href="messages.html?with=' + encodeURIComponent(o.seller) + '">Message seller</a></div></div>';
    document.querySelector('.order-title').textContent = 'Thank you!';
    $('order-form-col').querySelector('h2').setAttribute('tabindex', '-1');
    $('order-form-col').querySelector('h2').focus();
  }
})();
