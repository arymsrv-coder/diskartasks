// Site-wide checks over every root *.html page and js/**. No browser needed.
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');

const PAGES = ['index.html', 'browse.html', 'about.html', 'signin.html', 'signup.html', 'profile.html', 'seller.html', 'gig.html', 'order.html', 'messages.html', 'post-gig.html', 'pricing.html'];
const SCRIPT_ORDER = ['js/util.js', 'js/icons.js', 'js/storage.js', 'js/data.js', 'js/store.js', 'js/auth.js', 'js/ui.js'];
const CSS_ORDER = ['css/tokens.css', 'css/base.css', 'css/components.css', 'css/shell.css', 'css/pages.css'];
const PAGE_SCRIPT = { 'index.html': 'home' };

const pages = () => fs.readdirSync(ROOT).filter(f => f.endsWith('.html')).sort();
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
function jsFiles(dir) { const out = []; for (const e of fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true })) { const rel = dir + '/' + e.name; if (e.isDirectory()) out.push(...jsFiles(rel)); else if (e.name.endsWith('.js')) out.push(rel); } return out; }
const allSources = () => [...pages(), ...jsFiles('js')];

// href="x", src="x" in HTML or inside JS template strings, and href: 'x' object properties. Strings built with + are dynamic and skipped.
function localTargets(text) {
  const found = [];
  const rx = /\b(?:href|src)\s*=\s*"([^"]*)"|\bhref\s*:\s*'([^']*)'|\bhref\s*:\s*"([^"]*)"/g;
  let m;
  while ((m = rx.exec(text))) found.push(m[1] !== undefined ? m[1] : m[2] !== undefined ? m[2] : m[3]);
  return found;
}
const isExternal = v => /^(https?:|mailto:|tel:|data:|javascript:|\/\/)/i.test(v);

test('all twelve pages exist and no other root page sneaks in', () => { eq(pages(), PAGES.slice().sort()); eq(pages().length, 12); });

test('no page or script uses href="#", an empty href, modules, fetch or XMLHttpRequest', () => {
  for (const f of allSources()) {
    const text = read(f);
    ok(!/href\s*=\s*"#"/.test(text) && !/href\s*=\s*""/.test(text) && !/href\s*=\s*'#'/.test(text), f + ' has an empty or # href');
    ok(!/type\s*=\s*["']module["']/.test(text), f + ' uses a module script');
    ok(!/\bfetch\s*\(/.test(text) && !/XMLHttpRequest/.test(text), f + ' uses fetch or XHR');
  }
});

test('every local link and image target exists', () => {
  for (const f of allSources()) {
    for (const raw of localTargets(read(f))) {
      if (!raw || isExternal(raw) || raw.startsWith('#') || /['"`+]/.test(raw)) continue;
      const file = raw.split('#')[0].split('?')[0];
      if (!file) continue;
      const exists = fs.existsSync(path.join(ROOT, file));
      ok(exists, f + ' links to a missing file: ' + raw);
    }
  }
});

test('every page loads the stylesheets and scripts in the Global Constraints order and has main#main', () => {
  for (const f of pages()) {
    const text = read(f);
    const css = [...text.matchAll(/<link[^>]+rel="stylesheet"[^>]+href="(css\/[^"]+)"/g)].map(m => m[1]);
    eq(css, CSS_ORDER, f + ' stylesheets');
    const scripts = [...text.matchAll(/<script[^>]+src="([^"]+)"/g)].map(m => m[1]);
    eq(scripts.slice(0, SCRIPT_ORDER.length), SCRIPT_ORDER, f + ' base scripts');
    const name = PAGE_SCRIPT[f] || f.replace(/\.html$/, '');
    const rest = scripts.slice(SCRIPT_ORDER.length);
    const ok1 = rest.length === 1 && rest[0] === 'js/pages/' + name + '.js';
    const ok2 = rest.length === 2 && rest[0] === 'js/pages/settings-drawer.js' && rest[1] === 'js/pages/' + name + '.js';
    ok(ok1 || ok2, f + ' page scripts: ' + JSON.stringify(rest));
    ok(/<main[^>]+id="main"/.test(text), f + ' has no <main id="main">');
    ok(/<title>[^<]+<\/title>/.test(text) && /<meta name="viewport"/.test(text), f + ' needs a title and viewport meta');
  }
});

test('every js/pages script that a page loads exists', () => {
  for (const f of pages()) for (const m of read(f).matchAll(/<script[^>]+src="([^"]+)"/g)) ok(fs.existsSync(path.join(ROOT, m[1])), f + ' loads missing ' + m[1]);
});

// Photos: the seed names files in images/; each must exist, be credited, and nothing in images/ may be an unused leftover.
test('every photo the seed refers to exists in images/, is credited, and none is unused', () => {
  const refs = new Set();
  const grab = v => { const m = /^img:([\w.\-]+)$/.exec(String(v)); if (m) refs.add(m[1]); };
  Object.values(SEED.images).forEach(grab);
  Object.values(SEED.categoryCovers).forEach(grab);
  SEED.gigs.forEach(g => grab(g.cover));
  SEED.users.forEach(u => (u.portfolio || []).forEach(p => grab(p.cover)));
  ok(refs.size >= 40, 'expected the seed to use at least 40 photos, found ' + refs.size);
  const dir = path.join(ROOT, 'images');
  for (const f of refs) ok(fs.existsSync(path.join(dir, f)), 'missing images/' + f);
  const files = fs.readdirSync(dir).filter(f => /\.(jpe?g|png|webp)$/i.test(f));
  for (const f of files) ok(refs.has(f), f + ' is in images/ but the seed never uses it');
  const credits = fs.readFileSync(path.join(dir, 'CREDITS.txt'), 'utf8');
  for (const f of files) ok(credits.includes(f), f + ' has no line in images/CREDITS.txt');
  const total = files.reduce((n, f) => n + fs.statSync(path.join(dir, f)).size, 0);
  ok(total < 6 * 1024 * 1024, 'images/ is ' + Math.round(total / 1024) + ' KB, over the 6 MB budget');
  for (const f of files) ok(fs.readFileSync(path.join(dir, f)).slice(0, 2).toString('hex') === 'ffd8', f + ' is not a JPEG');
  // Accessibility: each photo has a description for screen readers, and none describes a file that is not there.
  for (const f of files) { const a = SEED.photoAlt[f]; ok(typeof a === 'string' && a.length >= 15 && a.length <= 160, f + ' needs a 15-160 character alt text in SEED.photoAlt'); }
  for (const f of Object.keys(SEED.photoAlt)) ok(files.includes(f), 'SEED.photoAlt describes ' + f + ' which is not in images/');
});
