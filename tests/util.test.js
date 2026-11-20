test('esc escapes HTML', () => eq(Util.esc(`<b>"x" & 'y'</b>`), '&lt;b&gt;&quot;x&quot; &amp; &#39;y&#39;&lt;/b&gt;'));            // Review Focus 2
test('formatPeso', () => { eq(Util.formatPeso(1500), '₱1,500'); eq(Util.formatPeso(350), '₱350'); eq(Util.formatPeso('x'), '₱0'); });
test('toInt sanitises junk', () => { eq(Util.toInt('abc',1,1,999), 1); eq(Util.toInt('-3',1,1,999), 1); eq(Util.toInt('5000',1,1,999), 999); eq(Util.toInt('7',1,1,999), 7); eq(Util.toInt(undefined,1,1,9), 1); }); // Review Focus 1
test('initials', () => { eq(Util.initials('Paolo Dela Cruz'), 'PD'); eq(Util.initials('juana'), 'J'); eq(Util.initials('  '), '?'); });
test('isValidEmail', () => { ok(Util.isValidEmail('a@slsu.edu.ph')); ok(!Util.isValidEmail('a@')); ok(!Util.isValidEmail(' a b@x.com')); });
test('mockHash is deterministic and not the input', () => { const h = Util.mockHash('pw12345678'); eq(h, Util.mockHash('pw12345678')); ok(h !== 'pw12345678' && h !== Util.mockHash('pw12345679')); });
// Added in Task 16: ids in URLs must never be clamped into range (?id=-5 once showed gig 1).
test('toId accepts only plain positive whole numbers and returns 0 for anything else', () => { eq(Util.toId('3'), 3); eq(Util.toId('007'), 7); for (const bad of ['abc', '-5', '0', '1e3', '1.5', ' 7', '7 ', '', null, undefined, '99999999999', '<b>1</b>']) eq(Util.toId(bad), 0, String(bad)); }); // Review Focus 1
