/* Auth: route helpers that sit on top of Store. */
(function (root) {
  'use strict';

  var Auth = {
    // Signed in: returns the user. Signed out: sends the visitor to sign-in (returning here afterwards) and returns null.
    require: function () {
      var user = root.Store.currentUser();
      if (user) return user;
      var loc = root.location;
      var page = (String(loc.pathname || '').split('/').pop() || 'index.html') + (loc.search || '');
      loc.replace('signin.html?next=' + encodeURIComponent(page));
      return null;
    },

    // Sellers land on their own seller page, everyone else on their profile.
    landingFor: function (user) {
      return user && user.isSeller ? 'seller.html?u=' + encodeURIComponent(user.handle) : 'profile.html';
    },

    // Only same-folder .html pages are accepted as a return address, so ?next= can never leave the site.
    safeNext: function (param) {
      if (typeof param !== 'string') return null;
      return /^[a-z0-9-]+\.html(\?[\w=&%.\-]*)?(#[\w-]*)?$/i.test(param) ? param : null;
    }
  };

  root.Auth = Auth;
})(typeof window !== 'undefined' ? window : this);
