'use strict';
// Tiny test harness: no packages. Loads the browser scripts from js/ into a fresh vm context.
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const registry = [];

function test(name, fn) { registry.push({ name, fn }); }

// Structural equality that works across vm realms (arrays/objects from the app have other prototypes).
function same(a, b) {
  if (Object.is(a, b)) return true;
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;
  if (typeof a.getTime === 'function' && typeof b.getTime === 'function') return a.getTime() === b.getTime();
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (Array.isArray(a)) return a.length === b.length && a.every((v, i) => same(v, b[i]));
  const ka = Object.keys(a).sort();
  const kb = Object.keys(b).sort();
  return ka.length === kb.length && ka.every((k, i) => k === kb[i] && same(a[k], b[k]));
}

function show(v) {
  try { const s = JSON.stringify(v); const out = s === undefined ? String(v) : s; return out.length > 300 ? out.slice(0, 300) + '… (' + out.length + ' chars)' : out; } catch (e) { return String(e); }
}

function eq(actual, expected, msg) {
  if (!same(actual, expected)) {
    throw new Error((msg ? msg + '\n' : '') + '  actual:   ' + show(actual) + '\n  expected: ' + show(expected));
  }
}

function ok(cond, msg) {
  if (!cond) throw new Error(msg || 'assertion failed');
}

const DEFAULT_FILES = ['util', 'storage', 'data', 'store', 'auth'];

function makeApp(opts) {
  opts = opts || {};
  // sharedWith: another app whose backing storage this app should use (two tabs on the same site)
  const data = opts.sharedWith ? opts.sharedWith._data : Object.assign({}, opts.preload || {});
  let writesBroken = false;
  const blocked = opts.localStorage === 'blocked';
  const guard = () => { if (blocked) throw new Error('SecurityError: localStorage is blocked'); };
  const ls = {
    getItem(k) { guard(); return Object.prototype.hasOwnProperty.call(data, k) ? data[k] : null; },
    setItem(k, v) { guard(); if (writesBroken) throw new Error('QuotaExceededError'); data[k] = String(v); },
    removeItem(k) { guard(); delete data[k]; },
    key(i) { guard(); return Object.keys(data)[i] || null; },
    clear() { guard(); Object.keys(data).forEach(k => delete data[k]); },
    get length() { guard(); return Object.keys(data).length; },
  };

  let nameValue = opts.windowName || '';
  const location = {
    protocol: opts.protocol || 'http:',
    pathname: opts.pathname || '/index.html',
    search: opts.search || '',
    hash: opts.hash || '',
    href: '',
    navigatedTo: null,
    replace(u) { this.navigatedTo = u; },
    assign(u) { this.navigatedTo = u; },
  };
  const sandbox = {
    console, Date, setTimeout, clearTimeout,
    navigator: { userAgent: opts.userAgent || 'Mozilla/5.0 (Macintosh) Chrome/130.0 Safari/537.36' },
    location,
  };
  Object.defineProperty(sandbox, 'name', {
    configurable: true, enumerable: true,
    get() { return nameValue; },
    set(v) { if (!opts.freezeWindowName) nameValue = String(v); },
  });
  Object.defineProperty(sandbox, 'localStorage', { configurable: true, get() { return ls; } });
  sandbox.window = sandbox;
  vm.createContext(sandbox);

  const files = opts.files || DEFAULT_FILES.filter(f => fs.existsSync(path.join(ROOT, 'js', f + '.js')));
  for (const f of files) {
    const file = path.join(ROOT, 'js', f + '.js');
    vm.runInContext(fs.readFileSync(file, 'utf8'), sandbox, { filename: file });
  }

  const app = {
    window: sandbox,
    location,
    localStorageKeys: () => Object.keys(data),
    dump: () => Object.assign({}, data),          // a copy of everything in storage, usable as `preload`
    breakWrites: () => { writesBroken = true; },  // from now on setItem throws, like a full or blocked store
    _data: data,
  };
  for (const g of ['Util', 'Icons', 'CGStorage', 'SEED', 'Store', 'Auth', 'UI']) app[g] = sandbox[g];
  return app;
}

function boot(opts) {
  const app = makeApp(opts);
  if (app.Store) {
    app.Store.init();
    app.Store.setClock(() => new Date('2026-11-15T10:00:00'));
  }
  return app;
}

module.exports = { registry, test, eq, ok, same, makeApp, boot, ROOT };
