# Campus Gigs Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the 13-page Campus Gigs student marketplace as a plain HTML/CSS/JS site that runs on mock data stored in the browser.

**Architecture:** Separate HTML pages share `css/` files and classic scripts. All behaviour that can break (accounts, gigs, orders, reviews, chat, storage fallback) lives in DOM-free files (`util.js`, `storage.js`, `data.js`, `store.js`, `auth.js`) that are unit-tested in Node. Pages are thin scripts that render from `Store` and are verified in a browser.

**Tech Stack:** HTML5, CSS custom properties, vanilla JS in classic scripts (no modules), Node 22 for tests (`node tests/run.js`, no packages), Python 3 `http.server` for browser checks, Google Fonts (Inter, Poppins) with system fallback.

**Spec:** `docs/superpowers/specs/2026-11-15-campus-gigs-website-design.md`. Read it and the mockups in `/Users/arymsr.vendiola/Downloads/UI_UX MAAM GARAY/Idea/` before starting. The mockups win over the earlier HTML sample.

**Commits:** `Campus Gig/` is not a git repo and the owner has not asked for commits, so each task ends with a verification step, not a commit.

## Global Constraints

- Plain HTML, CSS and JavaScript. No framework, no build step, no package install.
- Must work from `file://`: no ES modules, no `fetch` or XHR of local files. Classic `<script>` tags only; data lives in `.js` files.
- Output goes in `/Users/arymsr.vendiola/Campus Gig/`. The originals in Downloads stay untouched.
- Currency is ₱. School is SLSU. Contact shown: `campusgigs@slsu.edu.ph`, "SLSU Main Campus". Footer tagline: "Made for campus. Made for each other." Footer line: "© 2026 Campus Gigs. All rights reserved."
- Colours: Warm Cream `#FBE8CE`, Pale Olive `#E9E4B8`, Slate Teal `#2F5A66`, Ivory `#FDFBE3`, Deep Teal `#0B1D22`. Poppins for headings, Inter for body.
- Component heights: button 48, input 52, chip 36, segmented control 40, filter bar 56, bottom navigation 64. Radii 4/8/12/16/24. 8-point spacing.
- Storage keys prefixed `campusgigs.v1.`. Backend: `localStorage`, else `window.name` (with a notice), else a banner. Missing or corrupt data reseeds.
- Sign-up requires an `@slsu.edu.ph` email and a password of at least 8 characters. The sign-up page says "Demo only: don't use a real password".
- Every interactive element navigates, opens something, or gives visible feedback. No `href="#"`.
- Accessibility: visible `:focus-visible`, labelled fields, modals trap focus and close on Esc, touch targets of at least 44px, text contrast of at least 4.5:1, `prefers-reduced-motion` respected.
- Every page loads scripts in this order: `js/util.js`, `js/icons.js`, `js/storage.js`, `js/data.js`, `js/store.js`, `js/auth.js`, `js/ui.js`, then (profile and seller pages only) `js/pages/settings-drawer.js`, then `js/pages/<page>.js`. Each file is an IIFE that attaches one global: `Util`, `Icons`, `CGStorage` (not `Storage`, which is a browser built-in), `SEED`, `Store`, `Auth`, `UI`.
- Every page links stylesheets in this order: `css/tokens.css`, `css/base.css`, `css/components.css`, `css/shell.css`, `css/pages.css`, and has `<main id="main">`.
- The header, footer and pop-ups follow the spec's "Reference pass" (Upwork's structure, Indeed's section patterns) while keeping the mockups' palette, logo and copy. Static links in `js/ui.js` are written as literal `href="page.html…"` attributes or `href: '…'` properties so `tests/site.test.js` can check them.
- Mutating `Store` calls return `{ok:true, ...}` or `{ok:false, error:string}`. They never throw on bad user input.

## Shared data shapes

```
Category     {id:'design'|'tech'|'writing'|'tutoring'|'admin'|'others', name, icon}
             names: Design & Creative, Tech & Development, Writing & Editing, Tutoring, Admin Support, Others
User         {handle, name, email, passHash, isSeller, headline, bio, skills:string[], joined:'YYYY-MM',
              avatarColor, rating, ratingCount, followers, portfolio:[{title, cover}],
              prefs:{notifyOrders, notifyMessages, newsletter}}
Package      {name:'Basic'|'Standard'|'Pro', price, days, revisions, includes:string[]}
Gig          {id:number, sellerHandle, title, category:categoryId, description, skills:string[],
              cover:'tile:<categoryId>'|'img:<file>'|dataURL, unit:'project'|'hour',
              packages:Package[1..3], showRange:boolean, rating, ratingCount, createdAt:ISO}
Order        {id:'CG-####', gigId, gigTitle, buyer, seller, pkg, qty, date:'YYYY-MM-DD', time:'HH:MM',
              notes, payment:'Pay on meet-up (demo)', total, status:'in_progress'|'completed',
              createdAt:ISO, reviewed:boolean}
Review       {id, gigId, orderId, buyer, seller, stars:1..5, text, createdAt:ISO}
Conversation {id, members:[handle,handle], messages:[{from, text, at:ISO}], readCount:{[handle]:number}}
Storage collections: users, gigs, orders, reviews, conversations, favorites{[handle]:gigId[]},
                     follows{[handle]:handle[]}, session(handle|null), newsletter, contacts, meta{version}
```

## Review Focus

Failure modes the spec implies but a straight reading would not test, most likely first. Each has a test in the task named in brackets.

1. **Junk or missing URL parameters** (`gig.html?id=abc`, `id=9999`, `seller.html?u=nobody`, `browse.html?page=-3&price=junk&sort=zzz`, `order.html` with no params): a friendly not-found or default view, never a blank page or console error. [Tasks 1, 3, 15, 16, 17]
2. **User text that is HTML, whitespace-only, or huge** (names, titles, bios, messages, reviews, notes): escaped when shown, trimmed, rejected or clamped. [Tasks 1, 4, 5, 6, 7]
3. **Records pointing at something deleted** (stale session after Reset or Delete account, a gig deleted while it has orders and favorites): signed-out state, favorites skip it, orders keep their saved title. [Tasks 4, 6]
4. **Double submits** (double-click Place order, Send, Leave review, Publish): one record only. [Tasks 5, 17, 19]
5. **Dates and times**: yesterday, today at an earlier time, empty fields. [Task 5]
6. **Popovers and modals opened by mouse, touch or keyboard** (mega menu, avatar menu, mobile menu drawer, modal, drawer): Esc and an outside click close them, focus returns to the opener, two popovers never stay open together, the page behind a modal does not scroll, and a tap on the mega-menu chevron works without hover. [Task 9]

## File Structure

```
Campus Gig/
  index.html browse.html about.html contact.html signin.html signup.html
  profile.html seller.html gig.html order.html messages.html post-gig.html pricing.html
  css/   tokens.css  base.css  components.css  shell.css  pages.css
  js/    util.js  icons.js  storage.js  data.js  store.js  auth.js  ui.js
         pages/  home.js browse.js about.js contact.js signin.js signup.js profile.js
                 settings-drawer.js seller.js gig.js order.js messages.js post-gig.js pricing.js
  images/  README.txt (how to swap in real photos; placeholders are generated)
  dev/kit.html          component style guide, used to check the design system
  tests/   harness.js run.js util.test.js storage.test.js seed.test.js catalog.test.js
           accounts.test.js orders.test.js market.test.js messaging.test.js site.test.js
  README.txt
```

## Browser verification setup (used by every page task)

- Serve: `python3 -m http.server 8077 --directory "/Users/arymsr.vendiola/Campus Gig"` in the background. Open `http://localhost:8077/<page>` in the built-in browser.
- Fresh state: run `localStorage.clear()` in the page console and reload.
- Widths: 1280, 768 and 375 (resize presets desktop / tablet / mobile). Console must show no errors.
- Fidelity: view the matching mockup PNG, take a screenshot at about 1024–1280 wide, and compare layout, copy, colours and components.

---

### Task 1: Test harness, utilities and storage layer

**Files:**
- Create: `tests/harness.js`, `tests/run.js`, `tests/util.test.js`, `tests/storage.test.js`, `js/util.js`, `js/storage.js`

**Interfaces:**
- Produces `tests/harness.js`: `test(name, fn)`, `eq(actual, expected)` (deep equal), `ok(cond, msg?)`. `makeApp(opts?): app` loads the named scripts from `js/` into a fresh `vm` context whose `window` is the global object. `opts`: `files?: string[]` (default util, storage, data, store, auth when they exist), `localStorage?: 'ok'|'blocked'` (blocked throws on every call), `windowName?: string`, `freezeWindowName?: boolean` (assignments ignored), `userAgent?: string`, `protocol?: string`, `preload?: {[key]: string}`. `app` exposes the globals (`app.Util`, `app.CGStorage`, …), `app.window`, `app.localStorageKeys(): string[]`. `boot(opts?): app` = `makeApp` + `Store.init()` + `Store.setClock(() => new Date('2026-11-15T10:00:00'))`. `tests/run.js` runs every `tests/*.test.js`, prints pass/fail per test, exits 1 on any failure. Before each test the runner calls `boot()` and assigns `Store`, `Auth`, `CGStorage`, `Util`, `SEED` to `globalThis`, so every test starts from fresh seed data; tests that need other options call `makeApp`/`boot` themselves. `boot()` skips the `Store` steps while `store.js` does not exist yet.
- Produces `Util`: `esc(s): string`, `formatPeso(n): string`, `toInt(v, fallback, min, max): number`, `clamp(n, min, max): number`, `initials(name): string`, `isValidEmail(s): boolean`, `mockHash(s): string`.
- Produces `CGStorage`: `init(): 'local'|'window-name'|'none'` (also sets `.mode`), `get(key): any|undefined`, `set(key, value): boolean`, `remove(key): void`, `clearAll(): void` (prefixed keys only).

- [ ] **Step 1: Write the failing tests**

```js
// tests/util.test.js
test('esc escapes HTML', () => eq(Util.esc(`<b>"x" & 'y'</b>`), '&lt;b&gt;&quot;x&quot; &amp; &#39;y&#39;&lt;/b&gt;'));            // Review Focus 2
test('formatPeso', () => { eq(Util.formatPeso(1500), '₱1,500'); eq(Util.formatPeso(350), '₱350'); eq(Util.formatPeso('x'), '₱0'); });
test('toInt sanitises junk', () => { eq(Util.toInt('abc',1,1,999), 1); eq(Util.toInt('-3',1,1,999), 1); eq(Util.toInt('5000',1,1,999), 999); eq(Util.toInt('7',1,1,999), 7); eq(Util.toInt(undefined,1,1,9), 1); }); // Review Focus 1
test('initials', () => { eq(Util.initials('Paolo Dela Cruz'), 'PD'); eq(Util.initials('juana'), 'J'); eq(Util.initials('  '), '?'); });
test('isValidEmail', () => { ok(Util.isValidEmail('a@slsu.edu.ph')); ok(!Util.isValidEmail('a@')); ok(!Util.isValidEmail(' a b@x.com')); });
test('mockHash is deterministic and not the input', () => { const h = Util.mockHash('pw12345678'); eq(h, Util.mockHash('pw12345678')); ok(h !== 'pw12345678' && h !== Util.mockHash('pw12345679')); });
```
```js
// tests/storage.test.js (S = app.CGStorage)
test('local mode round-trips under the prefix', () => { const a = makeApp(); eq(a.CGStorage.init(), 'local'); a.CGStorage.set('users', [{handle:'a'}]); eq(a.CGStorage.get('users'), [{handle:'a'}]); ok(a.localStorageKeys().includes('campusgigs.v1.users')); });
test('corrupt JSON reads as undefined', () => { const a = makeApp({preload:{'campusgigs.v1.users':'{bad'}}); a.CGStorage.init(); eq(a.CGStorage.get('users'), undefined); });
test('blocked localStorage falls back to window.name and survives a page change', () => { const a = makeApp({localStorage:'blocked'}); eq(a.CGStorage.init(), 'window-name'); a.CGStorage.set('session','juana.delacruz'); const b = makeApp({localStorage:'blocked', windowName:a.window.name}); b.CGStorage.init(); eq(b.CGStorage.get('session'),'juana.delacruz'); });
test('Firefox on file:// uses window.name even when localStorage works', () => eq(makeApp({userAgent:'Mozilla/5.0 Firefox/130.0', protocol:'file:'}).CGStorage.init(), 'window-name'));
test('both backends failing gives mode none and still works in memory', () => { const a = makeApp({localStorage:'blocked', freezeWindowName:true}); eq(a.CGStorage.init(), 'none'); a.CGStorage.set('k',1); eq(a.CGStorage.get('k'),1); });
test('clearAll leaves foreign keys alone', () => { const a = makeApp({preload:{'other':'x'}}); a.CGStorage.init(); a.CGStorage.set('k',1); a.CGStorage.clearAll(); eq(a.CGStorage.get('k'), undefined); ok(a.localStorageKeys().includes('other')); });
```

- [ ] **Step 2: Run `node tests/run.js`.** Expected: FAIL (scripts missing).
- [ ] **Step 3: Implement `js/util.js` and `js/storage.js`.** Storage probes `localStorage` with a write/read/remove of a probe key. `window-name` mode keeps one JSON object in `window.name` and verifies the write by reading it back; if the read-back fails it uses an in-memory object (`none`). In `window-name` mode `set` mirrors nothing to `localStorage`.
- [ ] **Step 4: Run `node tests/run.js`.** Expected: all Task 1 tests PASS.

---

### Task 2: Seed data and store bootstrap

**Files:**
- Create: `js/data.js`, `js/store.js` (bootstrap and read accessors only), `tests/seed.test.js`

**Interfaces:**
- Consumes: `CGStorage` (Task 1), `Util`.
- Produces `SEED`: `{version:'v1', categories, users, gigs, orders, reviews, conversations, favorites, follows, testimonials, faq, replies, demo, images}`. `SEED.images` is the one map for page imagery: slots `heroFrame1`–`heroFrame4`, `aboutCollage1`–`aboutCollage4`, `campus`, `banner`, each `'tile:<categoryId>'` by default or `'img:<filename>'` for a file in `images/`. `SEED.demo = {buyer:{email,password}, seller:{email,password}}`; the two passwords are 8+ characters chosen by the builder and live only here. `SEED.replies = {generic:string[], design:string[], tech:string[], writing:string[], tutoring:string[], admin:string[], others:string[]}`.
- Produces `Store`: `init(): void` (calls `CGStorage.init()`, loads the collections, reseeds everything if any collection is missing or invalid or `meta.version !== SEED.version`), `reset(): void` (reseed and clear session), `setClock(fn: ()=>Date): void`, `now(): Date`, `storageMode(): string`, `categories(): Category[]`, `allGigs(): Gig[]`, `getGig(id: number): Gig|undefined`, `allUsers(): User[]`, `getUser(handle: string): User|undefined`, `demoAccounts(): {buyer:{email,password}, seller:{email,password}}`, `testimonials(): {name, role, quote}[]`, `faq(): {q, a}[]`. Internal `Store._save(collection: string): void` writes one collection through `CGStorage`.

- [ ] **Step 1: Write the failing tests** in `tests/seed.test.js` using `boot()`:

```js
test('six categories in order', () => eq(Store.categories().map(c=>c.id), ['design','tech','writing','tutoring','admin','others']));
test('enough gigs, each category stocked', () => { const g = Store.allGigs(); ok(g.length >= 18); for (const c of ['design','tech','writing','tutoring','admin']) ok(g.filter(x=>x.category===c).length >= 3, c); ok(g.some(x=>x.category==='others')); });
test('mockup gigs 1-4 match the homepage', () => {
  const g = id => Store.getGig(id);
  eq([g(1).title, g(1).sellerHandle, g(1).rating, g(1).ratingCount, g(1).packages.map(p=>p.price)], ['Minimalist Logo for your Capstone','paolo_d',4.9,97,[350,600,900]]);
  eq([g(2).title, g(2).rating, g(2).ratingCount, Math.min(...g(2).packages.map(p=>p.price))], ['Brand Kit and Logo Pack',4.9,74,450]);
  eq([g(3).title, g(3).rating, g(3).ratingCount, Math.min(...g(3).packages.map(p=>p.price))], ['Next.js Components and Bug Fixes',4.8,63,500]);
  eq([g(4).title, g(4).rating, g(4).ratingCount, Math.min(...g(4).packages.map(p=>p.price))], ['Technical VA Hours',4.7,49,300]);
});
test('seller handles', () => eq([1,2,3,4,5,6].map(id=>Store.getGig(id).sellerHandle), ['paolo_d','bea_s','jaya_r','jaya_r','ken_c','rhea_m']));
test('every price filter has results', () => { const m = Store.allGigs().map(g=>Math.min(...g.packages.map(p=>p.price))); ok(m.some(x=>x<500) && m.some(x=>x>=500&&x<=1000) && m.some(x=>x>1000)); });
test('gigs 5+ never outscore gig 4 (rating x count 230.3) so Top-Rated stays 1-4', () => ok(Store.allGigs().filter(g=>g.id>4).every(g=>g.rating*g.ratingCount < 230)));
test('referential integrity', () => { for (const g of Store.allGigs()) { ok(Store.getUser(g.sellerHandle), g.title); ok(g.packages.every(p=>p.price>0)); } });
test('demo buyer', () => { const u = Store.getUser('juana.delacruz'); ok(u && !u.isSeller); /* orders and favorites asserted in Task 5/6 tests that own those APIs */ });
test('demo seller', () => { const u = Store.getUser('paolo_d'); eq([u.isSeller,u.rating,u.ratingCount,u.joined,u.skills], [true,4.8,87,'2025-03',['Graphic Design','Canva','Photo Editing','Branding']]); });
test('demo credentials exist and are 8+ chars', () => { const d = Store.demoAccounts(); ok(d.buyer.password.length>=8 && d.seller.password.length>=8); });
test('image slots are set', () => ok(['heroFrame1','heroFrame4','aboutCollage1','aboutCollage4','campus','banner'].every(k => /^(tile|img):/.test(SEED.images[k]))));
test('testimonials and faq', () => { eq(Store.testimonials().length, 4); ok(Store.testimonials()[0].quote.includes('Campus Gigs made it so easy to get my logo for our capstone')); eq(Store.faq().length, 3); });
test('corrupt collection reseeds', () => { const a = boot({preload:{'campusgigs.v1.gigs':'{bad'}}); ok(a.Store.allGigs().length >= 18); });
test('version mismatch reseeds', () => { const a = boot({preload:{'campusgigs.v1.meta':'{"version":"old"}'}}); ok(a.Store.allGigs().length >= 18); });
test('reset restores the seed and signs out', () => { const a = boot(); a.CGStorage.set('session','paolo_d'); a.Store.reset(); eq(a.CGStorage.get('session'), null); });
```
- [ ] **Step 2: Run `node tests/run.js`.** Expected: FAIL (`SEED`/`Store` missing).
- [ ] **Step 3: Write `js/data.js`.** Gigs 1–18 with ids fixed. Include the six mockup gigs (Statistical Analysis and Data Reports by `ken_c`, Academic Writing and Editing by `rhea_m`), a gig "Logo Design for Your Project" by `designbysaye` (from ₱450), Mia Santos' "Logo & Brand Design" (from ₱250), and invented gigs for the rest. Seller handles are exactly `paolo_d`, `bea_s`, `jaya_r`, `ken_c`, `rhea_m`, `mia_santos`, `designbysaye`; gigs 1–6 are the mockup gigs in that seller order (gigs 3 and 4 are both `jaya_r`). All seeded `createdAt` values are before 2026-11-15T10:00, so records created in tests sort first. Hourly gigs get `unit:'hour'` (tutoring, Technical VA Hours). Gig 1 has `showRange:true`. Prices ₱200–₱1,500. Seed orders, reviews, favorites, follows and conversations are added by Tasks 5–7, which own their tests; this task seeds users, gigs, testimonials (first quote is Ana Santos', as in the spec), faq (the three questions in `about.png`) and replies.
- [ ] **Step 4: Write `js/store.js` bootstrap** with the signatures above. Reads are plain lookups; `allGigs()` returns active gigs newest first.
- [ ] **Step 5: Run `node tests/run.js`.** Expected: PASS.

---

### Task 3: Catalog queries

**Files:**
- Modify: `js/store.js`
- Create: `tests/catalog.test.js`

**Interfaces:**
- Consumes: `Store.allGigs`, `Store.getGig`, `Store.getUser`, `Util.toInt`.
- Produces: `Store.minPrice(gig): number`, `Store.priceLabel(gig): string` (`showRange` → `₱350 – ₱900`; single package → `₱X`; otherwise `from ₱X`), `Store.listGigs(opts?: {q?: string, cat?: string, price?: string[], sort?: string, page?: number, perPage?: number}): {items: Gig[], total: number, page: number, pages: number}`, `Store.topRated(n: number): Gig[]`, `Store.recommended(handle: string|null, n: number): Gig[]`, `Store.gigsBySeller(handle: string): Gig[]`.
- Rules: `price` ids `'u500'` (min price < 500), `'mid'` (500 to 1,000 inclusive), `'high'` (> 1,000), combined with OR; unknown ids ignored. `sort`: `'recent'` (default; `createdAt` desc), `'low'`, `'high'`, `'top'` (rating × ratingCount desc); unknown falls back to `'recent'`. `q` matches title, category name, skills and seller name, case-insensitively. Unknown `cat` is treated as all. `page` clamps to `[1, pages]`; `perPage` default 6. `topRated` uses the same score as `'top'`. `recommended` excludes the user's own gigs and gigs they already ordered, then follows `topRated` order.

- [ ] **Step 1: Write the failing tests** with `boot()`:

```js
test('default listing paginates six per page', () => { const r = Store.listGigs({}); eq(r.items.length, 6); eq(r.pages, Math.ceil(r.total/6)); eq(r.page, 1); });
test('sorts', () => { const low = Store.listGigs({sort:'low', perPage:99}).items.map(Store.minPrice); eq(low, [...low].sort((a,b)=>a-b)); const top = Store.listGigs({sort:'top', perPage:99}).items.map(g=>g.rating*g.ratingCount); eq(top, [...top].sort((a,b)=>b-a)); });
test('category filter', () => ok(Store.listGigs({cat:'design', perPage:99}).items.every(g=>g.category==='design')));
test('price filters and union', () => { const p = ids => Store.listGigs({price:ids, perPage:99}).items.map(Store.minPrice); ok(p(['u500']).every(x=>x<500)); ok(p(['mid']).every(x=>x>=500&&x<=1000)); ok(p(['high']).every(x=>x>1000)); eq(p(['u500','high']).length, p(['u500']).length + p(['high']).length); });
test('search by title, seller and skill; no match is empty not an error', () => { ok(Store.listGigs({q:'LOGO'}).total >= 1); ok(Store.listGigs({q:'paolo'}).total >= 1); ok(Store.listGigs({q:'canva'}).total >= 1); const r = Store.listGigs({q:'zzzz'}); eq([r.total, r.pages, r.items], [0, 1, []]); });
test('junk options degrade gracefully', () => { const r = Store.listGigs({page:-3, sort:'zzz', price:['junk'], cat:'nope'}); eq(r.page, 1); eq(r.total, Store.allGigs().length); eq(Store.listGigs({page:999}).page, Store.listGigs({}).pages); }); // Review Focus 1
test('price labels', () => { eq(Store.priceLabel(Store.getGig(1)), '₱350 – ₱900'); eq(Store.priceLabel(Store.getGig(2)), 'from ₱450'); });
test('top rated four are gigs 1-4 in order', () => eq(Store.topRated(4).map(g=>g.id), [1,2,3,4]));
test('recommended is distinct and skips own and ordered gigs', () => { const r = Store.recommended('paolo_d', 4); eq(r.length, 4); eq(new Set(r.map(g=>g.id)).size, 4); ok(r.every(g=>g.sellerHandle!=='paolo_d')); eq(Store.recommended(null, 4).length, 4); });
```
- [ ] **Step 2: Run `node tests/run.js`.** Expected: FAIL.
- [ ] **Step 3: Implement the functions in `js/store.js`** per the rules above.
- [ ] **Step 4: Run `node tests/run.js`.** Expected: PASS.

---

### Task 4: Accounts, session and route helpers

**Files:**
- Modify: `js/store.js`
- Create: `js/auth.js`, `tests/accounts.test.js`

**Interfaces:**
- Consumes: `Util.isValidEmail`, `Util.mockHash`, `Util.clamp`, `Store.getUser`, `CGStorage`.
- Produces `Store`: `signUp({name, email, password, role: 'buyer'|'seller'}): {ok, user?, error?}` (handle = lowercased email local part with characters outside `a-z0-9._` replaced by `_`, plus a number suffix if taken; starts the session; `joined` = current month from `Store.now()`; headline `'SLSU Student'`), `signIn(email, password): {ok, user?, error?}` (email trimmed and case-insensitive), `signOut(): void`, `currentUser(): User|null` (reads the session from `CGStorage` on every call; never cached), `becomeSeller(handle): {ok, user?}`, `updateProfile(handle, {name?, headline?, bio?, skills?, prefs?}): {ok, user?, error?}` (name trimmed, required, ≤ 60 chars; bio ≤ 500), `deleteAccount(handle): {ok}` (removes the user, their gigs, favorites and follows, then signs out; orders stay).
- Produces `Auth`: `require(): User|null` (if not signed in, redirects to `signin.html?next=<encoded current page and query>` and returns null; otherwise returns the user), `landingFor(user): string` (`seller.html?u=<handle>` for sellers, else `profile.html`), `safeNext(param: string|null): string|null` (accepts only `^[a-z0-9-]+\.html(\?[\w=&%.\-]*)?(#[\w-]*)?$`, case-insensitive).

- [ ] **Step 1: Write the failing tests:**

```js
test('signUp buyer and seller', () => { const b = Store.signUp({name:'Ana Reyes', email:'Ana.Reyes@slsu.edu.ph', password:'longenough1', role:'buyer'}); eq([b.ok, b.user.handle, b.user.isSeller], [true,'ana.reyes',false]); eq(Store.currentUser().handle, 'ana.reyes'); const s = Store.signUp({name:'Seller Sam', email:'sam@slsu.edu.ph', password:'longenough1', role:'seller'}); eq(s.user.isSeller, true); });
test('signUp validation', () => { const r = (o) => Store.signUp({name:'A', email:'a1@slsu.edu.ph', password:'12345678', role:'buyer', ...o}); ok(r({email:'a@gmail.com'}).error.includes('@slsu.edu.ph')); eq(r({password:'short'}).error, 'Password must be at least 8 characters.'); eq(r({name:'   '}).error, 'Enter your full name.'); r({}); eq(r({email:'A1@SLSU.EDU.PH'}).error, 'An account with that email already exists.'); });
test('signIn', () => { const d = Store.demoAccounts(); eq(Store.signIn(` ${d.buyer.email.toUpperCase()} `, d.buyer.password).ok, true); eq(Store.signIn(d.buyer.email, 'wrong').error, 'Incorrect email or password.'); eq(Store.signIn('nobody@slsu.edu.ph','x').error, 'Incorrect email or password.'); });
test('password is not stored in the clear', () => { Store.signUp({name:'Pw Test', email:'pw@slsu.edu.ph', password:'secret-pass-1', role:'buyer'}); ok(!JSON.stringify(Store.getUser('pw')).includes('secret-pass-1')); });
test('signOut', () => { Store.signIn(Store.demoAccounts().buyer.email, Store.demoAccounts().buyer.password); Store.signOut(); eq(Store.currentUser(), null); });
test('stale session reads as signed out and is cleared', () => { CGStorage.set('session','ghost'); eq(Store.currentUser(), null); eq(CGStorage.get('session'), null); }); // Review Focus 3
test('becomeSeller is idempotent', () => { Store.becomeSeller('juana.delacruz'); Store.becomeSeller('juana.delacruz'); eq(Store.getUser('juana.delacruz').isSeller, true); });
test('updateProfile trims, clamps, rejects empty name', () => { eq(Store.updateProfile('juana.delacruz',{name:'  '}).ok, false); const r = Store.updateProfile('juana.delacruz',{name:' Juana ', bio:'x'.repeat(900)}); eq([r.user.name, r.user.bio.length], ['Juana', 500]); }); // Review Focus 2
test('HTML in a name is stored as text for the UI to escape', () => { const r = Store.signUp({name:'<img src=x onerror=alert(1)>', email:'x1@slsu.edu.ph', password:'12345678', role:'buyer'}); eq(r.user.name, '<img src=x onerror=alert(1)>'); });
test('deleteAccount removes the user and their gigs and signs out', () => { Store.signIn(Store.demoAccounts().seller.email, Store.demoAccounts().seller.password); Store.deleteAccount('paolo_d'); eq([Store.getUser('paolo_d'), Store.currentUser(), Store.gigsBySeller('paolo_d')], [undefined, null, []]); });
test('Auth.safeNext blocks open redirects', () => { eq(Auth.safeNext('gig.html?id=3'), 'gig.html?id=3'); for (const bad of ['https://evil.com','//evil.com','javascript:alert(1)','../x.html',null,'']) eq(Auth.safeNext(bad), null); });
test('Auth.landingFor', () => { eq(Auth.landingFor({handle:'paolo_d', isSeller:true}), 'seller.html?u=paolo_d'); eq(Auth.landingFor({handle:'juana.delacruz', isSeller:false}), 'profile.html'); });
```
- [ ] **Step 2: Run `node tests/run.js`.** Expected: FAIL.
- [ ] **Step 3: Implement** `store.js` account functions and `js/auth.js`. `Auth.require` and `Auth.landingFor` use `location`; the harness provides a fake one.
- [ ] **Step 4: Run `node tests/run.js`.** Expected: PASS.

---

### Task 5: Orders and reviews

**Files:**
- Modify: `js/store.js`, `js/data.js`
- Create: `tests/orders.test.js`

**Interfaces:**
- Consumes: `Store.getGig`, `Store.getUser`, `Store.now`, `Store._save`.
- Produces: `Store.placeOrder({buyer, gigId, pkg, qty, date, time, notes}): {ok, order?, error?}`, `Store.getOrder(id): Order|undefined`, `Store.ordersOf(buyer, status?): Order[]` and `Store.ordersReceived(seller, status?): Order[]` (newest first), `Store.completeOrder(orderId, bySeller): {ok, error?}`, `Store.addReview({orderId, buyer, stars, text}): {ok, review?, error?}`, `Store.reviewsForGig(gigId)`, `Store.reviewsForSeller(handle)`, `Store.reviewsBy(buyer)`: `Review[]` newest first.
- Rules: `total = package price × qty`. `qty` is an integer 1–20. `notes` trimmed and clamped to 500. A new order has status `in_progress`, id `CG-` plus a counter starting at 1001 (continuing after seeded ids), `payment` `'Pay on meet-up (demo)'`, `gigTitle` copied from the gig. A review updates both the gig and the seller using `newRating = (rating × count + stars) / (count + 1)`, `count + 1`, and sets `order.reviewed`.
- Seed (add to `data.js`): orders for `juana.delacruz` with statuses (newest first) `in_progress`, `completed`, `completed`, where the in-progress one is "Logo Design for Your Project", ₱450, seller `designbysaye`; `paolo_d` receives at least one `in_progress` and one `completed`; several seeded reviews including at least one by `juana.delacruz` and at least one for gig 1. All seeded `createdAt` values are before 2026-11-15T10:00.

- [ ] **Step 1: Write the failing tests** (clock is 2026-11-15 10:00):

```js
const order = o => Store.placeOrder({buyer:'juana.delacruz', gigId:1, pkg:'Standard', qty:1, date:'2026-11-20', time:'14:00', notes:' hi ', ...o});
test('seeded orders for the demo accounts', () => { eq(Store.ordersOf('juana.delacruz').map(o=>o.status), ['in_progress','completed','completed']); eq(Store.ordersOf('juana.delacruz')[0].gigTitle, 'Logo Design for Your Project'); ok(Store.ordersReceived('paolo_d','in_progress').length>=1 && Store.ordersReceived('paolo_d','completed').length>=1); ok(Store.reviewsBy('juana.delacruz').length>=1 && Store.reviewsForGig(1).length>=1); });
test('placeOrder', () => { const r = order({qty:2}); eq([r.ok, r.order.total, r.order.status, r.order.notes], [true, 1200, 'in_progress', 'hi']); ok(/^CG-\d{4,}$/.test(r.order.id)); eq(Store.ordersOf('juana.delacruz')[0].id, r.order.id); });
test('cannot order your own gig', () => eq(order({buyer:'paolo_d'}).error, "You can't order your own gig."));
test('date and time rules', () => { eq(order({date:'', time:''}).error, 'Choose a date and time.'); const past = 'Pick a date and time that is not in the past.'; eq(order({date:'2026-11-14'}).error, past); eq(order({date:'2026-11-15', time:'09:00'}).error, past); eq(order({date:'2026-11-15', time:'11:00'}).ok, true); }); // Review Focus 5
test('quantity and lookup rules', () => { for (const q of [0, 1.5, 'x', 21]) eq(order({qty:q}).error, 'Quantity must be a whole number from 1 to 20.'); ok(!order({gigId:9999}).ok); ok(!order({pkg:'Gold'}).ok); });
test('long notes are clamped', () => eq(order({notes:'n'.repeat(900)}).order.notes.length, 500)); // Review Focus 2
test('completeOrder', () => { const o = order({}).order; eq(Store.completeOrder(o.id,'ana.reyes').error, 'Only the seller can complete this order.'); eq(Store.completeOrder(o.id,'paolo_d').ok, true); eq(Store.getOrder(o.id).status, 'completed'); eq(Store.completeOrder(o.id,'paolo_d').error, 'This order is already completed.'); });
test('review rules', () => { const o = order({}).order; const rv = x => Store.addReview({orderId:o.id, buyer:'juana.delacruz', stars:5, text:'Great', ...x}); eq(rv({}).error, 'You can review an order once it is completed.'); Store.completeOrder(o.id,'paolo_d'); eq(rv({buyer:'ana.reyes'}).error, 'Only the buyer can review this order.'); for (const s of [0,6,2.5]) eq(rv({stars:s}).error, 'Choose a rating from 1 to 5 stars.'); eq(rv({text:'   '}).error, 'Write a short review first.'); eq(rv({}).ok, true); eq(rv({}).error, 'You already reviewed this order.'); }); // Review Focus 4
```
- [ ] **Step 2: Run `node tests/run.js`.** Expected: FAIL.
- [ ] **Step 3: Implement orders and reviews** and add the seed orders/reviews. Reviewing the same order is rejected by the `order.reviewed` flag, which is also the double-submit guard.
- [ ] **Step 4: Run `node tests/run.js`.** Expected: PASS.

---

### Task 6: Gig management, favorites and follows

**Files:**
- Modify: `js/store.js`, `js/data.js`
- Create: `tests/market.test.js`

**Interfaces:**
- Consumes: `Store.getGig`, `Store.getUser`, `Store._save`.
- Produces: `Store.createGig(sellerHandle, draft: {title, category, description, skills, cover, unit, packages}): {ok, gig?, error?}` (title 1–80 chars after trim; known category; non-empty description ≤ 2000; 1–3 packages with price > 0, whole days ≥ 1, revisions ≥ 0; only sellers; rating 0, count 0; `showRange` false; next numeric id; `createdAt` from `Store.now()`), `Store.updateGig(id, sellerHandle, patch): {ok, gig?, error?}` (owner only), `Store.deleteGig(id, sellerHandle): {ok, error?}` (owner only), `Store.toggleFavorite(handle, gigId): boolean` (new state; false and no change for unknown user or gig), `Store.isFavorite(handle, gigId): boolean`, `Store.favoritesOf(handle): Gig[]` (most recently favorited first, skips missing gigs), `Store.toggleFollow(handle, sellerHandle): boolean` (false for self or unknown), `Store.isFollowing(handle, sellerHandle): boolean`, `Store.followerCount(sellerHandle): number` (seeded `followers` plus the number of `follows` entries targeting that seller).
- Seed (add to `data.js`): `juana.delacruz` has four favorites and follows `paolo_d`.

- [ ] **Step 1: Write the failing tests:**

```js
const draft = o => ({title:'Poster design', category:'design', description:'I make posters.', skills:['Canva'], cover:'tile:design', unit:'project', packages:[{name:'Basic', price:300, days:3, revisions:1, includes:['1 concept']}], ...o});
const buyerB = () => Store.signUp({name:'Buyer B', email:'b@slsu.edu.ph', password:'12345678', role:'buyer'});
test('createGig', () => { Store.becomeSeller('juana.delacruz'); const r = Store.createGig('juana.delacruz', draft({})); eq([r.ok, r.gig.rating, r.gig.ratingCount], [true,0,0]); eq(Store.listGigs({}).items[0].id, r.gig.id); eq(Store.gigsBySeller('juana.delacruz').some(g=>g.id===r.gig.id), true); });
test('createGig is for sellers', () => { buyerB(); eq(Store.createGig('b', draft({})).error, 'Only sellers can post gigs.'); });
test('createGig validation', () => { for (const bad of [{title:'  '}, {title:'t'.repeat(81)}, {category:'zzz'}, {description:''}, {packages:[]}, {packages:[{name:'Basic',price:0,days:1,revisions:0,includes:[]}]}, {packages:[{name:'Basic',price:100,days:0,revisions:0,includes:[]}]}]) ok(!Store.createGig('paolo_d', draft(bad)).ok); const four = ['Basic','Standard','Pro','Pro'].map(n=>({name:n,price:100,days:1,revisions:0,includes:[]})); ok(!Store.createGig('paolo_d', draft({packages:four})).ok); }); // Review Focus 2
test('update and delete are owner-only', () => { const g = Store.createGig('paolo_d', draft({})).gig; ok(!Store.updateGig(g.id,'bea_s',{title:'x'}).ok); eq(Store.updateGig(g.id,'paolo_d',{title:'New title'}).gig.title, 'New title'); ok(!Store.deleteGig(g.id,'bea_s').ok); eq(Store.deleteGig(g.id,'paolo_d').ok, true); eq(Store.getGig(g.id), undefined); });
test('a deleted gig disappears from favorites but orders keep their title', () => { const g = Store.createGig('paolo_d', draft({})).gig; Store.toggleFavorite('juana.delacruz', g.id); const o = Store.placeOrder({buyer:'juana.delacruz', gigId:g.id, pkg:'Basic', qty:1, date:'2026-11-20', time:'14:00', notes:''}).order; Store.deleteGig(g.id,'paolo_d'); ok(!Store.favoritesOf('juana.delacruz').some(x=>x.id===g.id)); eq(Store.getOrder(o.id).gigTitle, 'Poster design'); }); // Review Focus 3
test('favorites', () => { eq(Store.favoritesOf('juana.delacruz').length, 4); const was = Store.isFavorite('juana.delacruz', 5); eq(Store.toggleFavorite('juana.delacruz', 5), !was); eq(Store.isFavorite('juana.delacruz', 5), !was); eq(Store.toggleFavorite('juana.delacruz', 9999), false); eq(Store.toggleFavorite('ghost', 1), false); });
test('favoritesOf lists the newest favorite first', () => { buyerB(); Store.toggleFavorite('b', 3); Store.toggleFavorite('b', 4); eq(Store.favoritesOf('b').map(g=>g.id), [4,3]); });
test('follows and follower count', () => { const n = Store.followerCount('paolo_d'); eq(Store.isFollowing('juana.delacruz','paolo_d'), true); eq(Store.toggleFollow('juana.delacruz','paolo_d'), false); eq(Store.followerCount('paolo_d'), n-1); eq(Store.toggleFollow('juana.delacruz','paolo_d'), true); eq(Store.toggleFollow('paolo_d','paolo_d'), false); eq(Store.toggleFollow('juana.delacruz','nobody'), false); });
test('reviews move the gig and seller rating', () => { const g = Store.createGig('paolo_d', draft({})).gig; const buy = () => { const o = Store.placeOrder({buyer:'juana.delacruz', gigId:g.id, pkg:'Basic', qty:1, date:'2026-11-20', time:'14:00', notes:''}).order; Store.completeOrder(o.id,'paolo_d'); return o; }; const sellerBefore = Store.getUser('paolo_d').ratingCount; Store.addReview({orderId:buy().id, buyer:'juana.delacruz', stars:4, text:'ok'}); eq([Store.getGig(g.id).rating, Store.getGig(g.id).ratingCount], [4, 1]); Store.addReview({orderId:buy().id, buyer:'juana.delacruz', stars:5, text:'wow'}); eq([Store.getGig(g.id).rating, Store.getGig(g.id).ratingCount], [4.5, 2]); eq(Store.getUser('paolo_d').ratingCount, sellerBefore + 2); });
```
- [ ] **Step 2: Run `node tests/run.js`.** Expected: FAIL.
- [ ] **Step 3: Implement** the functions and the seeded favorites/follows.
- [ ] **Step 4: Run `node tests/run.js`.** Expected: PASS across Tasks 1–6.

---

### Task 7: Messaging, newsletter and contact

**Files:**
- Modify: `js/store.js`, `js/data.js`
- Create: `tests/messaging.test.js`

**Interfaces:**
- Consumes: `SEED.replies`, `Store.getUser`, `Store.now`, `Store._save`.
- Produces: `Store.conversationsOf(handle): Conversation[]` (latest message first), `Store.openConversation(me, other): Conversation` (get-or-create, order-insensitive; does not validate handles, so pages check `Store.getUser` first), `Store.sendMessage(convId, from, text): {ok, message?, error?}` (trim; empty rejected; max 1000), `Store.autoReply(convId, replier, rng?: ()=>number): Message|null` (null if `replier` is not a member; text from `SEED.replies` for the gig category when known, else `generic`), `Store.markRead(convId, handle): void`, `Store.unreadCount(handle): number` (messages from the other member with index ≥ `readCount[handle]`), `Store.subscribeNewsletter(email): {ok, already?, error?}`, `Store.saveContact({name, email, message}): {ok, error?}`.
- Seed: at least one conversation each for `juana.delacruz` and `paolo_d` (between them), with at least one seeded unread message for `paolo_d`; all of `paolo_d`'s unread messages are in that one conversation.

- [ ] **Step 1: Write the failing tests:**

```js
test('openConversation is idempotent and order-insensitive', () => { const a = Store.openConversation('ana.reyes','paolo_d'); const b = Store.openConversation('paolo_d','ana.reyes'); eq(a.id, b.id); eq(a.messages, []); });
test('sendMessage', () => { const c = Store.openConversation('ana.reyes','bea_s'); eq(Store.sendMessage(c.id,'ana.reyes','   ').error, 'Type a message first.'); ok(!Store.sendMessage(c.id,'ana.reyes','x'.repeat(1001)).ok); const r = Store.sendMessage(c.id,'ana.reyes','  hello  '); eq([r.ok, r.message.text, r.message.from], [true,'hello','ana.reyes']); }); // Review Focus 2
test('autoReply', () => { const c = Store.openConversation('ana.reyes','jaya_r'); const m = Store.autoReply(c.id,'jaya_r',()=>0); eq(m.from,'jaya_r'); ok(m.text.length>0); eq(Store.autoReply(c.id,'ghost',()=>0), null); eq(Store.conversationsOf('ana.reyes').find(x=>x.id===c.id).messages.length, 1); });
test('unread counts', () => { const before = Store.unreadCount('paolo_d'); const c = Store.openConversation('juana.delacruz','paolo_d'); Store.sendMessage(c.id,'juana.delacruz','new question'); eq(Store.unreadCount('paolo_d'), before+1); Store.markRead(c.id,'paolo_d'); eq(Store.unreadCount('paolo_d'), 0); });
test('seeded conversations exist for both demo users', () => { ok(Store.conversationsOf('juana.delacruz').length>=1); ok(Store.conversationsOf('paolo_d').length>=1); });
test('conversations sort by latest message', () => { const l = Store.conversationsOf('juana.delacruz'); const last = c => c.messages.length ? Date.parse(c.messages[c.messages.length-1].at) : 0; eq(l.map(last), [...l.map(last)].sort((a,b)=>b-a)); });
test('newsletter', () => { eq(Store.subscribeNewsletter('nope').error, 'Enter a valid email address.'); eq(Store.subscribeNewsletter('n@x.com').ok, true); eq(Store.subscribeNewsletter('n@x.com').already, true); });
test('contact form', () => { eq(Store.saveContact({name:'', email:'a@b.co', message:'hi'}).error, 'Please fill in all fields.'); eq(Store.saveContact({name:'A', email:'bad', message:'hi'}).error, 'Enter a valid email address.'); eq(Store.saveContact({name:'A', email:'a@b.co', message:'hi'}).ok, true); });
```
- [ ] **Step 2: Run `node tests/run.js`.** Expected: FAIL.
- [ ] **Step 3: Implement** the functions and seed conversations. `autoReply` takes the category from the most recent gig whose seller is `replier`, if any.
- [ ] **Step 4: Run `node tests/run.js`.** Expected: PASS across Tasks 1–7. The domain layer is now complete and tested.

---

### Task 8: Design system (tokens, components, icons, reference sections)

**Files:**
- Create: `css/tokens.css`, `css/base.css`, `css/components.css`, `js/icons.js`, `dev/kit.html`

**Interfaces:**
- Produces CSS custom properties. Kit: `--cream --olive --teal --ivory --deep`, `--r4 --r8 --r12 --r16 --r24`, `--s4 --s8 --s12 --s16 --s20 --s24 --s32 --s40`, `--h-btn:48px --h-input:52px --h-chip:36px --h-seg:40px --h-filter:56px --h-bottomnav:64px`. Reference pass: `--r-pill:999px`, `--danger:#B3261E`, `--shadow-card --shadow-pop --shadow-modal`, `--grad-soft` (90deg, Pale Olive to Warm Cream), `--grad-band` (135deg, Deep Teal to Slate Teal), `--container:1200px`, `--gutter:24px` (16px under 768px), `--h-header:72px`, `--h-appbar:56px`, `--fs-display:clamp(40px, 5.5vw, 64px)`, layers `--z-header:50 --z-mega:60 --z-drawer:70 --z-modal:80 --z-toast:90`.
- `base.css` also provides `.container` (max width `--container`, side padding `--gutter`) and `html{scroll-padding-top:calc(var(--h-header) + 16px)}`, so anchor jumps (profile and seller navs, footer links) never hide under the sticky header.
- Produces kit classes: `.btn .btn--primary .btn--secondary .btn--outline .btn--sm .btn--icon`, `.chip .chip--active .chip--removable`, `.field .input-wrap .input` (leading icon, focus ring), `.check .radio .switch`, `.segmented`, `.pagination .page`, `.stepper`, `.stars`, `.card`, `.gig-card` (+ `--compact`, `--row`), `.pill .pill--progress .pill--done`, `.avatar`, `.band` (+ `--olive`, `--deep`), `.modal`, `.drawer`, `.toast`, `.sr-only`.
- Produces reference-pass classes. All are CSS-only; behaviour comes from `UI` in Task 9. Each takes its look from the reference named in brackets and its colours from the kit:
  - `.btn--light`: Warm Cream fill, Deep Teal text, Ivory on hover, 48px high; for dark bands and the curved hero [Indeed's gold button].
  - `.mark`: inline highlighter, a Pale Olive band under the lower 40% of the text, `box-decoration-break:clone` [Upwork "proven freelancers"]. `.h-rule`: a 48 × 2px Slate Teal rule under a section heading [Indeed].
  - `.avatar-stack` (overlapping 28px avatars with a 2px Ivory ring) and `.proof` (stack plus a caption) [Upwork "1M+ jobs completed"]. `.logo-row`: an eyebrow line over a wrapped row of text wordmarks in Slate Teal Poppins 600 [Upwork "Trusted by"].
  - `.cat-tabs`: icon-over-label tab strip, 2px Deep Teal underline on the active tab, horizontal scroll with snap under 768px. `.spec-card`: title, "N available" caption and an optional avatar stack; `.spec-card--selected` has a 2px Slate Teal border; five columns on desktop, two on phones [Upwork].
  - `.steps-3`: three columns of heading and text under an `.h-rule` [Indeed]. `.steps-card`: Pale Olive card, three icon-led steps separated by hairlines [Upwork "How work gets done"]. `.media-card`: Deep Teal card with a rounded image slot, Ivory caption and sub-caption, optional play button [Upwork "See how it works"].
  - `.compare`: grid table with a column-label header; `.compare__row--us` has `--grad-soft`, `--r16`, `--shadow-card` and a larger title; cells hold `.yes` (check-circle, Slate Teal, `aria-label="Yes"`) or `.no` (x-circle, `--danger`, `aria-label="No"`) [Upwork "Why us?"].
  - `.keytable`: grouped feature table inside a scroll wrapper (first column sticky on phones): group heading rows, a highlighted column `.keytable__col--hl` filled with `--grad-soft` top to bottom, cells that are a check icon, text ("Limited access") or empty [Upwork Key Features].
  - `.plan-card`: Ivory card, `--r24`, 1px Deep Teal border at 12% opacity, feature list led by check icons; `.plan-card--popular` has a 2px Slate Teal border, a `--grad-soft` wash at the top and a `.badge--popular` tag in the top-right corner [Upwork Pricing]. `.badge`: `--popular` (Pale Olive pill, Deep Teal caps, 12px/600) and `--verified` (shield-check icon plus "SLSU verified", Slate Teal).
  - `.acc`: `.acc__item` holds a heading with `button.acc__btn[aria-expanded]` (chevron rotates when open) and `.acc__panel[hidden]`. `.acc-split` puts the list left and `.acc__preview` (a Slate Teal panel, `--r16`, with a sample card inside) right [Indeed "Your dashboard features"]. `.faq-split` puts a heading with `.h-rule` left and the list right [Indeed FAQ]. Both split layouts stack under 768px.
  - `.quote-band`: Warm Cream band, quote icon in Slate Teal, bold 20/28 quote, attribution in caption size [Indeed testimonial]. `.stat-line`: centred bold line under a trend-up icon [Indeed].
  - `.cta-band`: wide, `--grad-band` background, Ivory text, `.btn--light` [Upwork banner]. `.cta-band--card`: a 480px-max Slate Teal card that overlaps the corner of a photo [Indeed "Ready to find your next hire?"].
  - `.hero-curve`: Slate Teal panel whose bottom-right edge is a large organic curve (inline SVG mask or `clip-path`, no raster image), a Pale Olive blob behind the photo slot, light text and `.btn--light`; photo on the right, stacked under the text below 768px [Indeed hero].
  - `.seller-card`: avatar, name with `.badge--verified`, headline, a meta row (pin and location, rating, "N gigs", "from ₱X"), up to three `.chip`s, a two-line clamped bio and a *View profile* button [Upwork freelancer card].
  - `.link-grid`: four columns of plain text links (two under 768px), underline on hover [Upwork "Explore freelancer markets"]. `.breadcrumb`: home icon, chevron-right separators, last item plain text with `aria-current="page"`. `.rating-line`: stars, bold score, muted "Based on N reviews". `.prose`: long-text styles (max 68ch, heading and list spacing, underlined links).
- Produces `Icons.svg(name: string, opts?: {size?: number, cls?: string}): string` and `Icons.logo(size?: number): string`. Names: home, search, plus, message, user, heart, heart-fill, bookmark, bell, settings, sliders, calendar, clock, pin, tag, briefcase, code, pencil, image, upload, more, arrow-left, arrow-right, check, chevron-down, graduation, mail, minus, star, star-fill, trash, x, palette, shield-check, zap, handshake, users, grid, send, eye, eye-off, logout, quote, menu, facebook, instagram, x-social, youtube, google, apple, and, from the reference pass, chevron-right, check-circle, x-circle, trending-up, play, help. 24px grid, 2px rounded stroke, `currentColor`. Unknown name returns an empty string and does not throw.

- [ ] **Step 1: Write the tokens, base reset and kit components** to the kit board's specs, including the token additions above. Load Inter and Poppins from Google Fonts with a system-font fallback stack.
- [ ] **Step 2: Write the reference-pass components** in `css/components.css`, one block per component under a comment naming its source (for example `/* ref: upwork compare */`). Interactive ones get hover, `:focus-visible` and disabled states. Transitions only on `opacity`, `transform` and colour, all removed under `prefers-reduced-motion`.
- [ ] **Step 3: Write `js/icons.js` and `dev/kit.html`**, a page that shows every kit component and icon in all states (default, hover, focus, disabled, selected, error), then a "Reference sections" area with one specimen of every reference-pass component built from placeholder content (initials avatars, palette tiles). Accordions in the kit are static (open and closed set by attribute); Task 9 adds their behaviour.
- [ ] **Step 4: Verify in the browser** (`/dev/kit.html`) at 1280, 768 and 375. Compare the kit components with `Campus Gigs UI Asset Kit Board (1).png` and the reference components with the PDF screenshots (`First coding run for the website.pdf`, pages 1–9), in Campus Gigs colours. In the console, check `getBoundingClientRect().height` is 48 for `.btn` and `.btn--light`, 52 for `.input`, 36 for `.chip`, 40 for `.segmented`. Tab through every control and confirm a visible focus ring. Compute contrast; each pair must be at least 4.5:1: Deep Teal on Ivory, Ivory on Deep Teal, Slate Teal on Cream, Ivory on Slate Teal, Deep Teal on Pale Olive, Deep Teal on Warm Cream, Slate Teal on Pale Olive, and `--danger` on Ivory, Cream and Pale Olive. At 375 the page has no horizontal scroll (`.keytable` and `.cat-tabs` scroll inside their own wrappers). Expected: all heights match, all contrasts pass.
- [ ] **Step 5: Run `node tests/run.js`.** Expected: PASS (nothing here is covered by Node tests; this confirms nothing regressed).

---

### Task 9: Page shell (header, footer, pop-ups, shared components)

**Files:**
- Create: `js/ui.js`, `css/shell.css`
- Modify: `js/data.js` (add `SEED.navMenu`), `tests/catalog.test.js` (nav-menu test), `dev/kit.html` (mount the shell and show the shared components)

**Interfaces:**
- Consumes: `Store.currentUser`, `Store.unreadCount`, `Store.storageMode`, `Store.subscribeNewsletter`, `Store.categories`, `Store.gigsBySeller`, `Store.listGigs`, `Store.priceLabel`, `Store.isFavorite`, `Store.toggleFavorite`, `Store.signOut`, `Auth.landingFor`, `Util.esc`, `Util.formatPeso`, `Icons.svg`, `SEED.images`, `SEED.navMenu`, and the Task 8 classes.
- Produces `SEED.navMenu: {cat: string, subs: {label: string, desc: string, q: string}[]}[]`: one entry per category in `Store.categories()` order, four sub-services each. The builder writes the names and one-line descriptions; `q` is a search term that matches seeded gigs.
- Produces `UI`:
  - `mount(opts: {page: string, hideFooter?: boolean, crumbs?: {label: string, href?: string}[]}): void`. Injects, in order: a skip link to `#main`, the storage notice when `Store.storageMode() !== 'local'`, the desktop header (shown from 1024px), the mobile app bar (below 1024px), the bottom navigation (below 768px), the breadcrumb strip when `crumbs` is given, the footer unless `hideFooter`, and the toast host. `page` values `'home' | 'browse' | 'pricing' | 'about' | 'contact'` mark the matching nav link `aria-current="page"`; any other value marks none.
  - `toast(message: string, opts?: {actionLabel?: string, onAction?: ()=>void}): void`, `modal({title, body: string|Node, actions: {label, variant?, onClick?: ()=>boolean|void}[]}): {close(): void}`, `drawer({title, body, side?: 'left'|'right'}): {close(): void}` (default `'right'`). Modals and drawers: focus trap, Esc and an outside click close them, focus returns to the opener, the page behind stops scrolling, opening one closes any open popover, and toasts sit above them.
  - `policy(kind: 'privacy'|'terms'|'accessibility'|'sitemap'|'guidelines'): void` opens a short placeholder modal (the sitemap lists every page as a link).
  - `accordion(root: Element, opts?: {single?: boolean}): void` wires every `.acc` inside `root`: a header button toggles `aria-expanded` and its panel's `hidden`; Up, Down, Home and End move between headers; `single` defaults to true (one open at a time).
  - `breadcrumb(items: {label: string, href?: string}[]): string`, `ctaBand(opts: {title: string, text?: string, label: string, href: string, variant?: 'wide'|'card'}): string`, `sellerCard(user: User): string` (uses `Store.gigsBySeller` for the gig count and "from ₱X").
  - `avatar(user, size?: number): string`, `stars(rating: number, count?: number): string`, `tile(coverKey: string, alt: string): string` (placeholder tile for `tile:<id>`, `<img>` with tile fallback for `img:` and data URLs), `gigCard(gig, opts?: {variant?: 'grid'|'compact'|'row'}): string`, `bindGigCards(root: Element): void` (card click opens `gig.html?id=`; heart toggles favorites, or sends a signed-out user to `signin.html?next=`), `query(): URLSearchParams`, `notFound(root: Element, what: string): void` (friendly "we couldn't find that" panel with a Browse Gigs button).
  - `refreshBadges(): void` re-reads `Store.unreadCount` and updates every Messages badge (header, app bar, bottom navigation); the Messages page calls it after `Store.markRead`.
- **Header (from 1024px).** Sticky (`--z-header`); `.is-scrolled` adds a shadow after 8px of scroll. Left to right: the logo (`index.html`); the nav, *Browse Gigs* (a link to `browse.html` with a chevron button beside it that opens the mega menu), *Pricing* (`pricing.html`), *About Us* (`about.html`), *Contact* (`contact.html`); the search, a category `<select aria-label="Search in">` (All categories plus the six, values `''` and the category ids), a text input "Search gigs..." and a submit button, which goes to `browse.html?q=<q>&cat=<cat>` leaving out empty parameters. Signed out: *Sign In* (outline, `signin.html`) and *Sign Up* (filled, `signup.html`). Signed in: a heart icon button (`profile.html#favorites`), a Messages icon button with the unread badge (`messages.html`) and the avatar button that opens the avatar menu; sellers also get a filled *Post a gig* button (`post-gig.html`) before the icons. Avatar menu: My Profile (`profile.html`), My Orders (`profile.html#orders`), Messages (`messages.html`); for sellers also My Seller Page (`seller.html?u=<handle>`), Orders received (`seller.html?u=<handle>#orders`) and Post a gig; then Log out (`Store.signOut()`, then `index.html`).
- **Mega menu.** Opens when the pointer rests on the Browse Gigs item for 120ms, or on a click of the chevron, or on Enter or Space on the focused chevron. Closes 200ms after the pointer leaves, on Esc (focus returns to the chevron), on an outside click, and when anything else opens. Layout: a left list of the six categories (buttons with `aria-controls`; hover or focus shows that category's panel, the first by default), a right panel with the category's four sub-services in two columns (`label` bold, `desc` below, each linking to `browse.html?cat=<id>&q=<encodeURIComponent(q)>`), and a bottom row: *See all gigs →* (`browse.html`), *Become a seller →* (`signup.html?role=seller` when signed out, else `post-gig.html`) and *Pricing →* (`pricing.html`). ArrowUp and ArrowDown move through the categories, ArrowRight moves into the panel, ArrowLeft returns. The panel is at most `--container` wide, sits on `--z-mega`, and fades in unless `prefers-reduced-motion`.
- **App bar and menu (below 1024px).** App bar (`--h-appbar`): the logo, a search icon button (opens the menu drawer with the search field focused) and a menu button. The menu drawer (`UI.drawer`, side `'left'`) holds, in order: the search field (same submit rule), an accordion of the six categories (each expands to its sub-services; the heading also links to `browse.html?cat=<id>`), then Pricing, About Us, Contact, then Sign In and Sign Up (or the avatar-menu items for a signed-in user), then the legal links. **Bottom navigation (below 768px):** Home (`index.html`), Search (`browse.html#search`; Browse focuses its search field when the hash is `#search`), + (`post-gig.html` for sellers, `signup.html` otherwise), Messages (`messages.html`, with the unread badge), Profile (`profile.html`; signed out goes to `signin.html`). The active item uses the filled icon and a Deep Teal label. The page gets `padding-bottom: var(--h-bottomnav)` so the footer is never covered.
- **Footer.** Deep Teal with the mockup's two soft blobs. Brand block: logo, "Made for campus. Made for each other.", Follow Us icons (facebook, instagram, x-social, youtube; each shows the toast "Demo: placeholder link") and the newsletter form ("Get the latest updates", an email field with a submit arrow, `Store.subscribeNewsletter`, an inline error, then "Thanks, you're on the list"). Four link groups: *For Buyers*: Browse Gigs (`browse.html`), How it works (`about.html#how`), Pricing (`pricing.html`), My Orders (`profile.html#orders`). *For Sellers*: Become a Seller (`signup.html?role=seller` when signed out, else `post-gig.html`), Post a gig (`post-gig.html`), Seller fees (`pricing.html?for=sellers`), Seller guidelines (`UI.policy('guidelines')`). *Resources*: Help & support (`contact.html`), FAQ (`about.html#faq`), Success stories (`index.html#community`). *Company*: About Us (`about.html`), Contact Us (`contact.html`). Legal row: "© 2026 Campus Gigs. All rights reserved." and Privacy Policy, Terms of Service, Accessibility, Sitemap (each opens `UI.policy`). Five columns on desktop, two on tablet, stacked on phones. The breadcrumb strip sits directly above it when `crumbs` is passed.
- **Anchors later tasks must provide** for the shell's links: `about.html#how` and `#faq` (Task 12), `index.html#community` (Task 10), `profile.html#orders` and `#favorites` (Task 14), the focus-on-`#search` behaviour in Browse (Task 11), `pricing.html?for=sellers` (Task 20).

- [ ] **Step 1: Write the failing nav-menu test** in `tests/catalog.test.js`:

```js
test('nav menu: one entry per category, every sub-service search finds gigs', () => { eq(SEED.navMenu.map(m => m.cat), Store.categories().map(c => c.id)); for (const m of SEED.navMenu) { eq(m.subs.length, 4); for (const s of m.subs) ok(Store.listGigs({cat: m.cat, q: s.q}).total >= 1, m.cat + ':' + s.q); } });
```
- [ ] **Step 2: Run `node tests/run.js`.** Expected: FAIL (`SEED.navMenu` missing).
- [ ] **Step 3: Add `SEED.navMenu` to `js/data.js`** (24 sub-services) and run `node tests/run.js`. Expected: PASS. If a term finds nothing, change the term, not the test.
- [ ] **Step 4: Write `js/ui.js` and `css/shell.css`.** All user-provided strings pass through `Util.esc` before being placed in HTML. Mega-menu hrefs are built with `encodeURIComponent`.
- [ ] **Step 5: Mount the shell in `dev/kit.html`** with one gig card of each variant, a seller card for `paolo_d`, both CTA bands, a breadcrumb, a split accordion wired with `UI.accordion`, and a row of buttons that open a modal, a drawer and a toast.
- [ ] **Step 6: Verify in the browser** at 1280, 768 and 375, against the Upwork header and footer screenshots (`First coding run for the website.pdf`, pages 4–9) in Campus Gigs colours. Desktop, signed out: the header shows the logo, four nav items, the scoped search, Sign In and Sign Up; it gains a shadow after scrolling; hovering Browse Gigs opens the mega menu, hovering each of the six categories swaps the panel, and three sub-services open Browse with results. Keyboard only: Tab to the chevron, Enter opens, ArrowDown and ArrowRight move, Esc closes and focus returns to the chevron; an outside click closes it; opening the avatar menu (signed in) closes the mega menu. Search: choose Tutoring, type `math`, submit goes to `browse.html?q=math&cat=tutoring`; an empty search with All categories goes to `browse.html`. Signed in as the demo seller (set the session from the console with the demo credentials): the *Post a gig* button, favorites and Messages icons show, the Messages badge shows the seeded unread count, the avatar menu lists the seller items, and Log out returns to Home signed out. Footer: every link goes where listed or opens its modal; the five modal links open, Esc closes and focus returns to the link; social icons show the toast; the newsletter shows an error for `nope` and success for `a@b.co`. Modals and drawers: Tab never leaves them, the page behind does not scroll, a toast shows above an open modal. At 1024 (the narrowest desktop header): nothing wraps or overlaps, including for a signed-in seller with the *Post a gig* button. At 768: the app bar and menu button show with no bottom navigation; the menu drawer opens with the search field, the category accordion opens one at a time, and Esc closes it. At 375: the bottom navigation and the Messages badge show, footer groups stack, the last footer row is not covered, and there is no horizontal scroll. A heart on a card while signed out goes to `signin.html?next=...`. A gig titled `<b>x</b>` shows as text. With storage blocked the notice appears. Under `prefers-reduced-motion` the menus and drawers do not animate. Expected: all behave as described, no console errors.
- [ ] **Step 7: Run `node tests/run.js`.** Expected: PASS.

---

## Reference adoption by page (proposed; the owner confirms before Tasks 10, 11, 12 and 20 start)

Tasks 8 and 9 build the reference components and the shell, and the shell applies to every page. Placing section components on pages changes the mockup layouts, so each placement below is a proposal. Every page keeps its mockup body; the additions go between or under its existing sections. The Indeed "Landing page" is read as a source of patterns, not a separate page (spec, call 16).

| Task and page | Add from the references |
|---|---|
| 10 Home | `.proof` row under the subtitle. Below Top-Rated Gigs: a "Popular right now" row of `.spec-card`s (each links to Browse filtered), then a `.steps-card` beside a `.media-card` ("How Campus Gigs works"), then a `.compare` table ("Why Campus Gigs?" against Facebook groups and word of mouth). A `.logo-row` ("Trusted by SLSU student orgs") above the CTA band. Keep `id="community"` on "What Our Community Says". |
| 11 Browse | `.cat-tabs` under the banner (a tab sets `cat` and mirrors the radios); a "Top sellers" row of three `UI.sellerCard`s; a "Popular searches" `.link-grid` under the results; `crumbs` Home › Browse Gigs; focus the search field when the hash is `#search`. |
| 12 About | Hero as `.hero-curve`; "How Campus Gigs Works" as `.steps-3` with `id="how"`, then an `.acc-split` ("What you can do from your profile"); `.quote-band` with Ana Santos' quote; the FAQ as `.faq-split` wired by `UI.accordion`, with `id="faq"`; a closing `.cta-band--card`. Contact gets `crumbs` only. |
| 20 Pricing | The whole page (Task 20). |
| 13 to 19 | Header, footer and `crumbs` only; Task 16's breadcrumb uses `UI.breadcrumb`; Task 18 calls `UI.refreshBadges()` after `Store.markRead`. |

---

### Task 10: Home page and site checks

**Files:**
- Create: `index.html`, `js/pages/home.js`, `tests/site.test.js`
- Modify: `css/pages.css`

**Interfaces:**
- Consumes: `UI.mount`, `UI.gigCard`, `UI.bindGigCards`, `UI.toast`, `UI.modal`, `Store.categories`, `Store.topRated`, `Store.testimonials`, `Store.subscribeNewsletter`, `Store.currentUser`, `Store.becomeSeller`, `Auth.landingFor`.
- Produces `tests/site.test.js` checks over every root `*.html` and `js/**`: each local `href` and `src` target exists (ignoring query and hash), including `href: '…'` object properties in `js/ui.js`; no `href="#"` or empty href; no `type="module"`; no `fetch(` or `XMLHttpRequest`; each page loads the Global Constraints script order and stylesheet order and contains `<main id="main">`.

- [ ] **Step 1: Write `tests/site.test.js`.**
- [ ] **Step 2: Build `index.html` and `home.js`** to `homepage.png`: hero (H1 "Find skilled SLSU students." then "Get things done." in Slate Teal; subtitle "From design to tutoring, Campus Gigs connects you with talented peers on campus."; *Browse Gigs →* and *Become a Seller*; tilted frames collage from `SEED.images.heroFrame1`–`4` with a "Campus Gigs" sticker), Popular Categories (six cards linking to `browse.html?cat=<id>`, "Explore more →" to `browse.html`), Top-Rated Gigs (`Store.topRated(4)`, "See all →" to `browse.html?sort=top`), "Why Choose Campus Gigs?" band with *Start Browsing →*, "What Our Community Says" carousel (dots, swipe, auto-advance that pauses on hover and stays off under reduced motion) beside the campus-photo tile ("Campus gigs, handled."), the "Ready to get started?" band with *Sign Up Free →*. *Become a Seller*: signed out → `signup.html?role=seller`; buyer → confirm modal then `Store.becomeSeller` then `post-gig.html`; seller → `post-gig.html`.
- [ ] **Step 3: Run `node tests/run.js`.** Expected: PASS (site checks include `index.html`).
- [ ] **Step 4: Verify in the browser:** compare to `homepage.png` at about 1280 wide; section order matches; the four Top-Rated cards are gigs 1–4; the six category cards land on Browse with that category selected; carousel dots change the slide; the newsletter shows an error for `nope` and success for `a@b.co`; *Become a Seller* behaves for all three states; 375 and 768 have no horizontal scroll.

---

### Task 11: Browse page

**Files:**
- Create: `browse.html`, `js/pages/browse.js`
- Modify: `css/pages.css`, `tests/site.test.js` (no change expected; it covers the new page)

**Interfaces:**
- Consumes: `Store.listGigs`, `Store.recommended`, `Store.categories`, `Store.currentUser`, `UI.gigCard`, `UI.bindGigCards`, `UI.query`, `Util.toInt`.

- [ ] **Step 1: Build `browse.html` and `browse.js`** to `browse.png`: banner "Browse Gigs / Find the perfect service for your needs." (`SEED.images.banner` under a dark overlay); sidebar with category radios (All Categories plus six) and price checkboxes (Under ₱500, ₱500–₱1,000, ₱1,000+); search field; sort select (Most Recent, Price: Low to High, Price: High to Low, Top Rated); grid of 6 cards per page; pagination with arrows and numbers; "Recommended for you" row (`Store.recommended`, 4 compact cards, "See all →"); empty state with a Clear filters button. All state lives in the URL as `?q=&cat=&price=u500,mid&sort=&page=` and the page re-renders from it; changing a control updates the URL with `history.pushState` so Back works. On phones the sidebar collapses behind the kit's filter bar button into a drawer.
- [ ] **Step 2: Run `node tests/run.js`.** Expected: PASS.
- [ ] **Step 3: Verify in the browser:** `browse.html?cat=design` shows only Design gigs with the radio selected; ticking two price boxes shows the union; `?q=logo` fills the search field; `?page=-3&price=junk&sort=zzz&cat=nope` renders the default first page with no console error (Review Focus 1); `?q=zzzz` shows the empty state; pagination arrows disable at the ends; Back restores the previous filters; hearts and card clicks work; compare to `browse.png`.

---

### Task 12: About and Contact pages

**Files:**
- Create: `about.html`, `contact.html`, `js/pages/about.js`, `js/pages/contact.js`
- Modify: `css/pages.css`

**Interfaces:**
- Consumes: `Store.faq`, `Store.saveContact`, `Store.currentUser`, `UI.mount`, `UI.toast`.

- [ ] **Step 1: Build `about.html`** to `about.png`: hero ("ABOUT US", "Made for campus. Made for each other.", the subtitle), photo collage tiles (`SEED.images.aboutCollage1`–`4`), Our Story and Our Mission, "How Campus Gigs Works" (Browse → Connect → Get It Done), Who It's For, the three-question FAQ accordion (button with `aria-expanded`, keyboard operable, one open at a time), CTA band with *Browse Gigs*.
- [ ] **Step 2: Build `contact.html`** to `contact.png`: hero ("CONTACT US", "Let's stay in touch!"), info column (Email `campusgigs@slsu.edu.ph`, Visit Us "SLSU Main Campus", Follow Us icons with the placeholder toast), and the "Send us a message" form (Name, Email, Message, all required, inline errors from `Store.saveContact`, success state replacing the form with a "Message sent" panel and a *Send another* button). Prefill name and email for a signed-in user.
- [ ] **Step 3: Run `node tests/run.js`.** Expected: PASS.
- [ ] **Step 4: Verify in the browser:** FAQ items open and close by mouse and keyboard; contact form rejects empty and bad-email input with a message, accepts valid input, and the success panel appears; a message of only spaces is rejected; compare both pages to their mockups.

---

### Task 13: Sign In and Sign Up pages

**Files:**
- Create: `signin.html`, `signup.html`, `js/pages/signin.js`, `js/pages/signup.js`
- Modify: `css/pages.css`

**Interfaces:**
- Consumes: `Store.signIn`, `Store.signUp`, `Store.demoAccounts`, `Store.currentUser`, `Auth.safeNext`, `Auth.landingFor`, `UI.modal`, `UI.toast`, `UI.query`.

- [ ] **Step 1: Build `signin.html`** to `sign in.png`: "Welcome back!" card over a blurred campus tile; email and password (eye button toggles visibility, `aria-pressed`); *Forgot password?* opens a modal asking for an email and "sending" a reset link (toast); *Sign In →*; "or continue with" Google and Apple, which sign in as the demo buyer and toast "Demo sign-in: signed in as Juana"; link to Sign Up preserving `next`; a small "Try a demo account" row with two buttons that fill the form for the demo buyer and seller. Errors appear inline in an `aria-live` region.
- [ ] **Step 2: Build `signup.html`** to `sign up.png`: "Create your account" card; tabs *Student (Buyer)* and *Freelancer (Seller)* (role picked from `?role=seller`); Full Name, SLSU Email, Password with the same eye toggle; the note "Demo only: don't use a real password"; *Sign Up →*. On success go to `Auth.safeNext(next)` or `Auth.landingFor(user)`; sellers land on `seller.html?u=<handle>&welcome=1`.
- [ ] **Step 3: Both pages:** an already signed-in visitor is redirected to their landing page. Disable the submit button while submitting.
- [ ] **Step 4: Run `node tests/run.js`.** Expected: PASS.
- [ ] **Step 5: Verify in the browser:** wrong password shows "Incorrect email or password."; demo buttons sign in; `signin.html?next=https://evil.com` lands on the normal landing page, not the external site; `signin.html?next=gig.html?id=3` returns to that gig; a `gmail.com` address on sign-up shows the SLSU-email message; duplicate email shows its message; the Freelancer tab sets a seller account; Enter submits both forms.

---

### Task 14: Buyer profile page and Settings drawer

**Files:**
- Create: `profile.html`, `js/pages/profile.js`, `js/pages/settings-drawer.js`
- Modify: `css/pages.css`

**Interfaces:**
- Consumes: `Auth.require`, `Store.ordersOf`, `Store.favoritesOf`, `Store.reviewsBy`, `Store.getOrder`, `Store.addReview`, `Store.updateProfile`, `Store.becomeSeller`, `Store.deleteAccount`, `Store.reset`, `Store.signOut`, `UI.modal`, `UI.drawer`, `UI.gigCard`, `UI.stars`, `UI.avatar`.
- Produces `SettingsDrawer.open(user: User, onChange?: ()=>void): void` (name, headline, bio, notification switches for orders and messages and newsletter, *Become a Seller* for buyers, *Reset demo data*, *Delete account*; both destructive actions go through a confirm modal; Reset calls `Store.reset()` then goes to `index.html`). `profile.js` also holds a local `openReviewModal(orderId: string, onDone?: ()=>void): void` (five-star radio group and a textarea; submit disabled while saving; errors from `Store.addReview` shown inline).

- [ ] **Step 1: Build `profile.html` and `profile.js`** to `user_consumer.png`, as one long page: banner, avatar, `@handle`, headline, *Profile* button (opens the Settings drawer), left nav (Profile, My Orders, Favorites, Settings, Log Out) and the tab bar (My Orders, Favorites, Reviews) both as anchor links that scroll to their sections and highlight the current one. Sections: **My Orders** (chips All / In Progress / Completed; each row shows the seller avatar, the order's saved `gigTitle`, price, `by @seller`, a status pill and *View Details →*, which opens a modal with date, time, package, notes, total and, for a completed order not yet reviewed, *Leave a review*); **Favorites** (thumbnail grid with hearts; un-favoriting removes the card with a toast); **Recent Reviews** (stars, text, *See all* expands). Sellers also see *Seller page* and *Orders received* items in the left nav linking to their own `seller.html`. An empty list shows a friendly empty state with a link to Browse. Section ids are `orders`, `favorites` and `reviews`.
- [ ] **Step 2: Build `settings-drawer.js`** with `SettingsDrawer`.
- [ ] **Step 3: Run `node tests/run.js`.** Expected: PASS.
- [ ] **Step 4: Verify in the browser:** signed out → redirected to `signin.html?next=profile.html`; as the demo buyer the page matches the mockup (three orders, four favorites); chips filter orders; an order for a deleted gig still shows its title; leaving a review on a completed order updates Recent Reviews and cannot be submitted twice by double-clicking; Settings saves a changed name and shows it in the header; *Reset demo data* asks to confirm, then restores the seed and signs out; *Delete account* asks to confirm; a stale session (set `campusgigs.v1.session` to `"ghost"` and reload) redirects to Sign In.

---

### Task 15: Seller profile page

**Files:**
- Create: `seller.html`, `js/pages/seller.js`
- Modify: `css/pages.css`

**Interfaces:**
- Consumes: `Store.getUser`, `Store.gigsBySeller`, `Store.reviewsForSeller`, `Store.isFollowing`, `Store.toggleFollow`, `Store.followerCount`, `Store.ordersReceived`, `Store.completeOrder`, `Store.updateGig`, `Store.deleteGig`, `Store.currentUser`, `SettingsDrawer.open`, `UI.notFound`, `UI.query`, `UI.modal`, `UI.gigCard`.

- [ ] **Step 1: Build `seller.html` and `seller.js`** to `user_seller.png`, stacked like the mockup: banner, avatar, `@handle`, headline (e.g. "Graphic Designer · SLSU Student"), rating and review count, "Joined March 2025", **Message** (to `messages.html?with=<handle>`; signed out → sign-in with `next`) and **Follow / Following** (updates the follower count); then About Me with skill chips, Portfolio grid with hearts and *See all →*, My Gigs (card rows with *View Gig →*), Reviews. The left nav (Profile, My Gigs, Portfolio, Settings, Log Out) and tab bar scroll to sections; Settings and Log Out show only to the owner and "My Gigs" reads "Gigs" for visitors. Owner view: Message/Follow become **Edit profile** (opens `SettingsDrawer`) and **Post a gig**; an **Orders received** section lists orders with *Mark as completed* (updates in place); each of the owner's gig rows gains *Edit* (to `post-gig.html?edit=<id>`) and *Delete* (confirm modal). `?welcome=1` shows a "Post your first gig" banner. Unknown or missing `u` renders `UI.notFound`. Section ids are `about`, `portfolio`, `gigs`, `reviews` and `orders`. The page loads `js/pages/settings-drawer.js` before `seller.js`.
- [ ] **Step 2: Run `node tests/run.js`.** Expected: PASS.
- [ ] **Step 3: Verify in the browser:** `seller.html?u=paolo_d` signed out shows Message and Follow and no Settings or Log Out; Follow toggles and the count changes; as the demo seller the owner controls appear and *Mark as completed* turns an In Progress order Completed; `seller.html?u=nobody` and `seller.html` show the not-found panel with no console error (Review Focus 1); compare to `user_seller.png`.

---

### Task 16: Gig detail page

**Files:**
- Create: `gig.html`, `js/pages/gig.js`
- Modify: `css/pages.css`

**Interfaces:**
- Consumes: `Store.getGig`, `Store.getUser`, `Store.reviewsForGig`, `Store.gigsBySeller`, `Store.priceLabel`, `Store.isFavorite`, `Store.toggleFavorite`, `Store.currentUser`, `UI.notFound`, `UI.query`, `UI.stars`, `UI.gigCard`, `Util.toInt`.

- [ ] **Step 1: Build `gig.html` and `gig.js`**: breadcrumb (Browse Gigs › category › title), gallery (cover tile plus two supporting tiles), title, seller card (avatar, name, rating, *View profile*, *Message*), heart, description and skills, package selector using the kit's segmented control over the gig's existing packages (Basic / Standard / Pro; absent tiers are not shown) with price, delivery days, revisions and inclusions for the selected one, *Continue (₱…)* to `order.html?gig=<id>&pkg=<name>` (signed out → sign-in with `next` set to that order URL), reviews list, "More from this seller". On phones a sticky bottom bar holds the price and *Continue*. When the viewer owns the gig, *Continue* is replaced by *Edit gig*. Invalid, non-numeric or unknown `id` renders `UI.notFound`.
- [ ] **Step 2: Run `node tests/run.js`.** Expected: PASS.
- [ ] **Step 3: Verify in the browser:** `gig.html?id=1` shows three packages and the selector updates price and inclusions; `?id=abc`, `?id=9999` and no id show the not-found panel (Review Focus 1); a one-package gig shows one tier; Continue builds the right order URL; the owner sees *Edit gig*; at 375 the sticky bar shows and nothing overflows.

---

### Task 17: Order page

**Files:**
- Create: `order.html`, `js/pages/order.js`
- Modify: `css/pages.css`

**Interfaces:**
- Consumes: `Auth.require`, `Store.getGig`, `Store.placeOrder`, `Store.currentUser`, `Store.now`, `UI.notFound`, `UI.query`, `UI.toast`, `Util.formatPeso`, `Util.toInt`.

- [ ] **Step 1: Build `order.html` and `order.js`**: a two-column layout (summary card on the right on desktop, above the form on phones). Summary: gig cover, title, seller, selected package, price. Form: quantity stepper (only when `gig.unit === 'hour'`; label "Hours"), preferred date (`min` = today) and time using the kit's date and time inputs, notes to the seller (textarea, 500-char counter), payment shown as "Pay on meet-up (demo)". The total updates live. *Place order* disables itself on first click, calls `Store.placeOrder`, shows inline errors on failure (and re-enables), and on success replaces the form with an "Order placed!" panel showing the order number, a recap, *View my orders* (`profile.html#orders`) and *Message seller*. A seller viewing their own gig sees "You can't order your own gig." with a link back. Missing, invalid or unknown `gig` or `pkg` renders `UI.notFound`; an unknown `pkg` for a valid gig falls back to the first package.
- [ ] **Step 2: Run `node tests/run.js`.** Expected: PASS.
- [ ] **Step 3: Verify in the browser:** signed out → redirected to sign-in and back to the same order URL afterwards; `order.html`, `order.html?gig=abc` and `?gig=9999` show not-found; yesterday's date and an empty date show the store's messages; choosing today with an earlier time shows the past-time message; double-clicking *Place order* creates exactly one order (check My Orders); an hourly gig shows the stepper and the total multiplies; the order appears In Progress in My Orders and in the seller's Orders received.

---

### Task 18: Messages page

**Files:**
- Create: `messages.html`, `js/pages/messages.js`
- Modify: `css/pages.css`

**Interfaces:**
- Consumes: `Auth.require`, `Store.conversationsOf`, `Store.openConversation`, `Store.sendMessage`, `Store.autoReply`, `Store.markRead`, `Store.unreadCount`, `Store.getUser`, `UI.avatar`, `UI.toast`, `UI.query`.

- [ ] **Step 1: Build `messages.html` and `messages.js`**: conversation list (avatar, name, last-message preview, time, unread dot) on the left and the thread on the right, a composer at the bottom (Enter sends, Shift+Enter adds a line), own messages right-aligned in Deep Teal and the other person's left-aligned in Pale Olive, scroll to the newest message. After the user sends, show a typing indicator for about 1.5 s, then call `Store.autoReply` and append its message; opening a thread calls `Store.markRead` and updates the nav badge. `?with=<handle>` opens or creates that thread; an unknown or own handle is ignored with a toast and the first conversation opens. Phones show the list first, then the thread with a back button. A conversation whose other member no longer exists shows "Former student" with a "?" avatar. An empty inbox shows an empty state with *Browse Gigs*. Sending is disabled while the text is empty or whitespace.
- [ ] **Step 2: Run `node tests/run.js`.** Expected: PASS.
- [ ] **Step 3: Verify in the browser:** `messages.html?with=paolo_d` from a gig's *Message* button opens the thread; sending shows the typing indicator then a reply from the other person; sending text containing `<b>x</b>` renders as text; whitespace-only input cannot be sent; the unread badge drops after opening; at 375 the list-then-thread flow works; switch accounts and confirm the seeded unread message for the demo seller.

---

### Task 19: Post a gig page

**Files:**
- Create: `post-gig.html`, `js/pages/post-gig.js`
- Modify: `css/pages.css`

**Interfaces:**
- Consumes: `Auth.require`, `Store.createGig`, `Store.updateGig`, `Store.getGig`, `Store.categories`, `Store.becomeSeller`, `UI.gigCard`, `UI.toast`, `UI.query`.

- [ ] **Step 1: Build `post-gig.html` and `post-gig.js`**: title, category chips, description, skills (type and Enter to add removable chips), up to three packages (Basic / Standard / Pro) with price, days, revisions and inclusions (add and remove rows; Basic is required), cover chooser (six palette tiles, or an optional upload resized in a canvas to at most 640px wide and stored as a JPEG data URL, falling back to the chosen tile if anything fails), and a live preview card (`UI.gigCard`) that updates as the user types. *Publish* disables on first click, calls `Store.createGig` (or `Store.updateGig` for `?edit=<id>`, owner only), shows field errors inline, and on success goes to `gig.html?id=<id>` with a toast. A signed-in non-seller sees a "Become a seller to post gigs" panel with a button that calls `Store.becomeSeller` and reloads the form. `?edit=` for a gig the user does not own, or an unknown id, renders `UI.notFound`.
- [ ] **Step 2: Run `node tests/run.js`.** Expected: PASS.
- [ ] **Step 3: Verify in the browser:** as a new Freelancer, publishing with an empty title shows an error; a valid gig appears first in Browse and in the seller's My Gigs; double-clicking *Publish* creates one gig; editing changes it; deleting from My Gigs removes it; a buyer sees the Become-a-seller panel; `?edit=9999` shows not-found.

---

### Task 20: Pricing page

**Files:**
- Create: `pricing.html`, `js/pages/pricing.js`
- Modify: `js/data.js` (add `SEED.pricing`), `tests/seed.test.js` (pricing test), `css/pages.css`

**Interfaces:**
- Consumes: `UI.mount` (with `crumbs`), `UI.accordion`, `UI.ctaBand`, `UI.query`, `Icons.svg`.
- Produces `SEED.pricing: {buyers: Audience, sellers: Audience, faq: {q: string, a: string}[]}` where `Audience = {plans: [Plan, Plan], features: {group: string, rows: {label: string, a: boolean|string, b: boolean|string}[]}[]}` and `Plan = {name: string, blurb: string, price: string, fee: string, includes: string[], cta: string}`. The second plan of each audience is the popular one. All values are mock; the builder writes the copy.
- Rules: plan buttons go to `signup.html?role=buyer` or `signup.html?role=seller`; the page says "Demo only: no payment is taken."

- [ ] **Step 1: Write the failing test** in `tests/seed.test.js`:

```js
test('pricing seed: two plans per audience, grouped features, faq', () => { for (const k of ['buyers','sellers']) { const a = SEED.pricing[k]; eq(a.plans.length, 2); ok(a.features.length >= 3 && a.features.every(g => g.rows.length >= 3), k); } ok(SEED.pricing.faq.length >= 3); });
```
- [ ] **Step 2: Run `node tests/run.js`.** Expected: FAIL (`SEED.pricing` missing).
- [ ] **Step 3: Add `SEED.pricing` to `js/data.js`** and run `node tests/run.js`. Expected: PASS.
- [ ] **Step 4: Build `pricing.html` and `pricing.js`** to the Upwork Pricing screenshots (`First coding run for the website.pdf`, pages 8 and 9) in Campus Gigs colours: `crumbs` Home › Pricing; a centred hero (builder's wording, for example "Simple pricing for campus life") with a subtitle and a link ("Looking to sell? Switch to Sellers") that selects the other audience; the kit's `.segmented` toggle *Buyers* / *Sellers* (buttons with `aria-pressed`; `?for=sellers` preselects Sellers, any other value Buyers; changing it updates the URL with `history.replaceState`); two `.plan-card`s for that audience (the second `--popular`) whose buttons go to the sign-up links above; a `.keytable` ("Key Features") for that audience, with `id="sellers"` on the Sellers one; one `.stat-line` (a mock stat); `.faq-split` from `SEED.pricing.faq` wired with `UI.accordion`; a closing `UI.ctaBand`.
- [ ] **Step 5: Run `node tests/run.js`.** Expected: PASS (site checks include `pricing.html`).
- [ ] **Step 6: Verify in the browser:** the toggle swaps the cards and the table and updates the URL; `pricing.html?for=sellers` opens on Sellers; `?for=junk` opens on Buyers with no console error; plan buttons reach sign-up with the right role preselected; the FAQ opens one item at a time by mouse and keyboard; at 375 the table scrolls inside its wrapper and the page does not scroll sideways; the header's Pricing link is marked current; compare to the Upwork pricing screenshots.

---

### Task 21: Final pass, README and full run-through

**Files:**
- Create: `README.txt`
- Modify: any page or stylesheet that fails a check below.

**Interfaces:**
- Consumes: everything.

- [ ] **Step 1: Write `README.txt`:** how to open the site (double-click `index.html`), recommended browsers (Chrome, Edge or Safari), what the storage notice means, the two demo accounts (named by role; credentials are in `js/data.js`), what `images/` is for (also create `images/README.txt` listing the `SEED.images` slot names and the three steps to swap in a photo: copy the file into `images/`, set the slot to `'img:<filename>'` in `js/data.js`, reload), how to run `node tests/run.js`, and a line that `dev/kit.html` is a component style guide.
- [ ] **Step 2: Run `node tests/run.js`.** Expected: every test PASSES, including the site checks over all thirteen pages.
- [ ] **Step 3: Run the spec's Definition of Done in a browser**, each from fresh storage, no console errors:
  1. Buyer loop: Home → Browse → filter Design → open a gig → Standard → Continue → sign up as a Student → date and time → Place order → In Progress in My Orders.
  2. Seller loop: log out, sign in as the demo seller → Orders received → Mark as completed. Back as the buyer → Leave a review → the gig's rating and count change.
  3. Post a gig: sign up as a Freelancer → Post a gig → appears in Browse and My Gigs; edit and delete work.
  4. Messaging: Message a seller from a gig page → reply arrives.
  5. Persistence: refresh keeps everything; *Reset demo data* restores the seed; clearing storage by hand and reloading reseeds. Open `file:///Users/arymsr.vendiola/Campus%20Gig/index.html` in Chrome and (if installed) Firefox and repeat the buyer loop.
  6. Fidelity: each mockup page beside its screenshot at desktop width. The header, footer and pop-ups follow the PDF references instead; compare Pricing with the Upwork pricing screenshots (PDF pages 8 and 9).
  7. Responsive: 375 and 768 have no horizontal scroll; bottom navigation works.
  8. No dead ends: click every link, button, social icon, mega-menu link and footer link on all thirteen pages, signed out and signed in.
  9. Shell: the mega menu, avatar menu, mobile menu drawer, modals and drawers work by mouse, touch and keyboard (Esc and an outside click close them, focus returns, never two popovers open).
- [ ] **Step 4: Accessibility pass:** keyboard-only through sign-in, an order, a review, the mega menu and the avatar menu; confirm focus rings, modal focus trap and Esc, and `prefers-reduced-motion` stops the carousel.
- [ ] **Step 5: Report** anything that could not be verified (for example Firefox not installed) rather than claiming it passed.
