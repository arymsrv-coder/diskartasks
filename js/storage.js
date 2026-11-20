/* CGStorage: key/value store for the whole site. Backends, in order:
   'local'       window.localStorage
   'window-name' one JSON object in window.name (survives page changes within a tab; used when localStorage is
                 blocked, or on Firefox over file:// where every file is its own origin)
   'none'        in memory only (data is lost on every page change; the UI shows a banner)  */
(function (root) {
  'use strict';

  var PREFIX = 'campusgigs.v1.';
  var mem = {};
  var ls = null;

  function clone(v) { return v === undefined ? undefined : JSON.parse(JSON.stringify(v)); }

  function probeLocal() {
    try {
      var s = root.localStorage;
      var k = PREFIX + '__probe';
      s.setItem(k, '1');
      var back = s.getItem(k);
      s.removeItem(k);
      return back === '1' ? s : null;
    } catch (e) { return null; }
  }

  function isFirefoxOnFile() {
    var ua = (root.navigator && root.navigator.userAgent) || '';
    var proto = (root.location && root.location.protocol) || '';
    return /firefox/i.test(ua) && proto === 'file:';
  }

  function loadName() {
    mem = {};
    try {
      var o = JSON.parse(root.name);
      if (o && o.__cg === 1 && o.d && typeof o.d === 'object' && !Array.isArray(o.d)) mem = o.d;
    } catch (e) { /* not ours: start empty */ }
  }

  function writeName() {
    try {
      var str = JSON.stringify({ __cg: 1, d: mem });
      root.name = str;
      return root.name === str;
    } catch (e) { return false; }
  }

  var CGStorage = {
    mode: null,

    // Picks a backend. Safe to call more than once.
    init: function () {
      this.mode = null;
      ls = null;
      if (!isFirefoxOnFile()) {
        ls = probeLocal();
        if (ls) this.mode = 'local';
      }
      if (!this.mode) {
        loadName();
        this.mode = writeName() ? 'window-name' : 'none';
      }
      return this.mode;
    },

    get: function (key) {
      if (!this.mode) this.init();
      if (this.mode === 'local') {
        try {
          var raw = ls.getItem(PREFIX + key);
          return raw === null ? undefined : JSON.parse(raw);
        } catch (e) { return undefined; }
      }
      return clone(mem[key]);
    },

    set: function (key, value) {
      if (!this.mode) this.init();
      if (value === undefined) { this.remove(key); return true; }
      if (this.mode === 'local') {
        try { ls.setItem(PREFIX + key, JSON.stringify(value)); return true; } catch (e) { return false; }
      }
      mem[key] = clone(value);
      if (this.mode === 'window-name') writeName();
      return true;
    },

    remove: function (key) {
      if (!this.mode) this.init();
      if (this.mode === 'local') {
        try { ls.removeItem(PREFIX + key); } catch (e) { /* ignore */ }
        return;
      }
      delete mem[key];
      if (this.mode === 'window-name') writeName();
    },

    // Removes only this site's keys.
    clearAll: function () {
      if (!this.mode) this.init();
      if (this.mode === 'local') {
        try {
          var doomed = [];
          for (var i = 0; i < ls.length; i++) {
            var k = ls.key(i);
            if (k && k.indexOf(PREFIX) === 0) doomed.push(k);
          }
          doomed.forEach(function (k) { ls.removeItem(k); });
        } catch (e) { /* ignore */ }
        return;
      }
      mem = {};
      if (this.mode === 'window-name') writeName();
    }
  };

  root.CGStorage = CGStorage;
})(typeof window !== 'undefined' ? window : this);
