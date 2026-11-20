/* Util: small pure helpers shared by every page. No DOM access. */
(function (root) {
  'use strict';

  var ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

  var Util = {
    // Escape user text before it is placed in HTML.
    esc: function (s) {
      if (s === null || s === undefined) return '';
      return String(s).replace(/[&<>"']/g, function (c) { return ESC[c]; });
    },

    // 1500 -> "₱1,500"; junk -> "₱0".
    formatPeso: function (n) {
      var v = Number(n);
      if (!isFinite(v)) v = 0;
      v = Math.round(v * 100) / 100;
      var parts = String(Math.abs(v)).split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      return (v < 0 ? '-' : '') + '₱' + parts.join('.');
    },

    // Whole-number parameter from user or URL input: non-integers fall back, integers clamp to [min, max].
    toInt: function (v, fallback, min, max) {
      if (v === null || v === undefined || !/^\s*[-+]?\d+\s*$/.test(String(v))) return fallback;
      var n = parseInt(v, 10);
      if (typeof min === 'number' && n < min) n = min;
      if (typeof max === 'number' && n > max) n = max;
      return n;
    },

    // A record id from a URL: a plain positive whole number of up to 9 digits, else 0 (never clamped into range).
    toId: function (v) {
      if (v === null || v === undefined || !/^\d{1,9}$/.test(String(v))) return 0;
      return parseInt(v, 10);
    },

    clamp: function (n, min, max) { return Math.min(Math.max(n, min), max); },

    // "Paolo Dela Cruz" -> "PD"; blank -> "?".
    initials: function (name) {
      var words = String(name === null || name === undefined ? '' : name).trim().split(/\s+/).filter(Boolean);
      if (!words.length) return '?';
      return words.slice(0, 2).map(function (w) { return w.charAt(0).toUpperCase(); }).join('');
    },

    isValidEmail: function (s) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s === null || s === undefined ? '' : s)); },

    // Deterministic, NOT secure: the demo never stores a password in the clear (the browser's crypto API is unreliable on file://).
    mockHash: function (s) {
      var str = String(s);
      var a = 0x811c9dc5, b = 0x01000193;
      for (var i = 0; i < str.length; i++) {
        a = Math.imul(a ^ str.charCodeAt(i), 0x01000193) >>> 0;
        b = Math.imul(b ^ str.charCodeAt(str.length - 1 - i), 0x85ebca6b) >>> 0;
      }
      return 'h1$' + ('00000000' + a.toString(16)).slice(-8) + ('00000000' + b.toString(16)).slice(-8);
    }
  };

  root.Util = Util;
})(typeof window !== 'undefined' ? window : this);
