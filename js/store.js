/* Store: all domain logic and persistence for DiskarTasks. DOM-free so it can be unit-tested in Node.
   Mutating calls return {ok:true, ...} or {ok:false, error}; they never throw on bad user input. */
(function (root) {
  'use strict';

  var CG = root.CGStorage;
  var SEED = root.SEED;
  var Util = root.Util;

  var SHAPES = {
    users: 'array', gigs: 'array', orders: 'array', reviews: 'array', conversations: 'array',
    favorites: 'object', follows: 'object', newsletter: 'array', contacts: 'array', meta: 'object'
  };

  var db = {};
  var rev = '';   // token of the last write this page has seen; a different token in storage means another tab wrote since
  var clock = function () { return new Date(); };

  function clone(v) { return JSON.parse(JSON.stringify(v)); }

  function validShape(kind, v) {
    if (kind === 'array') return Array.isArray(v);
    return v !== null && typeof v === 'object' && !Array.isArray(v);
  }

  function newRev() { return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8); }
  function readRev() { var r = CG.get('rev'); return typeof r === 'string' ? r : ''; }

  // Reads every collection from storage; null when any is missing, corrupt or from another version.
  function loadAll() {
    var loaded = {};
    var keys = Object.keys(SHAPES);
    for (var i = 0; i < keys.length; i++) {
      var v = CG.get(keys[i]);
      if (!validShape(SHAPES[keys[i]], v)) return null;
      loaded[keys[i]] = v;
    }
    if (loaded.meta.version !== SEED.version) return null;
    if (CG.get('session') === undefined) return null;
    return loaded;
  }

  // Another tab may have written since this page loaded. Re-read before changing anything so nothing is overwritten.
  function syncIfStale() {
    var r = readRev();
    if (r === rev) return;
    var loaded = loadAll();
    if (loaded) { db = loaded; rev = r; }
  }

  function seedAll() {
    Object.keys(SHAPES).forEach(function (k) {
      if (k === 'meta') {
        // lastGigId starts at the highest seeded id so a deleted seeded gig's id is never handed out again
        db.meta = { version: SEED.version, lastGigId: SEED.gigs.reduce(function (m, g) { return Math.max(m, g.id); }, 0) };
      } else if (SEED[k] !== undefined) db[k] = clone(SEED[k]);
      else db[k] = SHAPES[k] === 'array' ? [] : {};
      CG.set(k, db[k]);
    });
    CG.set('session', null);
    rev = newRev();
    CG.set('rev', rev);
  }

  var STORAGE_FULL = 'Your browser could not save that (its storage may be full or blocked). Nothing was changed.';

  // Runs `change` (which edits db and returns the result), then saves the named collections. If the browser refuses a
  // write, the edit is undone and a storage error comes back instead of a false success.
  function commit(names, change) {
    var snap = {};
    names.forEach(function (n) { snap[n] = clone(db[n]); });
    var result = change();
    var saved = names.every(function (n) { return Store._save(n); });
    if (saved) return result;
    names.forEach(function (n) { db[n] = snap[n]; Store._save(n); });
    return { ok: false, error: STORAGE_FULL };
  }

  // A list stored under a handle in favorites/follows, ignoring inherited names such as "constructor".
  function own(map, key) {
    return Object.prototype.hasOwnProperty.call(map, key) && Array.isArray(map[key]) ? map[key] : null;
  }

  function byNewest(a, b) {
    if (a.createdAt !== b.createdAt) return a.createdAt < b.createdAt ? 1 : -1;
    return b.id - a.id;
  }

  function minPrice(gig) {
    return Math.min.apply(null, gig.packages.map(function (p) { return p.price; }));
  }

  function categoryIds() { return SEED.categories.map(function (c) { return c.id; }); }

  function score(g) { return g.rating * g.ratingCount; }

  var PRICE_TESTS = {
    u500: function (p) { return p < 500; },
    mid: function (p) { return p >= 500 && p <= 1000; },
    high: function (p) { return p > 1000; }
  };

  var SORTS = {
    recent: byNewest,
    low: function (a, b) { return minPrice(a) - minPrice(b) || byNewest(a, b); },
    high: function (a, b) { return minPrice(b) - minPrice(a) || byNewest(a, b); },
    top: function (a, b) { return score(b) - score(a) || byNewest(a, b); }
  };

  // Lower-cased text a search query is matched against: title, category name, skills, seller name.
  function searchText(g) {
    var cat = SEED.categories.filter(function (c) { return c.id === g.category; })[0];
    var seller = Store.getUser(g.sellerHandle);
    return [g.title, cat ? cat.name : '', g.skills.join(' '), seller ? seller.name : ''].join(' ').toLowerCase();
  }

  function orderNumber(o) { return parseInt(String(o.id).replace(/\D/g, ''), 10) || 0; }
  function ordersNewest(a, b) { return a.createdAt === b.createdAt ? orderNumber(b) - orderNumber(a) : (a.createdAt < b.createdAt ? 1 : -1); }
  function reviewsNewest(a, b) { return a.createdAt === b.createdAt ? b.id - a.id : (a.createdAt < b.createdAt ? 1 : -1); }
  function nextOrderNumber() { return db.orders.reduce(function (m, o) { return Math.max(m, orderNumber(o)); }, 1000) + 1; }
  function nextId(list) { return list.reduce(function (m, x) { return Math.max(m, x.id); }, 0) + 1; }

  // newRating = (rating * count + stars) / (count + 1), kept to two decimals.
  function applyRating(target, stars) {
    target.rating = Math.round(((target.rating * target.ratingCount + stars) / (target.ratingCount + 1)) * 100) / 100;
    target.ratingCount += 1;
  }

  function convById(id) {
    for (var i = 0; i < db.conversations.length; i++) if (db.conversations[i].id === id) return db.conversations[i];
    return undefined;
  }

  function lastMessageTime(c) {
    return c.messages.length ? Date.parse(c.messages[c.messages.length - 1].at) : 0;
  }

  var PACKAGE_NAMES = ['Basic', 'Standard', 'Pro'];

  function text(v) { return String(v === undefined || v === null ? '' : v); }

  function cleanPackages(list) {
    if (!Array.isArray(list) || list.length < 1 || list.length > 3) return { error: 'Add one to three packages.' };
    var seen = {};
    var out = [];
    for (var i = 0; i < list.length; i++) {
      var p = list[i] || {};
      var name = text(p.name);
      if (PACKAGE_NAMES.indexOf(name) < 0 || seen[name]) return { error: 'Package names must be Basic, Standard or Pro, each used once.' };
      seen[name] = true;
      var price = Number(p.price);
      var days = Number(p.days);
      var revisions = p.revisions === '' || p.revisions === undefined || p.revisions === null ? 0 : Number(p.revisions);
      if (!isFinite(price) || Math.round(price * 100) / 100 <= 0 || price > 1000000) return { error: 'Each package needs a price above ₱0.' };   // test the rounded value: 0.004 is stored as 0
      if (!isFinite(days) || Math.floor(days) !== days || days < 1) return { error: 'Delivery days must be a whole number of 1 or more.' };
      if (!isFinite(revisions) || Math.floor(revisions) !== revisions || revisions < 0) return { error: 'Revisions must be a whole number of 0 or more.' };
      var includes = (Array.isArray(p.includes) ? p.includes : []).map(function (s) { return text(s).trim().slice(0, 80); }).filter(Boolean).slice(0, 8);
      out.push({ name: name, price: Math.round(price * 100) / 100, days: days, revisions: revisions, includes: includes });
    }
    if (!seen.Basic) return { error: 'Add a Basic package.' };
    out.sort(function (a, b) { return PACKAGE_NAMES.indexOf(a.name) - PACKAGE_NAMES.indexOf(b.name); });
    return { value: out };
  }

  // Keeps a known placeholder tile, an images/ filename or a small image data URL; anything else falls back to the category tile.
  function cleanCover(cover, category) {
    var c = text(cover);
    var m = /^tile:(\w+)$/.exec(c);
    if (m && categoryIds().indexOf(m[1]) >= 0) return c;
    if (/^img:[\w.\-]+$/.test(c)) return c;
    if (/^data:image\/(png|jpe?g|webp);base64,[A-Za-z0-9+\/=]+$/.test(c) && c.length <= 150000) return c;
    return 'tile:' + category;
  }

  // Validates the gig fields in `src`. requireAll: every field is required (create); otherwise only fields present are checked (update).
  function checkGigFields(src, requireAll, existing) {
    var f = {};
    function has(k) { return requireAll || k in src; }
    if (has('title')) {
      var title = text(src.title).trim();
      if (!title) return { error: 'Enter a title.' };
      if (title.length > 80) return { error: 'Title must be 80 characters or fewer.' };
      f.title = title;
    }
    if (has('category')) {
      if (categoryIds().indexOf(src.category) < 0) return { error: 'Choose a category.' };
      f.category = src.category;
    }
    if (has('description')) {
      var description = text(src.description).trim();
      if (!description) return { error: 'Add a description.' };
      if (description.length > 2000) return { error: 'Description must be 2,000 characters or fewer.' };
      f.description = description;
    }
    if (has('skills')) {
      f.skills = (Array.isArray(src.skills) ? src.skills : []).map(function (s) { return text(s).trim().slice(0, 30); }).filter(Boolean).slice(0, 12);
    }
    if (has('unit')) f.unit = src.unit === 'hour' ? 'hour' : 'project';
    if (has('packages')) {
      var pk = cleanPackages(src.packages);
      if (pk.error) return { error: pk.error };
      f.packages = pk.value;
    }
    if (has('cover')) f.cover = cleanCover(src.cover, f.category || (existing && existing.category) || 'others');
    return { fields: f };
  }

  var AVATAR_COLORS = ['#2F5A66', '#4F7C82', '#8FA66A', '#C9855A', '#7D5C7A', '#B5894A', '#566B91'];

  function userByEmail(email) {
    for (var i = 0; i < db.users.length; i++) if (db.users[i].email.toLowerCase() === email) return db.users[i];
    return undefined;
  }

  var Store = {
    // Picks the storage backend, loads every collection, and reseeds everything when anything is
    // missing, corrupt or from another version.
    init: function () {
      CG.init();
      var loaded = loadAll();
      if (loaded) { db = loaded; rev = readRev(); } else seedAll();
    },

    // Restores the seed and signs out ("Reset demo data").
    reset: function () { seedAll(); },

    setClock: function (fn) { clock = fn; },
    now: function () { return clock(); },
    storageMode: function () { return CG.mode; },

    // Writes one collection back through CGStorage and stamps a new revision. Returns false when the browser refuses.
    _save: function (collection) {
      var ok = CG.set(collection, db[collection]);
      if (ok) { rev = newRev(); CG.set('rev', rev); }
      return ok;
    },

    categories: function () { return clone(SEED.categories); },
    allGigs: function () { return db.gigs.slice().sort(byNewest); },
    getGig: function (id) {
      for (var i = 0; i < db.gigs.length; i++) if (db.gigs[i].id === id) return db.gigs[i];
      return undefined;
    },
    allUsers: function () { return db.users.slice(); },
    getUser: function (handle) {
      for (var i = 0; i < db.users.length; i++) if (db.users[i].handle === handle) return db.users[i];
      return undefined;
    },
    demoAccounts: function () { return clone(SEED.demo); },
    testimonials: function () { return clone(SEED.testimonials); },
    faq: function () { return clone(SEED.faq); }

    ,

    // ---- Task 3: catalog queries ----
    minPrice: minPrice,

    // "₱350 – ₱900" for showRange gigs, "₱X" for a single package, otherwise "from ₱X".
    priceLabel: function (gig) {
      var prices = gig.packages.map(function (p) { return p.price; });
      var lo = Math.min.apply(null, prices);
      var hi = Math.max.apply(null, prices);
      if (gig.showRange && lo !== hi) return Util.formatPeso(lo) + ' – ' + Util.formatPeso(hi);
      if (gig.packages.length === 1) return Util.formatPeso(lo);
      return 'from ' + Util.formatPeso(lo);
    },

    // opts: {q, cat, price: ['u500','mid','high'], sort: 'recent'|'low'|'high'|'top', page, perPage}. Junk degrades to defaults.
    listGigs: function (opts) {
      opts = opts || {};
      var q = String(opts.q === undefined || opts.q === null ? '' : opts.q).trim().toLowerCase();
      var cat = categoryIds().indexOf(opts.cat) >= 0 ? opts.cat : '';
      var price = (Array.isArray(opts.price) ? opts.price : []).filter(function (id) { return PRICE_TESTS[id]; });
      var sort = SORTS[opts.sort] ? opts.sort : 'recent';
      var perPage = Util.toInt(opts.perPage, 6, 1, 100);

      var items = db.gigs.filter(function (g) {
        if (cat && g.category !== cat) return false;
        if (price.length && !price.some(function (id) { return PRICE_TESTS[id](minPrice(g)); })) return false;
        return !q || searchText(g).indexOf(q) >= 0;
      }).sort(SORTS[sort]);

      var pages = Math.max(1, Math.ceil(items.length / perPage));
      var page = Util.clamp(Util.toInt(opts.page, 1, 1, pages), 1, pages);
      return { items: items.slice((page - 1) * perPage, page * perPage), total: items.length, page: page, pages: pages };
    },

    topRated: function (n) { return db.gigs.slice().sort(SORTS.top).slice(0, n); },

    // Top-rated order, skipping the user's own gigs and gigs they already ordered.
    recommended: function (handle, n) {
      var ordered = {};
      db.orders.forEach(function (o) { if (o.buyer === handle) ordered[o.gigId] = true; });
      return db.gigs.slice().sort(SORTS.top).filter(function (g) {
        return g.sellerHandle !== handle && !ordered[g.id];
      }).slice(0, n);
    },

    gigsBySeller: function (handle) {
      return db.gigs.filter(function (g) { return g.sellerHandle === handle; }).sort(byNewest);
    }

    ,

    // ---- Task 4: accounts and session ----
    signUp: function (input) {
      input = input || {};
      var name = String(input.name === undefined || input.name === null ? '' : input.name).trim();
      var email = String(input.email === undefined || input.email === null ? '' : input.email).trim().toLowerCase();
      var password = String(input.password === undefined || input.password === null ? '' : input.password);
      if (!name) return { ok: false, error: 'Enter your full name.' };
      if (name.length > 60) return { ok: false, error: 'Name must be 60 characters or fewer.' };
      if (!Util.isValidEmail(email)) return { ok: false, error: 'Enter a valid email address.' };
      if (!/@slsu\.edu\.ph$/.test(email)) {
        return { ok: false, error: 'Use your SLSU email (@slsu.edu.ph). No SLSU email yet? Try a demo account on the sign-in page.' };
      }
      if (password.length < 8) return { ok: false, error: 'Password must be at least 8 characters.' };
      if (userByEmail(email)) return { ok: false, error: 'An account with that email already exists.' };

      var base = email.split('@')[0].replace(/[^a-z0-9._]/g, '_') || 'student';
      var handle = base;
      // never hand out a handle that is also an Object.prototype name ("constructor", "__proto__")
      for (var n = 2; Store.getUser(handle) || handle in Object.prototype; n++) handle = base + n;

      var d = Store.now();
      var user = {
        handle: handle, name: name, email: email, passHash: Util.mockHash(password),
        isSeller: input.role === 'seller', headline: 'SLSU Student', bio: '', skills: [],
        joined: d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2),
        avatarColor: AVATAR_COLORS[db.users.length % AVATAR_COLORS.length],
        rating: 0, ratingCount: 0, followers: 0, portfolio: [],
        prefs: { notifyOrders: true, notifyMessages: true, newsletter: false }
      };
      var made = commit(['users'], function () { db.users.push(user); return { ok: true, user: user }; });
      if (made.ok) CG.set('session', handle);
      return made;
    },

    signIn: function (email, password) {
      var user = userByEmail(String(email === undefined || email === null ? '' : email).trim().toLowerCase());
      if (!user || user.passHash !== Util.mockHash(password === undefined || password === null ? '' : password)) {
        return { ok: false, error: 'Incorrect email or password.' };
      }
      CG.set('session', user.handle);
      return { ok: true, user: user };
    },

    signOut: function () { CG.set('session', null); },

    // Reads the session on every call (never cached). A session that points at a missing user is cleared.
    currentUser: function () {
      var handle = CG.get('session');
      if (!handle) return null;
      var user = Store.getUser(handle);
      if (!user) { CG.set('session', null); return null; }
      return user;
    },

    becomeSeller: function (handle) {
      var user = Store.getUser(handle);
      if (!user) return { ok: false, error: 'Account not found.' };
      if (user.isSeller) return { ok: true, user: user };
      return commit(['users'], function () { Store.getUser(handle).isSeller = true; return { ok: true, user: Store.getUser(handle) }; });
    },

    // patch: {name?, headline?, bio?, skills?, prefs?}. Everything is validated before anything is applied.
    updateProfile: function (handle, patch) {
      var user = Store.getUser(handle);
      if (!user) return { ok: false, error: 'Account not found.' };
      patch = patch || {};
      var next = {};
      if ('name' in patch) {
        var name = String(patch.name === undefined || patch.name === null ? '' : patch.name).trim();
        if (!name) return { ok: false, error: 'Enter your full name.' };
        if (name.length > 60) return { ok: false, error: 'Name must be 60 characters or fewer.' };
        next.name = name;
      }
      if ('headline' in patch) next.headline = String(patch.headline === undefined || patch.headline === null ? '' : patch.headline).trim().slice(0, 80);
      if ('bio' in patch) next.bio = String(patch.bio === undefined || patch.bio === null ? '' : patch.bio).trim().slice(0, 500);
      if ('skills' in patch) {
        next.skills = (Array.isArray(patch.skills) ? patch.skills : []).map(function (s) { return String(s).trim().slice(0, 30); }).filter(Boolean).slice(0, 12);
      }
      if (patch.prefs && typeof patch.prefs === 'object') {
        next.prefs = {
          notifyOrders: 'notifyOrders' in patch.prefs ? !!patch.prefs.notifyOrders : user.prefs.notifyOrders,
          notifyMessages: 'notifyMessages' in patch.prefs ? !!patch.prefs.notifyMessages : user.prefs.notifyMessages,
          newsletter: 'newsletter' in patch.prefs ? !!patch.prefs.newsletter : user.prefs.newsletter
        };
      }
      return commit(['users'], function () {
        var u = Store.getUser(handle);
        Object.keys(next).forEach(function (k) { u[k] = next[k]; });
        return { ok: true, user: u };
      });
    },

    // Removes the user, their gigs, favorites and follows (and follows of them), then signs out. Orders stay.
    deleteAccount: function (handle) {
      var done = commit(['users', 'gigs', 'favorites', 'follows', 'meta'], function () {
        db.meta.lastGigId = Math.max(db.meta.lastGigId || 0, db.gigs.reduce(function (m, g) { return Math.max(m, g.id); }, 0));
        db.users = db.users.filter(function (u) { return u.handle !== handle; });
        db.gigs = db.gigs.filter(function (g) { return g.sellerHandle !== handle; });
        delete db.favorites[handle];
        delete db.follows[handle];
        Object.keys(db.follows).forEach(function (h) {
          if (Array.isArray(db.follows[h])) db.follows[h] = db.follows[h].filter(function (x) { return x !== handle; });
        });
        return { ok: true };
      });
      if (done.ok && CG.get('session') === handle) CG.set('session', null);
      return done;
    }

    ,

    // ---- Task 5: orders and reviews ----
    // input: {buyer, gigId, pkg, qty, date:'YYYY-MM-DD', time:'HH:MM', notes}
    placeOrder: function (input) {
      input = input || {};
      var gig = Store.getGig(Util.toInt(input.gigId, 0));
      if (!gig) return { ok: false, error: 'That gig is no longer available.' };
      var buyer = String(input.buyer === undefined || input.buyer === null ? '' : input.buyer);
      if (!Store.getUser(buyer)) return { ok: false, error: 'Sign in to place an order.' };
      if (gig.sellerHandle === buyer) return { ok: false, error: "You can't order your own gig." };
      var pkg = gig.packages.filter(function (p) { return p.name === input.pkg; })[0];
      if (!pkg) return { ok: false, error: 'Choose a package.' };

      var qty = input.qty === undefined ? 1 : (typeof input.qty === 'number' ? input.qty : Number(String(input.qty).trim()));
      if (!isFinite(qty) || Math.floor(qty) !== qty || qty < 1 || qty > 20 || (typeof input.qty === 'string' && !input.qty.trim())) {
        return { ok: false, error: 'Quantity must be a whole number from 1 to 20.' };
      }

      var date = String(input.date === undefined || input.date === null ? '' : input.date).trim();
      var time = String(input.time === undefined || input.time === null ? '' : input.time).trim();
      var when = /^\d{4}-\d{2}-\d{2}$/.test(date) && /^\d{2}:\d{2}$/.test(time) ? new Date(date + 'T' + time + ':00') : null;
      if (!when || isNaN(when.getTime())) return { ok: false, error: 'Choose a date and time.' };
      if (when.getTime() < Store.now().getTime()) return { ok: false, error: 'Pick a date and time that is not in the past.' };

      var order = {
        id: 'CG-' + nextOrderNumber(), gigId: gig.id, gigTitle: gig.title, buyer: buyer, seller: gig.sellerHandle,
        pkg: pkg.name, qty: qty, date: date, time: time,
        notes: String(input.notes === undefined || input.notes === null ? '' : input.notes).trim().slice(0, 500),
        payment: 'Pay on meet-up (demo)', total: pkg.price * qty, status: 'in_progress',
        createdAt: Store.now().toISOString(), reviewed: false
      };
      return commit(['orders'], function () { db.orders.push(order); return { ok: true, order: order }; });
    },

    getOrder: function (id) {
      for (var i = 0; i < db.orders.length; i++) if (db.orders[i].id === id) return db.orders[i];
      return undefined;
    },

    ordersOf: function (buyer, status) {
      return db.orders.filter(function (o) { return o.buyer === buyer && (!status || o.status === status); }).sort(ordersNewest);
    },

    ordersReceived: function (seller, status) {
      return db.orders.filter(function (o) { return o.seller === seller && (!status || o.status === status); }).sort(ordersNewest);
    },

    completeOrder: function (orderId, bySeller) {
      var order = Store.getOrder(orderId);
      if (!order) return { ok: false, error: 'Order not found.' };
      if (order.seller !== bySeller) return { ok: false, error: 'Only the seller can complete this order.' };
      if (order.status === 'completed') return { ok: false, error: 'This order is already completed.' };
      return commit(['orders'], function () { Store.getOrder(orderId).status = 'completed'; return { ok: true }; });
    },

    // input: {orderId, buyer, stars, text}. Updates the gig's and the seller's rating; order.reviewed blocks a second review.
    addReview: function (input) {
      input = input || {};
      var order = Store.getOrder(input.orderId);
      if (!order) return { ok: false, error: 'Order not found.' };
      if (order.buyer !== input.buyer) return { ok: false, error: 'Only the buyer can review this order.' };
      if (order.status !== 'completed') return { ok: false, error: 'You can review an order once it is completed.' };
      if (order.reviewed) return { ok: false, error: 'You already reviewed this order.' };
      var stars = typeof input.stars === 'number' ? input.stars : Number(String(input.stars === undefined || input.stars === null ? '' : input.stars).trim() || NaN);
      if (!isFinite(stars) || Math.floor(stars) !== stars || stars < 1 || stars > 5) return { ok: false, error: 'Choose a rating from 1 to 5 stars.' };
      var text = String(input.text === undefined || input.text === null ? '' : input.text).trim().slice(0, 500);
      if (!text) return { ok: false, error: 'Write a short review first.' };

      var review = {
        id: nextId(db.reviews), gigId: order.gigId, orderId: order.id, buyer: order.buyer, seller: order.seller,
        stars: stars, text: text, createdAt: Store.now().toISOString()
      };
      return commit(['reviews', 'orders', 'gigs', 'users'], function () {
        db.reviews.push(review);
        Store.getOrder(order.id).reviewed = true;
        var gig = Store.getGig(order.gigId);
        if (gig) applyRating(gig, stars);
        var seller = Store.getUser(order.seller);
        if (seller) applyRating(seller, stars);
        return { ok: true, review: review };
      });
    },

    reviewsForGig: function (gigId) { return db.reviews.filter(function (r) { return r.gigId === gigId; }).sort(reviewsNewest); },
    reviewsForSeller: function (handle) { return db.reviews.filter(function (r) { return r.seller === handle; }).sort(reviewsNewest); },
    reviewsBy: function (buyer) { return db.reviews.filter(function (r) { return r.buyer === buyer; }).sort(reviewsNewest); }

    ,

    // ---- Task 6: gig management, favorites and follows ----
    // draft: {title, category, description, skills, cover, unit, packages}. Sellers only.
    createGig: function (sellerHandle, draft) {
      var seller = Store.getUser(sellerHandle);
      if (!seller || !seller.isSeller) return { ok: false, error: 'Only sellers can post gigs.' };
      var checked = checkGigFields(draft || {}, true, null);
      if (checked.error) return { ok: false, error: checked.error };
      var f = checked.fields;
      return commit(['gigs', 'meta'], function () {
        var id = Math.max(db.meta.lastGigId || 0, db.gigs.reduce(function (m, g) { return Math.max(m, g.id); }, 0)) + 1;
        db.meta.lastGigId = id;
        var gig = {
          id: id, sellerHandle: sellerHandle, title: f.title, category: f.category, description: f.description,
          skills: f.skills, cover: f.cover, unit: f.unit, packages: f.packages, showRange: false,
          rating: 0, ratingCount: 0, createdAt: Store.now().toISOString()
        };
        db.gigs.push(gig);
        return { ok: true, gig: gig };
      });
    },

    updateGig: function (id, sellerHandle, patch) {
      var gig = Store.getGig(id);
      if (!gig) return { ok: false, error: 'Gig not found.' };
      if (gig.sellerHandle !== sellerHandle) return { ok: false, error: 'You can only edit your own gigs.' };
      var checked = checkGigFields(patch || {}, false, gig);
      if (checked.error) return { ok: false, error: checked.error };
      return commit(['gigs'], function () {
        var g = Store.getGig(id);
        Object.keys(checked.fields).forEach(function (k) { g[k] = checked.fields[k]; });
        return { ok: true, gig: g };
      });
    },

    // Favorites and orders that point at the gig are left alone: favorites skip it, orders keep their saved title.
    deleteGig: function (id, sellerHandle) {
      var gig = Store.getGig(id);
      if (!gig) return { ok: false, error: 'Gig not found.' };
      if (gig.sellerHandle !== sellerHandle) return { ok: false, error: 'You can only delete your own gigs.' };
      return commit(['gigs', 'meta'], function () {
        db.meta.lastGigId = Math.max(db.meta.lastGigId || 0, id);   // a deleted gig's id is never reused
        db.gigs = db.gigs.filter(function (g) { return g.id !== id; });
        return { ok: true };
      });
    },

    // Returns the new state. Unknown user or gig: false and nothing changes.
    toggleFavorite: function (handle, gigId) {
      if (!Store.getUser(handle) || !Store.getGig(gigId)) return false;
      var was = (own(db.favorites, handle) || []).indexOf(gigId) >= 0;
      var r = commit(['favorites'], function () {
        var list = own(db.favorites, handle);
        if (!list) { list = []; db.favorites[handle] = list; }
        var at = list.indexOf(gigId);
        if (at >= 0) list.splice(at, 1); else list.push(gigId);
        return { ok: true };
      });
      return r.ok ? !was : was;   // a refused write leaves the heart as it was
    },

    isFavorite: function (handle, gigId) { return (own(db.favorites, handle) || []).indexOf(gigId) >= 0; },

    // Most recently favorited first; gigs that no longer exist are skipped.
    favoritesOf: function (handle) {
      return (own(db.favorites, handle) || []).slice().reverse().map(Store.getGig).filter(Boolean);
    },

    // Returns the new state. Self or an unknown seller: false and nothing changes.
    toggleFollow: function (handle, sellerHandle) {
      var target = Store.getUser(sellerHandle);
      if (handle === sellerHandle || !Store.getUser(handle) || !target || !target.isSeller) return false;
      var was = (own(db.follows, handle) || []).indexOf(sellerHandle) >= 0;
      var r = commit(['follows'], function () {
        var list = own(db.follows, handle);
        if (!list) { list = []; db.follows[handle] = list; }
        var at = list.indexOf(sellerHandle);
        if (at >= 0) list.splice(at, 1); else list.push(sellerHandle);
        return { ok: true };
      });
      return r.ok ? !was : was;
    },

    isFollowing: function (handle, sellerHandle) { return (own(db.follows, handle) || []).indexOf(sellerHandle) >= 0; },

    // Seeded followers plus every follows entry that targets the seller.
    followerCount: function (sellerHandle) {
      var user = Store.getUser(sellerHandle);
      var n = user ? user.followers : 0;
      Object.keys(db.follows).forEach(function (h) { if (Array.isArray(db.follows[h]) && db.follows[h].indexOf(sellerHandle) >= 0) n++; });
      return n;
    }

    ,

    // ---- Task 7: messaging, newsletter and contact ----
    // Latest message first. Conversations with no messages yet go last.
    conversationsOf: function (handle) {
      return db.conversations.filter(function (c) { return c.members.indexOf(handle) >= 0; }).sort(function (a, b) {
        return lastMessageTime(b) - lastMessageTime(a);
      });
    },

    // Gets or creates the conversation between two handles (order-insensitive). Does not validate the handles.
    openConversation: function (me, other) {
      for (var i = 0; i < db.conversations.length; i++) {
        var m = db.conversations[i].members;
        if ((m[0] === me && m[1] === other) || (m[0] === other && m[1] === me)) return db.conversations[i];
      }
      var read = {};
      read[me] = 0;
      read[other] = 0;
      var conv = { id: 'c' + (db.conversations.reduce(function (n, c) { return Math.max(n, parseInt(String(c.id).replace(/\D/g, ''), 10) || 0); }, 0) + 1), members: [me, other], messages: [], readCount: read };
      db.conversations.push(conv);
      Store._save('conversations');
      return conv;
    },

    sendMessage: function (convId, from, body) {
      var conv = convById(convId);
      if (!conv) return { ok: false, error: 'Conversation not found.' };
      if (conv.members.indexOf(from) < 0) return { ok: false, error: 'You are not part of this conversation.' };
      var t = String(body === undefined || body === null ? '' : body).trim();
      if (!t) return { ok: false, error: 'Type a message first.' };
      if (t.length > 1000) return { ok: false, error: 'Messages can be up to 1,000 characters.' };
      var message = { from: from, text: t, at: Store.now().toISOString() };
      return commit(['conversations'], function () {
        var c = convById(convId);
        c.messages.push(message);
        c.readCount[from] = c.messages.length;
        return { ok: true, message: message };
      });
    },

    // A canned reply from `replier` (null if they are not in the conversation). Category comes from the replier's newest gig.
    autoReply: function (convId, replier, rng) {
      var conv = convById(convId);
      if (!conv || conv.members.indexOf(replier) < 0) return null;
      var gigs = Store.gigsBySeller(replier);
      var bank = (gigs.length && SEED.replies[gigs[0].category]) || SEED.replies.generic;
      var pick = Math.floor((rng || Math.random)() * bank.length);
      var message = { from: replier, text: bank[Util.clamp(pick, 0, bank.length - 1)], at: Store.now().toISOString() };
      var r = commit(['conversations'], function () {
        var c = convById(convId);
        c.messages.push(message);
        c.readCount[replier] = c.messages.length;
        return { ok: true };
      });
      return r.ok ? message : null;
    },

    markRead: function (convId, handle) {
      var conv = convById(convId);
      if (!conv || conv.members.indexOf(handle) < 0) return;
      conv.readCount[handle] = conv.messages.length;
      Store._save('conversations');
    },

    // Messages from the other member that this handle has not read yet, across all conversations.
    unreadCount: function (handle) {
      var n = 0;
      db.conversations.forEach(function (c) {
        if (c.members.indexOf(handle) < 0) return;
        var seen = c.readCount[handle] || 0;
        c.messages.forEach(function (m, i) { if (m.from !== handle && i >= seen) n++; });
      });
      return n;
    },

    subscribeNewsletter: function (email) {
      var e = String(email === undefined || email === null ? '' : email).trim().toLowerCase();
      if (!Util.isValidEmail(e)) return { ok: false, error: 'Enter a valid email address.' };
      if (db.newsletter.some(function (s) { return s.email === e; })) return { ok: true, already: true };
      return commit(['newsletter'], function () { db.newsletter.push({ email: e, createdAt: Store.now().toISOString() }); return { ok: true }; });
    },

    saveContact: function (input) {
      input = input || {};
      var name = String(input.name === undefined || input.name === null ? '' : input.name).trim();
      var email = String(input.email === undefined || input.email === null ? '' : input.email).trim();
      var message = String(input.message === undefined || input.message === null ? '' : input.message).trim();
      if (!name || !email || !message) return { ok: false, error: 'Please fill in all fields.' };
      if (!Util.isValidEmail(email)) return { ok: false, error: 'Enter a valid email address.' };
      return commit(['contacts'], function () {
        db.contacts.push({ name: name.slice(0, 80), email: email.slice(0, 120), message: message.slice(0, 2000), createdAt: Store.now().toISOString() });
        return { ok: true };
      });
    }

    /* @@NEXT@@ */
  };

  // Every call that changes data, and the session reader, first picks up anything another tab saved since this page loaded.
  ['signUp', 'signIn', 'currentUser', 'becomeSeller', 'updateProfile', 'deleteAccount', 'placeOrder', 'completeOrder', 'addReview',
    'createGig', 'updateGig', 'deleteGig', 'toggleFavorite', 'toggleFollow', 'openConversation', 'sendMessage', 'autoReply',
    'markRead', 'subscribeNewsletter', 'saveContact'].forEach(function (name) {
    var fn = Store[name];
    Store[name] = function () { syncIfStale(); return fn.apply(Store, arguments); };
  });

  root.Store = Store;
})(typeof window !== 'undefined' ? window : this);
