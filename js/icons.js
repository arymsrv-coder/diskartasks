/* Icons: one inline SVG set. 24px grid, 2px rounded stroke, currentColor.
   Icons.svg(name, {size, cls}) returns markup ('' for an unknown name); Icons.logo(size) returns the logo lockup. */
(function (root) {
  'use strict';

  var FILL = ' fill="currentColor" stroke="none"';

  var P = {
    'home': '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>',
    'home-fill': '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" fill="currentColor"/>',
    'search': '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    'plus': '<path d="M12 5v14M5 12h14"/>',
    'message': '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.4-4.6A8 8 0 1 1 21 12z"/>',
    'user': '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    'heart': '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
    'heart-fill': '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" fill="currentColor"/>',
    'bookmark': '<path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>',
    'bell': '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
    'settings': '<circle cx="12" cy="12" r="3"/><path d="M10.3 3h3.4l.5 2.4 1.9.8 2.1-1.3 2.4 2.4-1.3 2.1.8 1.9 2.4.5v3.4l-2.4.5-.8 1.9 1.3 2.1-2.4 2.4-2.1-1.3-1.9.8-.5 2.4h-3.4l-.5-2.4-1.9-.8-2.1 1.3-2.4-2.4 1.3-2.1-.8-1.9L3 13.7v-3.4l2.4-.5.8-1.9-1.3-2.1 2.4-2.4 2.1 1.3 1.9-.8z"/>',
    'sliders': '<path d="M4 6h8M16 6h4M4 12h2M10 12h10M4 18h10M18 18h2"/><circle cx="14" cy="6" r="2"/><circle cx="8" cy="12" r="2"/><circle cx="16" cy="18" r="2"/>',
    'calendar': '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    'clock': '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    'pin': '<path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>',
    'tag': '<path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V4h9l8.6 8.6a2 2 0 0 1 0 2.8z"/><circle cx="7.5" cy="8.5" r="1"/>',
    'briefcase': '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18"/>',
    'code': '<path d="m8 8-4 4 4 4M16 8l4 4-4 4M14 5l-4 14"/>',
    'pencil': '<path d="M4 20l1-4L16.5 4.5a2.1 2.1 0 0 1 3 3L8 19z"/><path d="m14 7 3 3"/>',
    'image': '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="1.5"/><path d="m21 16-5-5-9 9"/>',
    'upload': '<path d="M12 16V4M7 9l5-5 5 5M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"/>',
    'more': '<circle cx="5" cy="12" r="1.3"' + FILL + '/><circle cx="12" cy="12" r="1.3"' + FILL + '/><circle cx="19" cy="12" r="1.3"' + FILL + '/>',
    'arrow-left': '<path d="M19 12H5M11 6l-6 6 6 6"/>',
    'arrow-right': '<path d="M5 12h14M13 6l6 6-6 6"/>',
    'check': '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    'chevron-down': '<path d="m6 9 6 6 6-6"/>',
    'graduation': '<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11.5V16c0 1.5 2.7 3 6 3s6-1.5 6-3v-4.5M22 9v6"/>',
    'mail': '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    'minus': '<path d="M5 12h14"/>',
    'star': '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
    'star-fill': '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" fill="currentColor"/>',
    'trash': '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
    'x': '<path d="M6 6l12 12M18 6 6 18"/>',
    'palette': '<path d="M12 3a9 9 0 1 0 0 18c1.1 0 1.8-.8 1.8-1.7 0-.5-.2-.9-.5-1.3-.3-.4-.5-.8-.5-1.3 0-1 .8-1.7 1.8-1.7H17a4 4 0 0 0 4-4C21 6.6 17 3 12 3z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10" cy="7" r="1"/><circle cx="15" cy="7" r="1"/>',
    'shield-check': '<path d="M12 3 4 6v6c0 4.5 3.3 8 8 9 4.7-1 8-4.5 8-9V6z"/><path d="m8.5 12 2.5 2.5 4.5-5"/>',
    'zap': '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
    'handshake': '<path d="m11 17 2 2a1 1 0 1 0 3-3"/><path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4"/><path d="m21 3 1 11h-2"/><path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3"/><path d="M3 4h8"/>',
    'users': '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.7a3.5 3.5 0 0 1 0 6.6M18 14.5a6.5 6.5 0 0 1 3.5 5.5"/>',
    'grid': '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    'send': '<path d="M21 3 3 10.5l7 2.5 2.5 7z"/><path d="m21 3-10.5 10"/>',
    'eye': '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    'eye-off': '<path d="M9.9 5.2A9.8 9.8 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3 3.9M6.6 6.6A17 17 0 0 0 2 12s3.6 7 10 7a9.7 9.7 0 0 0 4.4-1"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2M3 3l18 18"/>',
    'logout': '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
    'quote': '<path d="M9 7C6 7.8 4 10.3 4 14v3h6v-6H7c.2-1.6 1-2.6 2-3zM19 7c-3 .8-5 3.3-5 7v3h6v-6h-3c.2-1.6 1-2.6 2-3z"' + FILL + '/>',
    'menu': '<path d="M4 6h16M4 12h16M4 18h16"/>',
    'facebook': '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>',
    'instagram': '<rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.4A4 4 0 1 1 12.6 8 4 4 0 0 1 16 11.4z"/><path d="M17.5 6.5h.01"/>',
    'x-social': '<path d="M17.7 3h3.1l-6.8 7.7L22 21h-6.2l-4.9-6.3L5.3 21H2.2l7.2-8.3L2 3h6.4l4.4 5.8zm-1.1 16.2h1.7L7.5 4.7H5.7z"' + FILL + '/>',
    'youtube': '<path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/>',
    'google': '<path d="M20.5 12.2H12M20.5 12.2a8.5 8.5 0 1 1-2.5-6"/>',
    'apple': '<path d="M16.4 12.6c0-2.2 1.8-3.2 1.9-3.3-1-1.5-2.6-1.7-3.2-1.7-1.4-.1-2.7.8-3.4.8s-1.8-.8-3-.8C6.8 7.6 5.3 8.5 4.5 10c-1.700 3-.4 7.400 1.200 9.800.8 1.100 1.700 2.400 3 2.400 1.200 0 1.700-.8 3.100-.8s1.800.8 3.100.8c1.300 0 2.100-1.200 2.900-2.300.9-1.300 1.300-2.600 1.300-2.700 0 0-2.500-1-2.500-3.600zM14 5.600c.7-.8 1.100-1.900 1-3-1 .1-2.100.7-2.800 1.500-.6.700-1.200 1.800-1 2.900 1.100.1 2.100-.5 2.800-1.400z"' + FILL + '/>',
    /* reference pass */
    'chevron-right': '<path d="m9 6 6 6-6 6"/>',
    'check-circle': '<circle cx="12" cy="12" r="9"/><path d="m8 12.5 3 3 5-6"/>',
    'x-circle': '<circle cx="12" cy="12" r="9"/><path d="m9 9 6 6M15 9l-6 6"/>',
    'trending-up': '<path d="M3 17l6-6 4 4 8-8M15 7h6v6"/>',
    'play': '<path d="M8 5v14l11-7z"' + FILL + '/>',
    'sun': '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    'moon': '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
    'pause': '<path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z"' + FILL + '/>',
    'help': '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 0 1 5 .5c0 1.5-2.5 2-2.5 3.5M12 17h.01"/>'
  };

  var Icons = {
    svg: function (name, opts) {
      if (typeof name !== 'string' || !Object.prototype.hasOwnProperty.call(P, name)) return '';
      var body = P[name];
      opts = opts || {};
      var size = Number(opts.size) > 0 ? Number(opts.size) : 24;
      var cls = String(opts.cls || '').replace(/[^\w\- ]/g, '');
      return '<svg class="icon' + (cls ? ' ' + cls : '') + '" width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + body + '</svg>';
    },

    names: function () { return Object.keys(P); },

    // The Campus Gigs lockup: a C and a G drawn together, then the two-line name. Colours come from CSS (see .logo in shell.css).
    logo: function (size) {
      var s = Number(size) > 0 ? Number(size) : 40;
      return '<svg class="logo__mark" width="' + s + '" height="' + s + '" viewBox="0 0 40 40" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' +
        '<path class="logo__c" d="M31 10.5A14 14 0 1 0 31 29.5" stroke="currentColor" stroke-width="5"/>' +
        '<path class="logo__g" d="M27 15.5A8 8 0 1 0 27 24.5H21" stroke-width="4"/></svg>' +
        '<span class="logo__text">Campus<br>Gigs</span>';
    }
  };

  root.Icons = Icons;
})(typeof window !== 'undefined' ? window : this);
