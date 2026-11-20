/* Sign Up page. Tabs choose the starting role (?role=seller preselects Freelancer); one account can buy and sell either way. */
(function () {
  'use strict';

  Store.init();

  var $ = function (id) { return document.getElementById(id); };
  var esc = Util.esc;
  var q = UI.query();
  var next = Auth.safeNext(q.get('next'));

  var existing = Store.currentUser();
  if (existing) { location.replace(next || Auth.landingFor(existing)); return; }

  UI.mount({ page: 'signup' });

  $('auth-bg').innerHTML = UI.tile(SEED.images.campusSunset, '');
  $('ico-user').outerHTML = Icons.svg('user', { size: 20 });   // replaces the span so the icon is a direct child of .input-wrap
  $('ico-mail').outerHTML = Icons.svg('mail', { size: 20 });
  $('ico-arrow').innerHTML = Icons.svg('arrow-right', { size: 20 });
  $('toggle-pass').innerHTML = Icons.svg('eye', { size: 20 });
  if (next) $('to-signin').setAttribute('href', 'signin.html?next=' + encodeURIComponent(next));

  // role tabs (roving focus, arrow keys)
  var role = q.get('role') === 'seller' ? 'seller' : 'buyer';
  var tabs = Array.prototype.slice.call(document.querySelectorAll('#role-tabs [role="tab"]'));
  function setRole(r, focus) {
    role = r;
    tabs.forEach(function (t) {
      var on = t.getAttribute('data-role') === r;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      if (on) { $('signup-form').setAttribute('aria-labelledby', t.id); if (focus) t.focus(); }
    });
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { setRole(t.getAttribute('data-role')); });
    t.addEventListener('keydown', function (e) {
      var to = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!to) return;
      e.preventDefault();
      setRole(tabs[(i + to + tabs.length) % tabs.length].getAttribute('data-role'), true);
    });
  });
  setRole(role);

  // password visibility
  $('toggle-pass').addEventListener('click', function () {
    var input = $('password');
    var show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    this.setAttribute('aria-pressed', String(show));
    this.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
    this.innerHTML = Icons.svg(show ? 'eye-off' : 'eye', { size: 20 });
  });

  var fields = ['name', 'email', 'password'];
  function setError(field, message) {
    var input = $(field), p = $('e-' + field);
    if (message) {
      p.innerHTML = Icons.svg('x-circle', { size: 18 }) + '<span>' + esc(message) + '</span>';
      p.hidden = false;
      input.setAttribute('aria-invalid', 'true');
      UI.describe(input, 'e-' + field, true);
      $('f-' + field).classList.add('field--error');
    } else {
      p.hidden = true;
      input.removeAttribute('aria-invalid');
      UI.describe(input, 'e-' + field, false);
      $('f-' + field).classList.remove('field--error');
    }
  }
  fields.forEach(function (f) { $(f).addEventListener('input', function () { setError(f, ''); $('auth-error').hidden = true; }); });

  // Store errors point at the field they are about
  function fieldFor(msg) {
    if (/password/i.test(msg)) return 'password';
    if (/name/i.test(msg)) return 'name';
    if (/email/i.test(msg)) return 'email';
    return null;
  }

  var submitting = false;
  $('signup-form').addEventListener('submit', function (e) {
    e.preventDefault();
    if (submitting) return;
    $('auth-error').hidden = true;
    fields.forEach(function (f) { setError(f, ''); });
    submitting = true;
    $('submit').disabled = true;
    var r = Store.signUp({ name: $('name').value, email: $('email').value, password: $('password').value, role: role });
    if (!r.ok) {
      submitting = false;
      $('submit').disabled = false;
      var f = fieldFor(r.error);
      if (f) { setError(f, r.error); $(f).focus(); }
      else { $('auth-error').innerHTML = Icons.svg('x-circle', { size: 18 }) + '<span>' + esc(r.error) + '</span>'; $('auth-error').hidden = false; }
      return;
    }
    var u = r.user;
    location.href = next || (u.isSeller ? 'seller.html?u=' + encodeURIComponent(u.handle) + '&welcome=1' : Auth.landingFor(u));
  });
})();
