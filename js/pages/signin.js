/* Sign In page. Honours ?next= (only same-site pages, via Auth.safeNext); otherwise sellers land on their seller page and everyone else on Profile. */
(function () {
  'use strict';

  Store.init();

  var $ = function (id) { return document.getElementById(id); };
  var esc = Util.esc;
  var next = Auth.safeNext(UI.query().get('next'));

  // already signed in: nothing to do here
  var existing = Store.currentUser();
  if (existing) { location.replace(next || Auth.landingFor(existing)); return; }

  UI.mount({ page: 'signin' });

  $('auth-bg').innerHTML = UI.tile(SEED.images.campusSunset, '');
  $('ico-mail').outerHTML = Icons.svg('mail', { size: 20 });   // replaces the span so the icon is a direct child of .input-wrap
  $('ico-arrow').innerHTML = Icons.svg('arrow-right', { size: 20 });
  $('ico-google').innerHTML = Icons.svg('google', { size: 20 });
  $('ico-apple').innerHTML = Icons.svg('apple', { size: 20 });
  $('toggle-pass').innerHTML = Icons.svg('eye', { size: 20 });
  if (next) $('to-signup').setAttribute('href', 'signup.html?next=' + encodeURIComponent(next));

  function goAfter(user) { location.href = next || Auth.landingFor(user); }

  function showError(msg) {
    var p = $('auth-error');
    p.innerHTML = Icons.svg('x-circle', { size: 18 }) + '<span>' + esc(msg) + '</span>';
    p.hidden = false;
  }

  // password visibility
  $('toggle-pass').addEventListener('click', function () {
    var input = $('password');
    var show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    this.setAttribute('aria-pressed', String(show));
    this.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
    this.innerHTML = Icons.svg(show ? 'eye-off' : 'eye', { size: 20 });
  });

  // sign in
  var submitting = false;
  $('signin-form').addEventListener('submit', function (e) {
    e.preventDefault();
    if (submitting) return;
    $('auth-error').hidden = true;
    var email = $('email').value, password = $('password').value;
    if (!email.trim() || !password) { showError('Enter your email and password.'); return; }
    submitting = true;
    $('submit').disabled = true;
    var r = Store.signIn(email, password);
    if (!r.ok) {
      submitting = false;
      $('submit').disabled = false;
      showError(r.error);
      return;
    }
    goAfter(r.user);
  });

  // demo accounts fill the form (credentials come from the seed)
  var demo = Store.demoAccounts();
  // A demo account can be deleted from Settings; then its button must say so and point at the way back.
  var MISSING = 'That demo account was deleted. Use "Reset demo data" below to bring it back.';
  function demoMissing(d) { return !Store.allUsers().some(function (u) { return u.email && u.email.toLowerCase() === d.email.toLowerCase(); }); }
  document.querySelectorAll('[data-demo]').forEach(function (b) {
    b.addEventListener('click', function () {
      var d = demo[b.getAttribute('data-demo')];
      if (demoMissing(d)) { showError(MISSING); return; }
      $('email').value = d.email;
      $('password').value = d.password;
      $('auth-error').hidden = true;
      $('submit').focus();
    });
  });

  // Google and Apple are simulated: they sign in as the demo buyer
  document.querySelectorAll('[data-social-signin]').forEach(function (b) {
    b.addEventListener('click', function () {
      if (demoMissing(demo.buyer)) { showError(MISSING); return; }
      var r = Store.signIn(demo.buyer.email, demo.buyer.password);
      if (!r.ok) { showError(r.error); return; }
      UI.toast('Demo sign-in: signed in as ' + r.user.name.split(' ')[0]);
      setTimeout(function () { goAfter(r.user); }, 700);
    });
  });

  // forgot password: ask for an email and "send" a reset link
  $('forgot').addEventListener('click', function () {
    var m = UI.modal({
      title: 'Reset your password',
      body: '<p>Enter your SLSU email and we will send you a reset link.</p><div class="field" style="margin-top:12px"><label for="reset-email">Email address</label><input class="input" id="reset-email" type="email" autocomplete="email" placeholder="you@slsu.edu.ph"><p class="field__error" id="reset-error" role="alert" hidden></p></div>',
      actions: [
        { label: 'Cancel' },
        { label: 'Send reset link', variant: 'primary', onClick: function () {
          var el = document.getElementById('reset-email'), err = document.getElementById('reset-error');
          var v = el.value.trim();
          if (!Util.isValidEmail(v)) { err.textContent = 'Enter a valid email address.'; err.hidden = false; el.setAttribute('aria-invalid', 'true'); el.focus(); return false; }
          UI.toast('Demo: a reset link was "sent" to ' + v);
        } }
      ]
    });
    m.el.querySelector('#reset-email').value = $('email').value.trim();
  });

  // Reset demo data is also reachable here, signed out, so a deleted demo account can always be restored.
  $('demo-reset').addEventListener('click', function () {
    UI.modal({
      title: 'Reset demo data?',
      body: '<p>This restores the sample accounts, gigs, orders and messages and removes anything you added.</p>',
      actions: [
        { label: 'Cancel' },
        { label: 'Reset demo data', variant: 'primary', onClick: function () { Store.reset(); location.href = 'signin.html'; return false; } }
      ]
    });
  });
})();
