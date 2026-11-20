/* SettingsDrawer: the slide-in Settings panel used by the buyer profile and the seller page.
   SettingsDrawer.open(user, onChange) edits name, headline, bio and notification switches, offers Become a Seller to buyers,
   and holds the two destructive actions (Reset demo data, Delete account), each behind a confirm modal. */
(function (root) {
  'use strict';

  var esc = Util.esc;

  function open(user, onChange) {
    var u = Store.getUser(user.handle) || user;
    var body =
      '<form class="settings" novalidate>' +
        '<div class="field" id="s-f-name"><label for="s-name">Display name</label><input class="input" id="s-name" maxlength="60" autocomplete="name" value="' + esc(u.name) + '"><p class="field__error" id="s-e-name" hidden></p></div>' +
        '<div class="field"><label for="s-headline">Headline</label><input class="input" id="s-headline" maxlength="80" value="' + esc(u.headline) + '"></div>' +
        '<div class="field"><label for="s-bio">Bio</label><textarea class="input textarea" id="s-bio" maxlength="500">' + esc(u.bio) + '</textarea><p class="counter" id="s-count">' + u.bio.length + ' / 500</p></div>' +
        '<fieldset class="settings__group"><legend>Notifications</legend>' +
          '<label class="switch"><input type="checkbox" id="s-orders"' + (u.prefs.notifyOrders ? ' checked' : '') + '><span class="switch__track"></span>Order updates</label>' +
          '<label class="switch"><input type="checkbox" id="s-messages"' + (u.prefs.notifyMessages ? ' checked' : '') + '><span class="switch__track"></span>New messages</label>' +
          '<label class="switch"><input type="checkbox" id="s-news"' + (u.prefs.newsletter ? ' checked' : '') + '><span class="switch__track"></span>Newsletter</label>' +
        '</fieldset>' +
        '<p class="field__error" id="s-error" role="alert" hidden></p>' +
        '<button class="btn btn--primary btn--block" type="submit" id="s-save">Save changes</button>' +
      '</form>' +
      (u.isSeller ? '' : '<div class="settings__box"><h3>Want to sell too?</h3><p>Become a seller to post gigs and receive orders. You can still buy as usual.</p><button class="btn btn--outline btn--block" type="button" id="s-seller">Become a Seller</button></div>') +
      '<div class="settings__danger"><h3>Demo data</h3>' +
        '<button class="btn btn--outline btn--block" type="button" id="s-reset">Reset demo data</button>' +
        '<button class="btn btn--outline btn--block settings__delete" type="button" id="s-delete">Delete account</button></div>';

    var d = UI.drawer({ title: 'Settings', body: body });
    var el = d.el;
    var $ = function (id) { return el.querySelector('#' + id); };

    $('s-bio').addEventListener('input', function () { $('s-count').textContent = this.value.length + ' / 500'; });
    $('s-name').addEventListener('input', function () { $('s-e-name').hidden = true; this.removeAttribute('aria-invalid'); });

    var saving = false;
    el.querySelector('.settings').addEventListener('submit', function (e) {
      e.preventDefault();
      if (saving) return;
      saving = true;
      $('s-save').disabled = true;
      $('s-error').hidden = true;
      var r = Store.updateProfile(u.handle, {
        name: $('s-name').value, headline: $('s-headline').value, bio: $('s-bio').value,
        prefs: { notifyOrders: $('s-orders').checked, notifyMessages: $('s-messages').checked, newsletter: $('s-news').checked }
      });
      saving = false;
      $('s-save').disabled = false;
      if (!r.ok) {
        if (/name/i.test(r.error)) { $('s-e-name').textContent = r.error; $('s-e-name').hidden = false; $('s-name').setAttribute('aria-invalid', 'true'); $('s-name').focus(); }
        else { $('s-error').textContent = r.error; $('s-error').hidden = false; }
        return;
      }
      UI.refreshAccount();
      if (onChange) onChange(r.user);
      d.close();
      UI.toast('Profile saved');
    });

    var sellerBtn = $('s-seller');
    if (sellerBtn) sellerBtn.addEventListener('click', function () {
      UI.modal({
        title: 'Become a seller?',
        body: '<p>Your account will be able to post gigs and receive orders. Your orders and favorites stay as they are.</p>',
        actions: [
          { label: 'Not now' },
          { label: 'Become a seller', variant: 'primary', onClick: function () {
            var r = Store.becomeSeller(u.handle);
            if (!r.ok) { UI.toast(r.error); return; }
            location.href = 'seller.html?u=' + encodeURIComponent(u.handle) + '&welcome=1';
            return false;
          } }
        ]
      });
    });

    $('s-reset').addEventListener('click', function () {
      UI.modal({
        title: 'Reset demo data?',
        body: '<p>This restores the sample accounts, gigs, orders and messages, removes anything you added, and signs you out.</p>',
        actions: [
          { label: 'Cancel' },
          { label: 'Reset demo data', variant: 'primary', onClick: function () { Store.reset(); location.href = 'index.html'; return false; } }
        ]
      });
    });

    $('s-delete').addEventListener('click', function () {
      UI.modal({
        title: 'Delete your account?',
        body: '<p>This removes your profile, your gigs, your favorites and your follows. Your past orders stay on record. This cannot be undone.</p>',
        actions: [
          { label: 'Cancel' },
          { label: 'Delete account', variant: 'primary', onClick: function () {
            var r = Store.deleteAccount(u.handle);
            if (!r.ok) { UI.toast(r.error); return; }
            location.href = 'index.html';
            return false;
          } }
        ]
      });
    });

    return d;
  }

  root.SettingsDrawer = { open: open };
})(typeof window !== 'undefined' ? window : this);
