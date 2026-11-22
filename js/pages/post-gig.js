/* Post a gig (post-gig.html, or ?edit=<id> for the owner). A form with a live preview card. Publish disables itself on the first click. */
(function () {
  'use strict';

  Store.init();
  var viewer = Auth.require();
  if (!viewer) return;
  UI.mount({ page: 'post-gig' });

  var $ = function (id) { return document.getElementById(id); };
  var esc = Util.esc;
  var q = UI.query();
  var rootEl = $('postgig-root');
  var cats = Store.categories();
  var TIERS = ['Basic', 'Standard', 'Pro'];

  // ---------- who may be here
  var editing = null;
  if (q.has('edit')) {
    editing = Store.getGig(Util.toId(q.get('edit')));
    if (!editing || editing.sellerHandle !== viewer.handle) {          // unknown, or someone else's gig
      rootEl.innerHTML = '<section class="section"></section>';
      UI.notFound(rootEl.firstChild, 'gig');
      return;
    }
  }
  if (!Store.getUser(viewer.handle).isSeller) {
    $('postgig-layout').outerHTML = '<div class="empty-state" id="become-panel">' + Icons.svg('briefcase', { size: 48 }) + '<h1>Become a seller to post gigs</h1>' +
      '<p>Your account can buy right now. Turn on selling to post gigs and receive orders. You can still buy as usual.</p><button class="btn btn--primary" type="button" id="become-btn">Become a Seller</button></div>';
    $('page-title').hidden = true;
    $('become-btn').addEventListener('click', function () {
      this.disabled = true;
      var r = Store.becomeSeller(viewer.handle);
      if (r.ok) location.reload(); else { this.disabled = false; UI.toast(r.error); }
    });
    return;
  }

  if (editing) { document.title = 'Edit gig | DiskarTasks'; $('page-title').textContent = 'Edit gig'; $('publish').textContent = 'Save changes'; }

  // ---------- state
  var state = {
    category: editing ? editing.category : '', unit: editing ? editing.unit : 'project',
    skills: editing ? editing.skills.slice() : [], upload: '', cover: '', coverTouched: false, tiers: {}
  };
  // The cover a category starts with: its photo from SEED.categoryCovers, or the placeholder tile if it has none.
  function defaultCover(catId) { return (SEED.categoryCovers && SEED.categoryCovers[catId]) || 'tile:' + catId; }
  TIERS.forEach(function (n) { state.tiers[n] = { on: n === 'Basic', price: '', days: '3', revisions: '1', includes: [''] }; });
  if (editing) {
    editing.packages.forEach(function (p) {
      state.tiers[p.name] = { on: true, price: String(p.price), days: String(p.days), revisions: String(p.revisions), includes: p.includes.length ? p.includes.slice() : [''] };
    });
    if (/^data:image/.test(editing.cover)) { state.upload = editing.cover; state.coverTouched = true; }
    else if (editing.cover !== defaultCover(editing.category)) { state.cover = editing.cover; state.coverTouched = true; }
    $('title').value = editing.title;
    $('description').value = editing.description;
  }
  $('title-count').textContent = $('title').value.length + ' / 80';
  $('desc-count').textContent = $('description').value.length + ' / 2000';

  function coverValue() { return state.upload || (state.coverTouched && state.cover) || defaultCover(state.category || 'others'); }
  function draft() {
    return {
      title: $('title').value, category: state.category, description: $('description').value, skills: state.skills.slice(), cover: coverValue(), unit: state.unit,
      packages: TIERS.filter(function (n) { return state.tiers[n].on; }).map(function (n) {
        var t = state.tiers[n];
        return { name: n, price: t.price, days: t.days, revisions: t.revisions, includes: t.includes.map(function (s) { return s.trim(); }).filter(Boolean) };
      })
    };
  }

  // ---------- live preview (a real gig card built from the draft)
  function renderPreview() {
    var d = draft();
    var pkgs = d.packages.map(function (p) { return { name: p.name, price: Number(p.price) > 0 ? Number(p.price) : 0, days: 1, revisions: 0, includes: [] }; });
    var gig = {
      id: 0, sellerHandle: viewer.handle, title: d.title.trim() || 'Your gig title', category: d.category || 'others', cover: d.cover, unit: d.unit,
      packages: pkgs.length ? pkgs : [{ name: 'Basic', price: 0, days: 1, revisions: 0, includes: [] }], showRange: false, rating: 0, ratingCount: 0, createdAt: ''
    };
    $('preview').innerHTML = UI.gigCard(gig);
    // The card links to gig.html?id=0, which does not exist yet: point it at this form so no copied or middle-clicked link is dead.
    Array.prototype.forEach.call($('preview').querySelectorAll('a[href]'), function (a) { a.setAttribute('href', 'post-gig.html'); });
  }
  // The preview card is not a real gig yet: its title link and heart give feedback instead of opening gig.html?id=0.
  $('preview').addEventListener('click', function (e) {
    if (!e.target.closest || !e.target.closest('a, button')) return;
    e.preventDefault();
    UI.toast('This is a preview. Publish your gig to make it live.');
  });

  // ---------- category and unit
  $('category-chips').innerHTML = cats.map(function (c) {
    return '<button type="button" class="chip" role="radio" data-cat="' + esc(c.id) + '" aria-checked="false">' + Icons.svg(c.icon, { size: 18 }) + esc(c.name) + '</button>';
  }).join('');
  function renderCategory() {
    Array.prototype.forEach.call($('category-chips').children, function (b) {
      var on = b.getAttribute('data-cat') === state.category;
      b.setAttribute('aria-checked', String(on));
      b.classList.toggle('chip--active', on);
    });
  }
  $('category-chips').addEventListener('click', function (e) {
    var b = e.target.closest('[data-cat]');
    if (!b) return;
    state.category = b.getAttribute('data-cat');
    clearError('category');
    renderCategory(); renderCovers(); renderPreview();
  });
  $('unit-seg').addEventListener('click', function (e) {
    var b = e.target.closest('[data-unit]');
    if (!b) return;
    state.unit = b.getAttribute('data-unit');
    renderUnit(); renderTiers(); renderPreview();    // the price labels say "per hour" for hourly gigs
  });
  function renderUnit() {
    Array.prototype.forEach.call($('unit-seg').children, function (b) {
      var on = b.getAttribute('data-unit') === state.unit;
      b.setAttribute('aria-pressed', String(on));
      b.classList.toggle('is-active', on);
    });
  }

  // ---------- text fields
  $('title').addEventListener('input', function () { $('title-count').textContent = this.value.length + ' / 80'; clearError('title'); renderPreview(); });
  $('description').addEventListener('input', function () { $('desc-count').textContent = this.value.length + ' / 2000'; clearError('description'); });

  // ---------- skills: type and press Enter
  function renderSkills() {
    $('skill-chips').innerHTML = state.skills.map(function (s, i) {
      return '<span class="chip chip--removable chip--static">' + esc(s) + '<button class="chip__x" type="button" data-skill="' + i + '" aria-label="Remove skill ' + esc(s) + '">' + Icons.svg('x', { size: 16 }) + '</button></span>';
    }).join('');
  }
  function addSkill() {
    var v = $('skill-input').value.trim().slice(0, 30);
    if (!v) return;
    if (state.skills.length >= 12) { UI.toast('You can add up to 12 skills.'); return; }
    if (!state.skills.some(function (s) { return s.toLowerCase() === v.toLowerCase(); })) state.skills.push(v);
    $('skill-input').value = '';
    renderSkills();
  }
  $('skill-input').addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addSkill(); } });
  $('skill-input').addEventListener('blur', addSkill);
  $('skill-chips').addEventListener('click', function (e) {
    var b = e.target.closest('[data-skill]');
    if (!b) return;
    state.skills.splice(Util.toInt(b.getAttribute('data-skill'), -1, 0, 99), 1);
    renderSkills();
    $('skill-input').focus();
  });

  // ---------- packages
  function renderTiers() {
    $('tiers').innerHTML = TIERS.filter(function (n) { return state.tiers[n].on; }).map(function (n) {
      var t = state.tiers[n];
      return '<div class="tier" data-tier="' + n + '"><div class="tier__head"><h2>' + n + '</h2>' + (n === 'Basic' ? '<span class="caption">Required</span>' : '<button class="btn btn--outline btn--sm" type="button" data-remove-tier="' + n + '">Remove</button>') + '</div>' +
        '<div class="tier__grid">' +
        '<div class="field"><label for="p-' + n + '-price">' + (state.unit === 'hour' ? 'Price per hour (₱)' : 'Price (₱)') + '</label><input class="input" id="p-' + n + '-price" data-field="price" inputmode="decimal" value="' + esc(t.price) + '" placeholder="350"></div>' +
        '<div class="field"><label for="p-' + n + '-days">Delivery (days)</label><input class="input" id="p-' + n + '-days" data-field="days" inputmode="numeric" value="' + esc(t.days) + '"></div>' +
        '<div class="field"><label for="p-' + n + '-rev">Revisions</label><input class="input" id="p-' + n + '-rev" data-field="revisions" inputmode="numeric" value="' + esc(t.revisions) + '"></div></div>' +
        '<div class="field"><span class="field__label">What’s included</span>' + t.includes.map(function (inc, i) {
          return '<div class="include-row"><input class="input" data-inc="' + i + '" aria-label="Included item ' + (i + 1) + ' for ' + n + '" maxlength="80" value="' + esc(inc) + '" placeholder="e.g. 2 logo concepts"><button class="btn btn--outline btn--icon btn--sm" type="button" data-remove-inc="' + i + '" aria-label="Remove item ' + (i + 1) + '">' + Icons.svg('trash', { size: 16 }) + '</button></div>';
        }).join('') + (t.includes.length < 8 ? '<button class="btn btn--outline btn--sm" type="button" data-add-inc>' + Icons.svg('plus', { size: 16 }) + 'Add item</button>' : '') + '</div></div>';
    }).join('');
    $('add-tiers').innerHTML = TIERS.filter(function (n) { return !state.tiers[n].on; }).map(function (n) {
      return '<button class="btn btn--outline btn--sm" type="button" data-add-tier="' + n + '">' + Icons.svg('plus', { size: 16 }) + 'Add ' + n + ' package</button>';
    }).join('');
  }
  $('tiers').addEventListener('input', function (e) {
    var tier = e.target.closest('[data-tier]');
    if (!tier) return;
    var t = state.tiers[tier.getAttribute('data-tier')];
    if (e.target.hasAttribute('data-field')) t[e.target.getAttribute('data-field')] = e.target.value;
    else if (e.target.hasAttribute('data-inc')) t.includes[Util.toInt(e.target.getAttribute('data-inc'), 0, 0, 7)] = e.target.value;
    clearError('packages');
    renderPreview();
  });
  $('tiers').addEventListener('click', function (e) {
    var tier = e.target.closest('[data-tier]');
    if (!tier) return;
    var name = tier.getAttribute('data-tier'), t = state.tiers[name];
    if (e.target.closest('[data-add-inc]')) { t.includes.push(''); renderTiers(); var rows = $('tiers').querySelectorAll('[data-tier="' + name + '"] [data-inc]'); rows[rows.length - 1].focus(); }
    else if (e.target.closest('[data-remove-inc]')) { t.includes.splice(Util.toInt(e.target.closest('[data-remove-inc]').getAttribute('data-remove-inc'), 0, 0, 7), 1); if (!t.includes.length) t.includes = ['']; renderTiers(); renderPreview(); }
    else if (e.target.closest('[data-remove-tier]')) { t.on = false; renderTiers(); renderPreview(); }
  });
  $('add-tiers').addEventListener('click', function (e) {
    var b = e.target.closest('[data-add-tier]');
    if (!b) return;
    state.tiers[b.getAttribute('data-add-tier')].on = true;
    renderTiers(); renderPreview();
    var first = $('tiers').querySelector('[data-tier="' + b.getAttribute('data-add-tier') + '"] [data-field="price"]');
    if (first) first.focus();
  });

  // ---------- cover: palette tiles, or an uploaded photo resized in a canvas
  function renderCovers() {
    var chosen = coverValue();
    $('cover-choices').innerHTML = cats.map(function (c) {
      var key = defaultCover(c.id);
      return '<button type="button" class="cover-choice" data-cover="' + esc(key) + '" aria-pressed="' + (!state.upload && chosen === key) + '" aria-label="' + esc(c.name) + ' cover">' + UI.tile(key, '') + '</button>';
    }).join('');
    $('cover-remove').hidden = !state.upload;
    $('cover-file-label').textContent = state.upload ? 'Replace photo' : 'Upload a photo';
  }
  $('cover-choices').addEventListener('click', function (e) {
    var b = e.target.closest('[data-cover]');
    if (!b) return;
    state.cover = b.getAttribute('data-cover'); state.coverTouched = true; state.upload = '';
    renderCovers(); renderPreview();
  });
  $('cover-remove').addEventListener('click', function () { state.upload = ''; $('cover-file').value = ''; renderCovers(); renderPreview(); });
  $('cover-file').addEventListener('change', function () {
    var file = this.files && this.files[0];
    if (!file) return;
    var fail = function () { state.upload = ''; renderCovers(); renderPreview(); UI.toast('We could not use that image, so your cover stays on the tile.'); };
    if (!/^image\/(png|jpe?g|webp)$/.test(file.type)) { fail(); return; }
    var reader = new FileReader();
    reader.onerror = fail;
    reader.onload = function () {
      var img = new Image();
      img.onerror = fail;
      img.onload = function () {
        try {
          var w = Math.min(640, img.width), h = Math.round(img.height * (w / img.width));
          var canvas = document.createElement('canvas');
          canvas.width = w; canvas.height = h;
          canvas.getContext('2d').drawImage(img, 0, 0, w, h);
          var url = '';
          [0.8, 0.6, 0.45].some(function (qlt) { url = canvas.toDataURL('image/jpeg', qlt); return url.length <= 140000; });
          if (!url || url.indexOf('data:image/jpeg') !== 0 || url.length > 140000) { fail(); return; }
          state.upload = url; state.coverTouched = true;
          renderCovers(); renderPreview();
        } catch (err) { fail(); }
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });

  // ---------- errors: shown next to the field they are about
  var ERROR_FIELDS = ['title', 'category', 'description', 'packages'];
  // The control each message is about, so a screen reader reads the message with it (packages: the Basic price box).
  function controlFor(f) { return f === 'title' ? $('title') : f === 'description' ? $('description') : f === 'category' ? $('category-chips') : $('p-Basic-price'); }
  function clearError(f) {
    var p = $('e-' + f);
    if (p) p.hidden = true;
    var c = controlFor(f); if (c) { c.removeAttribute('aria-invalid'); UI.describe(c, 'e-' + f, false); }
    var holder = $('f-' + f);
    if (holder) holder.classList.remove('field--error');
    $('form-error').hidden = true;
  }
  function showError(f, message) {
    var p = $('e-' + f);
    p.innerHTML = Icons.svg('x-circle', { size: 18 }) + '<span>' + esc(message) + '</span>';
    p.hidden = false;
    var c = controlFor(f); if (c) { c.setAttribute('aria-invalid', 'true'); UI.describe(c, 'e-' + f, true); }
    $('f-' + f).classList.add('field--error');
  }
  function fieldFor(msg) {
    if (/title/i.test(msg)) return 'title';
    if (/category/i.test(msg)) return 'category';
    if (/description/i.test(msg)) return 'description';
    if (/package|price|delivery|revision|basic/i.test(msg)) return 'packages';
    return null;
  }

  // ---------- publish
  var publishing = false;
  $('gig-form').addEventListener('submit', function (e) {
    e.preventDefault();
    if (publishing) return;
    publishing = true;
    $('publish').disabled = true;
    ERROR_FIELDS.forEach(clearError);
    var d = draft();
    var r = editing ? Store.updateGig(editing.id, viewer.handle, d) : Store.createGig(viewer.handle, d);
    if (!r.ok) {
      publishing = false;
      $('publish').disabled = false;
      var f = fieldFor(r.error);
      if (f) { showError(f, r.error); var target = f === 'packages' ? $('tiers').querySelector('input') : f === 'category' ? $('category-chips').firstChild : $(f); if (target) target.focus(); }
      else { $('form-error').innerHTML = Icons.svg('x-circle', { size: 18 }) + '<span>' + esc(r.error) + '</span>'; $('form-error').hidden = false; }
      return;
    }
    location.href = 'gig.html?id=' + r.gig.id + (editing ? '&saved=1' : '&posted=1');
  });

  // ---------- start
  renderCategory(); renderUnit(); renderSkills(); renderTiers(); renderCovers(); renderPreview();
})();
