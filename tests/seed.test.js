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
// Rewritten after the final review: the original three could pass even if init() always reseeded.
// A control (valid data survives a second init) plus a marker user prove which branch ran.
const keeper = opts => { const a = boot(opts); a.Store.signUp({name:'Keeper', email:'keeper@slsu.edu.ph', password:'12345678', role:'buyer'}); return a; };
test('valid stored data survives a second init (control for the reseed tests)', () => { const a = keeper(); const b = boot({preload: a.dump()}); ok(b.Store.getUser('keeper')); eq(b.Store.currentUser().handle, 'keeper'); eq(b.Store.allGigs().length, a.Store.allGigs().length); });
test('corrupt collection reseeds', () => { const d = keeper().dump(); d['campusgigs.v1.gigs'] = '{bad'; const b = boot({preload: d}); ok(b.Store.allGigs().length >= 18); eq(b.Store.getUser('keeper'), undefined); });
test('version mismatch reseeds', () => { const d = keeper().dump(); d['campusgigs.v1.meta'] = '{"version":"old"}'; const b = boot({preload: d}); ok(b.Store.allGigs().length >= 18); eq(b.Store.getUser('keeper'), undefined); });
test('a missing session key reseeds', () => { const d = keeper().dump(); delete d['campusgigs.v1.session']; const b = boot({preload: d}); eq(b.Store.getUser('keeper'), undefined); });
test('reset restores the seed and signs out', () => { const a = keeper(); a.Store.reset(); eq(a.CGStorage.get('session'), null); eq(a.Store.getUser('keeper'), undefined); ok(a.Store.allGigs().length >= 18); });
test('window.name persistence round-trips through a second page', () => { const a = keeper({localStorage:'blocked'}); const b = boot({localStorage:'blocked', windowName: a.window.name}); eq(b.Store.storageMode(), 'window-name'); ok(b.Store.getUser('keeper')); eq(b.Store.currentUser().handle, 'keeper'); });
// Task 20: the Pricing page's mock plans and feature rows.
test('pricing seed: two plans per audience, grouped features, faq', () => { for (const k of ['buyers','sellers']) { const a = SEED.pricing[k]; eq(a.plans.length, 2); ok(a.features.length >= 3 && a.features.every(g => g.rows.length >= 3), k); for (const p of a.plans) ok(p.name && p.blurb && p.price && p.fee && p.cta && p.includes.length >= 3, k + ' ' + p.name); for (const g of a.features) for (const r of g.rows) ok(['boolean','string'].includes(typeof r.a) && ['boolean','string'].includes(typeof r.b), g.group + ': ' + r.label); } ok(SEED.pricing.faq.length >= 3 && SEED.pricing.faq.every(f => f.q && f.a)); });
