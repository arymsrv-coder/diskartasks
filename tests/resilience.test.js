// Added after the final review: failure modes the plan's tests did not exercise.
const draft = o => ({title:'Poster design', category:'design', description:'I make posters.', skills:['Canva'], cover:'tile:design', unit:'project', packages:[{name:'Basic', price:300, days:3, revisions:1, includes:['1 concept']}], ...o});
const order = (S, o) => S.placeOrder({buyer:'juana.delacruz', gigId:1, pkg:'Standard', qty:1, date:'2026-11-20', time:'14:00', notes:'', ...o});

test('deleting the highest seeded gig does not let the next gig reuse its id', () => {
  const max = Math.max(...Store.allGigs().map(g => g.id)); const owner = Store.getGig(max).sellerHandle;
  Store.toggleFavorite('juana.delacruz', max); Store.deleteGig(max, owner);
  const g = Store.createGig(owner, draft({})).gig;
  ok(g.id > max, 'new id ' + g.id + ' must be above ' + max); eq(Store.isFavorite('juana.delacruz', g.id), false);
});

test('deleting an account that owns the highest gig does not recycle that id either', () => {
  const max = Math.max(...Store.allGigs().map(g => g.id)); const owner = Store.getGig(max).sellerHandle;
  Store.deleteAccount(owner); Store.becomeSeller('juana.delacruz');
  ok(Store.createGig('juana.delacruz', draft({})).gig.id > max);
});

test('a write the browser refuses is reported and rolled back, not faked as success', () => {
  const a = boot(); a.breakWrites(); const S = a.Store; const err = r => { eq(r.ok, false); ok(/could not save|storage/i.test(r.error), r.error); };
  err(S.createGig('paolo_d', draft({}))); eq(S.listGigs({q:'Poster design'}).total, 0);
  const before = S.ordersOf('juana.delacruz').length; err(order(S, {})); eq(S.ordersOf('juana.delacruz').length, before);
  const cid = S.conversationsOf('juana.delacruz')[0].id; const n = S.conversationsOf('juana.delacruz').find(c => c.id === cid).messages.length; err(S.sendMessage(cid, 'juana.delacruz', 'hello')); eq(S.conversationsOf('juana.delacruz').find(c => c.id === cid).messages.length, n);
  err(S.signUp({name:'Q', email:'q@slsu.edu.ph', password:'12345678', role:'buyer'})); eq(S.getUser('q'), undefined);
  const title = S.getGig(1).title; err(S.updateGig(1, 'paolo_d', {title:'Changed'})); eq(S.getGig(1).title, title);
  const o = S.ordersOf('juana.delacruz', 'completed').find(x => !x.reviewed); const rating = S.getGig(o.gigId).ratingCount;
  err(S.addReview({orderId:o.id, buyer:'juana.delacruz', stars:5, text:'great'})); eq(S.getOrder(o.id).reviewed, false); eq(S.getGig(o.gigId).ratingCount, rating);
});

test('oversized cover images fall back to the category tile instead of filling storage', () => {
  const big = 'data:image/jpeg;base64,' + 'A'.repeat(200000), fine = 'data:image/jpeg;base64,' + 'A'.repeat(100000);
  eq(Store.createGig('paolo_d', draft({cover: big})).gig.cover, 'tile:design'); eq(Store.createGig('paolo_d', draft({cover: fine})).gig.cover, fine);
});

test('two tabs on the same data do not overwrite each other', () => {
  const a = boot(); const b = makeApp({sharedWith: a}); b.Store.init(); b.Store.setClock(() => new Date('2026-11-15T10:00:00'));
  a.Store.toggleFavorite('juana.delacruz', 5);            // tab A writes
  b.Store.toggleFavorite('juana.delacruz', 6);            // tab B loaded before A's write
  const o1 = order(a.Store, {}).order, o2 = order(b.Store, {}).order;
  ok(o1.id !== o2.id, 'two tabs must not hand out the same order number');
  const c = makeApp({sharedWith: a}); c.Store.init();
  eq([c.Store.isFavorite('juana.delacruz', 5), c.Store.isFavorite('juana.delacruz', 6)], [true, true]);
  eq(c.Store.ordersOf('juana.delacruz').filter(o => o.id === o1.id || o.id === o2.id).length, 2);
});

test('a tab that is behind does not sign the user out when another tab created the account', () => {
  const a = boot(); const b = makeApp({sharedWith: a}); b.Store.init();
  a.Store.signUp({name:'New Person', email:'newperson@slsu.edu.ph', password:'12345678', role:'buyer'});
  eq(b.Store.currentUser().handle, 'newperson'); eq(a.Store.currentUser().handle, 'newperson');
});

test('handles that match Object.prototype names are made safe and never crash favorites or follows', () => {
  for (const local of ['constructor', '__proto__', 'toString', 'hasOwnProperty']) {
    const r = Store.signUp({name:'P', email: local + '@slsu.edu.ph', password:'12345678', role:'buyer'}); ok(r.ok, local);
    const h = r.user.handle; ok(!(h in Object.prototype), 'handle ' + h + ' is an Object.prototype name');
    eq(Store.toggleFavorite(h, 3), true); eq(Store.isFavorite(h, 3), true); eq(Store.favoritesOf(h).length, 1); eq(Store.isFollowing(h, 'paolo_d'), false);
  }
  eq(Store.isFavorite('constructor', 3), false); eq(Store.isFollowing('toString', 'paolo_d'), false); eq(Store.favoritesOf('__proto__'), []);
});
